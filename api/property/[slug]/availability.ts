/**
 * GET /api/property/:slug/availability — public JSON availability for one unit.
 * Returns blocked date ranges (merged from Airbnb, Gathern, and manual blocks)
 * so external systems can read availability without parsing iCal.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SUPABASE_URL, SUPABASE_KEY } from "../../_lib/config.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  const slug = String(req.query.slug || "").trim();
  if (!slug) {
    res.status(400).json({ error: "missing_slug" });
    return;
  }

  try {
    const propRes = await fetch(
      `${SUPABASE_URL}/rest/v1/properties?slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&select=id,slug,name_ar,name_en,price_per_night`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const props = (await propRes.json()) as Array<{
      id: number; slug: string; name_ar: string; name_en: string; price_per_night: number;
    }>;
    if (!props.length) {
      res.status(404).json({ error: "property_not_found" });
      return;
    }
    const prop = props[0];

    const today = new Date().toISOString().slice(0, 10);
    const blockedRes = await fetch(
      `${SUPABASE_URL}/rest/v1/blocked_dates?property_id=eq.${prop.id}&end_date=gte.${today}&select=start_date,end_date,source&order=start_date.asc&limit=500`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const blocked = (await blockedRes.json()) as Array<{
      start_date: string; end_date: string; source: string;
    }>;

    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    res.status(200).json({
      property: prop,
      currency: "SAR",
      blocked: blocked.map((b) => ({ from: b.start_date, to: b.end_date, source: b.source })),
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
