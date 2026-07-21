import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OdooIntegration from '@/lib/odoo/odoo-integration';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const odooConfig = {
  url: process.env.ODOO_URL || 'https://demo.odoo.com',
  database: process.env.ODOO_DATABASE || 'demo_db',
  username: process.env.ODOO_USERNAME || 'admin@example.com',
  password: process.env.ODOO_PASSWORD || 'admin',
  apiKey: process.env.ODOO_API_KEY,
};

const odoo = new OdooIntegration(odooConfig);

interface SyncResult {
  bookingId: string;
  action: string;
  status: 'success' | 'failed';
  error?: string;
  odooId?: number;
}

/**
 * POST /api/cron/sync-bookings-to-odoo
 * Synchronize pending bookings to Odoo
 * Runs daily at 2:00 AM (configured in Vercel Cron)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret if provided
    const cronSecret = req.headers.get('authorization');
    if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting Odoo booking synchronization...');

    // Authenticate with Odoo
    const authenticated = await odoo.authenticate();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Failed to authenticate with Odoo', synced: 0, failed: 0 },
        { status: 500 }
      );
    }

    // Fetch pending bookings (not yet synced to Odoo)
    const { data: pendingBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('payment_status', 'completed')
      .is('odoo_rental_order_id', null)
      .order('created_at', { ascending: true })
      .limit(100);

    if (fetchError) {
      console.error('Error fetching bookings:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch bookings', synced: 0, failed: 0 },
        { status: 500 }
      );
    }

    if (!pendingBookings || pendingBookings.length === 0) {
      console.log('No pending bookings to sync');
      return NextResponse.json({
        success: true,
        message: 'No pending bookings to sync',
        synced: 0,
        failed: 0,
        results: [],
      });
    }

    console.log(`Found ${pendingBookings.length} bookings to sync`);

    const results: SyncResult[] = [];
    let syncedCount = 0;
    let failedCount = 0;

    // Sync each booking
    for (const booking of pendingBookings) {
      try {
        // Fetch property details
        const { data: property, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', booking.property_id)
          .single();

        if (propertyError || !property) {
          throw new Error('Property not found');
        }

        // Create rental order
        const rentalOrder = await odoo.createRentalOrder({
          id: booking.id,
          propertyId: property.id,
          propertyName: property.name || property.internal_name,
          guestName: booking.guest_name,
          guestEmail: booking.guest_email,
          checkIn: booking.check_in_date,
          checkOut: booking.check_out_date,
          totalPrice: booking.total_price,
          currency: 'SAR',
          paymentStatus: 'completed',
          paymentMethod: booking.payment_method || 'myfatoorah',
          confirmationCode: booking.confirmation_code,
        });

        if (!rentalOrder || typeof rentalOrder !== 'object' || !('id' in rentalOrder)) {
          throw new Error('Failed to create rental order');
        }

        // Create invoice
        const invoiceId = await odoo.createInvoice(
          {
            id: booking.id,
            propertyId: property.id,
            propertyName: property.name || property.internal_name,
            guestName: booking.guest_name,
            guestEmail: booking.guest_email,
            checkIn: booking.check_in_date,
            checkOut: booking.check_out_date,
            totalPrice: booking.total_price,
            currency: 'SAR',
            paymentStatus: 'completed',
            paymentMethod: booking.payment_method || 'myfatoorah',
            confirmationCode: booking.confirmation_code,
          },
          rentalOrder.id
        );

        // Record payment
        const paymentRecorded = await odoo.recordPayment(
          invoiceId || 0,
          booking.total_price,
          booking.payment_method || 'myfatoorah',
          booking.confirmation_code
        );

        // Update booking with Odoo references
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            odoo_rental_order_id: rentalOrder.id,
            odoo_invoice_id: invoiceId,
            odoo_sync_status: 'synced',
            odoo_sync_date: new Date().toISOString(),
          })
          .eq('id', booking.id);

        if (updateError) {
          throw new Error(`Failed to update booking: ${updateError.message}`);
        }

        results.push({
          bookingId: booking.id,
          action: 'create_rental_order_and_invoice',
          status: 'success',
          odooId: rentalOrder.id,
        });

        syncedCount++;
        console.log(`✓ Synced booking ${booking.id} to Odoo (Order ID: ${rentalOrder.id})`);
      } catch (error) {
        failedCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          bookingId: booking.id,
          action: 'create_rental_order_and_invoice',
          status: 'failed',
          error: errorMessage,
        });
        console.error(`✗ Failed to sync booking ${booking.id}: ${errorMessage}`);
      }
    }

    console.log(`Synchronization complete: ${syncedCount} synced, ${failedCount} failed`);

    return NextResponse.json({
      success: true,
      message: `Synchronization complete: ${syncedCount} synced, ${failedCount} failed`,
      synced: syncedCount,
      failed: failedCount,
      results,
    });
  } catch (error) {
    console.error('Odoo sync error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        synced: 0,
        failed: 0,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/sync-bookings-to-odoo
 * Health check for the cron job
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Odoo sync cron endpoint is healthy',
    nextRun: 'Daily at 2:00 AM UTC',
  });
}
