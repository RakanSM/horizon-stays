import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createHmac } from 'crypto';
import { sendWozTellMessage } from '@/lib/woztell';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const signature = req.headers.get('X-Airbnb-Signature') ?? '';
  const body = await req.text();
  const expectedSig = createHmac('sha256', process.env.AIRBNB_WEBHOOK_SECRET ?? '').update(body).digest('hex');
  if (signature !== `sha256=${expectedSig}`) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  const payload = JSON.parse(body);
  const supabase = createServerClient() as any;
  const evt = payload.event_type as string;
  if (!['reservation.created', 'reservation.updated', 'reservation.cancelled'].includes(evt)) return NextResponse.json({ received: true });
  const r = payload.data?.reservation;
  if (!r) return NextResponse.json({ error: 'No reservation data' }, { status: 400 });
  const { data: property } = await supabase.from('properties').select('id, lock_id').filter('platform_names->airbnb->id', 'eq', r.listing_id ?? r.listing?.id).single();
  const bookingData = { property_id: property?.id, guest_name: r.guest?.full_name ?? r.guest_full_name ?? 'Airbnb Guest', guest_phone: r.guest?.phone_numbers?.[0] ?? null, guest_email: r.guest?.email ?? null, platform: 'airbnb' as const, platform_booking_id: r.confirmation_code ?? r.id, check_in: r.start_date, check_out: r.end_date, nights: r.nights ?? 1, guests_count: r.number_of_guests ?? 1, amount_sar: r.payout_price_breakdown?.gross_earnings?.amount ?? r.expected_payout_amount ?? 0, status: evt === 'reservation.cancelled' ? 'cancelled' as const : 'confirmed' as const, payment_method: 'myfatoorah' as const, payment_status: 'paid' as const };
  await supabase.from('bookings').upsert(bookingData, { onConflict: 'platform_booking_id' });
  if (evt === 'reservation.created' && bookingData.guest_phone) await sendWozTellMessage(bookingData.guest_phone, 'WELCOME', { name: bookingData.guest_name, property: 'وحدتكم', check_in: bookingData.check_in }).catch(console.error);
  return NextResponse.json({ received: true });
}
