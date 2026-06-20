import { createServerClient } from '@/lib/supabase/server';

export async function generateICAL(propertyId: string): Promise<string> {
  const supabase = createServerClient() as any;
  const [{ data: bookings }, { data: blocked }] = await Promise.all([
    supabase.from('bookings').select('id, guest_name, check_in, check_out, status').eq('property_id', propertyId).not('status', 'in', '("cancelled","transferred")'),
    supabase.from('blocked_days').select('start_date, end_date, reason').eq('property_id', propertyId).eq('status', 'approved'),
  ]);
  const events = [
    ...(bookings ?? []).map((b: any) => ({ uid: b.id, summary: `BLOCKED - ${b.guest_name}`, dtstart: b.check_in.replace(/-/g, ''), dtend: b.check_out.replace(/-/g, '') })),
    ...(blocked ?? []).map((b: any) => ({ uid: `blocked-${b.start_date}-${propertyId}`, summary: `BLOCKED - ${b.reason ?? 'Maintenance'}`, dtstart: b.start_date.replace(/-/g, ''), dtend: b.end_date.replace(/-/g, '') })),
  ];
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Horizon Stays//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...events.flatMap(e => ['BEGIN:VEVENT', `UID:${e.uid}@horizonstays.com`, `SUMMARY:${e.summary}`, `DTSTART;VALUE=DATE:${e.dtstart}`, `DTEND;VALUE=DATE:${e.dtend}`, 'END:VEVENT']), 'END:VCALENDAR'].join('\r\n');
}
