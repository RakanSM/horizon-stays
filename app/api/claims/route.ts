import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { sendWozTellMessage } from '@/lib/woztell';

export async function GET() {
  const supabase = createServerClient() as any;
  const { data, error } = await supabase.from('claims').select('*, booking:bookings(guest_name,guest_phone), property:properties(internal_name)').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const supabase = createServerClient() as any;
  const body = await req.json();
  const { data, error } = await supabase.from('claims').insert(body).select('*, booking:bookings(guest_phone, guest_name)').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const guest = data.booking as { guest_phone?: string; guest_name?: string } | null;
  if (guest?.guest_phone) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://horizonstays.com';
    await sendWozTellMessage(guest.guest_phone, 'CLAIM_NOTICE', { amount: String(data.amount_sar), link: `${appUrl}/ar/guest/claims` }).catch(console.error);
  }
  return NextResponse.json({ data }, { status: 201 });
}
