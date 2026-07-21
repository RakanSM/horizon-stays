import { createServerClient } from '@/lib/supabase/server';
import { fulfillPaidBooking } from '@/lib/payment-fulfillment';
import { mapMyFatoorahStatus, type ReconciledPaymentStatus } from '@/lib/payment-status';
import type { VerifiedMyFatoorahPayment } from '@/lib/myfatoorah';

const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z]/g, '');

function resolveBookingId(payment: VerifiedMyFatoorahPayment): string {
  const candidates = [payment.customerReference, payment.customerIdentifier, payment.userDefinedField].filter(Boolean);
  const bookingId = candidates[0] ?? '';
  if (!bookingId || candidates.some((value) => value !== bookingId)) throw new Error('PAYMENT_BOOKING_ID_MISMATCH');
  return bookingId;
}

function selectTransaction(payment: VerifiedMyFatoorahPayment, status: ReconciledPaymentStatus) {
  const success = payment.transactions.find((transaction) => ['success', 'succss'].includes(normalize(transaction.status)));
  if (status === 'paid' && success) return success;
  return payment.transactions.find((transaction) => transaction.paymentId || transaction.transactionId) ?? payment.transactions[0];
}

function safeTimestamp(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

export async function recordVerifiedPayment(payment: VerifiedMyFatoorahPayment, eventReference?: string) {
  const bookingId = resolveBookingId(payment);
  const status = mapMyFatoorahStatus(payment.invoiceStatus, payment.transactions.map((transaction) => transaction.status), payment.expiryDate);
  const transaction = selectTransaction(payment, status);
  const paymentId = transaction?.paymentId ?? '';
  if (!payment.invoiceId || payment.currency.toUpperCase() !== 'SAR') throw new Error('INVALID_VERIFIED_PAYMENT');
  if (status === 'paid' && !paymentId) throw new Error('PAID_PAYMENT_ID_MISSING');

  const supabase = createServerClient() as any;
  const { data, error } = await supabase.rpc('record_verified_myfatoorah_state', {
    p_booking_id: bookingId,
    p_invoice_id: payment.invoiceId,
    p_payment_id: paymentId,
    p_transaction_id: transaction?.transactionId ?? '',
    p_gateway_method: transaction?.gateway ?? '',
    p_provider_status: payment.invoiceStatus,
    p_internal_status: status,
    p_amount: payment.invoiceValue,
    p_currency: payment.currency,
    p_environment: payment.environment,
    p_event_reference: eventReference ?? null,
    p_provider_created_at: safeTimestamp(payment.createdAt),
    p_transaction_created_at: safeTimestamp(transaction?.createdAt ?? ''),
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.booking_id) throw new Error('PAYMENT_RECORDING_FAILED');

  if (status === 'paid') await fulfillPaidBooking(bookingId).catch((error) => console.error('Paid booking fulfillment deferred:', error));
  return { paid: status === 'paid', status, bookingId, newlyPaid: Boolean(result.newly_paid) };
}
