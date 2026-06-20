import { NextResponse } from 'next/server';
import { sendWozTellMessage } from '@/lib/woztell';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { phone, template, params } = await req.json();
  const supabase = createServerClient() as any;
  try {
    await sendWozTellMessage(phone, template, params);
    await supabase.from('messages').insert({ direction: 'outbound', channel: 'whatsapp', content: `[${template}] sent to ${phone}`, is_read: true });
    return NextResponse.json({ data: { sent: true } });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : 'Send failed' }, { status: 500 }); }
}
