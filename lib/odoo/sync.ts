
import { createServerClient } from '@/lib/supabase/server';
import { OdooIntegration } from './odoo-integration';

export async function syncBookingToOdoo(bookingId: string) {
  const supabase = createServerClient();
  const odoo = new OdooIntegration({
    url: process.env.ODOO_URL!,
    db: process.env.ODOO_DATABASE!,
    username: process.env.ODOO_USERNAME!,
    apiKey: process.env.ODOO_API_KEY!,
  });

  // 1. Fetch booking data
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*, properties(*)')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) throw new Error(`Booking not found: ${bookingId}`);

  try {
    // 2. Create Rental Order
    const rentalOrderId = await odoo.createRentalOrder({
      partner_id: 1, // Placeholder: should be mapped to customer
      property_id: booking.property_id,
      start_date: booking.check_in,
      end_date: booking.check_out,
      // ... other fields
    });

    // 3. Create Invoice
    const invoiceId = await odoo.createInvoice({
      move_type: 'out_invoice',
      partner_id: 1,
      invoice_date: new Date().toISOString().split('T')[0],
      invoice_line_ids: [[0, 0, {
        name: `Stay at ${booking.properties.name}`,
        quantity: 1,
        price_unit: booking.amount_sar,
      }]],
    });

    // 4. Update Supabase
    await supabase
      .from('bookings')
      .update({
        odoo_rental_order_id: rentalOrderId,
        odoo_invoice_id: invoiceId,
        odoo_sync_status: 'synced',
        odoo_sync_date: new Date().toISOString(),
      })
      .eq('id', bookingId);

    return { rentalOrderId, invoiceId };
  } catch (error: any) {
    await supabase
      .from('odoo_sync_errors')
      .insert({
        entity_type: 'booking',
        entity_id: bookingId,
        error_message: error.message,
      });
    throw error;
  }
}

export async function syncESGFromOdoo() {
  const supabase = createServerClient();
  const odoo = new OdooIntegration({
    url: process.env.ODOO_URL!,
    db: process.env.ODOO_DATABASE!,
    username: process.env.ODOO_USERNAME!,
    apiKey: process.env.ODOO_API_KEY!,
  });

  const metrics = await odoo.getESGMetrics();
  for (const metric of metrics) {
    await supabase.from('esg_metrics').upsert({
      metric_type: metric.metric_type,
      value: metric.value,
      unit: metric.unit,
      period_start: metric.period_start,
      period_end: metric.period_end,
      odoo_reference_id: metric.id,
    }, { onConflict: 'odoo_reference_id' });
  }
}
