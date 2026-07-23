/**
 * iCal engine (ported from Horizon Stays Manus project).
 * Serverless-safe: no imports beyond fetch.
 */

export type IcalEvent = {
  uid: string;
  start: string; // YYYY-MM-DD inclusive
  end: string; // YYYY-MM-DD exclusive (iCal DTEND convention)
  summary: string;
};

function fmtDate(d: string | Date): string {
  const dt = typeof d === "string" ? new Date(d + "T00:00:00Z") : d;
  return dt.toISOString().slice(0, 10).replace(/-/g, "");
}

function icalEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function generateIcalFeed(propertyName: string, slug: string, events: IcalEvent[]): string {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Horizon Stays//Calendar Sync//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icalEscape(propertyName)} — Horizon Stays`,
  ];
  for (const ev of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${ev.uid}@horizonstays`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${fmtDate(ev.start)}`,
      `DTEND;VALUE=DATE:${fmtDate(ev.end)}`,
      `SUMMARY:${icalEscape(ev.summary || "Reserved")}`,
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

export function parseIcalFeed(ics: string): IcalEvent[] {
  const unfolded = ics.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);
  const events: IcalEvent[] = [];
  let cur: Partial<IcalEvent> | null = null;

  const parseDate = (v: string): string | null => {
    const m = v.match(/^(\d{4})(\d{2})(\d{2})/);
    if (!m) return null;
    return `${m[1]}-${m[2]}-${m[3]}`;
  };

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      cur = {};
    } else if (line === "END:VEVENT") {
      if (cur && cur.start && cur.end) {
        events.push({
          uid: cur.uid || `${cur.start}-${cur.end}`,
          start: cur.start,
          end: cur.end,
          summary: cur.summary || "Reserved",
        });
      }
      cur = null;
    } else if (cur) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const keyPart = line.slice(0, idx);
      const value = line.slice(idx + 1).trim();
      const key = keyPart.split(";")[0].toUpperCase();
      if (key === "UID") cur.uid = value;
      else if (key === "SUMMARY") cur.summary = value;
      else if (key === "DTSTART") {
        const d = parseDate(value);
        if (d) cur.start = d;
      } else if (key === "DTEND") {
        const d = parseDate(value);
        if (d) cur.end = d;
      }
    }
  }
  return events;
}

async function fetchRaw(url: string, timeoutMs: number): Promise<{ status: number; text: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "HorizonStays-CalendarSync/1.0" },
      redirect: "follow",
    });
    return { status: res.status, text: await res.text() };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Fetch a feed URL with relay fallback for geo-blocked egress IPs.
 * Relay config comes from env or the fallback constants baked at deploy time.
 */
export async function fetchIcalFeed(
  url: string,
  relay: { url: string; key: string } | null,
  timeoutMs = 20000
): Promise<IcalEvent[]> {
  let direct: { status: number; text: string } | null = null;
  let directErr: unknown = null;
  try {
    direct = await fetchRaw(url, timeoutMs);
    if (direct.status === 200 && direct.text.includes("BEGIN:VCALENDAR")) {
      return parseIcalFeed(direct.text);
    }
  } catch (err) {
    directErr = err;
  }

  if (relay && relay.url && relay.key) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs + 10000);
    try {
      const res = await fetch(
        `${relay.url.replace(/\/$/, "")}/fetch?url=${encodeURIComponent(url)}`,
        { signal: ctrl.signal, headers: { "x-relay-key": relay.key } }
      );
      const text = await res.text();
      if (res.ok && text.includes("BEGIN:VCALENDAR")) {
        return parseIcalFeed(text);
      }
      throw new Error(`Relay fetch failed: HTTP ${res.status}`);
    } catch (relayErr) {
      const directMsg = direct ? `HTTP ${direct.status}` : String(directErr);
      throw new Error(
        `Feed fetch failed (direct: ${directMsg}; relay: ${String(
          relayErr instanceof Error ? relayErr.message : relayErr
        )})`
      );
    } finally {
      clearTimeout(t);
    }
  }

  if (directErr) throw directErr;
  if (direct && direct.status !== 200) throw new Error(`Feed fetch failed: HTTP ${direct.status}`);
  throw new Error("Response is not an iCal feed");
}
