import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { verifyPayment } from '@/lib/myfatoorah';
import { sendWozTellMessage } from '@/lib/woztell';
import { generateTemporaryCode } from '@/lib/ttlock';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const paymentId = url.searchParams.get('paymentId');
  if (!paymentId) return NextResponse.redirect(new URL('/ar/booking?error=missing_payment_id', process.env.NEXT_PUBLIC_APP_URL ?? 'https://horizonstays.com'));
  return handleCallback(paymentId);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const paymentId = body.paymentId ?? body.PaymentId;
  if (!paymentId) return NextResponse.json({ error: 'paymentId missing' }, { status: 400 });
  return handleCallback(paymentId);
}

async function handleCallback(paymentId: string) {
  const supabase = createServerClient() as any;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://horizonstays.com';
  try {
    const payment = await verifyPayment(paymentId);
    if (payment.invoiceStatus !== 'Paid') return NextResponse.redirect(new URL(`/ar/booking?error=payment_${payment.invoiceStatus.toLowerCase()}`, appUrl));
    const bookingId = payment.customerReference;
    await supabase.from('bookings').update({ payment_status: 'paid', status: 'confirmed' }).eq('id', bookingId);
    await supabase.from('payments').insert({ booking_id: bookingId, method: 'myfatoorah', amount_sar: payment.invoiceValue, status: 'paid', gateway_ref: String(payment.invoiceId) });
    const { data: booking } = await supabase.from('bookings').select('*, property:properties(lock_id, internal_name)').eq('id', bookingId).single();
    if (booking) {
      const prop = booking.property as { lock_id?: string; internal_name?: string } | null;
      if (prop?.lock_id) {
        try {
          const codeResult = await generateTemporaryCode(prop.lock_id, booking.check_in, booking.check_out);
          await supabase.from('bookings').update({ door_code: codeResult.code, door_code_expires: booking.check_out }).eq('id', bookingId);
          if (booking.guest_phone) await sendWozTellMessage(booking.guest_phone, 'DOOR_CODE', { code: codeResult.code, expiry: booking.check_out });
        } catch (e) { console.error('TTLock code generation failed:', e); }
      }
      if (booking.guest_phone) await sendWozTellMessage(booking.guest_phone, 'WELCOME', { name: booking.guest_name, property: prop?.internal_name ?? '', check_in: booking.check_in });
    }
    return NextResponse.redirect(new URL(`/ar/booking/confirmation?id=${bookingId}`, appUrl));
  } catch (err) { console.error('Payment callback error:', err); return NextResponse.redirect(new URL('/ar/booking?error=callback_failed', appUrl)); }
}
