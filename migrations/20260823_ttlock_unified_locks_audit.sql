-- TTLock unified locks page: auditable Horizon-to-TTLock operations.
-- This deliberately has no property mapping. A lock can be managed before it is
-- associated with a residence, and sensitive lock secrets are never stored here.

CREATE TABLE IF NOT EXISTS public.ttlock_sync_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL CHECK (action IN ('refresh', 'rename', 'passcode_created', 'passcode_deleted', 'remote_unlock', 'records_read')),
  lock_id BIGINT,
  lock_alias TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'blocked')),
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ttlock_sync_audit_created_at_idx ON public.ttlock_sync_audit (created_at DESC);
CREATE INDEX IF NOT EXISTS ttlock_sync_audit_lock_id_idx ON public.ttlock_sync_audit (lock_id);

ALTER TABLE public.ttlock_sync_audit ENABLE ROW LEVEL SECURITY;

-- No direct table policies: the audit log is available only through the
-- token-checked administrative RPCs below.
REVOKE ALL ON TABLE public.ttlock_sync_audit FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_log_ttlock_sync(
  p_token TEXT,
  p_action TEXT,
  p_lock_id BIGINT DEFAULT NULL,
  p_lock_alias TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'success',
  p_detail JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF (SELECT value FROM private_config WHERE key = 'admin_session') IS DISTINCT FROM p_token THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'unauthorized');
  END IF;

  INSERT INTO public.ttlock_sync_audit (action, lock_id, lock_alias, status, detail)
  VALUES (p_action, p_lock_id, NULLIF(trim(p_lock_alias), ''), p_status, COALESCE(p_detail, '{}'::jsonb))
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('ok', TRUE, 'id', v_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_ttlock_sync_audit(
  p_token TEXT,
  p_limit INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT value FROM private_config WHERE key = 'admin_session') IS DISTINCT FROM p_token THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'unauthorized');
  END IF;

  RETURN jsonb_build_object(
    'ok', TRUE,
    'items', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', a.id,
        'action', a.action,
        'lock_id', a.lock_id,
        'lock_alias', a.lock_alias,
        'status', a.status,
        'detail', a.detail,
        'created_at', a.created_at
      ) ORDER BY a.created_at DESC)
      FROM (
        SELECT *
        FROM public.ttlock_sync_audit
        ORDER BY created_at DESC
        LIMIT LEAST(GREATEST(COALESCE(p_limit, 30), 1), 100)
      ) a
    ), '[]'::jsonb)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_log_ttlock_sync(TEXT, TEXT, BIGINT, TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_get_ttlock_sync_audit(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_log_ttlock_sync(TEXT, TEXT, BIGINT, TEXT, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_ttlock_sync_audit(TEXT, INTEGER) TO anon, authenticated;
