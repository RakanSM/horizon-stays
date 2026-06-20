import { getOdooClient } from './client';
import { createServerClient } from '@/lib/supabase/server';

export async function syncBookingToOdoo(bookingId: string): Promise<number> {
  const supabase = createServerClient() as any;
  const odoo = getOdooClient();
  const { data: booking } = await supabase.from('bookings').select('*, property:properties(internal_name, property_type, owner:property_owners(management_fee_pct))').eq('id', bookingId).single();
  if (!booking) throw new Error('Booking not found');
  const partners = await odoo.call('res.partner', 'search_read', [[['email', '=', booking.guest_email ?? '']]], { fields: ['id', 'name'], limit: 1 }) as Array<{ id: number }>;
  const partnerId = partners.length > 0 ? partners[0].id : await odoo.call('res.partner', 'create', [{ name: booking.guest_name, email: booking.guest_email, phone: booking.guest_phone, country_id: 191 }]) as number;
  const amountBeforeVat = booking.amount_sar / 1.15;
  const prop = booking.property as { internal_name?: string } | null;
  const orderId = await odoo.call('sale.order', 'create', [{ partner_id: partnerId, date_order: booking.check_in, note: `Horizon Stays - ${prop?.internal_name ?? ''} - ${booking.check_in} to ${booking.check_out}`, order_line: [[0, 0, { name: `${prop?.internal_name ?? 'Property'} - ${booking.nights} nights`, product_uom_qty: booking.nights, price_unit: amountBeforeVat / booking.nights, tax_id: [[6, 0, []]] }]] }]) as number;
  await supabase.from('bookings').update({ odoo_invoice_id: orderId }).eq('id', bookingId);
  const propData = booking.property as { property_type?: string; owner?: { management_fee_pct?: number } } | null;
  if (propData?.property_type === 'third_party_managed' && propData?.owner?.management_fee_pct) await syncManagementFeeToOdoo(bookingId, booking.amount_sar, propData.owner.management_fee_pct);
  return orderId;
}

async function syncManagementFeeToOdoo(bookingId: string, amountSar: number, feePct: number): Promise<void> {
  const odoo = getOdooClient();
  const managementFee = amountSar * (feePct / 100);
  const ownerDue = amountSar - managementFee;
  await odoo.call('account.move', 'create', [{ move_type: 'entry', ref: `Management fee - booking ${bookingId}`, line_ids: [[0, 0, { name: 'Revenue', debit: amountSar, credit: 0 }], [0, 0, { name: 'Management Fee Income', debit: 0, credit: managementFee }], [0, 0, { name: 'Owner Liability', debit: 0, credit: ownerDue }]] }]);
}

export async function syncExpenseToOdoo(expenseId: string): Promise<number> {
  const supabase = createServerClient() as any;
  const odoo = getOdooClient();
  const { data: expense } = await supabase.from('expenses').select('*').eq('id', expenseId).single();
  if (!expense) throw new Error('Expense not found');
  const journalMap: Record<string, string> = { purchases: 'purchase', services: 'general', salaries: 'payroll' };
  const entryId = await odoo.call('account.move', 'create', [{ move_type: 'entry', date: expense.expense_date, ref: `${expense.tab}: ${expense.category} - ${expense.description}`, journal_id: journalMap[expense.tab] ?? 'general', line_ids: [[0, 0, { name: expense.description, debit: expense.amount_sar, credit: 0 }], [0, 0, { name: 'Cash/Bank', debit: 0, credit: expense.amount_sar }]] }]) as number;
  await supabase.from('expenses').update({ odoo_journal_entry_id: entryId }).eq('id', expenseId);
  return entryId;
}

export async function syncAllPending(): Promise<{ bookings: number; expenses: number }> {
  const supabase = createServerClient() as any;
  const [{ data: pendingBookings }, { data: pendingExpenses }] = await Promise.all([supabase.from('bookings').select('id').is('odoo_invoice_id', null).eq('status', 'confirmed'), supabase.from('expenses').select('id').is('odoo_journal_entry_id', null)]);
  let bookingsSynced = 0, expensesSynced = 0;
  for (const b of (pendingBookings ?? [])) { try { await syncBookingToOdoo(b.id); bookingsSynced++; } catch (e) { await supabase.from('odoo_sync_errors').insert({ entity_type: 'booking', entity_id: b.id, error_message: String(e) }); } }
  for (const e of (pendingExpenses ?? [])) { try { await syncExpenseToOdoo(e.id); expensesSynced++; } catch (e2) { await supabase.from('odoo_sync_errors').insert({ entity_type: 'expense', entity_id: e.id, error_message: String(e2) }); } }
  return { bookings: bookingsSynced, expenses: expensesSynced };
}
