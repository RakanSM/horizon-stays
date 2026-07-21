import { createServerClient } from '@/lib/supabase/server';
import { generateTemporaryCode } from '@/lib/ttlock';
import { sendWozTellMessage } from '@/lib/woztell';

type FulfillmentStep = 'door_status' | 'door_message_status' | 'welcome_status';
type FulfillmentState = 'pending' | 'processing' | 'done' | 'skipped' | 'failed' | 'manual_review';

type FulfillmentRow = {
  booking_id: string;
  door_code: string | null;
  keyboard_pwd_id: number | null;
  door_status: FulfillmentState;
  door_message_status: FulfillmentState;
  welcome_status: FulfillmentState;
};

type PaidBooking = {
  id: string;
  guest_name: string;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  door_code: string | null;
  property: { lock_id?: string | null; name_ar?: string | null; name_en?: string | null } | null;
};

async function claimStep(bookingId: string, step: FulfillmentStep): Promise<boolean> {
  const supabase = createServerClient() as any;
  const { data, error } = await supabase
    .from('payment_fulfillments')
    .update({ [step]: 'processing', updated_at: new Date().toISOString() })
    .eq('booking_id', bookingId)
    .in(step, ['pending', 'failed'])
    .select('booking_id')
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

async function finishStep(bookingId: string, step: FulfillmentStep, state: Exclude<FulfillmentState, 'pending' | 'processing'>, error?: string) {
  const supabase = createServerClient() as any;
  await supabase.from('payment_fulfillments').update({
    [step]: state,
    last_error: error ? error.slice(0, 1000) : null,
    updated_at: new Date().toISOString(),
  }).eq('booking_id', bookingId);
}

async function processDoorCode(booking: PaidBooking, fulfillment: FulfillmentRow): Promise<string | null> {
  if (fulfillment.door_code || booking.door_code) return fulfillment.door_code ?? booking.door_code;
  const lockId = booking.property?.lock_id;
  if (!lockId) {
    await finishStep(booking.id, 'door_status', 'skipped');
    return null;
  }
  if (!(await claimStep(booking.id, 'door_status'))) return null;
  let externalCodeCreated = false;
  try {
    const generated = await generateTemporaryCode(lockId, booking.check_in, booking.check_out);
    externalCodeCreated = true;
    const supabase = createServerClient() as any;
    const { error: fulfillmentUpdateError } = await supabase.from('payment_fulfillments').update({
      door_code: generated.code,
      keyboard_pwd_id: generated.keyboardPwdId,
      door_status: 'done',
      last_error: null,
      updated_at: new Date().toISOString(),
    }).eq('booking_id', booking.id);
    if (fulfillmentUpdateError) {
      // The row remains `processing`, which claimStep cannot retry. Prefer manual reconciliation over a duplicate code.
      console.error('TTLock code created but fulfillment persistence failed; automatic retry disabled:', fulfillmentUpdateError);
      return null;
    }
    const { error: bookingUpdateError } = await supabase.from('bookings').update({ door_code: generated.code, door_code_expires: booking.check_out }).eq('id', booking.id);
    if (bookingUpdateError) console.error('Door code booking projection failed; persisted fulfillment will be reused:', bookingUpdateError);
    return generated.code;
  } catch (error) {
    await finishStep(booking.id, 'door_status', externalCodeCreated ? 'manual_review' : 'failed', error instanceof Error ? error.message : 'TTLock failed');
    throw error;
  }
}

export async function fulfillPaidBooking(bookingId: string): Promise<void> {
  const supabase = createServerClient() as any;
  const [{ data: booking, error: bookingError }, { data: fulfillment, error: fulfillmentError }] = await Promise.all([
    supabase.from('bookings').select('id, guest_name, guest_phone, check_in, check_out, door_code, property:properties(name_ar, name_en)').eq('id', bookingId).eq('payment_status', 'paid').single(),
    supabase.from('payment_fulfillments').select('*').eq('booking_id', bookingId).single(),
  ]);
  if (bookingError || !booking) throw bookingError ?? new Error('Paid booking not found');
  if (fulfillmentError || !fulfillment) throw fulfillmentError ?? new Error('Fulfillment row not found');

  const paidBooking = booking as PaidBooking;
  let code: string | null = null;
  try { code = await processDoorCode(paidBooking, fulfillment as FulfillmentRow); } catch (error) { console.error('TTLock fulfillment failed:', error); }

  if (code && paidBooking.guest_phone && await claimStep(bookingId, 'door_message_status')) {
    try {
      await sendWozTellMessage(paidBooking.guest_phone, 'DOOR_CODE', { code, expiry: paidBooking.check_out });
      await finishStep(bookingId, 'door_message_status', 'done');
    } catch (error) {
      await finishStep(bookingId, 'door_message_status', 'failed', error instanceof Error ? error.message : 'Door message failed');
    }
  } else if ((!code || !paidBooking.guest_phone) && (fulfillment as FulfillmentRow).door_message_status !== 'done') {
    await finishStep(bookingId, 'door_message_status', 'skipped');
  }

  if (paidBooking.guest_phone && await claimStep(bookingId, 'welcome_status')) {
    try {
      await sendWozTellMessage(paidBooking.guest_phone, 'WELCOME', {
        name: paidBooking.guest_name,
        property: paidBooking.property?.name_ar ?? paidBooking.property?.name_en ?? '',
        check_in: paidBooking.check_in,
      });
      await finishStep(bookingId, 'welcome_status', 'done');
    } catch (error) {
      await finishStep(bookingId, 'welcome_status', 'failed', error instanceof Error ? error.message : 'Welcome message failed');
    }
  } else if (!paidBooking.guest_phone && (fulfillment as FulfillmentRow).welcome_status !== 'done') {
    await finishStep(bookingId, 'welcome_status', 'skipped');
  }
}
