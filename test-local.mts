/* Local harness: verifies RPCs + feed logic before deploy. */
import { fetchIcalFeed, generateIcalFeed } from "./api/_lib/ical.js";
import { rpc, RELAY, SYNC_SECRET } from "./api/_lib/config.js";

type Target = { id: number; slug: string; airbnb_ical_url: string | null; gatherin_ical_url: string | null };

async function main() {
  // 1. get_sync_targets
  const targets = await rpc<Target[]>("get_sync_targets", { p_secret: SYNC_SECRET });
  console.log("targets:", targets.length);

  // 2. wrong secret must fail
  try {
    await rpc("get_sync_targets", { p_secret: "wrong" });
    console.log("SECURITY FAIL: wrong secret accepted");
  } catch {
    console.log("wrong secret rejected: OK");
  }

  // 3. sync one property end-to-end
  const t = targets.find((x) => x.airbnb_ical_url && x.gatherin_ical_url) || targets[0];
  console.log("testing slug:", t.slug);
  const events = await fetchIcalFeed(t.airbnb_ical_url!, RELAY, 15000);
  console.log("airbnb events:", events.length);
  const n = await rpc<number>("replace_blocked_dates", {
    p_secret: SYNC_SECRET,
    p_property_id: t.id,
    p_source: "airbnb",
    p_events: events.map((e) => ({ uid: e.uid, summary: e.summary, start: e.start, end: e.end })),
  });
  console.log("replaced rows:", n);

  // 4. export feed via RPC with real token
  const propRes = await fetch(
    `${process.env.SUPABASE_URL || "https://bwffhalzuvvmuzjfmdyp.supabase.co"}/rest/v1/properties?slug=eq.${t.slug}&select=slug,ical_token`,
    {
      headers: {
        apikey: "sb_publishable_BqnW7Igm5BDtHw-3CD0gBA_lKwg34Vz",
        Authorization: "Bearer sb_publishable_BqnW7Igm5BDtHw-3CD0gBA_lKwg34Vz",
      },
    }
  );
  const props = (await propRes.json()) as Array<{ slug: string; ical_token: string }>;
  console.log("ical_token visible via anon select:", props[0]?.ical_token ? "YES (need to hide!)" : "no");

  const rows = await rpc<Array<{ source: string; uid: string; summary: string; start_date: string; end_date: string }>>(
    "get_ical_export",
    { p_slug: t.slug, p_token: props[0]?.ical_token || "x" }
  );
  console.log("export rows:", rows.length);
  const ics = generateIcalFeed(t.slug, t.slug, rows.map((r) => ({ uid: r.uid || "u", start: r.start_date, end: r.end_date, summary: "Reserved" })));
  console.log("ics head:", ics.split("\r\n").slice(0, 3).join(" | "), "events:", (ics.match(/BEGIN:VEVENT/g) || []).length);

  // 5. bad token must fail
  try {
    await rpc("get_ical_export", { p_slug: t.slug, p_token: "bad" });
    console.log("SECURITY FAIL: bad token accepted");
  } catch {
    console.log("bad token rejected: OK");
  }
}

main().catch((e) => {
  console.error("HARNESS FAILED:", e);
  process.exit(1);
});
