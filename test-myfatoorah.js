'use strict';

// Optional sandbox smoke test. It reads credentials from the environment and never embeds or prints them.
const apiKey = process.env.MYFATOORAH_TEST_API_KEY;
if (!apiKey) {
  console.error('MYFATOORAH_TEST_API_KEY is required for the optional sandbox smoke test.');
  process.exit(2);
}
if ((process.env.MYFATOORAH_ENV || 'test').toLowerCase() !== 'test') {
  console.error('Refusing to run against a non-test environment.');
  process.exit(2);
}

fetch('https://apitest.myfatoorah.com/v2/InitiatePayment', {
  method: 'POST',
  headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ InvoiceAmount: 10, CurrencyIso: 'SAR' }),
}).then(async (response) => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.IsSuccess !== true) throw new Error(body.Message || `HTTP ${response.status}`);
  const methods = Array.isArray(body.Data?.PaymentMethods) ? body.Data.PaymentMethods : [];
  console.log(`Sandbox method discovery passed (${methods.length} methods).`);
}).catch((error) => {
  console.error(`Sandbox method discovery failed: ${error.message}`);
  process.exitCode = 1;
});
