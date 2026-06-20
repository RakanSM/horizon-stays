const MF_BASE = process.env.MYFATOORAH_ENV === 'live'
  ? 'https://api.myfatoorah.com'
  : 'https://apitest.myfatoorah.com';

interface MFHeaders { Authorization: string; 'Content-Type': string; }

function getMFHeaders(): MFHeaders {
  return {
    Authorization: `Bearer ${process.env.MYFATOORAH_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

export interface InitiatePaymentParams {
  bookingId: string;
  amount: number;
  guestEmail: string;
  guestName: string;
  guestPhone: string;
  callbackUrl: string;
  errorUrl: string;
  lang?: 'ar' | 'en';
}

export async function initiatePayment(params: InitiatePaymentParams) {
  const body = {
    InvoiceAmount: params.amount,
    CurrencyIso: 'SAR',
    CustomerName: params.guestName,
    CustomerEmail: params.guestEmail,
    CustomerMobile: params.guestPhone,
    CallBackUrl: params.callbackUrl,
    ErrorUrl: params.errorUrl,
    Language: params.lang ?? 'ar',
    CustomerReference: params.bookingId,
    DisplayCurrencyIso: 'SAR',
    UserDefinedField: params.bookingId,
    PaymentMethodId: null,
  };
  const res = await fetch(`${MF_BASE}/v2/SendPayment`, { method: 'POST', headers: getMFHeaders() as unknown as HeadersInit, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`MyFatoorah SendPayment failed: ${res.status}`);
  const data = await res.json();
  if (!data.IsSuccess) throw new Error(data.Message ?? 'MyFatoorah error');
  return { invoiceId: data.Data.InvoiceId as number, paymentUrl: data.Data.InvoiceURL as string };
}

export async function verifyPayment(paymentId: string) {
  const res = await fetch(`${MF_BASE}/v2/GetPaymentStatus`, { method: 'POST', headers: getMFHeaders() as unknown as HeadersInit, body: JSON.stringify({ Key: paymentId, KeyType: 'PaymentId' }) });
  if (!res.ok) throw new Error(`MyFatoorah GetPaymentStatus failed: ${res.status}`);
  const data = await res.json();
  if (!data.IsSuccess) throw new Error(data.Message ?? 'Verification failed');
  const invoice = data.Data;
  return {
    invoiceId: invoice.InvoiceId as number,
    invoiceStatus: invoice.InvoiceStatus as 'Paid' | 'Unpaid' | 'Expired' | 'Failed',
    invoiceValue: invoice.InvoiceValue as number,
    customerReference: invoice.CustomerReference as string,
    transactions: invoice.InvoiceTransactions as Array<{ TransactionId: string; PaymentGateway: string; TransactionStatus: string; PaidCurrency: string; PaidAmount: number; }>,
  };
}

export async function refundPayment(keyType: 'InvoiceId', key: string, amount: number, comment: string) {
  const res = await fetch(`${MF_BASE}/v2/MakeRefund`, { method: 'POST', headers: getMFHeaders() as unknown as HeadersInit, body: JSON.stringify({ KeyType: keyType, Key: key, Amount: amount, Comment: comment, ServiceCharge: 0 }) });
  if (!res.ok) throw new Error(`MyFatoorah refund failed: ${res.status}`);
  const data = await res.json();
  return data.IsSuccess as boolean;
}
