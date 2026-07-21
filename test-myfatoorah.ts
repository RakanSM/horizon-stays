import crypto from 'crypto';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildPaymentStatusChangedSignature, parseInvoiceDisplayValue, verifyMyFatoorahWebhookSignature, verifyPayment } from './lib/myfatoorah';
import { mapMyFatoorahStatus } from './lib/payment-status';

async function main() {
const payload = { Event: { Code: 1, Name: 'PAYMENT_STATUS_CHANGED', Reference: 'WH-626519' }, Data: { Invoice: { Id: '6409988', Status: 'PAID', ExternalIdentifier: 'booking-123' }, Transaction: { Status: 'SUCCESS', PaymentId: '07076409988323998875' } } };
const ordered = 'Invoice.Id=6409988,Invoice.Status=PAID,Transaction.Status=SUCCESS,Transaction.PaymentId=07076409988323998875,Invoice.ExternalIdentifier=booking-123';
assert.equal(buildPaymentStatusChangedSignature(payload), ordered);
process.env.MYFATOORAH_WEBHOOK_SECRET = 'local-test-secret-not-a-credential';
const signature = crypto.createHmac('sha256', process.env.MYFATOORAH_WEBHOOK_SECRET).update(ordered).digest('base64');
assert.equal(verifyMyFatoorahWebhookSignature(payload, signature), true);
assert.equal(verifyMyFatoorahWebhookSignature(payload, `${signature.slice(0, -1)}x`), false);
assert.equal(verifyMyFatoorahWebhookSignature({ ...payload, Data: { ...payload.Data, Invoice: { ...payload.Data.Invoice, Status: 'PENDING' } } }, signature), false);

assert.deepEqual(parseInvoiceDisplayValue('1,500.000 SR'), { amount: 1500, currency: 'SAR' });
assert.deepEqual(parseInvoiceDisplayValue('121.448 KD'), { amount: 121.448, currency: 'KWD' });
assert.deepEqual(parseInvoiceDisplayValue('1500 SAR'), { amount: 1500, currency: 'SAR' });
assert.equal(parseInvoiceDisplayValue('not-an-invoice-value'), null);

const originalFetch = globalThis.fetch;
process.env.MYFATOORAH_ENV = 'test';
process.env.MYFATOORAH_TEST_API_KEY = 'local-test-key-not-a-credential';
globalThis.fetch = async () => new Response(JSON.stringify({
  IsSuccess: true,
  Data: {
    InvoiceId: '6994679',
    InvoiceStatus: 'Paid',
    InvoiceValue: 121.448,
    InvoiceDisplayValue: '1,500.000 SR',
    CustomerReference: 'booking-123',
    UserDefinedField: 'booking-123',
    InvoiceTransactions: [{
      TransactionId: '31341',
      PaymentId: 'sandbox-payment-id',
      PaymentGateway: 'VISA/MASTER',
      TransactionStatus: 'Succss',
      PaidCurrency: 'KD',
    }],
  },
}), { status: 200, headers: { 'Content-Type': 'application/json' } });
const verifiedSettlementConversion = await verifyPayment('sandbox-payment-id');
globalThis.fetch = originalFetch;
assert.equal(verifiedSettlementConversion.invoiceValue, 1500);
assert.equal(verifiedSettlementConversion.currency, 'SAR');
assert.equal(verifiedSettlementConversion.transactions[0].currency, 'KD');

assert.equal(mapMyFatoorahStatus('Paid', ['Succss']), 'paid');
assert.equal(mapMyFatoorahStatus('Pending', []), 'pending');
assert.equal(mapMyFatoorahStatus('Canceled', []), 'canceled');
assert.equal(mapMyFatoorahStatus('Cancelled', []), 'canceled');
assert.equal(mapMyFatoorahStatus('Expired', []), 'expired');
assert.equal(mapMyFatoorahStatus('Pending', ['Declined']), 'failed');

const sql = readFileSync('supabase/migrations/003_myfatoorah_payment_consistency.sql', 'utf8');
for (const invariant of [
  'CREATE TABLE IF NOT EXISTS bookings', 'CREATE TABLE IF NOT EXISTS payments', 'record_myfatoorah_attempt',
  'record_verified_myfatoorah_state', 'payment_not_initiated', 'invoice_mismatch', 'environment_mismatch',
  'amount_mismatch', 'currency_mismatch', 'myfatoorah_webhook_events', 'event_reference TEXT PRIMARY KEY',
  "status='failed'", "updated_at<NOW()-INTERVAL '5 minutes'", 'payment_fulfillments', 'manual_review',
  'bookings_confirmation_code_unique', 'zatca_qr TEXT',
  'REVOKE ALL ON FUNCTION', 'FROM anon, authenticated', 'TO service_role',
]) assert.ok(sql.includes(invariant), `Missing SQL invariant: ${invariant}`);
assert.ok(!/ALTER TABLE properties/i.test(sql), 'Migration must not modify properties');

const webhookRoute = readFileSync('app/api/payments/webhook/route.ts', 'utf8');
assert.ok(webhookRoute.includes('claim_myfatoorah_webhook_event'));
assert.ok(webhookRoute.includes('finish_myfatoorah_webhook_event'));
const paymentRoute = readFileSync('app/api/payments/myfatoorah/route.ts', 'utf8');
const attemptCall = paymentRoute.indexOf("record_myfatoorah_attempt");
const finalRedirectResponse = paymentRoute.lastIndexOf('return NextResponse.json({ data: { paymentUrl');
assert.ok(attemptCall >= 0 && finalRedirectResponse > attemptCall, 'Pending attempt must be persisted before the new gateway URL is returned');
console.log('MyFatoorah signature, status mapping, SAR/KWD settlement, dedupe, and SQL/RPC invariant checks passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
