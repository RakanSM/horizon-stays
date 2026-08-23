-- Explicitly deny all direct REST/table access. The audit log is available
-- only through token-checked administrative RPCs.
DROP POLICY IF EXISTS "ttlock_audit_direct_access_denied" ON public.ttlock_sync_audit;
CREATE POLICY "ttlock_audit_direct_access_denied"
ON public.ttlock_sync_audit
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (FALSE)
WITH CHECK (FALSE);
