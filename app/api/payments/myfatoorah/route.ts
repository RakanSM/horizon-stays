import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { initiatePayment } from '@/lib/myfatoorah';

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();
    if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 });
    const supabase = createServerClient() as any;
    const { data: booking, error } = await supabase.from('bookings').select('id, amount_sar, guest_email, guest_name, guest_phone').eq('id', bookingId).single();
    if (error || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://horizonstays.com';
    const result = await initiatePayment({ bookingId, amount: booking.amount_sar, guestEmail: booking.guest_email ?? '', guestName: booking.guest_name, guestPhone: booking.guest_phone ?? '', callbackUrl: `${appUrl}/api/payments/callback`, errorUrl: `${appUrl}/ar/booking?error=payment_failed`, lang: 'ar' });
    await supabase.from('bookings').update({ payment_status: 'pending' }).eq('id', bookingId);
    return NextResponse.json({ data: { paymentUrl: result.paymentUrl, invoiceId: result.invoiceId } });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : 'Payment initiation failed' }, { status: 500 }); }
}
