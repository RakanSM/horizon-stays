import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const DAY_MS = 86_400_000;

function parseStay(checkIn: unknown, checkOut: unknown) {
  if (typeof checkIn !== 'string' || typeof checkOut !== 'string') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) return null;
  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  const nights = (end - start) / DAY_MS;
  return Number.isInteger(nights) && nights > 0 ? { checkIn, checkOut, nights } : null;
}

function safeText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const stay = parseStay(body.check_in, body.check_out);
    const propertyId = Number(body.property_id);
    const guestName = safeText(body.guest_name, 100);
    const guestEmail = safeText(body.guest_email, 254);
    const guestPhone = safeText(body.guest_phone, 30);
    const notes = safeText(body.notes, 1000);
    const guestsCount = Math.min(30, Math.max(1, Number.parseInt(String(body.guests_count ?? 1), 10) || 1));

    if (!Number.isInteger(propertyId) || propertyId <= 0 || !guestName || !stay) {
      return NextResponse.json({ error: 'Valid property, guest name, check-in, and check-out are required.' }, { status: 400 });
    }

    const supabase = createServerClient() as any;
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, name_ar, name_en, price_per_night, is_active')
      .eq('id', propertyId)
      .single();
    if (propertyError || !property) return NextResponse.json({ error: 'Property not found.' }, { status: 404 });
    if (!property.is_active) {
      return NextResponse.json({ error: 'Property is not available for booking.' }, { status: 409 });
    }

    const { data: overlaps, error: overlapError } = await supabase
      .from('bookings')
      .select('id')
      .eq('property_id', propertyId)
      .in('status', ['pending', 'confirmed', 'checked_in'])
      .lt('check_in', stay.checkOut)
      .gt('check_out', stay.checkIn)
      .limit(1);
    if (overlapError) throw overlapError;
    if (overlaps?.length) return NextResponse.json({ error: 'Those dates are no longer available.' }, { status: 409 });

    const nightlyRate = Number(property.price_per_night);
    if (!Number.isFinite(nightlyRate) || nightlyRate <= 0) throw new Error('Property pricing is not configured.');
    const amountSar = Number((stay.nights * nightlyRate).toFixed(2));

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        property_id: propertyId,
        guest_name: guestName,
        guest_email: guestEmail || null,
        guest_phone: guestPhone || null,
        check_in: stay.checkIn,
        check_out: stay.checkOut,
        nights: stay.nights,
        guests_count: guestsCount,
        platform: 'direct',
        amount_sar: amountSar,
        status: 'pending',
        payment_method: 'myfatoorah',
        payment_status: 'pending',
        notes,
      })
      .select('id, property_id, guest_name, guest_email, guest_phone, check_in, check_out, nights, guests_count, amount_sar, status, payment_status, property:properties(name_ar, name_en)')
      .single();
    if (bookingError || !booking) throw bookingError ?? new Error('Failed to create booking.');

    return NextResponse.json({ data: { booking } }, { status: 201 });
  } catch (error) {
    console.error('Booking creation failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Booking creation failed.' }, { status: 500 });
  }
}
