// app/api/cron/sync-icals/route.ts
// Called by Vercel Cron every 10 minutes
// Polls iCal feeds from all platforms and writes to Supabase

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Each property's iCal URLs per platform (set in Supabase env or config table)
// Format: { propertyId: { airbnb?: string, booking?: string, gatherin?: string, expedia?: string } }
// These come from environment variables named: ICAL_<PROPERTY_ID>_AIRBNB, ICAL_<PROPERTY_ID>_BOOKING, etc.

interface ICalEvent {
  uid: string;
  summary: string;
  dtstart: string;
  dtend: string;
  status: string;
}

function parseIcal(text: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const blocks = text.split("BEGIN:VEVENT");
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const get = (key: string) => {
      const m = block.match(new RegExp(`${key}(?:;[^:]*)?:([^\\r\\n]+)`));
      return m ? m[1].trim() : "";
    };
    const dtstart = get("DTSTART");
    const dtend   = get("DTEND");
    const uid     = get("UID");
    const summary = get("SUMMARY");
    const status  = get("STATUS") || "CONFIRMED";
    if (dtstart && dtend && uid) {
      events.push({ uid, summary, dtstart, dtend, status });
    }
  }
  return events;
}

function icalDateToISO(d: string): string {
  // Handles YYYYMMDD and YYYYMMDDTHHmmssZ
  if (d.length === 8) return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
  return new Date(d).toISOString().split("T")[0];
}

function dateRange(checkIn: string, checkOut: string): string[] {
  const days: string[] = [];
  const d = new Date(checkIn);
  const end = new Date(checkOut);
  while (d < end) {
    days.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return days;
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
  booking: "booking_com",
  gatherin: "gatherin",
  expedia: "expedia",
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

  // Property IDs 1–16
  const propertyIds = Array.from({ length: 16 }, (_, i) => String(i + 1));

  for (const pid of propertyIds) {
    for (const platform of ["airbnb", "booking", "gatherin", "expedia"]) {
      const envKey = `ICAL_${pid}_${platform.toUpperCase()}`;
      const icalUrl = process.env[envKey];
      if (!icalUrl) continue;

      const text = await fetchIcal(icalUrl);
      if (!text) {
        errors.push(`${pid}:${platform} — fetch failed`);
        continue;
      }

      const events = parseIcal(text).filter(e => e.status !== "CANCELLED");
      let blocked = 0;

      for (const ev of events) {
        try {
          const ci = icalDateToISO(ev.dtstart);
          const co = icalDateToISO(ev.dtend);
          const days = dateRange(ci, co);

          // Upsert blocked_days
          const blockRows = days.map(d => ({
            property_id: pid,
            date: d,
            reason: `${PLATFORM_NAMES[platform]}:${ev.uid}`,
          }));
          await (supabase as any)
            .from("blocked_days")
            .upsert(blockRows, { onConflict: "property_id,date" });

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
          blocked += days.length;
        } catch (e) {
          errors.push(`${pid}:${platform}:${ev.uid} — ${String(e)}`);
        }
      }

      results.push({ property: pid, platform, events: events.length, blocked });
    }
  }

  return NextResponse.json({
    synced_at: new Date().toISOString(),
    properties_checked: propertyIds.length,
    platform_feeds: results.length,
    total_events: results.reduce((s, r) => s + r.events, 0),
    total_dates_blocked: results.reduce((s, r) => s + r.blocked, 0),
    errors: errors.length ? errors : undefined,
    results,
  });
}
