import { NextResponse } from 'next/server';
import { getOdooClient } from '@/lib/odoo/client';
import { syncBookingToOdoo, syncExpenseToOdoo, syncAllPending } from '@/lib/odoo/sync';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { action, id } = await req.json();
  try {
    switch (action) {
      case 'status': return NextResponse.json({ data: { connected: await getOdooClient().testConnection() } });
      case 'syncBooking': return NextResponse.json({ data: { odooId: await syncBookingToOdoo(id) } });
      case 'syncExpense': return NextResponse.json({ data: { odooId: await syncExpenseToOdoo(id) } });
      case 'syncAll': return NextResponse.json({ data: await syncAllPending() });
      default: return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : 'Odoo error' }, { status: 500 }); }
}
