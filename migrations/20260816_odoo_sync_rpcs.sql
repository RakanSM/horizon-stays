-- Server-only Odoo RPCs. Each requires the existing server-side sync secret.

CREATE OR REPLACE FUNCTION public.odoo_get_sync_config(p_secret text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_secret IS NULL OR p_secret <> (SELECT value FROM public.private_config WHERE key = 'sync_secret' LIMIT 1) THEN
    -- Legacy deployments do not retain sync_secret in private_config. The Vercel endpoint
    -- also uses the established SYNC_SECRET value; reject if the durable value is absent.
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;
  RETURN (
    SELECT jsonb_build_object(
      'ok', true,
      'base_url', base_url,
      'database_name', database_name,
      'username', username,
      'api_key', api_key,
      'is_enabled', is_enabled,
      'sync_enabled', sync_enabled,
      'configured', base_url <> '' AND database_name <> '' AND username <> '' AND api_key <> ''
    ) FROM public.odoo_config WHERE id = 1
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.odoo_list_sync_bookings(p_secret text, p_limit integer DEFAULT 50)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_secret IS NULL OR p_secret <> (SELECT value FROM public.private_config WHERE key = 'sync_secret' LIMIT 1) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;
  RETURN jsonb_build_object('ok', true, 'bookings', coalesce((
    SELECT jsonb_agg(jsonb_build_object(
      'id', b.id, 'guest_name', b.guest_name, 'guest_phone', b.guest_phone, 'guest_email', b.guest_email,
      'check_in', b.check_in, 'check_out', b.check_out, 'nights', b.nights, 'amount_sar', b.amount_sar,
      'source', coalesce(b.source, b.platform, 'direct'), 'status', b.status, 'payment_status', b.payment_status,
      'odoo_rental_order_id', b.odoo_rental_order_id, 'odoo_invoice_id', b.odoo_invoice_id,
      'odoo_sync_status', b.odoo_sync_status, 'property', jsonb_build_object(
        'id', p.id, 'slug', p.slug, 'name_ar', p.name_ar, 'name_en', p.name_en,
        'odoo_product_id', p.odoo_product_id, 'odoo_product_name', p.odoo_product_name,
        'price_per_night', p.price_per_night
      )
    ) ORDER BY b.check_in ASC)
    FROM (
      SELECT b.* FROM public.bookings b
      WHERE coalesce(b.status, '') NOT IN ('canceled', 'cancelled')
        AND (b.odoo_sync_status IS NULL OR b.odoo_sync_status NOT IN ('synced'))
      ORDER BY b.check_in ASC
      LIMIT GREATEST(1, LEAST(coalesce(p_limit, 50), 100))
    ) b
    JOIN public.properties p ON p.id = b.property_id
  ), '[]'::jsonb));
END;
$function$;

CREATE OR REPLACE FUNCTION public.odoo_mark_booking_sync(
  p_secret text,
  p_booking_id uuid,
  p_status text,
  p_rental_order_id integer DEFAULT NULL,
  p_invoice_id integer DEFAULT NULL,
  p_payment_id integer DEFAULT NULL,
  p_external_ref text DEFAULT NULL,
  p_error text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_secret IS NULL OR p_secret <> (SELECT value FROM public.private_config WHERE key = 'sync_secret' LIMIT 1) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  UPDATE public.bookings SET
    odoo_sync_status = coalesce(p_status, odoo_sync_status),
    odoo_rental_order_id = coalesce(p_rental_order_id, odoo_rental_order_id),
    odoo_invoice_id = coalesce(p_invoice_id, odoo_invoice_id),
    odoo_payment_id = coalesce(p_payment_id, odoo_payment_id),
    odoo_external_ref = coalesce(p_external_ref, odoo_external_ref),
    odoo_sync_date = now(),
    odoo_sync_error = p_error,
    updated_at = now()
  WHERE id = p_booking_id;
  RETURN found;
END;
$function$;

CREATE OR REPLACE FUNCTION public.odoo_record_connection_result(
  p_secret text,
  p_status text,
  p_error text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_secret IS NULL OR p_secret <> (SELECT value FROM public.private_config WHERE key = 'sync_secret' LIMIT 1) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  UPDATE public.odoo_config SET
    last_connection_status = p_status,
    last_connection_checked_at = now(),
    last_error = p_error,
    updated_at = now()
  WHERE id = 1;
  RETURN found;
END;
$function$;

CREATE OR REPLACE FUNCTION public.odoo_record_sync_run(
  p_secret text,
  p_triggered_by text,
  p_status text,
  p_total_bookings integer,
  p_succeeded integer,
  p_failed integer,
  p_details jsonb DEFAULT '[]'::jsonb,
  p_error_message text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_run_id bigint;
BEGIN
  IF p_secret IS NULL OR p_secret <> (SELECT value FROM public.private_config WHERE key = 'sync_secret' LIMIT 1) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  INSERT INTO public.odoo_sync_runs (triggered_by, status, total_bookings, succeeded, failed, details, error_message, finished_at)
  VALUES (coalesce(p_triggered_by, 'manual'), coalesce(p_status, 'failed'), coalesce(p_total_bookings, 0), coalesce(p_succeeded, 0), coalesce(p_failed, 0), coalesce(p_details, '[]'::jsonb), p_error_message, now())
  RETURNING id INTO v_run_id;
  UPDATE public.odoo_config SET
    last_sync_at = now(),
    last_sync_summary = jsonb_build_object('run_id', v_run_id, 'status', p_status, 'total', coalesce(p_total_bookings, 0), 'succeeded', coalesce(p_succeeded, 0), 'failed', coalesce(p_failed, 0)),
    last_error = p_error_message,
    updated_at = now()
  WHERE id = 1;
  RETURN v_run_id;
END;
$function$;
