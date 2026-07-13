import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = createServerClient() as any;
  const url = new URL(req.url);
  
  let query = supabase
    .from('properties')
    .select('*, owner:property_owners(*)')
    .order('created_at', { ascending: false });

  const propertyId = url.searchParams.get('id');
  if (propertyId) {
    query = query.eq('id', propertyId).single();
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PUT(req: Request) {
  const supabase = createServerClient() as any;
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
