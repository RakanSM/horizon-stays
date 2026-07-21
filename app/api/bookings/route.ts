import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = createServerClient() as any;
  const url = new URL(req.url);
  let query: any = supabase.from('bookings').select('*, property:properties(name_ar, name_en, type)').order('created_at', { ascending: false });
  const status = url.searchParams.get('status');
  const platform = url.searchParams.get('platform');
  const propertyId = url.searchParams.get('property_id');
  if (status) query = query.eq('status', status);
  if (platform) query = query.eq('platform', platform);
  if (propertyId) query = query.eq('property_id', propertyId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const supabase = createServerClient() as any;
  const body = await req.json();
  const { data, error } = await supabase.from('bookings').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
