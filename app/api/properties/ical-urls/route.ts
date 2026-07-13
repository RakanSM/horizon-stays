import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = createServerClient() as any;
  const url = new URL(req.url);
  const propertyId = url.searchParams.get('property_id');

  if (!propertyId) {
    return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('properties')
    .select('id, internal_name, airbnb_ical_url, gatherin_ical_url')
    .eq('id', propertyId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PUT(req: Request) {
  const supabase = createServerClient() as any;
  const body = await req.json();
  const { propertyId, airbnb_ical_url, gatherin_ical_url } = body;

  if (!propertyId) {
    return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
  }

  const updates: any = {};
  if (airbnb_ical_url !== undefined) updates.airbnb_ical_url = airbnb_ical_url;
  if (gatherin_ical_url !== undefined) updates.gatherin_ical_url = gatherin_ical_url;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'At least one iCal URL must be provided' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', propertyId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
