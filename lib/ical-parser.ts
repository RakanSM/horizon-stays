export interface ICalEvent {
  uid: string;
  summary: string;
  dtstart: string;
  dtend: string;
  status: string;
}

export function parseIcal(text: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const blocks = text.split("BEGIN:VEVENT");

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const get = (key: string) => {
      const match = block.match(new RegExp(`${key}(?:;[^:]*)?:([^\\r\\n]+)`));
      return match ? match[1].trim() : "";
    };

    const dtstart = get("DTSTART");
    const dtend = get("DTEND");
    const uid = get("UID");
    const summary = get("SUMMARY");
    const status = get("STATUS") || "CONFIRMED";

    if (dtstart && dtend && uid) {
      events.push({ uid, summary, dtstart, dtend, status });
    }
  }

  return events;
}
