import { NextRequest, NextResponse } from 'next/server';
import OdooIntegration from '@/lib/odoo/odoo-integration';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Initialize Odoo integration
const odooConfig = {
  url: process.env.ODOO_URL || 'https://demo.odoo.com',
  database: process.env.ODOO_DB || process.env.ODOO_DATABASE || 'demo_db',
  username: process.env.ODOO_USERNAME || 'admin@example.com',
  password: process.env.ODOO_PASSWORD || 'admin',
  apiKey: process.env.ODOO_API_KEY,
};

const odoo = new OdooIntegration(odooConfig);

/**
 * POST /api/integrations/odoo
 * Sync a booking to Odoo (create rental order, invoice, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const { action, bookingId } = await req.json();

    if (!action || !bookingId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, bookingId' },
        { status: 400 }
      );
    }

    // Fetch booking from Supabase
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Fetch property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', booking.property_id)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Authenticate with Odoo
    const authenticated = await odoo.authenticate();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Failed to authenticate with Odoo' },
        { status: 500 }
      );
    }

    let result = null;

    if (action === 'create_rental_order') {
      result = await odoo.createRentalOrder({
        id: booking.id,
        propertyId: property.id,
        propertyName: property.name || property.internal_name,
        guestName: booking.guest_name,
        guestEmail: booking.guest_email,
        checkIn: booking.check_in_date,
        checkOut: booking.check_out_date,
        totalPrice: booking.total_price,
        currency: 'SAR',
        paymentStatus: booking.payment_status as 'pending' | 'completed' | 'failed',
        paymentMethod: booking.payment_method || 'myfatoorah',
        confirmationCode: booking.confirmation_code,
      });
    } else if (action === 'create_invoice') {
      const rentalOrderId = booking.odoo_rental_order_id || 0;
      result = await odoo.createInvoice(
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
          paymentStatus: booking.payment_status as 'pending' | 'completed' | 'failed',
          paymentMethod: booking.payment_method || 'myfatoorah',
          confirmationCode: booking.confirmation_code,
        },
        rentalOrderId
      );
    } else if (action === 'record_payment') {
      const invoiceId = booking.odoo_invoice_id || 0;
      result = await odoo.recordPayment(
        invoiceId,
        booking.total_price,
        booking.payment_method || 'myfatoorah',
        booking.confirmation_code
      );
    }

    // Update booking with Odoo reference
    if (result) {
      const updateData: Record<string, any> = {};
      if (action === 'create_rental_order' && typeof result === 'object' && 'id' in result) {
        updateData.odoo_rental_order_id = result.id;
      } else if (action === 'create_invoice' && typeof result === 'number') {
        updateData.odoo_invoice_id = result;
      }

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('bookings')
          .update(updateData)
          .eq('id', bookingId);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Odoo ${action} completed successfully`,
      result,
    });
  } catch (error) {
    console.error('Odoo integration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/integrations/odoo?action=status
 * Check Odoo integration status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'status') {
      const authenticated = await odoo.authenticate();
      return NextResponse.json({
        connected: authenticated,
        odoo_url: odooConfig.url,
        database: odooConfig.database,
        message: authenticated ? 'Connected to Odoo' : 'Failed to connect to Odoo',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Odoo status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
