-- Financial reporting visibility: reservations, collection, invoices, expenses, and settlement review.
-- This migration preserves existing ledgers. Property costs and maintenance remain separate historical ledgers.

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

  RETURN (
    WITH b AS (
      SELECT b.*
      FROM bookings b
      WHERE b.status <> 'cancelled'
        AND b.check_in BETWEEN f AND t
        AND (p_property_id IS NULL OR b.property_id = p_property_id)
    ), nb AS (
      SELECT b.*,
        CASE lower(COALESCE(NULLIF(b.payment_status, ''), 'unrecorded'))
          WHEN 'paid' THEN 'paid'
          WHEN 'partial' THEN 'partial'
          WHEN 'partially_paid' THEN 'partial'
          WHEN 'pending' THEN 'pending'
          WHEN 'unpaid' THEN 'pending'
          WHEN 'refunded' THEN 'refunded'
          WHEN 'failed' THEN 'failed'
          ELSE 'unrecorded'
        END AS payment_state,
        CASE lower(COALESCE(NULLIF(b.status, ''), 'unrecorded'))
          WHEN 'pending' THEN 'pending'
          WHEN 'confirmed' THEN 'confirmed'
          WHEN 'completed' THEN 'completed'
          ELSE 'unrecorded'
        END AS booking_state
      FROM b
    ), ae AS (
      SELECT e.*
      FROM operation_expenses e
      WHERE e.expense_date BETWEEN f AND t
        AND (p_property_id IS NULL OR e.property_id = p_property_id)
    ), re AS (
      SELECT * FROM ae WHERE status IN ('approved', 'partially_paid', 'paid')
    ), invoices_by_booking AS (
      SELECT nb.id, nb.amount_sar, bool_or(i.id IS NOT NULL) AS has_invoice
      FROM nb LEFT JOIN invoices i ON i.booking_id = nb.id
      GROUP BY nb.id, nb.amount_sar
    )
    SELECT jsonb_build_object(
      'ok', true,
      'range', jsonb_build_object('from', f, 'to', t, 'property_id', p_property_id),
      'totals', jsonb_build_object(
        'gross_revenue', COALESCE((SELECT sum(amount_sar) FROM nb), 0),
        'fully_paid_revenue', COALESCE((SELECT sum(amount_sar) FROM nb WHERE payment_state = 'paid'), 0),
        'collection_review_revenue', COALESCE((SELECT sum(amount_sar) FROM nb WHERE payment_state IN ('pending', 'partial', 'failed', 'unrecorded')), 0),
        'refunded_revenue', COALESCE((SELECT sum(amount_sar) FROM nb WHERE payment_state = 'refunded'), 0),
        'fully_paid_bookings', COALESCE((SELECT count(*) FROM nb WHERE payment_state = 'paid'), 0),
        'collection_review_bookings', COALESCE((SELECT count(*) FROM nb WHERE payment_state IN ('pending', 'partial', 'failed', 'unrecorded')), 0),
        'horizon_commission', COALESCE((SELECT sum(round(amount_sar * _commission_pct_for(property_id, commission_pct) / 100, 2)) FROM nb), 0),
        'landlord_before_expenses', COALESCE((SELECT sum(round(amount_sar * (100 - _commission_pct_for(property_id, commission_pct)) / 100, 2)) FROM nb), 0),
        'approved_expenses', COALESCE((SELECT sum(total_sar) FROM re), 0),
        'paid_expenses', COALESCE((SELECT sum(paid_amount_sar) FROM re), 0),
        'landlord_expense_share', COALESCE((SELECT sum(round(total_sar * landlord_share_pct / 100, 2)) FROM re), 0),
        'bookings', COALESCE((SELECT count(*) FROM nb), 0),
        'nights', COALESCE((SELECT sum(check_out - check_in) FROM nb), 0)
      ),
      'settlement_status', CASE
        WHEN EXISTS (SELECT 1 FROM nb WHERE payment_state IN ('pending', 'partial', 'failed', 'unrecorded')) THEN 'collection_review'
        WHEN EXISTS (SELECT 1 FROM ae WHERE status IN ('draft', 'submitted')) THEN 'expense_approval'
        ELSE 'ready_for_review'
      END,
      'invoice_summary', (SELECT jsonb_build_object(
        'issued', COALESCE(count(*) FILTER (WHERE has_invoice), 0),
        'missing', COALESCE(count(*) FILTER (WHERE NOT has_invoice), 0),
        'issued_total_sar', COALESCE(sum(amount_sar) FILTER (WHERE has_invoice), 0)
      ) FROM invoices_by_booking),
      'booking_statuses', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('status', booking_state, 'booking_count', booking_count, 'gross_revenue', gross_revenue) ORDER BY booking_count DESC)
        FROM (SELECT booking_state, count(*) AS booking_count, sum(amount_sar) AS gross_revenue FROM nb GROUP BY booking_state) s
      ), '[]'::jsonb),
      'payment_statuses', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('status', payment_state, 'booking_count', booking_count, 'gross_revenue', gross_revenue) ORDER BY booking_count DESC)
        FROM (SELECT payment_state, count(*) AS booking_count, sum(amount_sar) AS gross_revenue FROM nb GROUP BY payment_state) s
      ), '[]'::jsonb),
      'expense_statuses', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'status', status, 'record_count', record_count, 'total_sar', total_sar,
          'paid_amount_sar', paid_amount_sar, 'unpaid_amount_sar', GREATEST(total_sar - paid_amount_sar, 0)
        ) ORDER BY record_count DESC)
        FROM (SELECT status, count(*) AS record_count, sum(total_sar) AS total_sar, sum(paid_amount_sar) AS paid_amount_sar FROM ae GROUP BY status) s
      ), '[]'::jsonb),
      'by_property', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'property_id', p.id, 'name_ar', p.name_ar, 'name_en', p.name_en,
          'gross_revenue', COALESCE((SELECT sum(x.amount_sar) FROM nb x WHERE x.property_id = p.id), 0),
          'horizon_commission', COALESCE((SELECT sum(round(x.amount_sar * _commission_pct_for(x.property_id, x.commission_pct) / 100, 2)) FROM nb x WHERE x.property_id = p.id), 0),
          'approved_expenses', COALESCE((SELECT sum(x.total_sar) FROM re x WHERE x.property_id = p.id), 0),
          'landlord_expense_share', COALESCE((SELECT sum(round(x.total_sar * x.landlord_share_pct / 100, 2)) FROM re x WHERE x.property_id = p.id), 0)
        ) ORDER BY p.name_ar)
        FROM properties p WHERE (p_property_id IS NULL OR p.id = p_property_id)
      ), '[]'::jsonb),
      'expense_categories', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('category', category, 'total', total, 'count', record_count) ORDER BY total DESC)
        FROM (SELECT category, sum(total_sar) AS total, count(*) AS record_count FROM re GROUP BY category) categories
      ), '[]'::jsonb)
    )
  );
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

  RETURN (
    WITH b AS (
      SELECT b.*, pl.relation_type, COALESCE(pl.commission_pct, v_landlord.default_commission_pct) AS commission_pct
      FROM bookings b
      JOIN property_landlords pl ON pl.property_id = b.property_id
      WHERE pl.landlord_id = v_landlord.id
        AND b.status <> 'cancelled'
        AND b.check_in BETWEEN f AND t
        AND (p_property_id IS NULL OR b.property_id = p_property_id)
    ), nb AS (
      SELECT b.*,
        CASE lower(COALESCE(NULLIF(b.payment_status, ''), 'unrecorded'))
          WHEN 'paid' THEN 'paid'
          WHEN 'partial' THEN 'partial'
          WHEN 'partially_paid' THEN 'partial'
          WHEN 'pending' THEN 'pending'
          WHEN 'unpaid' THEN 'pending'
          WHEN 'refunded' THEN 'refunded'
          WHEN 'failed' THEN 'failed'
          ELSE 'unrecorded'
        END AS payment_state,
        CASE lower(COALESCE(NULLIF(b.status, ''), 'unrecorded'))
          WHEN 'pending' THEN 'pending'
          WHEN 'confirmed' THEN 'confirmed'
          WHEN 'completed' THEN 'completed'
          ELSE 'unrecorded'
        END AS booking_state
      FROM b
    ), ae AS (
      SELECT e.*, CASE WHEN e.landlord_id = v_landlord.id THEN 100 ELSE e.landlord_share_pct END AS owner_share_pct
      FROM operation_expenses e
      WHERE e.expense_date BETWEEN f AND t
        AND (e.landlord_id = v_landlord.id OR e.property_id IN (SELECT property_id FROM property_landlords WHERE landlord_id = v_landlord.id))
        AND (p_property_id IS NULL OR e.property_id = p_property_id)
    ), re AS (
      SELECT * FROM ae WHERE status IN ('approved', 'partially_paid', 'paid')
    ), invoices_by_booking AS (
      SELECT nb.id, nb.amount_sar, bool_or(i.id IS NOT NULL) AS has_invoice
      FROM nb LEFT JOIN invoices i ON i.booking_id = nb.id
      GROUP BY nb.id, nb.amount_sar
    )
    SELECT jsonb_build_object(
      'ok', true,
      'range', jsonb_build_object('from', f, 'to', t, 'property_id', p_property_id),
      'totals', jsonb_build_object(
        'gross_revenue', COALESCE((SELECT sum(amount_sar) FROM nb), 0),
        'fully_paid_revenue', COALESCE((SELECT sum(amount_sar) FROM nb WHERE payment_state = 'paid'), 0),
        'collection_review_revenue', COALESCE((SELECT sum(amount_sar) FROM nb WHERE payment_state IN ('pending', 'partial', 'failed', 'unrecorded')), 0),
        'horizon_commission', COALESCE((SELECT sum(CASE WHEN relation_type = 'owned' THEN 0 ELSE round(amount_sar * commission_pct / 100, 2) END) FROM nb), 0),
        'owner_before_expenses', COALESCE((SELECT sum(CASE WHEN relation_type = 'owned' THEN amount_sar ELSE round(amount_sar * (100 - commission_pct) / 100, 2) END) FROM nb), 0),
        'owner_expenses', COALESCE((SELECT sum(round(total_sar * owner_share_pct / 100, 2)) FROM re), 0),
        'bookings', COALESCE((SELECT count(*) FROM nb), 0),
        'nights', COALESCE((SELECT sum(check_out - check_in) FROM nb), 0)
      ),
      'settlement_status', CASE
        WHEN EXISTS (SELECT 1 FROM nb WHERE payment_state IN ('pending', 'partial', 'failed', 'unrecorded')) THEN 'collection_review'
        WHEN EXISTS (SELECT 1 FROM ae WHERE status IN ('draft', 'submitted')) THEN 'expense_approval'
        ELSE 'ready_for_review'
      END,
      'invoice_summary', (SELECT jsonb_build_object(
        'issued', COALESCE(count(*) FILTER (WHERE has_invoice), 0),
        'missing', COALESCE(count(*) FILTER (WHERE NOT has_invoice), 0)
      ) FROM invoices_by_booking),
      'booking_statuses', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('status', booking_state, 'booking_count', booking_count, 'gross_revenue', gross_revenue) ORDER BY booking_count DESC)
        FROM (SELECT booking_state, count(*) AS booking_count, sum(amount_sar) AS gross_revenue FROM nb GROUP BY booking_state) s
      ), '[]'::jsonb),
      'payment_statuses', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('status', payment_state, 'booking_count', booking_count, 'gross_revenue', gross_revenue) ORDER BY booking_count DESC)
        FROM (SELECT payment_state, count(*) AS booking_count, sum(amount_sar) AS gross_revenue FROM nb GROUP BY payment_state) s
      ), '[]'::jsonb),
      'expense_statuses', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'status', status, 'record_count', record_count,
          'owner_share_sar', owner_share_sar, 'paid_owner_share_sar', paid_owner_share_sar,
          'unpaid_owner_share_sar', GREATEST(owner_share_sar - paid_owner_share_sar, 0)
        ) ORDER BY record_count DESC)
        FROM (
          SELECT status, count(*) AS record_count,
            sum(round(total_sar * owner_share_pct / 100, 2)) AS owner_share_sar,
            sum(round(paid_amount_sar * owner_share_pct / 100, 2)) AS paid_owner_share_sar
          FROM ae GROUP BY status
        ) s
      ), '[]'::jsonb),
      'expenses', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', e.id, 'property_id', e.property_id, 'property_name_ar', p.name_ar, 'expense_date', e.expense_date,
          'category', e.category, 'description', e.description, 'total_sar', e.total_sar,
          'owner_share_sar', round(e.total_sar * e.owner_share_pct / 100, 2), 'status', e.status, 'invoice_number', e.invoice_number
        ) ORDER BY e.expense_date DESC)
        FROM re e LEFT JOIN properties p ON p.id = e.property_id
      ), '[]'::jsonb)
    )
  );
END $$;
