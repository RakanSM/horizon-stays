-- Horizon Stays: Odoo integration foundation
-- Stores only configuration metadata in admin-visible responses and tracks every sync run.

CREATE TABLE IF NOT EXISTS public.odoo_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  base_url text NOT NULL DEFAULT '',
  database_name text NOT NULL DEFAULT '',
  username text NOT NULL DEFAULT '',
  api_key text NOT NULL DEFAULT '',
  is_enabled boolean NOT NULL DEFAULT false,
  sync_enabled boolean NOT NULL DEFAULT false,
  last_connection_status text NOT NULL DEFAULT 'not_configured'
    CHECK (last_connection_status IN ('not_configured', 'ready', 'connected', 'failed')),
  last_connection_checked_at timestamptz,
  last_sync_at timestamptz,
  last_sync_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.odoo_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.odoo_config ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.odoo_sync_runs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  triggered_by text NOT NULL DEFAULT 'manual'
    CHECK (triggered_by IN ('manual', 'scheduled', 'connection_test')),
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'completed', 'partial', 'failed', 'skipped')),
  total_bookings integer NOT NULL DEFAULT 0,
  succeeded integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  details jsonb NOT NULL DEFAULT '[]'::jsonb,
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.odoo_sync_runs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS odoo_product_id integer,
  ADD COLUMN IF NOT EXISTS odoo_product_name text,
  ADD COLUMN IF NOT EXISTS odoo_sync_enabled boolean NOT NULL DEFAULT true;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS odoo_rental_order_id integer,
  ADD COLUMN IF NOT EXISTS odoo_payment_id integer,
  ADD COLUMN IF NOT EXISTS odoo_sync_status text NOT NULL DEFAULT 'not_configured',
  ADD COLUMN IF NOT EXISTS odoo_sync_date timestamptz,
  ADD COLUMN IF NOT EXISTS odoo_sync_error text,
  ADD COLUMN IF NOT EXISTS odoo_external_ref text;

CREATE INDEX IF NOT EXISTS idx_bookings_odoo_sync_status ON public.bookings (odoo_sync_status);
CREATE INDEX IF NOT EXISTS idx_odoo_sync_runs_created_at ON public.odoo_sync_runs (created_at DESC);

CREATE OR REPLACE FUNCTION public.admin_set_odoo_config(
  p_token text,
  p_base_url text,
  p_database_name text,
  p_username text,
  p_api_key text,
  p_is_enabled boolean,
  p_sync_enabled boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_url text := trim(coalesce(p_base_url, ''));
BEGIN
  IF NOT _is_admin(p_token) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;
  IF v_url <> '' AND v_url !~* '^https?://' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_odoo_url');
  END IF;

  INSERT INTO public.odoo_config (
    id, base_url, database_name, username, api_key, is_enabled, sync_enabled,
    last_connection_status, last_error, updated_at
  ) VALUES (
    1, rtrim(v_url, '/'), trim(coalesce(p_database_name, '')), trim(coalesce(p_username, '')),
    coalesce(p_api_key, ''), coalesce(p_is_enabled, false), coalesce(p_sync_enabled, false),
    CASE WHEN v_url = '' OR trim(coalesce(p_database_name, '')) = '' OR trim(coalesce(p_username, '')) = '' OR coalesce(p_api_key, '') = '' THEN 'not_configured' ELSE 'ready' END,
    NULL, now()
  )
  ON CONFLICT (id) DO UPDATE SET
    base_url = EXCLUDED.base_url,
    database_name = EXCLUDED.database_name,
    username = EXCLUDED.username,
    api_key = EXCLUDED.api_key,
    is_enabled = EXCLUDED.is_enabled,
    sync_enabled = EXCLUDED.sync_enabled,
    last_connection_status = EXCLUDED.last_connection_status,
    last_error = NULL,
    updated_at = now();

  UPDATE public.site_settings SET odoo_url = rtrim(v_url, '/'), updated_at = now() WHERE id = 1;
  RETURN public.admin_odoo_status(p_token);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_odoo_status(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT _is_admin(p_token) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;
  RETURN (
    SELECT jsonb_build_object(
      'ok', true,
      'config', jsonb_build_object(
        'base_url', c.base_url,
        'database_name', c.database_name,
        'username', c.username,
        'has_api_key', length(c.api_key) > 0,
        'is_enabled', c.is_enabled,
        'sync_enabled', c.sync_enabled,
        'configured', c.base_url <> '' AND c.database_name <> '' AND c.username <> '' AND length(c.api_key) > 0,
        'last_connection_status', c.last_connection_status,
        'last_connection_checked_at', c.last_connection_checked_at,
        'last_sync_at', c.last_sync_at,
        'last_sync_summary', c.last_sync_summary,
        'last_error', c.last_error
      ),
      'runs', coalesce((
        SELECT jsonb_agg(jsonb_build_object(
          'id', r.id, 'triggered_by', r.triggered_by, 'status', r.status,
          'total_bookings', r.total_bookings, 'succeeded', r.succeeded, 'failed', r.failed,
          'error_message', r.error_message, 'started_at', r.started_at, 'finished_at', r.finished_at
        ) ORDER BY r.created_at DESC)
        FROM (SELECT * FROM public.odoo_sync_runs ORDER BY created_at DESC LIMIT 12) r
      ), '[]'::jsonb)
    )
    FROM public.odoo_config c WHERE c.id = 1
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_set_odoo_url(p_token text, p_url text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT _is_admin(p_token) THEN RAISE EXCEPTION 'unauthorized'; END IF;
  UPDATE public.site_settings SET odoo_url = rtrim(trim(coalesce(p_url, '')), '/'), updated_at = now() WHERE id = 1;
  INSERT INTO public.odoo_config (id, base_url, updated_at)
  VALUES (1, rtrim(trim(coalesce(p_url, '')), '/'), now())
  ON CONFLICT (id) DO UPDATE SET base_url = EXCLUDED.base_url, updated_at = now();
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_update_odoo_sync_result(
  p_token text,
  p_triggered_by text,
  p_status text,
  p_total_bookings integer,
  p_succeeded integer,
  p_failed integer,
  p_details jsonb DEFAULT '[]'::jsonb,
  p_error_message text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_run_id bigint;
BEGIN
  IF NOT _is_admin(p_token) THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthorized'); END IF;
  INSERT INTO public.odoo_sync_runs (triggered_by, status, total_bookings, succeeded, failed, details, error_message, finished_at)
  VALUES (coalesce(p_triggered_by, 'manual'), coalesce(p_status, 'failed'), coalesce(p_total_bookings, 0), coalesce(p_succeeded, 0), coalesce(p_failed, 0), coalesce(p_details, '[]'::jsonb), p_error_message, now())
  RETURNING id INTO v_run_id;
  UPDATE public.odoo_config SET
    last_sync_at = now(),
    last_connection_status = CASE WHEN p_status IN ('completed', 'partial') THEN 'connected' ELSE last_connection_status END,
    last_sync_summary = jsonb_build_object('run_id', v_run_id, 'status', p_status, 'total', coalesce(p_total_bookings, 0), 'succeeded', coalesce(p_succeeded, 0), 'failed', coalesce(p_failed, 0)),
    last_error = p_error_message,
    updated_at = now()
  WHERE id = 1;
  RETURN jsonb_build_object('ok', true, 'run_id', v_run_id);
END;
$function$;
