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

/** Photo resolution: local gallery (bundled) or remote hero URL. */
export function propertyPhotos(p: Property): string[] {
  // Local bundled galleries exist for these slugs (1..6 images each)
  const localGalleries: Record<string, number[]> = {
    "kafd-penthouse-3bd": [1, 2, 3, 6],
    "towers-jacuzzi-suite": [1, 2, 3, 4, 5, 6],
    "private-rooftop-penthouse": [1, 2, 3, 4, 5, 6],
    "garden-hottub-suite": [1, 2, 3, 4, 5, 6],
    "cinema-suite-2br": [1, 2, 3, 4, 5, 6],
    "luxury-1bd-70tv": [1, 2, 3, 4, 5, 6],
    "sky-lounge-suite": [1],
    "executive-studio": [1, 2, 3, 4, 5, 6],
    "duplex-penthouse-4bd": [1, 2, 3, 4, 5, 6],
    "designer-loft-2bd": [1, 2, 3, 4, 5, 6],
    "city-view-suite": [1, 2, 3, 4, 5, 6],
    "minimalist-1bd": [1, 2, 3, 4, 5, 6],
    "royal-suite-3bd": [1, 2, 3, 4, 5, 6],
    "pool-view-apartment": [1, 2, 3, 4, 5, 6],
    "artistic-design-suite": [1, 2, 3, 4, 5, 6],
  };
  const local = localGalleries[p.slug];
  if (local) {
    return local.map((i) => `/assets/property-real/${p.slug}-${i}.jpg`);
  }
  const photos: string[] = [];
  if (p.hero_image) photos.push(p.hero_image);
  if (Array.isArray(p.gallery_images)) photos.push(...p.gallery_images);
  return photos;
}
