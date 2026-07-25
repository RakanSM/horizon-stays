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
  // Number of HQ images uploaded to storage per slug
  const hqGalleries: Record<string, number> = {
    "3br-apt-outdoor": 10,
    "al-yasmeen-apt-self-checkin": 10,
    "artistic-design-suite": 6,
    "cinema-suite-2br": 6,
    "city-view-suite": 6,
    "designer-loft-2bd": 6,
    "duplex-penthouse-4bd": 6,
    "executive-studio": 6,
    "garden-hottub-suite": 6,
    "kafd-penthouse-3bd": 4,
    "luxury-1bd-70tv": 6,
    "luxury-apt-3bd-gaming-area": 10,
    "luxury-apt-al-yasmin": 10,
    "luxury-apt-blvd-70-tv": 1,
    "massive-3br-2floors": 10,
    "minimalist-1bd": 6,
    "pool-view-apartment": 6,
    "private-rooftop-penthouse": 6,
    "royal-suite-3bd": 6,
    "self-checkin-apt-75tv-blvd": 10,
    "sky-lounge-suite": 10,
    "spacious-2bd-cinema": 10,
    "spacious-apt-luxury-bath-75tv": 10,
    "towers-jacuzzi-suite": 6,
    "tranquil-stay-luxury-bath": 1,
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
