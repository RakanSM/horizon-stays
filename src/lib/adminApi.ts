import { supabase } from "./supabase";
import { getAdminToken } from "./ThemeContext";

export async function adminRpc<T = any>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const tok = getAdminToken();
  if (!tok) throw new Error("no session");
  const { data, error } = await supabase.rpc(fn, { p_token: tok, ...args });
  if (error) throw new Error(error.message);
  if (data && data.ok === false) throw new Error(data.error || "failed");
  return data as T;
}

export const fmtSAR = (n: number | string) =>
  `${Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 })} ﷼`;

export const fmtDate = (d: string) => d; // yyyy-mm-dd kept as-is (business dates)

export type AdminProperty = {
  id: number; slug: string; name_ar: string; name_en: string; type: string;
  price_per_night: number; bedrooms: number; bathrooms: number; area_m2: number;
  floor: string | null; max_guests: number; neighborhood: string | null;
  description_ar: string | null; airbnb_url: string | null; gathern_url: string | null;
  airbnb_ical_url: string | null; gatherin_ical_url: string | null;
  ical_token: string | null; is_active: boolean; amenities: string[] | null;
  hero_image: string | null; gallery_images: string[] | null;
  odoo_product_id: number | null; odoo_product_name: string | null; odoo_sync_enabled: boolean;
  calendar: { blocked_count: number; last_synced_at: string | null } | null;
  landlord: { id: number; name: string; commission_pct: number } | null;
};

export type AdminBooking = {
  id: string; property_id: number; slug: string; property_name_ar: string; property_name_en: string;
  guest_name: string | null; guest_phone: string | null; guest_email: string | null;
  source: string; check_in: string; check_out: string; nights: number;
  amount: number; currency: string; status: string;
  commission_pct: number; commission_amount: number; net_to_landlord: number;
  payment_status: string | null; notes: string | null; created_at: string; has_invoice: boolean;
};

export type AdminLandlord = {
  id: number; name: string; phone: string | null; email: string | null;
  access_code: string; default_commission_pct: number; notes: string | null; is_active: boolean;
  properties: { property_id: number; slug: string; name_en: string; name_ar: string; commission_pct: number }[];
};

export type FinanceSummary = {
  ok: boolean;
  totals: { gross: number; commission: number; net_to_landlords: number; bookings: number; nights: number };
  monthly: { month: string; gross: number; commission: number; bookings: number }[];
  by_property: { property_id: number; slug: string; name_ar: string; name_en: string; gross: number; commission: number; bookings: number; nights: number }[];
  by_source: { source: string; gross: number; bookings: number }[];
};

export type Invoice = {
  id: number; invoice_no: string; booking_id: string; guest_name: string | null;
  property_name: string | null; check_in: string; check_out: string; nights: number;
  subtotal: number; vat_rate: number; vat_amount: number; total: number; issued_at: string;
};
