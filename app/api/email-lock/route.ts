// app/api/email-lock/route.ts
// Reads Airbnb booking emails → immediately blocks dates in Supabase
// Called by Vercel Cron every 5 minutes

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const PROPERTY_MAP: Record<string, string> = {
  "1-Bd Luxury Spacious":       "1",
  "75\" TV | 10 min to KAFD":   "1",
  "2BR| Outdoor area":          "2",
  "Cinema Room":                "2",
  "3BR| 3 outdoor areas":       "3",
  "Cozy 1Bd Apartment":         "4",
  "Heart of Riyadh":            "4",
  "Privet Rooftop":             "5",
  "Outdoor garden|HotTub":      "6",
  "PrivateEntrance":            "6",
  "La Ribera":                  "7",
  "Luxurious 1Bd Apartment":    "8",
  "70'SmTv":                    "8",
  "Studio with Bathtub":        "9",
  "Private Outdoor":            "9",
  "jacuzzi | towers view":      "10",
  "3outdoors|cinema":           "10",
  "Near to Blvd":               "11",
  "Outdoor area| Cozy Studio":  "12",
  "Penthouse| KAFD view":       "13",
  "KAFD view | 3Bd":            "13",
  "Luxury Banio":               "14",
  "Spacious APT":               "14",
  "Roof top studio":            "15",
  "HotTub|70":                  "15",
  "sound insulation":           "16",
  "10 minutes from KAFD":       "16",
};

function resolveProperty(title: string): string | null {
  for (const [fragment, id] of Object.entries(PROPERTY_MAP)) {
    if (title.toLowerCase().includes(fragment.toLowerCase())) return id;
  }
  return null;
}

function dateRange(checkIn: Date, checkOut: Date): string[] {
  const days: string[] = [];
  const d = new Date(checkIn);
  while (d < checkOut) {
    days.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return days;
}

async function fetchImapEmails(): Promise<
  { subject: string; body: string; uid: string }[]
> {
  // IMAP fetch via Node.js net/tls
  // Returns parsed email objects — simplified IMAP over TLS
  const tls = await import("tls");
  const emailUser = process.env.EMAIL_ADDRESS!;
  const emailPass = process.env.EMAIL_APP_PASSWORD!;
  if (!emailUser || !emailPass) return [];

  return new Promise((resolve) => {
    const emails: { subject: string; body: string; uid: string }[] = [];
    const socket = tls.connect(993, "imap.gmail.com", { rejectUnauthorized: true });
    let buffer = "";
    let step = 0;
    const send = (cmd: string) => socket.write(cmd + "\r\n");

    const timeout = setTimeout(() => { socket.destroy(); resolve(emails); }, 15000);

    socket.on("data", (data: Buffer) => {
      buffer += data.toString();
      const lines = buffer.split("\r\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (step === 0 && line.includes("* OK")) {
          step = 1;
          send(`A001 LOGIN ${JSON.stringify(emailUser)} ${JSON.stringify(emailPass)}`);
        } else if (step === 1 && line.includes("A001 OK")) {
          step = 2;
          send("A002 SELECT INBOX");
        } else if (step === 2 && line.includes("A002 OK")) {
          step = 3;
          send('A003 SEARCH UNSEEN FROM "automated@airbnb.com"');
        } else if (step === 3 && line.startsWith("* SEARCH")) {
          const ids = line.replace("* SEARCH", "").trim().split(" ").filter(Boolean);
          if (!ids.length) { send("A999 LOGOUT"); return; }
          step = 4;
          send(`A004 FETCH ${ids.join(",")} (FLAGS BODY[HEADER.FIELDS (SUBJECT)] BODY[TEXT])`);
        } else if (step === 4) {
          // Very simplified parser — extract subject and body segments
          const subjectMatch = line.match(/^Subject: (.+)/i);
          if (subjectMatch) {
            emails.push({ subject: subjectMatch[1].trim(), body: "", uid: String(emails.length + 1) });
          } else if (emails.length > 0 && line.length > 0 && !line.startsWith("A004")) {
            emails[emails.length - 1].body += line + "\n";
          }
          if (line.includes("A004 OK")) {
            send("A999 LOGOUT");
          }
        } else if (line.includes("A999 OK") || line.includes("BYE")) {
          clearTimeout(timeout);
          socket.destroy();
          resolve(emails);
        }
      }
    });

    socket.on("error", () => { clearTimeout(timeout); resolve([]); });
  });
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const processed: string[] = [];
  const skipped: string[] = [];

  const emails = await fetchImapEmails();

  for (const em of emails) {
    const { subject, body } = em;
    if (!/reservation confirmed|new reservation|booking confirmed/i.test(subject)) {
      skipped.push(subject);
      continue;
    }

    const title = subject.replace(/new reservation|reservation confirmed[:\s-]*/gi, "").trim();
    const propId = resolveProperty(title);
    if (!propId) {
      skipped.push(`UNMAPPED: ${title}`);
      continue;
    }

    const dateMatches = body.match(/\w+ \d{1,2}, \d{4}/g) ?? [];
    if (dateMatches.length < 2) { skipped.push(`NO_DATES: ${title}`); continue; }

    const ci = new Date(dateMatches[0]!);
    const co = new Date(dateMatches[1]!);
    if (isNaN(ci.getTime()) || isNaN(co.getTime()) || ci >= co) {
      skipped.push(`BAD_DATES: ${title}`);
      continue;
    }

    const codeMatch = body.match(/\bHM[A-Z0-9]{6,10}\b/);
    const confirmation = codeMatch?.[0] ?? `EMAIL_${Date.now()}`;
    const guestMatch = body.match(/(?:from|by|Guest:)\s+([A-Z][a-z]+)/i);
    const guest = guestMatch?.[1] ?? "Guest";
    const amountMatch = body.match(/SAR\s*([\d,]+)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(",", "")) : 0;

    const days = dateRange(ci, co);
    const blockRows = days.map(d => ({
      property_id: propId, date: d, reason: `airbnb_email:${confirmation}`,
    }));
    await (supabase as any).from("blocked_days").upsert(blockRows, { onConflict: "property_id,date" });
    await (supabase as any).from("bookings").upsert({
      property_id: propId,
      guest_name: guest,
      check_in: ci.toISOString().split("T")[0],
      check_out: co.toISOString().split("T")[0],
      total_amount: amount,
      platform: "airbnb",
      source: "airbnb_email",
      status: "confirmed",
      confirmation_code: confirmation,
    }, { onConflict: "confirmation_code" });

    processed.push(`${propId}:${confirmation}`);
  }

  return NextResponse.json({
    processed: processed.length,
    skipped: skipped.length,
    bookings: processed,
    unmapped: skipped.filter(s => s.startsWith("UNMAPPED")),
    checked_at: new Date().toISOString(),
  });
}
