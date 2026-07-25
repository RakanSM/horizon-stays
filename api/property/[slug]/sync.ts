/**
 * POST /api/property/:slug/sync — re-syncs a single unit's Airbnb + Gathern
 * iCal feeds into blocked_dates immediately. Auth: ?secret= (sync secret) or
 * x-admin-token header (admin session).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchIcalFeed } from "../../_lib/ical.js";
import { rpc, RELAY, SYNC_SECRET, SUPABASE_URL, SUPABASE_KEY } from "../../_lib/config.js";

type Target = {
  id: number;
  slug: string;
  airbnb_ical_url: string | null;
  gatherin_ical_url: string | null;
};

async function isAdminToken(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ p_token: token }),
    });
    const out = await res.json();
    return out === true || out?.ok === true;
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed", hint: "POST only" });
    return;
  }
  const slug = String(req.query.slug || "").trim();
  if (!slug) {
    res.status(400).json({ error: "missing_slug" });
    return;
  }

  const hasSecret = String(req.query.secret || "") === SYNC_SECRET;
  const adminTok = String(req.headers["x-admin-token"] || "");
  if (!hasSecret && !(await isAdminToken(adminTok))) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const started = Date.now();
  try {
    const targets = await rpc<Target[]>("get_sync_target_by_slug", {
      p_secret: SYNC_SECRET,
      p_slug: slug,
    });
    if (!targets.length) {
      res.status(404).json({ error: "property_not_found" });
      return;
    }
    const t = targets[0];
    const feeds: Array<{ source: string; url: string }> = [];
    if (t.airbnb_ical_url) feeds.push({ source: "airbnb", url: t.airbnb_ical_url });
    if (t.gatherin_ical_url) feeds.push({ source: "gathern", url: t.gatherin_ical_url });

    const results: Array<{ source: string; events?: number; error?: string }> = [];
    for (const f of feeds) {
      try {
        const events = await fetchIcalFeed(f.url, RELAY, 15000);
        await rpc<number>("replace_blocked_dates", {
          p_secret: SYNC_SECRET,
          p_property_id: t.id,
          p_source: f.source,
          p_events: events.map((e) => ({ uid: e.uid, summary: e.summary, start: e.start, end: e.end })),
        });
        results.push({ source: f.source, events: events.length });
      } catch (err) {
        results.push({ source: f.source, error: err instanceof Error ? err.message : String(err) });
      }
    }

    res.status(200).json({
      slug: t.slug,
      synced: results.filter((r) => !r.error),
      failures: results.filter((r) => r.error),
      feedsConfigured: feeds.length,
      tookMs: Date.now() - started,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
