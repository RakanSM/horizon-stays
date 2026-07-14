import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = createServerClient() as any;
  const url = new URL(req.url);
  const propertyId = url.searchParams.get('property_id');
  const startDate = url.searchParams.get('start_date');
  const endDate = url.searchParams.get('end_date');

  if (!propertyId) {
    return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
  }

  let query = supabase
    .from('blocked_days')
    .select('start_date, end_date, reason, status')
    .eq('property_id', propertyId);

  if (startDate && endDate) {
    query = query
      .gte('end_date', startDate)
      .lte('start_date', endDate);
  }

  const { data: blockedDays, error: blockedError } = await query;
  if (blockedError) {
    return NextResponse.json({ error: blockedError.message }, { status: 500 });
  }

  // Also get bookings for the same period
  let bookingQuery = supabase
    .from('bookings')
    .select('check_in, check_out, guest_name, status')
    .eq('property_id', propertyId)
    .not('status', 'in', '("cancelled","transferred")');

  if (startDate && endDate) {
    bookingQuery = bookingQuery
      .gte('check_out', startDate)
      .lte('check_in', endDate);
  }

  const { data: bookings, error: bookingError } = await bookingQuery;
  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      blockedDays: blockedDays || [],
      bookings: bookings || [],
    },
  });
}

export async function POST(req: Request) {
  const supabase = createServerClient() as any;
  const body = await req.json();
  const { property_id, start_date, end_date, reason = 'Maintenance' } = body;

  if (!property_id || !start_date || !end_date) {
    return NextResponse.json(
      { error: 'Property ID, start_date, and end_date are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('blocked_days')
    .insert({
      property_id,
      start_date,
      end_date,
      reason,
      status: 'approved',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(req: Request) {
  const supabase = createServerClient() as any;
  const url = new URL(req.url);
  const blockedDayId = url.searchParams.get('id');

  if (!blockedDayId) {
    return NextResponse.json({ error: 'Blocked day ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('blocked_days')
    .delete()
    .eq('id', blockedDayId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Blocked day removed' });
}
