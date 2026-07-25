import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bwffhalzuvvmuzjfmdyp.supabase.co";
const SUPABASE_KEY = "sb_publishable_BqnW7Igm5BDtHw-3CD0gBA_lKwg34Vz";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export type Property = {
  id: number;
  slug: string;
  name_ar: string;
  name_en: string;
  type: string;
  price_per_night: number;
  bedrooms: number;
  bathrooms: number;
  area_m2: number | null;
  floor: string | null;
  max_guests: number;
  neighborhood: string | null;
  airbnb_url: string | null;
  hero_image: string | null;
  gallery_images: string[] | null;
  amenities: string[] | null;
  description_ar: string | null;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
};

export type BlockedDate = {
  id: number;
  property_id: number;
  source: string;
  start_date: string;
  end_date: string;
};

export async function fetchProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, slug, name_ar, name_en, type, price_per_night, bedrooms, bathrooms, area_m2, floor, max_guests, neighborhood, airbnb_url, hero_image, gallery_images, amenities, description_ar, lat, lng, is_active"
    )
    .eq("is_active", true)
    .order("price_per_night", { ascending: false });
  if (error) throw error;
  return (data || []) as Property[];
}

export async function fetchPropertyBySlug(slug: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, slug, name_ar, name_en, type, price_per_night, bedrooms, bathrooms, area_m2, floor, max_guests, neighborhood, airbnb_url, hero_image, gallery_images, amenities, description_ar, lat, lng, is_active"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return (data as Property) || null;
}

export async function fetchBlockedDates(propertyId: number): Promise<BlockedDate[]> {
  const { data, error } = await supabase
    .from("blocked_dates")
    .select("id, property_id, source, start_date, end_date")
    .eq("property_id", propertyId)
    .gte("end_date", new Date().toISOString().slice(0, 10));
  if (error) throw error;
  return (data || []) as BlockedDate[];
}

/** High-quality photos served from Supabase Storage CDN (re-fetched from source at
 * full resolution, T17). Falls back to hero/gallery URLs stored in the DB. */
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/property-images`;

export function propertyPhotos(p: Property): string[] {
  // Number of original full-resolution images uploaded to storage per slug (T22, Jul 2026)
  const hqGalleries: Record<string, number> = {
    "3br-apt-outdoor": 28,
    "al-yasmeen-apt-self-checkin": 17,
    "artistic-design-suite": 20,
    "cinema-suite-2br": 30,
    "city-view-suite": 19,
    "designer-loft-2bd": 16,
    "duplex-penthouse-4bd": 27,
    "executive-studio": 17,
    "garden-hottub-suite": 23,
    "kafd-penthouse-3bd": 42,
    "luxury-1bd-70tv": 25,
    "luxury-apt-3bd-gaming-area": 39,
    "luxury-apt-al-yasmin": 30,
    "luxury-apt-blvd-70-tv": 1,
    "massive-3br-2floors": 29,
    "minimalist-1bd": 15,
    "pool-view-apartment": 37,
    "private-rooftop-penthouse": 28,
    "royal-suite-3bd": 20,
    "self-checkin-apt-75tv-blvd": 22,
    "sky-lounge-suite": 34,
    "spacious-2bd-cinema": 26,
    "spacious-apt-luxury-bath-75tv": 22,
    "towers-jacuzzi-suite": 25,
    "tranquil-stay-luxury-bath": 36,
  };
  const n = hqGalleries[p.slug];
  if (n) {
    return Array.from({ length: n }, (_, i) => `${STORAGE_BASE}/${p.slug}-${i + 1}.webp`);
  }
  const photos: string[] = [];
  if (p.hero_image) photos.push(p.hero_image);
  if (Array.isArray(p.gallery_images)) photos.push(...p.gallery_images);
  return photos;
}
