import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient() as any;
  const body = await req.json();
  const { data, error } = await supabase.from('claims').update(body).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (body.status === 'forgiven' && data) await supabase.from('maintenance_logs').insert({ property_id: data.property_id, issue: `مطالبة تلف مسامح عنها: ${data.description}`, severity: 'medium', status: 'open', notes: `مبلغ المطالبة: ${data.amount_sar} ريال` });
  return NextResponse.json({ data });
}
