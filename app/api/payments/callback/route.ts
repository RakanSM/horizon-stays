import { NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/myfatoorah';
import { recordVerifiedPayment } from '@/lib/payment-processing';

function appOrigin(req: Request) {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || new URL(req.url).origin).replace(/\/$/, '');
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = url.searchParams.get('locale') === 'en' ? 'en' : 'ar';
  const paymentId = url.searchParams.get('paymentId') || url.searchParams.get('paymentid');
  const origin = appOrigin(req);
  if (!paymentId) return NextResponse.redirect(`${origin}/${locale}/booking?error=missing_payment_id`);

  try {
    const payment = await verifyPayment(paymentId);
    const result = await recordVerifiedPayment(payment);
    if (!result.paid) {
      return NextResponse.redirect(`${origin}/${locale}/booking?error=payment_${result.status}&id=${encodeURIComponent(result.bookingId)}`);
    }
    return NextResponse.redirect(`${origin}/${locale}/booking/confirmation?id=${encodeURIComponent(result.bookingId)}`);
  } catch (error) {
    console.error('Payment callback verification failed:', error);
    return NextResponse.redirect(`${origin}/${locale}/booking?error=callback_failed`);
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Use the signed MyFatoorah webhook endpoint.' }, { status: 405, headers: { Allow: 'GET' } });
}
