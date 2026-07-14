import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { initiatePayment } from '@/lib/myfatoorah';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      property_id,
      guest_name,
      guest_email,
      guest_phone,
      check_in,
      check_out,
      nights,
      guests_count,
      platform = 'direct',
      notes = '',
    } = body;

    // Validate required fields
    if (!property_id || !guest_name || !check_in || !check_out) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient() as any;

    // Get property details to calculate price
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, internal_name, base_price_night, status')
      .eq('id', property_id)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if property is available for booking
    if (property.status === 'blocked' || property.status === 'maintenance') {
      return NextResponse.json(
        { error: 'Property is not available for booking' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const amount_sar = nights * property.base_price_night;

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        property_id,
        guest_name,
        guest_email,
        guest_phone,
        check_in,
        check_out,
        nights,
        guests_count,
        platform,
        amount_sar,
        status: 'pending',
        payment_status: 'pending',
        notes,
      })
      .select()
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Initiate MyFatoorah payment
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://horizonstays.com';
      const paymentResult = await initiatePayment({
        bookingId: booking.id,
        amount: amount_sar,
        guestEmail: guest_email || 'noemail@horizonstays.com',
        guestName,
        guestPhone: guest_phone || '+966500000000',
        callbackUrl: `${appUrl}/api/payments/callback`,
        errorUrl: `${appUrl}/ar/booking?error=payment_failed`,
        lang: 'ar',
      });

      return NextResponse.json({
        data: {
          booking,
          paymentUrl: paymentResult.paymentUrl,
          invoiceId: paymentResult.invoiceId,
        },
      });
    } catch (paymentError) {
      // If payment initiation fails, still return booking but with error
      console.error('Payment initiation failed:', paymentError);
      return NextResponse.json(
        {
          data: { booking },
          warning: 'Booking created but payment initiation failed',
        },
        { status: 201 }
      );
    }
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Booking creation failed' },
      { status: 500 }
    );
  }
}
