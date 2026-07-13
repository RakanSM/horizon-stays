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
    .select('id, internal_name, description')
    .eq('id', propertyId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PUT(req: Request) {
  const supabase = createServerClient() as any;
  const body = await req.json();
  const { propertyId, description } = body;

  if (!propertyId || description === undefined) {
    return NextResponse.json({ error: 'Property ID and description are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('properties')
    .update({ description })
    .eq('id', propertyId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
