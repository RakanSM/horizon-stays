import crypto from 'crypto';

export type MyFatoorahEnvironment = 'test' | 'live';
export type MyFatoorahMethodKind = 'card' | 'mada';

export interface MyFatoorahPaymentMethod {
  id: number;
  name: string;
  nameAr: string;
  kind: MyFatoorahMethodKind;
  serviceCharge: number;
  totalAmount: number;
  currency: string;
  directPayment: boolean;
}

export interface ExecutePaymentParams {
  bookingId: string;
  amount: number;
  paymentMethodId: number;
  guestEmail?: string;
  guestName: string;
  guestPhone?: string;
  callbackUrl: string;
  errorUrl: string;
  webhookUrl: string;
  propertyName: string;
  lang?: 'ar' | 'en';
}

export interface MyFatoorahTransaction {
  transactionId: string;
  paymentId: string;
  gateway: string;
  status: string;
  currency: string;
  amount: number | null;
  createdAt: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface VerifiedMyFatoorahPayment {
  invoiceId: string;
  invoiceStatus: string;
  invoiceValue: number;
  currency: string;
  customerReference: string;
  customerIdentifier: string;
  userDefinedField: string;
  createdAt: string;
  expiryDate: string;
  transactions: MyFatoorahTransaction[];
  environment: MyFatoorahEnvironment;
}

type JsonRecord = Record<string, unknown>;

const TEST_BASE_URL = 'https://apitest.myfatoorah.com';
const SAUDI_LIVE_BASE_URL = 'https://api-sa.myfatoorah.com';

export class MyFatoorahError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status = 502, code = 'MYFATOORAH_ERROR') {
    super(message);
    this.name = 'MyFatoorahError';
    this.status = status;
    this.code = code;
  }
}

export function getMyFatoorahEnvironment(): MyFatoorahEnvironment {
  return process.env.MYFATOORAH_ENV?.trim().toLowerCase() === 'live' ? 'live' : 'test';
}

export function getMyFatoorahPublicConfig() {
  return {
    environment: getMyFatoorahEnvironment(),
    testMode: getMyFatoorahEnvironment() === 'test',
    currency: 'SAR',
  } as const;
}

function getGatewayConfig() {
  const environment = getMyFatoorahEnvironment();
  const token = environment === 'live'
    ? process.env.MYFATOORAH_API_KEY
    : process.env.MYFATOORAH_TEST_API_KEY;

  if (!token || token === '[SENSITIVE]' || token.includes('your_')) {
    throw new MyFatoorahError(
      environment === 'live'
        ? 'MyFatoorah Live credential is not configured.'
        : 'MyFatoorah Test credential is not configured.',
      503,
      'MYFATOORAH_NOT_CONFIGURED'
    );
  }

  return {
    environment,
    token,
    baseUrl: environment === 'live' ? SAUDI_LIVE_BASE_URL : TEST_BASE_URL,
  };
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' ? value as JsonRecord : {};
}

function asString(value: unknown): string {
  return value == null ? '' : String(value);
}

function asNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readProviderMessage(payload: JsonRecord): string {
  const validation = Array.isArray(payload.ValidationErrors) ? payload.ValidationErrors : [];
  const firstValidation = validation.length ? asRecord(validation[0]) : {};
  return asString(firstValidation.Error ?? firstValidation.Message ?? payload.Message) || 'MyFatoorah rejected the request.';
}

async function requestMyFatoorah<T>(path: string, body: JsonRecord): Promise<T> {
  const config = getGatewayConfig();
  let response: Response;

  try {
    response = await fetch(`${config.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new MyFatoorahError('MyFatoorah could not be reached.', 502, 'MYFATOORAH_UNREACHABLE');
  }

  const payload = asRecord(await response.json().catch(() => ({})));
  if (!response.ok || payload.IsSuccess !== true) {
    const upstreamStatus = response.status === 401 || response.status === 403 ? 503 : 502;
    throw new MyFatoorahError(readProviderMessage(payload), upstreamStatus, `MYFATOORAH_${response.status || 'REJECTED'}`);
  }

  return payload.Data as T;
}

function classifyMethod(name: string): MyFatoorahMethodKind | null {
  if (/mada/i.test(name)) return 'mada';
  if (/visa|master/i.test(name)) return 'card';
  return null;
}

function localizeMethod(kind: MyFatoorahMethodKind, providerName: string) {
  if (kind === 'mada') return { name: 'Mada', nameAr: 'مدى' };
  return {
    name: /visa|master/i.test(providerName) ? 'Visa / Mastercard' : providerName,
    nameAr: 'فيزا / ماستركارد',
  };
}

export async function discoverPaymentMethods(amount: number, currency = 'SAR'): Promise<MyFatoorahPaymentMethod[]> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new MyFatoorahError('A valid positive amount is required.', 400, 'INVALID_AMOUNT');
  }

  const data = asRecord(await requestMyFatoorah<unknown>('/v2/InitiatePayment', {
    InvoiceAmount: Number(amount.toFixed(2)),
    CurrencyIso: currency,
  }));
  const rawMethods = Array.isArray(data.PaymentMethods) ? data.PaymentMethods : [];
  const methods = rawMethods.flatMap((entry) => {
    const method = asRecord(entry);
    const providerName = asString(method.PaymentMethodEn ?? method.PaymentMethodAr);
    const kind = classifyMethod(providerName);
    const id = asNumber(method.PaymentMethodId);
    if (!kind || !id) return [];
    const labels = localizeMethod(kind, providerName);
    return [{
      id,
      ...labels,
      kind,
      serviceCharge: asNumber(method.ServiceCharge),
      totalAmount: asNumber(method.TotalAmount) || Number(amount.toFixed(2)),
      currency: asString(method.CurrencyIso ?? currency) || currency,
      directPayment: Boolean(method.IsDirectPayment),
    } satisfies MyFatoorahPaymentMethod];
  });

  const unique = new Map<string, MyFatoorahPaymentMethod>();
  for (const method of methods) {
    const current = unique.get(method.kind);
    if (!current || method.serviceCharge < current.serviceCharge) unique.set(method.kind, method);
  }
  return Array.from(unique.values()).sort((a, b) => (a.kind === 'card' ? -1 : 1) - (b.kind === 'card' ? -1 : 1));
}

function normalizeSaudiMobile(phone?: string) {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('966')) return digits.slice(3);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
}

export async function executePayment(params: ExecutePaymentParams) {
  if (!params.bookingId || !Number.isFinite(params.amount) || params.amount <= 0 || !Number.isInteger(params.paymentMethodId)) {
    throw new MyFatoorahError('Invalid payment execution parameters.', 400, 'INVALID_EXECUTION_PARAMS');
  }

  const mobile = normalizeSaudiMobile(params.guestPhone);
  const body: JsonRecord = {
    PaymentMethodId: params.paymentMethodId,
    InvoiceValue: Number(params.amount.toFixed(2)),
    CallBackUrl: params.callbackUrl,
    ErrorUrl: params.errorUrl,
    WebhookUrl: params.webhookUrl,
    CustomerName: params.guestName.slice(0, 100),
    Language: (params.lang ?? 'ar').toUpperCase(),
    DisplayCurrencyIso: 'SAR',
    CustomerReference: params.bookingId,
    CustomerIdentifier: params.bookingId,
    UserDefinedField: params.bookingId,
    InvoiceItems: [{
      ItemName: params.propertyName.slice(0, 100),
      Quantity: 1,
      UnitPrice: Number(params.amount.toFixed(2)),
    }],
  };
  if (params.guestEmail) body.CustomerEmail = params.guestEmail;
  if (mobile) {
    body.MobileCountryCode = '+966';
    body.CustomerMobile = mobile;
  }

  const data = asRecord(await requestMyFatoorah<unknown>('/v2/ExecutePayment', body));
  const invoiceId = asString(data.InvoiceId);
  const paymentUrl = asString(data.PaymentURL);
  if (!invoiceId || !/^https:\/\//i.test(paymentUrl)) {
    throw new MyFatoorahError('MyFatoorah returned an incomplete payment response.', 502, 'INVALID_PROVIDER_RESPONSE');
  }

  return { invoiceId, paymentUrl, environment: getMyFatoorahEnvironment() };
}

export function parseInvoiceDisplayValue(value: unknown): { amount: number; currency: string } | null {
  const display = asString(value).trim();
  const match = display.match(/^([\d,]+(?:\.\d+)?)\s*([A-Z]{2,3})$/i);
  if (!match) return null;
  const amount = Number(match[1].replace(/,/g, ''));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const providerCurrency = match[2].toUpperCase();
  const currencyAliases: Record<string, string> = { SR: 'SAR', KD: 'KWD' };
  return { amount, currency: currencyAliases[providerCurrency] ?? providerCurrency };
}

function extractCurrency(invoice: JsonRecord, transactions: MyFatoorahTransaction[]): string {
  // MyFatoorah's Kuwait sandbox settles in KWD, while InvoiceDisplayValue retains
  // the authoritative customer-facing amount/currency requested in ExecutePayment.
  const display = parseInvoiceDisplayValue(invoice.InvoiceDisplayValue);
  if (display) return display.currency;
  const direct = asString(invoice.CurrencyIso ?? invoice.InvoiceCurrency ?? invoice.BaseCurrency);
  if (direct) return direct.toUpperCase();
  const transactionCurrency = transactions.find((transaction) => transaction.currency)?.currency;
  return transactionCurrency?.toUpperCase() ?? '';
}

export async function verifyPayment(paymentId: string): Promise<VerifiedMyFatoorahPayment> {
  if (!paymentId || paymentId.length > 200) {
    throw new MyFatoorahError('A valid payment ID is required.', 400, 'INVALID_PAYMENT_ID');
  }

  const invoice = asRecord(await requestMyFatoorah<unknown>('/v2/GetPaymentStatus', {
    Key: paymentId,
    KeyType: 'paymentid',
  }));
  const invoiceDisplay = parseInvoiceDisplayValue(invoice.InvoiceDisplayValue);
  const rawTransactions = Array.isArray(invoice.InvoiceTransactions) ? invoice.InvoiceTransactions : [];
  const transactions = rawTransactions.map((entry) => {
    const transaction = asRecord(entry);
    const error = asRecord(transaction.Error);
    return {
      transactionId: asString(transaction.TransactionId ?? transaction.Id),
      paymentId: asString(transaction.PaymentId),
      gateway: asString(transaction.PaymentGateway ?? transaction.PaymentMethod),
      status: asString(transaction.TransactionStatus ?? transaction.Status),
      currency: asString(transaction.PaidCurrency ?? transaction.CurrencyIso).toUpperCase(),
      amount: transaction.PaidAmount == null ? null : asNumber(transaction.PaidAmount),
      createdAt: asString(transaction.TransactionDate ?? transaction.CreatedDate),
      errorCode: asString(transaction.ErrorCode ?? error.Code) || undefined,
      errorMessage: asString(transaction.ErrorMessage ?? error.Message) || undefined,
    } satisfies MyFatoorahTransaction;
  });

  return {
    invoiceId: asString(invoice.InvoiceId ?? invoice.Id),
    invoiceStatus: asString(invoice.InvoiceStatus ?? invoice.Status),
    invoiceValue: invoiceDisplay?.amount ?? asNumber(invoice.InvoiceValue ?? invoice.Value),
    currency: invoiceDisplay?.currency ?? extractCurrency(invoice, transactions),
    customerReference: asString(invoice.CustomerReference),
    customerIdentifier: asString(invoice.CustomerIdentifier ?? invoice.ExternalIdentifier),
    userDefinedField: asString(invoice.UserDefinedField),
    createdAt: asString(invoice.CreatedDate ?? invoice.CreationDate),
    expiryDate: asString(invoice.ExpiryDate ?? invoice.ExpirationDate),
    transactions,
    environment: getMyFatoorahEnvironment(),
  };
}

export function buildPaymentStatusChangedSignature(payload: unknown): string {
  const root = asRecord(payload);
  const data = asRecord(root.Data);
  const invoice = asRecord(data.Invoice);
  const transaction = asRecord(data.Transaction);
  return [
    ['Invoice.Id', invoice.Id],
    ['Invoice.Status', invoice.Status],
    ['Transaction.Status', transaction.Status],
    ['Transaction.PaymentId', transaction.PaymentId],
    ['Invoice.ExternalIdentifier', invoice.ExternalIdentifier],
  ].map(([key, value]) => `${key}=${value == null ? '' : String(value)}`).join(',');
}

export function verifyMyFatoorahWebhookSignature(payload: unknown, suppliedSignature: string | null): boolean {
  const secret = process.env.MYFATOORAH_WEBHOOK_SECRET;
  if (!secret || !suppliedSignature) return false;
  const expected = crypto
    .createHmac('sha256', Buffer.from(secret, 'utf8'))
    .update(Buffer.from(buildPaymentStatusChangedSignature(payload), 'utf8'))
    .digest('base64');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const suppliedBuffer = Buffer.from(suppliedSignature.trim(), 'utf8');
  return expectedBuffer.length === suppliedBuffer.length && crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export async function refundPayment(keyType: 'InvoiceId', key: string, amount: number, comment: string) {
  const data = await requestMyFatoorah<JsonRecord>('/v2/MakeRefund', {
    KeyType: keyType,
    Key: key,
    Amount: amount,
    Comment: comment,
    ServiceCharge: 0,
  });
  return Boolean(data);
}
