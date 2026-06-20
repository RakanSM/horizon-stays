import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createHmac } from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const timestamp = req.headers.get('X-Timestamp') ?? '';
  const signature = req.headers.get('X-Signature') ?? '';
  const body = await req.text();
  const expectedSig = createHmac('sha512', process.env.EXPEDIA_API_SECRET ?? '').update(`${process.env.EXPEDIA_API_KEY}${timestamp}${body}`).digest('hex');
  if (signature !== expectedSig) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  const supabase = createServerClient() as any;
  const payload = JSON.parse(body);
  const r = payload.booking ?? payload;
  await supabase.from('bookings').upsert({ guest_name: `${r.primaryGuest?.firstName ?? ''} ${r.primaryGuest?.lastName ?? ''}`.trim() || 'Expedia Guest', guest_email: r.primaryGuest?.email ?? null, platform: 'expedia', platform_booking_id: String(r.id ?? r.itineraryId), check_in: r.checkInDate, check_out: r.checkOutDate, nights: r.roomStayNights ?? 1, guests_count: r.adultCount ?? 1, amount_sar: r.totalAmount?.value ?? 0, status: r.status === 'CANCELLED' ? 'cancelled' : 'confirmed', payment_method: 'myfatoorah', payment_status: 'paid' }, { onConflict: 'platform_booking_id' });
  return NextResponse.json({ received: true });
}
