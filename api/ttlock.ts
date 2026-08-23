/**
 * POST /api/ttlock — administrator-authenticated TTLock proxy.
 * Read operations expose only safe fields. Any operation that can affect a
 * door or guest access requires an explicit `confirmed: true` acknowledgement.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rpc } from "./_lib/config.js";
import {
  createTimedPasscode,
  deletePasscode,
  getCreds,
  getToken,
  listLocks,
  listPasscodes,
  remoteUnlock,
  renameLock,
  unlockRecords,
} from "./_lib/ttlock.js";
import { safeLock, safePasscode, safeRecord } from "./_lib/ttlockSafe.js";

const isPositiveId = (value: unknown) => Number.isSafeInteger(Number(value)) && Number(value) > 0;
const safeError = () => "TTLock connection could not be completed. Check the secured integration settings.";

async function logAudit(token: string, action: string, lockId: number | null, lockAlias: string, status: "success" | "failed" | "blocked", detail: Record<string, unknown> = {}) {
  await rpc("admin_log_ttlock_sync", {
    p_token: token,
    p_action: action,
    p_lock_id: lockId,
    p_lock_alias: lockAlias,
    p_status: status,
    p_detail: detail,
  }).catch(() => null);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  const { token, action, ...params } = (req.body || {}) as Record<string, unknown>;
  if (!token || typeof token !== "string") {
    res.status(401).json({ error: "missing admin token" });
    return;
  }

  const check = await rpc<{ ok: boolean }>("admin_check", { p_token: token }).catch(() => null);
  if (!check?.ok) {
    res.status(401).json({ error: "invalid session" });
    return;
  }

  if (action === "audit") {
    const audit = await rpc<{ ok: boolean; items?: unknown[] }>("admin_get_ttlock_sync_audit", { p_token: token, p_limit: 40 }).catch(() => null);
    res.status(200).json({ ok: Boolean(audit?.ok), data: audit?.items || [] });
    return;
  }

  try {
    const creds = await getCreds(token);
    if (!creds) {
      res.status(200).json({ ok: true, configured: false });
      return;
    }
    const ttToken = await getToken(token, creds);

    switch (action) {
      case "status": {
        const locks = await listLocks(ttToken, creds);
        const list = Array.isArray((locks as { list?: unknown[] }).list) ? (locks as { list: unknown[] }).list : [];
        res.status(200).json({ ok: true, configured: true, connected: true, lockCount: list.length });
        return;
      }
      case "locks": {
        const locks = await listLocks(ttToken, creds);
        const list = Array.isArray((locks as { list?: unknown[] }).list) ? (locks as { list: unknown[] }).list : [];
        const safe = list.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object").map(safeLock);
        res.status(200).json({ ok: true, configured: true, data: safe });
        return;
      }
      case "passcodes": {
        if (!isPositiveId(params.lockId)) { res.status(400).json({ error: "invalid lock" }); return; }
        const result = await listPasscodes(ttToken, creds, Number(params.lockId));
        const list = Array.isArray((result as { list?: unknown[] }).list) ? (result as { list: unknown[] }).list : [];
        const safe = list.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object").map(safePasscode);
        res.status(200).json({ ok: true, data: safe });
        return;
      }
      case "records": {
        if (!isPositiveId(params.lockId)) { res.status(400).json({ error: "invalid lock" }); return; }
        const result = await unlockRecords(ttToken, creds, Number(params.lockId));
        const list = Array.isArray((result as { list?: unknown[] }).list) ? (result as { list: unknown[] }).list : [];
        const safe = list.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object").map(safeRecord);
        await logAudit(token, "records_read", Number(params.lockId), "", "success");
        res.status(200).json({ ok: true, data: safe });
        return;
      }
      case "rename": {
        const lockAlias = typeof params.lockAlias === "string" ? params.lockAlias.trim().slice(0, 80) : "";
        if (!isPositiveId(params.lockId) || !lockAlias || params.confirmed !== true) {
          await logAudit(token, "rename", isPositiveId(params.lockId) ? Number(params.lockId) : null, lockAlias, "blocked");
          res.status(400).json({ ok: false, error: "A lock name and explicit administrator confirmation are required." });
          return;
        }
        const result = await renameLock(ttToken, creds, Number(params.lockId), lockAlias);
        const ok = (result as { errcode?: number }).errcode === 0;
        await logAudit(token, "rename", Number(params.lockId), lockAlias, ok ? "success" : "failed");
        res.status(200).json({ ok });
        return;
      }
      case "create-passcode": {
        const validRange = Number.isFinite(Number(params.start)) && Number.isFinite(Number(params.end)) && Number(params.end) > Number(params.start);
        if (!isPositiveId(params.lockId) || !validRange || params.confirmed !== true) {
          await logAudit(token, "passcode_created", isPositiveId(params.lockId) ? Number(params.lockId) : null, "", "blocked");
          res.status(400).json({ ok: false, error: "A valid range and explicit administrator confirmation are required." });
          return;
        }
        const result = await createTimedPasscode(ttToken, creds, Number(params.lockId), Number(params.start), Number(params.end), typeof params.name === "string" ? params.name.slice(0, 80) : undefined);
        const data = result as { errcode?: number; keyboardPwd?: string };
        const ok = data.errcode === 0 || Boolean(data.keyboardPwd);
        await logAudit(token, "passcode_created", Number(params.lockId), "", ok ? "success" : "failed", { requested_by: "horizon_admin" });
        res.status(200).json({ ok, data: ok ? { keyboardPwd: data.keyboardPwd || "" } : {} });
        return;
      }
      case "delete-passcode": {
        if (!isPositiveId(params.lockId) || !isPositiveId(params.keyboardPwdId) || params.confirmed !== true) {
          await logAudit(token, "passcode_deleted", isPositiveId(params.lockId) ? Number(params.lockId) : null, "", "blocked");
          res.status(400).json({ ok: false, error: "An explicit administrator confirmation is required." });
          return;
        }
        const result = await deletePasscode(ttToken, creds, Number(params.lockId), Number(params.keyboardPwdId));
        const ok = (result as { errcode?: number }).errcode === 0;
        await logAudit(token, "passcode_deleted", Number(params.lockId), "", ok ? "success" : "failed");
        res.status(200).json({ ok });
        return;
      }
      case "unlock": {
        if (!isPositiveId(params.lockId) || params.confirmed !== true) {
          await logAudit(token, "remote_unlock", isPositiveId(params.lockId) ? Number(params.lockId) : null, "", "blocked");
          res.status(400).json({ ok: false, error: "An explicit administrator confirmation is required." });
          return;
        }
        const result = await remoteUnlock(ttToken, creds, Number(params.lockId));
        const ok = (result as { errcode?: number }).errcode === 0;
        await logAudit(token, "remote_unlock", Number(params.lockId), "", ok ? "success" : "failed");
        res.status(200).json({ ok });
        return;
      }
      default:
        res.status(400).json({ error: "unknown action" });
    }
  } catch {
    res.status(200).json({ ok: false, configured: true, connected: false, error: safeError() });
  }
}
