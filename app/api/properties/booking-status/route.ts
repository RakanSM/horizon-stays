import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function PUT(req: Request) {
  const supabase = createServerClient() as any;
  const body = await req.json();
  const { propertyId, status } = body;

  if (!propertyId || !status) {
    return NextResponse.json({ error: 'Property ID and status are required' }, { status: 400 });
  }

  if (!['available', 'occupied', 'maintenance', 'blocked'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('properties')
    .update({ status })
    .eq('id', propertyId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
