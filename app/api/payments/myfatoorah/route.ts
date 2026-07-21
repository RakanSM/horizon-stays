import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { discoverPaymentMethods, executePayment, getMyFatoorahPublicConfig, MyFatoorahError } from '@/lib/myfatoorah';

function publicOrigin(req: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const origin = configured || new URL(req.url).origin;
  return origin.replace(/\/$/, '');
}

export async function GET(req: Request) {
  try {
    const amount = Number(new URL(req.url).searchParams.get('amount'));
    const methods = await discoverPaymentMethods(amount, 'SAR');
    return NextResponse.json({ data: { methods, ...getMyFatoorahPublicConfig() } });
  } catch (error) {
    const status = error instanceof MyFatoorahError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Payment methods unavailable.' }, { status });
  }
}

export async function POST(req: Request) {
  const supabase = createServerClient() as any;
  let bookingId = '';
  try {
    const body = await req.json();
    bookingId = typeof body.bookingId === 'string' ? body.bookingId : '';
    const paymentMethodId = Number(body.paymentMethodId);
    const locale = body.locale === 'en' ? 'en' : 'ar';
    if (!bookingId || !Number.isInteger(paymentMethodId) || paymentMethodId <= 0) {
      return NextResponse.json({ error: 'bookingId and a valid paymentMethodId are required.' }, { status: 400 });
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, amount_sar, guest_email, guest_name, guest_phone, check_in, check_out, payment_status, payment_method_id, payment_url, property:properties(name_ar, name_en)')
      .eq('id', bookingId)
      .single();
    if (error || !booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    if (booking.payment_status === 'paid') return NextResponse.json({ error: 'Booking is already paid.' }, { status: 409 });
    if (booking.payment_url && booking.payment_status === 'pending') {
      return NextResponse.json({ data: { paymentUrl: booking.payment_url, reused: true, ...getMyFatoorahPublicConfig() } });
    }

    const methods = await discoverPaymentMethods(Number(booking.amount_sar), 'SAR');
    const selectedMethod = methods.find((method) => method.id === paymentMethodId);
    if (!selectedMethod) {
      return NextResponse.json({ error: 'The selected payment method is not enabled for this MyFatoorah account.' }, { status: 400 });
    }

    const { data: claim, error: claimError } = await supabase.rpc('claim_myfatoorah_initialization', { p_booking_id: bookingId });
    if (claimError) {
      if (claimError.message?.includes('payment_initialization_in_progress')) {
        return NextResponse.json({ error: 'Payment initialization is already in progress. Please wait.' }, { status: 409 });
      }
      throw claimError;
    }
    const claimResult = Array.isArray(claim) ? claim[0] : claim;
    if (claimResult?.existing_url) return NextResponse.json({ data: { paymentUrl: claimResult.existing_url, reused: true, ...getMyFatoorahPublicConfig() } });

    const origin = publicOrigin(req);
    const property = booking.property as { name_ar?: string; name_en?: string } | null;
    const result = await executePayment({
      bookingId,
      amount: Number(booking.amount_sar),
      paymentMethodId,
      guestEmail: booking.guest_email || undefined,
      guestName: booking.guest_name,
      guestPhone: booking.guest_phone || undefined,
      callbackUrl: `${origin}/api/payments/callback?locale=${locale}`,
      errorUrl: `${origin}/${locale}/booking?error=payment_failed&id=${encodeURIComponent(bookingId)}`,
      webhookUrl: `${origin}/api/payments/webhook`,
      propertyName: (locale === 'ar' ? property?.name_ar : property?.name_en) || property?.name_ar || property?.name_en || 'Horizon Stays booking',
      lang: locale,
    });

    // The attempt and initiated invoice must be durable before the browser receives a redirect URL.
    const { error: attemptError } = await supabase.rpc('record_myfatoorah_attempt', {
      p_booking_id: bookingId,
      p_invoice_id: result.invoiceId,
      p_method_id: paymentMethodId,
      p_gateway_method: selectedMethod.name,
      p_amount: Number(booking.amount_sar),
      p_currency: 'SAR',
      p_environment: result.environment,
      p_payment_url: result.paymentUrl,
      p_provider_created_at: null,
    });
    if (attemptError) throw attemptError;

    return NextResponse.json({ data: { paymentUrl: result.paymentUrl, invoiceId: result.invoiceId, reused: false, ...getMyFatoorahPublicConfig() } });
  } catch (error) {
    if (bookingId) await supabase.from('bookings').update({ payment_initiated_at: null }).eq('id', bookingId).is('payment_url', null);
    const status = error instanceof MyFatoorahError ? error.status : 500;
    console.error('Payment initiation failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Payment initiation failed.' }, { status });
  }
}
