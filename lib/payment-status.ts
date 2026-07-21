export type ReconciledPaymentStatus = 'pending' | 'paid' | 'canceled' | 'expired' | 'failed';
const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z]/g, '');

export function mapMyFatoorahStatus(invoiceStatus: string, transactionStatuses: string[] = [], expiryDate = ''): ReconciledPaymentStatus {
  const invoice = normalize(invoiceStatus);
  const transactions = transactionStatuses.map(normalize);
  if (invoice === 'paid' || transactions.some((status) => status === 'success' || status === 'succss')) return 'paid';
  if (invoice === 'expired' || transactions.includes('expired')) return 'expired';
  if (invoice === 'canceled' || invoice === 'cancelled' || transactions.some((status) => status === 'canceled' || status === 'cancelled' || status === 'cancel')) return 'canceled';
  if (invoice === 'failed' || transactions.some((status) => status === 'failed' || status === 'failure' || status === 'error' || status === 'declined')) return 'failed';
  if (expiryDate) {
    const expiry = Date.parse(expiryDate);
    if (Number.isFinite(expiry) && expiry < Date.now()) return 'expired';
  }
  return 'pending';
}
