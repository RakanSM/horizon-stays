-- Fix PL/pgSQL output-column ambiguity in the paid fulfillment upsert.
-- This only replaces the reconciliation function; tables and properties are untouched.
CREATE OR REPLACE FUNCTION record_verified_myfatoorah_state(
  p_booking_id UUID,p_invoice_id TEXT,p_payment_id TEXT,p_transaction_id TEXT,p_gateway_method TEXT,
  p_provider_status TEXT,p_internal_status TEXT,p_amount NUMERIC,p_currency TEXT,p_environment TEXT,
  p_event_reference TEXT DEFAULT NULL,p_provider_created_at TIMESTAMPTZ DEFAULT NULL,p_transaction_created_at TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(booking_id UUID,newly_paid BOOLEAN,payment_status TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b bookings%ROWTYPE; was_paid BOOLEAN;
BEGIN
  IF p_internal_status NOT IN ('pending','paid','canceled','expired','failed') THEN RAISE EXCEPTION 'invalid_internal_status'; END IF;
  SELECT * INTO b FROM bookings WHERE id=p_booking_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'booking_not_found'; END IF;
  IF b.payment_invoice_id IS NULL THEN RAISE EXCEPTION 'payment_not_initiated'; END IF;
  IF b.payment_invoice_id IS DISTINCT FROM p_invoice_id THEN RAISE EXCEPTION 'invoice_mismatch'; END IF;
  IF b.payment_environment IS DISTINCT FROM p_environment THEN RAISE EXCEPTION 'environment_mismatch'; END IF;
  IF UPPER(COALESCE(p_currency,''))<>'SAR' THEN RAISE EXCEPTION 'currency_mismatch'; END IF;
  IF ABS(b.amount_sar-p_amount)>0.01 THEN RAISE EXCEPTION 'amount_mismatch'; END IF;
  was_paid := b.payment_status='paid';
  IF was_paid AND p_internal_status<>'paid' THEN RETURN QUERY SELECT b.id,FALSE,b.payment_status; RETURN; END IF;
  IF was_paid AND b.payment_id IS DISTINCT FROM p_payment_id THEN RAISE EXCEPTION 'payment_identity_conflict'; END IF;

  UPDATE bookings SET payment_status=p_internal_status,
    status=CASE WHEN p_internal_status='paid' THEN 'confirmed' ELSE status END,
    payment_id=COALESCE(NULLIF(p_payment_id,''),payment_id),payment_updated_at=NOW(),
    payment_completed_at=CASE WHEN p_internal_status IN ('paid','canceled','expired','failed') THEN COALESCE(payment_completed_at,NOW()) ELSE NULL END
  WHERE id=b.id;

  UPDATE payments SET status=p_internal_status,payment_id=COALESCE(NULLIF(p_payment_id,''),payment_id),
    provider_transaction_id=COALESCE(NULLIF(p_transaction_id,''),provider_transaction_id),gateway_method=COALESCE(NULLIF(p_gateway_method,''),gateway_method),
    provider_status=p_provider_status,currency='SAR',environment=p_environment,event_reference=COALESCE(p_event_reference,event_reference),
    provider_created_at=COALESCE(p_transaction_created_at,p_provider_created_at,provider_created_at),updated_at=NOW(),
    completed_at=CASE WHEN p_internal_status IN ('paid','canceled','expired','failed') THEN COALESCE(completed_at,NOW()) ELSE NULL END
  WHERE invoice_id=p_invoice_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'payment_attempt_missing'; END IF;

  IF p_internal_status='paid' THEN
    INSERT INTO payment_fulfillments(booking_id) VALUES(b.id)
    ON CONFLICT ON CONSTRAINT payment_fulfillments_pkey DO NOTHING;
  END IF;
  RETURN QUERY SELECT b.id,(p_internal_status='paid' AND NOT was_paid),p_internal_status;
END $$;

REVOKE ALL ON FUNCTION record_verified_myfatoorah_state(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,NUMERIC,TEXT,TEXT,TEXT,TIMESTAMPTZ,TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_verified_myfatoorah_state(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,NUMERIC,TEXT,TEXT,TEXT,TIMESTAMPTZ,TIMESTAMPTZ) TO service_role;
NOTIFY pgrst, 'reload schema';
