import { initiatePayment } from './lib/myfatoorah';

// Mock environment variables for testing
process.env.MYFATOORAH_API_KEY = 'SK_KWT_vVZlnnAqu8jRByOWaRPNId4ShzEDNt256dvnjebuyzo52dXjAfRx2ixW5umjWSUx';
process.env.MYFATOORAH_ENV = 'test';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

async function testIntegration() {
  console.log('--- Starting MyFatoorah Integration Test ---');
  
  try {
    const testParams = {
      bookingId: 'test-booking-' + Date.now(),
      amount: 10,
      guestEmail: 'test@example.com',
      guestName: 'Test Guest',
      guestPhone: '+966500000000',
      callbackUrl: 'http://localhost:3000/api/payments/callback',
      errorUrl: 'http://localhost:3000/ar/booking?error=payment_failed',
      lang: 'ar' as const,
    };

    console.log('Initiating test payment with params:', JSON.stringify(testParams, null, 2));
    
    const result = await initiatePayment(testParams);
    
    console.log('\n--- Success! ---');
    console.log('Invoice ID:', result.invoiceId);
    console.log('Payment URL:', result.paymentUrl);
    console.log('\nYou can visit the Payment URL above to test the payment flow in the sandbox.');
    
  } catch (error) {
    console.error('\n--- Test Failed ---');
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

testIntegration();
