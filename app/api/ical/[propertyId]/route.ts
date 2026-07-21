import { NextResponse } from 'next/server';
import { generateICAL } from '@/lib/ical';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: { propertyId: string } }) {
  const ical = await generateICAL(params.propertyId, 'airbnb');
  return new NextResponse(ical, { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `attachment; filename=horizon-${params.propertyId}.ics`, 'Cache-Control': 'no-cache' } });
}
