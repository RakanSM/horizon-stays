import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient() as any;
  const body = await req.json();
  const { data, error } = await supabase.from('bookings').update(body).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient() as any;
  const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { cancelled: true } });
}
