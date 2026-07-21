
import { NextRequest, NextResponse } from 'next/server';
import { OdooIntegration } from '@/lib/odoo/odoo-integration';
import { syncBookingToOdoo } from '@/lib/odoo/sync';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  const odoo = new OdooIntegration({
    url: process.env.ODOO_URL || '',
    db: process.env.ODOO_DATABASE || '',
    username: process.env.ODOO_USERNAME || '',
    apiKey: process.env.ODOO_API_KEY || '',
  });

  if (action === 'status') {
    const isConnected = await odoo.checkConnection();
    return NextResponse.json({
      connected: isConnected,
      odoo_url: process.env.ODOO_URL,
      message: isConnected ? 'Connected to Odoo' : 'Failed to connect to Odoo',
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, bookingId } = body;

    if (action === 'sync_booking') {
      const result = await syncBookingToOdoo(bookingId);
      return NextResponse.json({
        success: true,
        message: 'Booking synced to Odoo successfully',
        result,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Odoo integration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
