import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const apiKey = req.headers.get('X-Api-Key') ?? req.headers.get('Authorization');
  if (apiKey !== process.env.BOOKING_CHANNEL_MANAGER_KEY) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createServerClient() as any;
  const payload = await req.json();
  const r = payload.reservation ?? payload;
  await supabase.from('bookings').upsert({ guest_name: r.guest_name ?? 'Booking.com Guest', guest_phone: r.phone ?? null, guest_email: r.email ?? null, platform: 'booking', platform_booking_id: String(r.id ?? r.reservation_id), check_in: r.arrival ?? r.check_in, check_out: r.departure ?? r.check_out, nights: r.room_nights ?? 1, guests_count: r.num_guests ?? 1, amount_sar: r.total_price ?? 0, status: r.status === 'cancelled' ? 'cancelled' : 'confirmed', payment_method: 'myfatoorah', payment_status: 'paid' }, { onConflict: 'platform_booking_id' });
  return NextResponse.json({ received: true });
}
