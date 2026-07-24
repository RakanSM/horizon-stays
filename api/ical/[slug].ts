/**
 * GET /api/ical/{slug}?token=XXXX&exclude=airbnb|gathern
 * Serves the property's blocked dates as an iCal feed for import into
 * Airbnb / Gathern. `exclude` omits events originating from that platform
 * to prevent sync loops.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateIcalFeed, type IcalEvent } from "../_lib/ical.js";
import { rpc } from "../_lib/config.js";

type ExportRow = {
  property_id: number;
  source: string;
  uid: string | null;
  summary: string | null;
  start_date: string;
  end_date: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    let slug = String(req.query.slug || "");
    // support /api/ical/slug.ics style
    if (slug.endsWith(".ics")) slug = slug.slice(0, -4);
    const token = String(req.query.token || "");
    const exclude = String(req.query.exclude || "");

    if (!slug || !token) {
      res.status(400).send("Missing slug or token");
      return;
    }

    const rows = await rpc<ExportRow[]>("get_ical_export", {
      p_slug: slug,
      p_token: token,
    });

    const events: IcalEvent[] = rows
      .filter((r) => !exclude || r.source !== exclude)
      .map((r) => ({
        uid: r.uid || `${r.source}-${r.start_date}-${r.end_date}`,
        start: r.start_date,
        end: r.end_date,
        summary: "Reserved (Horizon Stays)",
      }));

    const ics = generateIcalFeed(slug, slug, events);
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).send(ics);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("not found")) {
      res.status(404).send("Not found");
    } else {
      res.status(500).send("Internal error");
    }
  }
}
