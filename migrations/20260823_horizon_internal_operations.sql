-- Horizon internal operations suite. Odoo remains intentionally untouched.

CREATE TABLE IF NOT EXISTS public.operation_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id integer REFERENCES public.properties(id) ON DELETE SET NULL,
  landlord_id integer REFERENCES public.landlords(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  expense_date date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Riyadh')::date,
  category text NOT NULL DEFAULT 'operations' CHECK (category IN ('operations','maintenance','utilities','cleaning','supplies','marketing','tax','other')),
  description text NOT NULL,
  amount_sar numeric(12,2) NOT NULL CHECK (amount_sar >= 0),
  vat_sar numeric(12,2) NOT NULL DEFAULT 0 CHECK (vat_sar >= 0),
  total_sar numeric(12,2) GENERATED ALWAYS AS (amount_sar + vat_sar) STORED,
  landlord_share_pct numeric(5,2) NOT NULL DEFAULT 0 CHECK (landlord_share_pct >= 0 AND landlord_share_pct <= 100),
  payer text NOT NULL DEFAULT 'horizon' CHECK (payer IN ('horizon','landlord','shared')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','partially_paid','paid','rejected','void')),
  paid_amount_sar numeric(12,2) NOT NULL DEFAULT 0 CHECK (paid_amount_sar >= 0),
  invoice_number text,
  receipt_url text,
  notes text,
  submitted_at timestamptz,
  approved_at timestamptz,
  approved_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.operation_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id integer REFERENCES public.properties(id) ON DELETE SET NULL,
  landlord_id integer REFERENCES public.landlords(id) ON DELETE SET NULL,
  expense_id uuid REFERENCES public.operation_expenses(id) ON DELETE SET NULL,
  module text NOT NULL CHECK (module IN ('expense','rental','invoice','crm','pos','subscription','accounting','general')),
  title text NOT NULL,
  file_url text,
  file_name text,
  mime_type text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  source text NOT NULL DEFAULT 'manual',
  stage text NOT NULL DEFAULT 'new' CHECK (stage IN ('new','contacted','qualified','won','lost')),
  expected_value_sar numeric(12,2) NOT NULL DEFAULT 0 CHECK (expected_value_sar >= 0),
  property_id integer REFERENCES public.properties(id) ON DELETE SET NULL,
  owner_name text,
  next_action_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pos_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id integer REFERENCES public.properties(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  reference text NOT NULL UNIQUE,
  description text NOT NULL,
  amount_sar numeric(12,2) NOT NULL CHECK (amount_sar >= 0),
  method text NOT NULL DEFAULT 'cash' CHECK (method IN ('cash','card','transfer','gateway','other')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','paid','void','refunded')),
  happened_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.operation_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id integer REFERENCES public.properties(id) ON DELETE SET NULL,
  landlord_id integer REFERENCES public.landlords(id) ON DELETE SET NULL,
  name text NOT NULL,
  amount_sar numeric(12,2) NOT NULL CHECK (amount_sar >= 0),
  cadence text NOT NULL DEFAULT 'monthly' CHECK (cadence IN ('monthly','quarterly','yearly')),
  next_renewal date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','paused','cancelled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rental_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id integer NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  landlord_id integer REFERENCES public.landlords(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  reference text NOT NULL UNIQUE,
  start_date date NOT NULL,
  end_date date NOT NULL CHECK (end_date > start_date),
  amount_sar numeric(12,2) NOT NULL DEFAULT 0 CHECK (amount_sar >= 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','completed','cancelled')),
  document_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.accounting_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Riyadh')::date,
  account_code text NOT NULL,
  account_name text NOT NULL,
  debit_sar numeric(12,2) NOT NULL DEFAULT 0 CHECK (debit_sar >= 0),
  credit_sar numeric(12,2) NOT NULL DEFAULT 0 CHECK (credit_sar >= 0),
  property_id integer REFERENCES public.properties(id) ON DELETE SET NULL,
  expense_id uuid REFERENCES public.operation_expenses(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  memo text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','posted','void')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((debit_sar = 0 AND credit_sar > 0) OR (credit_sar = 0 AND debit_sar > 0))
);

CREATE TABLE IF NOT EXISTS public.signature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES public.operation_documents(id) ON DELETE SET NULL,
  rental_agreement_id uuid REFERENCES public.rental_agreements(id) ON DELETE SET NULL,
  signer_name text NOT NULL,
  signer_email text,
  signer_phone text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','viewed','signed','declined','expired')),
  signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.operation_spreadsheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  module text NOT NULL DEFAULT 'operations' CHECK (module IN ('operations','finance','expenses','rental','crm','pos')),
  columns_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  rows_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.operation_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  action text NOT NULL,
  record_id uuid,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS operation_expenses_property_date_idx ON public.operation_expenses(property_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS operation_expenses_landlord_date_idx ON public.operation_expenses(landlord_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS crm_leads_stage_idx ON public.crm_leads(stage, created_at DESC);
CREATE INDEX IF NOT EXISTS rental_agreements_property_idx ON public.rental_agreements(property_id, start_date DESC);

ALTER TABLE public.operation_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_spreadsheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_audit_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.admin_financial_report(
  p_token text,
  p_from date DEFAULT NULL,
  p_to date DEFAULT NULL,
  p_property_id integer DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f date := COALESCE(p_from, date_trunc('year', now() AT TIME ZONE 'Asia/Riyadh')::date);
        t date := COALESCE(p_to, (now() AT TIME ZONE 'Asia/Riyadh')::date);
BEGIN
  IF NOT _is_admin(p_token) THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthorized'); END IF;
  IF t < f OR t > f + 731 THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid_date_range'); END IF;
  RETURN jsonb_build_object(
    'ok', true,
    'range', jsonb_build_object('from', f, 'to', t, 'property_id', p_property_id),
    'totals', (
      WITH b AS (
        SELECT b.* FROM bookings b WHERE b.status <> 'cancelled' AND b.check_in BETWEEN f AND t AND (p_property_id IS NULL OR b.property_id = p_property_id)
      ), e AS (
        SELECT e.* FROM operation_expenses e WHERE e.status IN ('approved','partially_paid','paid') AND e.expense_date BETWEEN f AND t AND (p_property_id IS NULL OR e.property_id = p_property_id)
      ) SELECT jsonb_build_object(
        'gross_revenue', COALESCE((SELECT sum(amount_sar) FROM b), 0),
        'horizon_commission', COALESCE((SELECT sum(round(amount_sar * _commission_pct_for(property_id, commission_pct) / 100, 2)) FROM b), 0),
        'landlord_before_expenses', COALESCE((SELECT sum(round(amount_sar * (100 - _commission_pct_for(property_id, commission_pct)) / 100, 2)) FROM b), 0),
        'approved_expenses', COALESCE((SELECT sum(total_sar) FROM e), 0),
        'landlord_expense_share', COALESCE((SELECT sum(round(total_sar * landlord_share_pct / 100, 2)) FROM e), 0),
        'bookings', COALESCE((SELECT count(*) FROM b), 0),
        'nights', COALESCE((SELECT sum(check_out - check_in) FROM b), 0)
      )
    ),
    'by_property', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'property_id', p.id, 'name_ar', p.name_ar, 'name_en', p.name_en,
        'gross_revenue', COALESCE((SELECT sum(b.amount_sar) FROM bookings b WHERE b.status <> 'cancelled' AND b.property_id = p.id AND b.check_in BETWEEN f AND t), 0),
        'horizon_commission', COALESCE((SELECT sum(round(b.amount_sar * _commission_pct_for(b.property_id, b.commission_pct) / 100, 2)) FROM bookings b WHERE b.status <> 'cancelled' AND b.property_id = p.id AND b.check_in BETWEEN f AND t), 0),
        'approved_expenses', COALESCE((SELECT sum(e.total_sar) FROM operation_expenses e WHERE e.status IN ('approved','partially_paid','paid') AND e.property_id = p.id AND e.expense_date BETWEEN f AND t), 0),
        'landlord_expense_share', COALESCE((SELECT sum(round(e.total_sar * e.landlord_share_pct / 100, 2)) FROM operation_expenses e WHERE e.status IN ('approved','partially_paid','paid') AND e.property_id = p.id AND e.expense_date BETWEEN f AND t), 0)
      ) ORDER BY p.name_ar)
      FROM properties p WHERE (p_property_id IS NULL OR p.id = p_property_id)
    ), '[]'::jsonb),
    'expense_categories', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('category', category, 'total', total, 'count', count) ORDER BY total DESC)
      FROM (SELECT category, sum(total_sar) AS total, count(*) AS count FROM operation_expenses WHERE status IN ('approved','partially_paid','paid') AND expense_date BETWEEN f AND t AND (p_property_id IS NULL OR property_id = p_property_id) GROUP BY category) categories
    ), '[]'::jsonb)
  );
END $$;

CREATE OR REPLACE FUNCTION public.admin_operation_expense(
  p_token text,
  p_action text,
  p_expense jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid := NULLIF(p_expense->>'id','')::uuid;
        v_status text := COALESCE(p_expense->>'status', 'draft');
BEGIN
  IF NOT _is_admin(p_token) THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthorized'); END IF;
  IF p_action = 'list' THEN
    RETURN jsonb_build_object('ok', true, 'expenses', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', e.id, 'property_id', e.property_id, 'property_name_ar', p.name_ar, 'landlord_id', e.landlord_id, 'landlord_name', l.name,
        'expense_date', e.expense_date, 'category', e.category, 'description', e.description, 'amount_sar', e.amount_sar, 'vat_sar', e.vat_sar, 'total_sar', e.total_sar,
        'landlord_share_pct', e.landlord_share_pct, 'payer', e.payer, 'status', e.status, 'paid_amount_sar', e.paid_amount_sar, 'invoice_number', e.invoice_number,
        'receipt_url', e.receipt_url, 'notes', e.notes, 'created_at', e.created_at
      ) ORDER BY e.expense_date DESC, e.created_at DESC) FROM operation_expenses e LEFT JOIN properties p ON p.id = e.property_id LEFT JOIN landlords l ON l.id = e.landlord_id
    ), '[]'::jsonb));
  END IF;
  IF p_action = 'create' THEN
    IF COALESCE(trim(p_expense->>'description'), '') = '' OR COALESCE((p_expense->>'amount_sar')::numeric, -1) < 0 THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid_expense'); END IF;
    INSERT INTO operation_expenses(property_id, landlord_id, booking_id, expense_date, category, description, amount_sar, vat_sar, landlord_share_pct, payer, status, paid_amount_sar, invoice_number, receipt_url, notes, submitted_at)
    VALUES (NULLIF(p_expense->>'property_id','')::integer, NULLIF(p_expense->>'landlord_id','')::integer, NULLIF(p_expense->>'booking_id','')::uuid,
      COALESCE(NULLIF(p_expense->>'expense_date','')::date, (now() AT TIME ZONE 'Asia/Riyadh')::date), COALESCE(NULLIF(p_expense->>'category',''),'operations'), trim(p_expense->>'description'),
      COALESCE((p_expense->>'amount_sar')::numeric,0), COALESCE((p_expense->>'vat_sar')::numeric,0), COALESCE((p_expense->>'landlord_share_pct')::numeric,0), COALESCE(NULLIF(p_expense->>'payer',''),'horizon'),
      CASE WHEN v_status IN ('draft','submitted') THEN v_status ELSE 'draft' END, COALESCE((p_expense->>'paid_amount_sar')::numeric,0), NULLIF(p_expense->>'invoice_number',''), NULLIF(p_expense->>'receipt_url',''), NULLIF(p_expense->>'notes',''),
      CASE WHEN v_status = 'submitted' THEN now() ELSE NULL END) RETURNING id INTO v_id;
    INSERT INTO operation_audit_log(module, action, record_id, detail) VALUES ('expense', 'created', v_id, jsonb_build_object('status', v_status));
    RETURN jsonb_build_object('ok', true, 'id', v_id);
  END IF;
  IF p_action = 'status' THEN
    IF v_id IS NULL OR v_status NOT IN ('draft','submitted','approved','partially_paid','paid','rejected','void') THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid_status_update'); END IF;
    UPDATE operation_expenses SET status = v_status, paid_amount_sar = COALESCE((p_expense->>'paid_amount_sar')::numeric, paid_amount_sar), approved_at = CASE WHEN v_status IN ('approved','partially_paid','paid') THEN now() ELSE approved_at END, approved_by = CASE WHEN v_status IN ('approved','partially_paid','paid') THEN 'admin' ELSE approved_by END, updated_at = now() WHERE id = v_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'expense_not_found'); END IF;
    INSERT INTO operation_audit_log(module, action, record_id, detail) VALUES ('expense', 'status_changed', v_id, jsonb_build_object('status', v_status));
    RETURN jsonb_build_object('ok', true);
  END IF;
  RETURN jsonb_build_object('ok', false, 'error', 'bad_action');
END $$;

CREATE OR REPLACE FUNCTION public.landlord_financial_report(
  p_token text,
  p_from date DEFAULT NULL,
  p_to date DEFAULT NULL,
  p_property_id integer DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_landlord landlords%ROWTYPE;
        f date := COALESCE(p_from, date_trunc('year', now() AT TIME ZONE 'Asia/Riyadh')::date);
        t date := COALESCE(p_to, (now() AT TIME ZONE 'Asia/Riyadh')::date);
BEGIN
  SELECT * INTO v_landlord FROM landlords WHERE session_token = p_token AND is_active = true;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthorized'); END IF;
  IF t < f OR t > f + 731 THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid_date_range'); END IF;
  RETURN jsonb_build_object(
    'ok', true, 'range', jsonb_build_object('from', f, 'to', t),
    'totals', (
      WITH b AS (SELECT b.*, pl.relation_type, COALESCE(pl.commission_pct, v_landlord.default_commission_pct) commission_pct FROM bookings b JOIN property_landlords pl ON pl.property_id = b.property_id WHERE pl.landlord_id = v_landlord.id AND b.status <> 'cancelled' AND b.check_in BETWEEN f AND t AND (p_property_id IS NULL OR b.property_id = p_property_id)),
           e AS (SELECT e.*, CASE WHEN e.landlord_id = v_landlord.id THEN 100 ELSE e.landlord_share_pct END owner_share_pct FROM operation_expenses e WHERE e.status IN ('approved','partially_paid','paid') AND e.expense_date BETWEEN f AND t AND (e.landlord_id = v_landlord.id OR e.property_id IN (SELECT property_id FROM property_landlords WHERE landlord_id = v_landlord.id)) AND (p_property_id IS NULL OR e.property_id = p_property_id))
      SELECT jsonb_build_object('gross_revenue', COALESCE((SELECT sum(amount_sar) FROM b),0), 'horizon_commission', COALESCE((SELECT sum(CASE WHEN relation_type = 'owned' THEN 0 ELSE round(amount_sar * commission_pct / 100,2) END) FROM b),0), 'owner_before_expenses', COALESCE((SELECT sum(CASE WHEN relation_type = 'owned' THEN amount_sar ELSE round(amount_sar * (100-commission_pct)/100,2) END) FROM b),0), 'owner_expenses', COALESCE((SELECT sum(round(total_sar * owner_share_pct / 100,2)) FROM e),0), 'bookings', COALESCE((SELECT count(*) FROM b),0), 'nights', COALESCE((SELECT sum(check_out-check_in) FROM b),0))
    ),
    'expenses', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', e.id, 'property_id', e.property_id, 'property_name_ar', p.name_ar, 'expense_date', e.expense_date, 'category', e.category, 'description', e.description, 'total_sar', e.total_sar, 'owner_share_sar', round(e.total_sar * CASE WHEN e.landlord_id = v_landlord.id THEN 100 ELSE e.landlord_share_pct END / 100,2), 'status', e.status, 'invoice_number', e.invoice_number) ORDER BY e.expense_date DESC) FROM operation_expenses e LEFT JOIN properties p ON p.id = e.property_id WHERE e.status IN ('approved','partially_paid','paid') AND e.expense_date BETWEEN f AND t AND (e.landlord_id = v_landlord.id OR e.property_id IN (SELECT property_id FROM property_landlords WHERE landlord_id = v_landlord.id)) AND (p_property_id IS NULL OR e.property_id = p_property_id)), '[]'::jsonb)
  );
END $$;
