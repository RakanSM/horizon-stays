import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createServerClient() as any;
  const payload = await req.json();
  const msg = payload.message ?? payload;
  await supabase.from('messages').insert({ direction: 'inbound', channel: 'whatsapp', content: msg.text?.body ?? msg.content ?? '', woztell_id: msg.id ?? msg.message_id, is_read: false });
  return NextResponse.json({ received: true });
}
