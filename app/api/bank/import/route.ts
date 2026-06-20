import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createServerClient() as any;
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  const text = await file.text();
  const lines = text.split('\n').filter(l => l.trim());
  const transactions = lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    return { date: cols[0], description: cols[1], amount: parseFloat(cols[2] ?? '0'), reference: cols[3] };
  }).filter(t => t.date && !Number.isNaN(t.amount));
  if (transactions.length === 0) return NextResponse.json({ error: 'No valid transactions found' }, { status: 400 });
  const { data: inserted, error } = await supabase.from('bank_transactions').insert(transactions).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: payments } = await supabase.from('payments').select('id, amount_sar').eq('status', 'pending_review');
  const matched: string[] = [];
  for (const txn of (inserted ?? [])) {
    const match = (payments ?? []).find((p: any) => Math.abs(p.amount_sar - Math.abs(txn.amount)) < 1);
    if (match) { await supabase.from('bank_transactions').update({ reconciled: true, payment_id: match.id }).eq('id', txn.id); matched.push(match.id); }
  }
  return NextResponse.json({ data: { total: transactions.length, matched: matched.length, unmatched: transactions.length - matched.length } });
}
