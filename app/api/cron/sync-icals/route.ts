import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { parseIcal } from "@/lib/ical-parser";

function icalDateToISO(d: string): string {
  // Handles YYYYMMDD and YYYYMMDDTHHmmssZ
  if (d.length === 8) return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
  return new Date(d).toISOString().split("T")[0];
}

async function fetchIcal(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "HorizonStays/1.0 Calendar Sync" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

const PLATFORM_NAMES: Record<string, string> = {
  airbnb: "airbnb",
  gatherin: "gatherin",
};

export async function GET(request: Request) {
  // Security: only allow Vercel Cron or internal calls
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const results: { property: string; platform: string; events: number; blocked: number }[] = [];
  const errors: string[] = [];

  const { data: properties, error: fetchPropertiesError } = await supabase
    .from("properties")
    .select("id, airbnb_ical_url, gatherin_ical_url");

  if (fetchPropertiesError) {
    errors.push(`Failed to fetch properties: ${fetchPropertiesError.message}`);
    return NextResponse.json({ errors }, { status: 500 });
  }

  for (const property of (properties as any[]) || []) {
    const pid = property.id;

    for (const platform of ["airbnb", "gatherin"]) {
      let icalUrl: string | null = null;
      if (platform === "airbnb") {
        icalUrl = property.airbnb_ical_url;
      } else if (platform === "gatherin") {
        icalUrl = property.gatherin_ical_url;
      }

      if (!icalUrl) continue;

      const text = await fetchIcal(icalUrl);
      if (!text) {
        errors.push(`${pid}:${platform} — fetch failed`);
        continue;
      }

      const events = parseIcal(text).filter(e => e.status !== "CANCELLED");
      let blockedCount = 0;

      for (const ev of events) {
        try {
          const ci = icalDateToISO(ev.dtstart);
          const co = icalDateToISO(ev.dtend);

          // Upsert blocked_days as a date range
          const { data: existingBlocks, error: existingBlocksError } = await (supabase as any)
            .from("blocked_days")
            .select("id")
            .eq("property_id", pid)
            .eq("start_date", ci)
            .eq("end_date", co)
            .limit(1);

          if (existingBlocksError) {
            errors.push(`${pid}:${platform}:${ev.uid} — Failed to check existing blocks: ${existingBlocksError.message}`);
            continue;
          }

          if (!existingBlocks || existingBlocks.length === 0) {
            const { error: insertBlockError } = await (supabase as any)
              .from("blocked_days")
              .insert({
                property_id: pid,
                start_date: ci,
                end_date: co,
                reason: `${PLATFORM_NAMES[platform]}:${ev.uid}`,
                status: "approved", // iCal blocks are usually confirmed
              });
            if (insertBlockError) {
              errors.push(`${pid}:${platform}:${ev.uid} — Failed to insert block: ${insertBlockError.message}`);
              continue;
            }
          }

          // Upsert booking record (skip Airbnb blocks — just date holds)
          if (!ev.summary?.toLowerCase().includes("not available") &&
              !ev.summary?.toLowerCase().includes("blocked")) {
            await (supabase as any)
              .from("bookings")
              .upsert({
                property_id: pid,
                check_in: ci,
                check_out: co,
                platform: PLATFORM_NAMES[platform],
                source: "ical_sync",
                status: "confirmed",
                confirmation_code: ev.uid,
                guest_name: ev.summary || "Guest",
              }, { onConflict: "confirmation_code" });
          }
          blockedCount += 1; // Count as one block entry, not individual days
        } catch (e) {
          errors.push(`${pid}:${platform}:${ev.uid} — ${String(e)}`);
        }
      }

      results.push({ property: pid, platform, events: events.length, blocked: blockedCount });
    }
  }

  return NextResponse.json({
    synced_at: new Date().toISOString(),
    properties_checked: properties?.length || 0,
    platform_feeds: results.length,
    total_events: results.reduce((s, r) => s + r.events, 0),
    total_dates_blocked: results.reduce((s, r) => s + r.blocked, 0),
    errors: errors.length ? errors : undefined,
    results,
  });
}
