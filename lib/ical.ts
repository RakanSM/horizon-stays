import { createServerClient } from '@/lib/supabase/server';
import { parseIcal } from '@/app/api/cron/sync-icals/route'; // Re-use the parsing logic

export async function generateICAL(propertyId: string, platform: 'airbnb' | 'gatherin'): Promise<string> {
  const supabase = createServerClient() as any;

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('airbnb_ical_url, gatherin_ical_url')
    .eq('id', propertyId)
    .single();

  if (propertyError) throw propertyError;

  const icalUrl = platform === 'airbnb' ? property?.airbnb_ical_url : property?.gatherin_ical_url;

  if (!icalUrl) {
    throw new Error(`iCal URL not found for property ${propertyId} on platform ${platform}`);
  }

  const response = await fetch(icalUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch iCal from ${icalUrl}: ${response.statusText}`);
  }
  const icalText = await response.text();
  const externalEvents = parseIcal(icalText);

  // For the generated iCal, we only include events from the external source.
  // The existing bookings and blocked days from our system are handled by the sync cron.
  const events = externalEvents.map(e => ({
    uid: e.uid,
    summary: e.summary,
    dtstart: e.dtstart.replace(/-/g, ''),
    dtend: e.dtend.replace(/-/g, ''),
  }));

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Horizon Stays//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events.flatMap(e => [
      'BEGIN:VEVENT',
      `UID:${e.uid}@horizonstays.com`,
      `SUMMARY:${e.summary}`,
      `DTSTART;VALUE=DATE:${e.dtstart}`,
      `DTEND;VALUE=DATE:${e.dtend}`,
      'END:VEVENT',
    ]),
    'END:VCALENDAR',
  ].join('\r\n');
}
