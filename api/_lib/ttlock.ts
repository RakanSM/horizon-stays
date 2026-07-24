/**
 * TTLock Open Platform API client (cloud API v3).
 * Docs: https://open.ttlock.com/doc/api  (EU mirror: https://euopen.ttlock.com)
 *
 * Credentials are stored in Supabase private_config (managed from the admin UI):
 *   ttlock_client_id, ttlock_client_secret, ttlock_username, ttlock_password_md5
 * Tokens are cached in private_config as ttlock_token_json.
 */
import { rpc } from "./config.js";

const API_BASES = ["https://euapi.ttlock.com", "https://api.ttlock.com"];

export type TTLockCreds = {
  clientId: string;
  clientSecret: string;
  username: string;
  passwordMd5: string;
  apiBase?: string;
};

type TokenBundle = {
  access_token: string;
  refresh_token: string;
  uid: number;
  expires_at: number; // ms epoch
  api_base: string;
};

export async function getCreds(adminToken: string): Promise<TTLockCreds | null> {
  const cfg = await rpc<{ ok: boolean; config?: Record<string, string> | null }>(
    "admin_get_ttlock_config",
    { p_token: adminToken },
  );
  if (!cfg?.ok || !cfg.config || !cfg.config.client_id) return null;
  return {
    clientId: cfg.config.client_id,
    clientSecret: cfg.config.client_secret,
    username: cfg.config.username,
    passwordMd5: cfg.config.password_md5,
    apiBase: cfg.config.api_base || undefined,
  };
}

async function form(url: string, params: Record<string, string | number>) {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) body.set(k, String(v));
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: res.status, json };
}

/** OAuth password-grant login; tries EU endpoint first, then global. */
export async function login(creds: TTLockCreds): Promise<TokenBundle> {
  const bases = creds.apiBase ? [creds.apiBase] : API_BASES;
  let lastErr = "";
  for (const base of bases) {
    const { json } = await form(`${base}/oauth2/token`, {
      clientId: creds.clientId,
      clientSecret: creds.clientSecret,
      username: creds.username,
      password: creds.passwordMd5,
    });
    if (json && typeof json.access_token === "string") {
      return {
        access_token: json.access_token as string,
        refresh_token: (json.refresh_token as string) || "",
        uid: Number(json.uid) || 0,
        expires_at: Date.now() + (Number(json.expires_in) || 7776000) * 1000 - 60000,
        api_base: base,
      };
    }
    lastErr = JSON.stringify(json).slice(0, 200);
  }
  throw new Error(`TTLock auth failed: ${lastErr}`);
}

export async function getToken(adminToken: string, creds: TTLockCreds): Promise<TokenBundle> {
  // Try cached token first
  const cached = await rpc<{ ok: boolean; token_json?: string }>(
    "admin_get_ttlock_token",
    { p_token: adminToken },
  ).catch(() => null);
  if (cached?.ok && cached.token_json) {
    try {
      const tok = JSON.parse(cached.token_json) as TokenBundle;
      if (tok.expires_at > Date.now()) return tok;
    } catch {
      /* re-login below */
    }
  }
  const fresh = await login(creds);
  await rpc("admin_set_ttlock_token", {
    p_token: adminToken,
    p_token_json: JSON.stringify(fresh),
  }).catch(() => null);
  return fresh;
}

/** Generic authenticated GET/POST against the TTLock cloud API. */
export async function api(
  tok: TokenBundle,
  creds: TTLockCreds,
  path: string,
  params: Record<string, string | number> = {},
) {
  const { json } = await form(`${tok.api_base}${path}`, {
    clientId: creds.clientId,
    accessToken: tok.access_token,
    date: Date.now(),
    ...params,
  });
  return json;
}

export async function listLocks(tok: TokenBundle, creds: TTLockCreds) {
  return api(tok, creds, "/v3/lock/list", { pageNo: 1, pageSize: 100 });
}

/**
 * Create a timed guest passcode (keyboardPwd type 3 = period).
 * startDate/endDate are ms epochs.
 */
export async function createTimedPasscode(
  tok: TokenBundle,
  creds: TTLockCreds,
  lockId: number,
  startMs: number,
  endMs: number,
  name?: string,
) {
  return api(tok, creds, "/v3/keyboardPwd/get", {
    lockId,
    keyboardPwdType: 3,
    startDate: startMs,
    endDate: endMs,
    keyboardPwdName: name || "Guest",
  });
}

export async function listPasscodes(tok: TokenBundle, creds: TTLockCreds, lockId: number) {
  return api(tok, creds, "/v3/lock/listKeyboardPwd", { lockId, pageNo: 1, pageSize: 50, orderBy: 1 });
}

export async function deletePasscode(
  tok: TokenBundle,
  creds: TTLockCreds,
  lockId: number,
  keyboardPwdId: number,
) {
  return api(tok, creds, "/v3/keyboardPwd/delete", { lockId, keyboardPwdId, deleteType: 2 });
}

export async function remoteUnlock(tok: TokenBundle, creds: TTLockCreds, lockId: number) {
  return api(tok, creds, "/v3/lock/unlock", { lockId });
}

export async function unlockRecords(tok: TokenBundle, creds: TTLockCreds, lockId: number) {
  return api(tok, creds, "/v3/lockRecord/list", { lockId, pageNo: 1, pageSize: 20 });
}
