-- Self-contained MyFatoorah payment state, webhook idempotency, and fulfillment consistency.
-- Safe when properties exists but bookings/payments do not. The working properties schema is not modified.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id INTEGER NOT NULL REFERENCES properties(id),
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  guest_email TEXT,
  platform TEXT DEFAULT 'direct',
  platform_booking_id TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL,
  guests_count INTEGER DEFAULT 1,
  amount_sar NUMERIC NOT NULL DEFAULT 0,
  source TEXT,
  confirmation_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  door_code TEXT,
  door_code_expires TIMESTAMPTZ,
  odoo_invoice_id INTEGER,
  zatca_invoice_id TEXT,
  zatca_qr TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  method TEXT NOT NULL DEFAULT 'myfatoorah',
  amount_sar NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  gateway_ref TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS confirmation_code TEXT,
  ADD COLUMN IF NOT EXISTS odoo_invoice_id INTEGER,
  ADD COLUMN IF NOT EXISTS zatca_invoice_id TEXT,
  ADD COLUMN IF NOT EXISTS zatca_qr TEXT,
  ADD COLUMN IF NOT EXISTS payment_method_id INTEGER,
  ADD COLUMN IF NOT EXISTS payment_invoice_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_environment TEXT,
  ADD COLUMN IF NOT EXISTS payment_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_initiated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMPTZ;

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS invoice_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS gateway_method TEXT,
  ADD COLUMN IF NOT EXISTS provider_status TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'SAR',
  ADD COLUMN IF NOT EXISTS environment TEXT,
  ADD COLUMN IF NOT EXISTS event_reference TEXT,
  ADD COLUMN IF NOT EXISTS provider_created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Expand legacy constraints without depending on whether 001_init.sql ran.
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_environment_check;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_environment_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check CHECK (payment_status IN ('pending','pending_review','paid','canceled','expired','failed','refunded')) NOT VALID;
ALTER TABLE payments ADD CONSTRAINT payments_status_check CHECK (status IN ('pending','pending_review','paid','canceled','expired','failed','refunded')) NOT VALID;
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_environment_check CHECK (payment_environment IS NULL OR payment_environment IN ('test','live')) NOT VALID;
ALTER TABLE payments ADD CONSTRAINT payments_environment_check CHECK (environment IS NULL OR environment IN ('test','live')) NOT VALID;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_confirmation_code_unique ON bookings(confirmation_code) WHERE confirmation_code IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS bookings_payment_invoice_id_unique ON bookings(payment_invoice_id) WHERE payment_invoice_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS bookings_payment_id_unique ON bookings(payment_id) WHERE payment_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS payments_invoice_id_unique ON payments(invoice_id) WHERE invoice_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS payments_payment_id_unique ON payments(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS payments_booking_id_idx ON payments(booking_id);

CREATE TABLE IF NOT EXISTS myfatoorah_webhook_events (
  event_reference TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','processed','failed')),
  attempts INTEGER NOT NULL DEFAULT 1,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);
ALTER TABLE myfatoorah_webhook_events
  ADD COLUMN IF NOT EXISTS event_name TEXT,
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS payment_fulfillments (
  booking_id UUID PRIMARY KEY REFERENCES bookings(id) ON DELETE CASCADE,
  door_code TEXT,
  keyboard_pwd_id BIGINT,
  door_status TEXT NOT NULL DEFAULT 'pending',
  door_message_status TEXT NOT NULL DEFAULT 'pending',
  welcome_status TEXT NOT NULL DEFAULT 'pending',
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE payment_fulfillments
  ADD COLUMN IF NOT EXISTS door_code TEXT,
  ADD COLUMN IF NOT EXISTS keyboard_pwd_id BIGINT,
  ADD COLUMN IF NOT EXISTS door_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS door_message_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS welcome_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE payment_fulfillments DROP CONSTRAINT IF EXISTS payment_fulfillments_door_status_check;
ALTER TABLE payment_fulfillments DROP CONSTRAINT IF EXISTS payment_fulfillments_door_message_status_check;
ALTER TABLE payment_fulfillments DROP CONSTRAINT IF EXISTS payment_fulfillments_welcome_status_check;
ALTER TABLE payment_fulfillments ADD CONSTRAINT payment_fulfillments_door_status_check CHECK (door_status IN ('pending','processing','done','skipped','failed','manual_review')) NOT VALID;
ALTER TABLE payment_fulfillments ADD CONSTRAINT payment_fulfillments_door_message_status_check CHECK (door_message_status IN ('pending','processing','done','skipped','failed')) NOT VALID;
ALTER TABLE payment_fulfillments ADD CONSTRAINT payment_fulfillments_welcome_status_check CHECK (welcome_status IN ('pending','processing','done','skipped','failed')) NOT VALID;

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE myfatoorah_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_fulfillments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bookings' AND policyname='Admin full access') THEN
    CREATE POLICY "Admin full access" ON bookings FOR ALL USING (auth.role()='authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Admin full access') THEN
    CREATE POLICY "Admin full access" ON payments FOR ALL USING (auth.role()='authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='myfatoorah_webhook_events' AND policyname='Admin full access') THEN
    CREATE POLICY "Admin full access" ON myfatoorah_webhook_events FOR ALL USING (auth.role()='authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payment_fulfillments' AND policyname='Admin full access') THEN
    CREATE POLICY "Admin full access" ON payment_fulfillments FOR ALL USING (auth.role()='authenticated');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION claim_myfatoorah_initialization(p_booking_id UUID)
RETURNS TABLE(action TEXT, existing_url TEXT) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b bookings%ROWTYPE;
BEGIN
  SELECT * INTO b FROM bookings WHERE id=p_booking_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'booking_not_found'; END IF;
  IF b.payment_status='paid' THEN RAISE EXCEPTION 'booking_already_paid'; END IF;
  IF b.payment_url IS NOT NULL AND b.payment_status='pending' THEN RETURN QUERY SELECT 'reuse'::TEXT,b.payment_url; RETURN; END IF;
  IF b.payment_initiated_at IS NOT NULL AND b.payment_initiated_at>NOW()-INTERVAL '2 minutes' THEN RAISE EXCEPTION 'payment_initialization_in_progress'; END IF;
  UPDATE bookings SET payment_initiated_at=NOW(),payment_updated_at=NOW(),payment_method='myfatoorah',
    payment_url=NULL,payment_invoice_id=NULL,payment_id=NULL,payment_method_id=NULL,payment_completed_at=NULL
  WHERE id=p_booking_id;
  RETURN QUERY SELECT 'claimed'::TEXT,NULL::TEXT;
END $$;

-- Persist the pending attempt atomically before any payment URL is returned to the browser.
CREATE OR REPLACE FUNCTION record_myfatoorah_attempt(
  p_booking_id UUID,p_invoice_id TEXT,p_method_id INTEGER,p_gateway_method TEXT,p_amount NUMERIC,
  p_currency TEXT,p_environment TEXT,p_payment_url TEXT,p_provider_created_at TIMESTAMPTZ DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b bookings%ROWTYPE;
BEGIN
  SELECT * INTO b FROM bookings WHERE id=p_booking_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'booking_not_found'; END IF;
  IF b.payment_status='paid' THEN RAISE EXCEPTION 'booking_already_paid'; END IF;
  IF ABS(b.amount_sar-p_amount)>0.01 THEN RAISE EXCEPTION 'amount_mismatch'; END IF;
  IF UPPER(COALESCE(p_currency,''))<>'SAR' THEN RAISE EXCEPTION 'currency_mismatch'; END IF;
  IF p_environment NOT IN ('test','live') THEN RAISE EXCEPTION 'environment_mismatch'; END IF;
  UPDATE bookings SET payment_status='pending',payment_method='myfatoorah',payment_method_id=p_method_id,
    payment_invoice_id=p_invoice_id,payment_environment=p_environment,payment_url=p_payment_url,
    payment_initiated_at=COALESCE(payment_initiated_at,NOW()),payment_updated_at=NOW() WHERE id=p_booking_id;
  INSERT INTO payments(booking_id,method,amount_sar,status,gateway_ref,invoice_id,gateway_method,provider_status,currency,environment,provider_created_at,created_at,updated_at)
  VALUES(p_booking_id,'myfatoorah',p_amount,'pending',p_invoice_id,p_invoice_id,p_gateway_method,'Pending','SAR',p_environment,p_provider_created_at,NOW(),NOW())
  ON CONFLICT (invoice_id) WHERE invoice_id IS NOT NULL DO UPDATE SET
    status='pending',gateway_method=EXCLUDED.gateway_method,provider_status='Pending',updated_at=NOW();
END $$;

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

  IF p_internal_status='paid' THEN INSERT INTO payment_fulfillments(booking_id) VALUES(b.id) ON CONFLICT ON CONSTRAINT payment_fulfillments_pkey DO NOTHING; END IF;
  RETURN QUERY SELECT b.id,(p_internal_status='paid' AND NOT was_paid),p_internal_status;
END $$;

-- Atomic Webhook V2 dedupe. Failed events can retry; live processing is reclaimable only after five minutes.
CREATE OR REPLACE FUNCTION claim_myfatoorah_webhook_event(p_event_reference TEXT,p_event_name TEXT,p_payment_id TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE claimed BOOLEAN;
BEGIN
  INSERT INTO myfatoorah_webhook_events(event_reference,event_name,payment_id) VALUES(p_event_reference,p_event_name,p_payment_id)
  ON CONFLICT(event_reference) DO UPDATE SET status='processing',attempts=myfatoorah_webhook_events.attempts+1,
    payment_id=EXCLUDED.payment_id,last_error=NULL,updated_at=NOW()
  WHERE myfatoorah_webhook_events.status='failed' OR (myfatoorah_webhook_events.status='processing' AND myfatoorah_webhook_events.updated_at<NOW()-INTERVAL '5 minutes')
  RETURNING TRUE INTO claimed;
  RETURN COALESCE(claimed,FALSE);
END $$;
CREATE OR REPLACE FUNCTION finish_myfatoorah_webhook_event(p_event_reference TEXT,p_error TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  UPDATE myfatoorah_webhook_events SET status=CASE WHEN p_error IS NULL THEN 'processed' ELSE 'failed' END,
    last_error=LEFT(p_error,1000),updated_at=NOW(),processed_at=CASE WHEN p_error IS NULL THEN NOW() ELSE NULL END
  WHERE event_reference=p_event_reference;
$$;

REVOKE ALL ON FUNCTION claim_myfatoorah_initialization(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION record_myfatoorah_attempt(UUID,TEXT,INTEGER,TEXT,NUMERIC,TEXT,TEXT,TEXT,TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION record_verified_myfatoorah_state(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,NUMERIC,TEXT,TEXT,TEXT,TIMESTAMPTZ,TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION claim_myfatoorah_webhook_event(TEXT,TEXT,TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION finish_myfatoorah_webhook_event(TEXT,TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION claim_myfatoorah_initialization(UUID) FROM anon, authenticated;
REVOKE ALL ON FUNCTION record_myfatoorah_attempt(UUID,TEXT,INTEGER,TEXT,NUMERIC,TEXT,TEXT,TEXT,TIMESTAMPTZ) FROM anon, authenticated;
REVOKE ALL ON FUNCTION record_verified_myfatoorah_state(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,NUMERIC,TEXT,TEXT,TEXT,TIMESTAMPTZ,TIMESTAMPTZ) FROM anon, authenticated;
REVOKE ALL ON FUNCTION claim_myfatoorah_webhook_event(TEXT,TEXT,TEXT) FROM anon, authenticated;
REVOKE ALL ON FUNCTION finish_myfatoorah_webhook_event(TEXT,TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION claim_myfatoorah_initialization(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION record_myfatoorah_attempt(UUID,TEXT,INTEGER,TEXT,NUMERIC,TEXT,TEXT,TEXT,TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION record_verified_myfatoorah_state(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,NUMERIC,TEXT,TEXT,TEXT,TIMESTAMPTZ,TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION claim_myfatoorah_webhook_event(TEXT,TEXT,TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION finish_myfatoorah_webhook_event(TEXT,TEXT) TO service_role;

-- Refresh PostgREST after the transactional migration commits.
NOTIFY pgrst, 'reload schema';
