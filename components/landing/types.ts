export type LandingProperty = {
  id: string | number;
  name?: string | null;
  title?: string | null;
  property_name?: string | null;
  type?: string | null;
  property_type?: string | null;
  bedrooms?: number | string | null;
  area?: number | string | null;
  area_sqm?: number | string | null;
  base_price_night?: number | string | null;
  price_per_night?: number | string | null;
  nightly_price?: number | string | null;
  image_url?: string | null;
  images?: string[] | null;
  status?: string | null;
};

export type LandingReview = {
  id?: string | number;
  guest_name?: string | null;
  name?: string | null;
  rating?: number | string | null;
  review_text?: string | null;
  comment?: string | null;
  created_at?: string | null;
  date?: string | null;
};
