import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { verifyMyFatoorahWebhookSignature, verifyPayment } from '@/lib/myfatoorah';
import { recordVerifiedPayment } from '@/lib/payment-processing';

type JsonRecord = Record<string, unknown>;
const asRecord = (value: unknown): JsonRecord => value && typeof value === 'object' ? value as JsonRecord : {};

export async function POST(req: Request) {
  let payload: unknown;
  try { payload = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }
  if (!verifyMyFatoorahWebhookSignature(payload, req.headers.get('myfatoorah-signature'))) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  const root = asRecord(payload);
  const event = asRecord(root.Event);
  const data = asRecord(root.Data);
  const transaction = asRecord(data.Transaction);
  if (Number(event.Code) !== 1 || String(event.Name) !== 'PAYMENT_STATUS_CHANGED') return NextResponse.json({ received: true, ignored: true });
  const eventReference = String(event.Reference ?? '').trim();
  const paymentId = String(transaction.PaymentId ?? '').trim();
  if (!eventReference || !paymentId) return NextResponse.json({ error: 'Event.Reference and PaymentId are required.' }, { status: 400 });

  const supabase = createServerClient() as any;
  const { data: claimed, error: claimError } = await supabase.rpc('claim_myfatoorah_webhook_event', {
    p_event_reference: eventReference,
    p_event_name: String(event.Name),
    p_payment_id: paymentId,
  });
  if (claimError) return NextResponse.json({ error: 'Webhook deduplication failed.' }, { status: 500 });
  if (!claimed) return NextResponse.json({ received: true, duplicate: true });

  try {
    const verified = await verifyPayment(paymentId);
    const result = await recordVerifiedPayment(verified, eventReference);
    const { error: finishError } = await supabase.rpc('finish_myfatoorah_webhook_event', { p_event_reference: eventReference, p_error: null });
    if (finishError) throw finishError;
    return NextResponse.json({ received: true, duplicate: false, status: result.status, paid: result.paid, newlyPaid: result.newlyPaid });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed.';
    await supabase.rpc('finish_myfatoorah_webhook_event', { p_event_reference: eventReference, p_error: message });
    console.error('MyFatoorah webhook processing failed:', error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
