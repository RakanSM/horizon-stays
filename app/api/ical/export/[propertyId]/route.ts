import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: { propertyId: string } }) {
  const { propertyId } = params;
  const supabase = createServerClient();

  // Fetch property details and all blocked days/bookings for this property
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, name_en")
    .eq("id", propertyId)
    .single();

  if (propertyError || !property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const { data: blockedDays, error: blockedDaysError } = await supabase
    .from("blocked_days")
    .select("start_date, end_date, reason")
    .eq("property_id", propertyId);

  if (blockedDaysError) {
    console.error("Error fetching blocked days:", blockedDaysError);
    return NextResponse.json({ error: "Failed to fetch blocked days" }, { status: 500 });
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("check_in, check_out, guest_name, platform, confirmation_code")
    .eq("property_id", propertyId)
    .neq("status", "cancelled"); // Exclude cancelled bookings

  if (bookingsError) {
    console.error("Error fetching bookings:", bookingsError);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }

  let icalContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//HorizonStays//NONSGML v1.0//EN\nCALSCALE:GREGORIAN\nX-WR-CALNAME:${property.name_en} Availability\n`;

  // Add blocked days to iCal
  for (const day of blockedDays || []) {
    const startDate = day.start_date.replace(/-/g, "");
    const endDate = day.end_date.replace(/-/g, "");
    icalContent += `BEGIN:VEVENT\nUID:${propertyId}-blocked-${startDate}-${endDate}\nDTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d{3}/g, "")}\nDTSTART;VALUE=DATE:${startDate}\nDTEND;VALUE=DATE:${endDate}\nSUMMARY:Blocked: ${day.reason || "Not Available"}\nEND:VEVENT\n`;
  }

  // Add bookings to iCal
  for (const booking of bookings || []) {
    const startDate = booking.check_in.replace(/-/g, "");
    const endDate = booking.check_out.replace(/-/g, "");
    icalContent += `BEGIN:VEVENT\nUID:${propertyId}-booking-${booking.confirmation_code}\nDTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d{3}/g, "")}\nDTSTART;VALUE=DATE:${startDate}\nDTEND;VALUE=DATE:${endDate}\nSUMMARY:Booked: ${booking.guest_name} (${booking.platform})\nEND:VEVENT\n`;
  }

  icalContent += `END:VCALENDAR`;

  return new NextResponse(icalContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${property.name_en.replace(/\s/g, "_")}_availability.ics"`,
    },
  });
}
