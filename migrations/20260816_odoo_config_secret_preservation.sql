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
  v_key text;
BEGIN
  IF NOT _is_admin(p_token) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;
  IF v_url <> '' AND v_url !~* '^https?://' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_odoo_url');
  END IF;
  SELECT api_key INTO v_key FROM public.odoo_config WHERE id = 1;
  v_key := CASE WHEN p_api_key IS NULL OR trim(p_api_key) = '' THEN coalesce(v_key, '') ELSE trim(p_api_key) END;

  INSERT INTO public.odoo_config (
    id, base_url, database_name, username, api_key, is_enabled, sync_enabled,
    last_connection_status, last_error, updated_at
  ) VALUES (
    1, rtrim(v_url, '/'), trim(coalesce(p_database_name, '')), trim(coalesce(p_username, '')),
    v_key, coalesce(p_is_enabled, false), coalesce(p_sync_enabled, false),
    CASE WHEN v_url = '' OR trim(coalesce(p_database_name, '')) = '' OR trim(coalesce(p_username, '')) = '' OR v_key = '' THEN 'not_configured' ELSE 'ready' END,
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
