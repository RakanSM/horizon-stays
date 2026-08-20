-- Create maintenance requests table
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id BIGINT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  invoice_number VARCHAR(100),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid', -- unpaid, partial, paid, cancelled
  paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read maintenance" ON public.maintenance_requests FOR SELECT USING (true);
CREATE POLICY "Allow all maintenance for admin" ON public.maintenance_requests FOR ALL USING (true);

-- Update landlord_data RPC to include maintenance requests for assigned properties
CREATE OR REPLACE FUNCTION public.landlord_data(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_landlord RECORD;
  v_props JSONB;
  v_bookings JSONB;
  v_maintenance JSONB;
  v_monthly JSONB;
  v_totals JSONB;
BEGIN
  SELECT l.* INTO v_landlord
  FROM public.landlords l
  WHERE l.session_token = p_token AND l.is_active = TRUE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'Unauthorized');
  END IF;

  -- Properties
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'property_id', p.id,
    'slug', p.slug,
    'name_ar', p.name_ar,
    'name_en', p.name_en,
    'relation_type', pl.relation_type,
    'commission_pct', pl.commission_pct
  )), '[]'::jsonb) INTO v_props
  FROM public.property_landlords pl
  JOIN public.properties p ON p.id = pl.property_id
  WHERE pl.landlord_id = v_landlord.id;

  -- Bookings
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', b.id,
    'property_id', b.property_id,
    'property_name_ar', p.name_ar,
    'guest_name', b.guest_name,
    'source', b.source,
    'check_in', b.check_in,
    'check_out', b.check_out,
    'nights', b.nights,
    'amount', b.amount,
    'relation_type', pl.relation_type,
    'commission_pct', CASE WHEN pl.relation_type = 'owned' THEN 0 ELSE pl.commission_pct END,
    'commission_amount', CASE WHEN pl.relation_type = 'owned' THEN 0 ELSE round(b.amount * (pl.commission_pct / 100.0), 2) END,
    'net_to_landlord', CASE WHEN pl.relation_type = 'owned' THEN b.amount ELSE round(b.amount * (1.0 - pl.commission_pct / 100.0), 2) END,
    'vat_in_amount', round(b.amount - (b.amount / 1.15), 2),
    'status', b.status
  ) ORDER BY b.check_in DESC), '[]'::jsonb) INTO v_bookings
  FROM public.bookings b
  JOIN public.property_landlords pl ON pl.property_id = b.property_id
  JOIN public.properties p ON p.id = b.property_id
  WHERE pl.landlord_id = v_landlord.id;

  -- Maintenance requests
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', m.id,
    'property_id', m.property_id,
    'property_name_ar', p.name_ar,
    'title', m.title,
    'description', m.description,
    'cost', m.cost,
    'invoice_number', m.invoice_number,
    'payment_status', m.payment_status,
    'paid_amount', m.paid_amount,
    'status', m.status,
    'created_at', m.created_at
  ) ORDER BY m.created_at DESC), '[]'::jsonb) INTO v_maintenance
  FROM public.maintenance_requests m
  JOIN public.property_landlords pl ON pl.property_id = m.property_id
  JOIN public.properties p ON p.id = m.property_id
  WHERE pl.landlord_id = v_landlord.id;

  -- Totals
  SELECT jsonb_build_object(
    'gross', coalesce(sum(b.amount), 0),
    'commission', coalesce(sum(CASE WHEN pl.relation_type = 'owned' THEN 0 ELSE round(b.amount * (pl.commission_pct / 100.0), 2) END), 0),
    'net', coalesce(sum(CASE WHEN pl.relation_type = 'owned' THEN b.amount ELSE round(b.amount * (1.0 - pl.commission_pct / 100.0), 2) END), 0),
    'bookings', count(b.id),
    'nights', coalesce(sum(b.nights), 0),
    'owned_gross', coalesce(sum(CASE WHEN pl.relation_type = 'owned' THEN b.amount ELSE 0 END), 0),
    'managed_gross', coalesce(sum(CASE WHEN pl.relation_type = 'managed' THEN b.amount ELSE 0 END), 0),
    'owned_net', coalesce(sum(CASE WHEN pl.relation_type = 'owned' THEN b.amount ELSE 0 END), 0),
    'managed_net', coalesce(sum(CASE WHEN pl.relation_type = 'managed' THEN round(b.amount * (1.0 - pl.commission_pct / 100.0), 2) ELSE 0 END), 0),
    'owned_bookings', count(b.id) FILTER (WHERE pl.relation_type = 'owned'),
    'owned_nights', coalesce(sum(b.nights) FILTER (WHERE pl.relation_type = 'owned'), 0),
    'managed_bookings', count(b.id) FILTER (WHERE pl.relation_type = 'managed'),
    'managed_nights', coalesce(sum(b.nights) FILTER (WHERE pl.relation_type = 'managed'), 0)
  ) INTO v_totals
  FROM public.bookings b
  JOIN public.property_landlords pl ON pl.property_id = b.property_id
  WHERE pl.landlord_id = v_landlord.id AND b.status != 'cancelled';

  -- Monthly
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'month', mo.month,
    'gross', mo.gross,
    'commission', mo.commission,
    'net', mo.net
  ) ORDER BY mo.month), '[]'::jsonb) INTO v_monthly
  FROM (
    SELECT left(b.check_in, 7) as month,
           sum(b.amount) as gross,
           sum(CASE WHEN pl.relation_type = 'owned' THEN 0 ELSE round(b.amount * (pl.commission_pct / 100.0), 2) END) as commission,
           sum(CASE WHEN pl.relation_type = 'owned' THEN b.amount ELSE round(b.amount * (1.0 - pl.commission_pct / 100.0), 2) END) as net
    FROM public.bookings b
    JOIN public.property_landlords pl ON pl.property_id = b.property_id
    WHERE pl.landlord_id = v_landlord.id AND b.status != 'cancelled'
    GROUP BY left(b.check_in, 7)
  ) mo;

  RETURN jsonb_build_object(
    'ok', TRUE,
    'landlord', jsonb_build_object('name', v_landlord.name, 'default_commission_pct', v_landlord.default_commission_pct),
    'properties', v_props,
    'bookings', v_bookings,
    'maintenance', v_maintenance,
    'totals', v_totals,
    'monthly', v_monthly
  );
END;
$$;
