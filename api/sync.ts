/**
 * GET/POST /api/sync — fetches Airbnb + Gathern iCal feeds for every active
 * property and replaces the platform-sourced blocked dates in Supabase.
 * Triggered by Vercel Cron every 3 hours (see vercel.json), or manually.
 * Sync is idempotent; each run fully replaces per-source rows.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchIcalFeed } from "./_lib/ical.js";
import { rpc, RELAY, SYNC_SECRET } from "./_lib/config.js";

type Target = {
  id: number;
  slug: string;
  airbnb_ical_url: string | null;
  gatherin_ical_url: string | null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isCron = Boolean(req.headers["x-vercel-cron"]);
  const hasSecret = String(req.query.secret || "") === SYNC_SECRET;
  const hasAuthHeader =
    process.env.CRON_SECRET &&
    req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;
  if (!isCron && !hasSecret && !hasAuthHeader) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const started = Date.now();
  const results: Array<{
    slug: string;
    source: string;
    events?: number;
    error?: string;
  }> = [];

  try {
    const targets = await rpc<Target[]>("get_sync_targets", {
      p_secret: SYNC_SECRET,
    });

    // Process with limited concurrency to stay within function time limits
    const jobs: Array<() => Promise<void>> = [];
    for (const t of targets) {
      const feeds: Array<{ source: string; url: string }> = [];
      if (t.airbnb_ical_url) feeds.push({ source: "airbnb", url: t.airbnb_ical_url });
      if (t.gatherin_ical_url) feeds.push({ source: "gathern", url: t.gatherin_ical_url });
      for (const f of feeds) {
        jobs.push(async () => {
          try {
            const events = await fetchIcalFeed(f.url, RELAY, 15000);
            await rpc<number>("replace_blocked_dates", {
              p_secret: SYNC_SECRET,
              p_property_id: t.id,
              p_source: f.source,
              p_events: events.map((e) => ({
                uid: e.uid,
                summary: e.summary,
                start: e.start,
                end: e.end,
              })),
            });
            results.push({ slug: t.slug, source: f.source, events: events.length });
          } catch (err) {
            results.push({
              slug: t.slug,
              source: f.source,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        });
      }
    }

    const CONCURRENCY = 6;
    let idx = 0;
    async function worker() {
      while (idx < jobs.length) {
        const job = jobs[idx++];
        await job();
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    const ok = results.filter((r) => r.error === undefined);
    const failed = results.filter((r) => r.error !== undefined);
    res.status(200).json({
      ok: ok.length,
      failed: failed.length,
      totalEvents: ok.reduce((s, r) => s + (r.events || 0), 0),
      tookMs: Date.now() - started,
      failures: failed,
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
      partial: results,
    });
  }
}
