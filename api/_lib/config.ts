/**
 * Server-side configuration for Horizon Stays serverless functions.
 * Values can be overridden via Vercel environment variables; the baked-in
 * defaults keep the deployment self-contained.
 *
 * SECURITY NOTES:
 * - SUPABASE_URL + publishable key are public by design (also shipped to browser).
 * - SYNC_SECRET only unlocks the replace_blocked_dates / get_sync_targets RPCs,
 *   which can only rewrite calendar-block rows (idempotent, re-synced every 3h).
 * - RELAY_KEY only allows proxying whitelisted iCal hosts through the relay.
 */

export const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://bwffhalzuvvmuzjfmdyp.supabase.co";

export const SUPABASE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_BqnW7Igm5BDtHw-3CD0gBA_lKwg34Vz";

export const SYNC_SECRET =
  process.env.SYNC_SECRET ||
  "dbacb18b4c8c915c0a35ee7377c202498286467317eb0739";

export const RELAY = {
  url: process.env.ICAL_RELAY_URL || "http://35.231.49.115:8791",
  key:
    process.env.ICAL_RELAY_KEY ||
    "0639b9c25460a095294bd6364a62931c7b332bb2572a8c56",
};

export async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`RPC ${fn} failed: HTTP ${res.status} ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}
