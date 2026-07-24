/**
 * POST /api/ttlock — admin-authenticated proxy to the TTLock cloud API.
 * Body: { token: adminSessionToken, action, ...params }
 * Actions:
 *   status                        → { configured, connected, lockCount }
 *   locks                         → list of locks
 *   passcodes { lockId }          → passcodes for a lock
 *   create-passcode { lockId, start, end, name } → new timed guest code
 *   delete-passcode { lockId, keyboardPwdId }
 *   unlock { lockId }             → remote unlock (needs gateway/WiFi lock)
 *   records { lockId }            → unlock history
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rpc } from "./_lib/config.js";
import {
  getCreds,
  getToken,
  listLocks,
  listPasscodes,
  createTimedPasscode,
  deletePasscode,
  remoteUnlock,
  unlockRecords,
} from "./_lib/ttlock.js";

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
  // Validate admin session via existing RPC
  const check = await rpc<{ ok: boolean }>("admin_check", { p_token: token }).catch(() => null);
  if (!check?.ok) {
    res.status(401).json({ error: "invalid session" });
    return;
  }

  try {
    const creds = await getCreds(token);
    if (!creds) {
      res.status(200).json({ ok: true, configured: false });
      return;
    }
    const tok = await getToken(token, creds);

    switch (action) {
      case "status": {
        const locks = await listLocks(tok, creds);
        const list = (locks as any)?.list || [];
        res.status(200).json({ ok: true, configured: true, connected: true, lockCount: list.length });
        return;
      }
      case "locks": {
        const locks = await listLocks(tok, creds);
        res.status(200).json({ ok: true, configured: true, data: (locks as any)?.list || [], raw: locks });
        return;
      }
      case "passcodes": {
        const data = await listPasscodes(tok, creds, Number(params.lockId));
        res.status(200).json({ ok: true, data: (data as any)?.list || [], raw: data });
        return;
      }
      case "create-passcode": {
        const data = await createTimedPasscode(
          tok,
          creds,
          Number(params.lockId),
          Number(params.start),
          Number(params.end),
          typeof params.name === "string" ? params.name : undefined,
        );
        res.status(200).json({ ok: !(data as any)?.errcode, data });
        return;
      }
      case "delete-passcode": {
        const data = await deletePasscode(tok, creds, Number(params.lockId), Number(params.keyboardPwdId));
        res.status(200).json({ ok: (data as any)?.errcode === 0, data });
        return;
      }
      case "unlock": {
        const data = await remoteUnlock(tok, creds, Number(params.lockId));
        res.status(200).json({ ok: (data as any)?.errcode === 0, data });
        return;
      }
      case "records": {
        const data = await unlockRecords(tok, creds, Number(params.lockId));
        res.status(200).json({ ok: true, data: (data as any)?.list || [], raw: data });
        return;
      }
      default:
        res.status(400).json({ error: "unknown action" });
    }
  } catch (e) {
    res.status(200).json({ ok: false, configured: true, connected: false, error: String((e as Error).message || e) });
  }
}
