const MF_BASE = 'https://apitest.myfatoorah.com';
const API_KEY = 'SK_KWT_vVZlnnAqu8jRByOWaRPNId4ShzEDNt256dvnjebuyzo52dXjAfRx2ixW5umjWSUx';

async function testInitiatePayment() {
  console.log('--- Starting MyFatoorah Integration Test (JS) ---');
  
  const body = {
    CustomerName: 'Test Guest',
    NotificationOption: 'ALL',
    InvoiceValue: 10,
    DisplayCurrencyIso: 'SAR',
    CallBackUrl: 'http://localhost:3000/api/payments/callback',
    ErrorUrl: 'http://localhost:3000/ar/booking?error=payment_failed',
    Language: 'ar',
    CustomerReference: 'test-booking-' + Date.now(),
    CustomerEmail: 'test@example.com',
    CustomerMobile: '500000000',
  };

  try {
    const res = await fetch(`${MF_BASE}/v2/SendPayment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    
    if (data.IsSuccess) {
      console.log('\n--- Success! ---');
      console.log('Invoice ID:', data.Data.InvoiceId);
      console.log('Payment URL:', data.Data.InvoiceURL);
      console.log('\nYou can visit the Payment URL above to test the payment flow in the sandbox.');
    } else {
      console.error('\n--- MyFatoorah Error ---');
      console.error('Message:', data.Message);
      console.error('Errors:', data.ValidationErrors);
    }
  } catch (error) {
    console.error('\n--- Network Error ---');
    console.error(error);
  }
}

testInitiatePayment();
