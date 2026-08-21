-- Permit the existing admin property editor to store a verified pin.
-- No coordinates are seeded here: location data is only updated when a manager verifies it.
DROP FUNCTION IF EXISTS public.admin_update_property(text, integer, text, text, text, integer, integer, integer, integer, text, integer, text, text, text, text, text, text, boolean, jsonb, text, jsonb, integer, text, boolean);

CREATE FUNCTION public.admin_update_property(
  p_token text,
  p_id integer,
  p_name_ar text DEFAULT NULL,
  p_name_en text DEFAULT NULL,
  p_type text DEFAULT NULL,
  p_price integer DEFAULT NULL,
  p_bedrooms integer DEFAULT NULL,
  p_bathrooms integer DEFAULT NULL,
  p_area integer DEFAULT NULL,
  p_floor text DEFAULT NULL,
  p_max_guests integer DEFAULT NULL,
  p_neighborhood text DEFAULT NULL,
  p_description_ar text DEFAULT NULL,
  p_airbnb_url text DEFAULT NULL,
  p_gathern_url text DEFAULT NULL,
  p_airbnb_ical text DEFAULT NULL,
  p_gathern_ical text DEFAULT NULL,
  p_is_active boolean DEFAULT NULL,
  p_amenities jsonb DEFAULT NULL,
  p_hero_image text DEFAULT NULL,
  p_gallery_images jsonb DEFAULT NULL,
  p_odoo_product_id integer DEFAULT NULL,
  p_odoo_product_name text DEFAULT NULL,
  p_odoo_sync_enabled boolean DEFAULT NULL,
  p_lat double precision DEFAULT NULL,
  p_lng double precision DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT _is_admin(p_token) THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthorized'); END IF;
  IF (p_lat IS NULL) <> (p_lng IS NULL) THEN RETURN jsonb_build_object('ok', false, 'error', 'location_pair_required'); END IF;
  IF p_lat IS NOT NULL AND (p_lat < 23 OR p_lat > 27 OR p_lng < 45 OR p_lng > 48) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'location_outside_riyadh_area');
  END IF;
  UPDATE public.properties SET
    name_ar = COALESCE(p_name_ar, name_ar), name_en = COALESCE(p_name_en, name_en),
    type = COALESCE(p_type, type), price_per_night = COALESCE(p_price, price_per_night),
    bedrooms = COALESCE(p_bedrooms, bedrooms), bathrooms = COALESCE(p_bathrooms, bathrooms),
    area_m2 = COALESCE(p_area, area_m2), floor = COALESCE(p_floor, floor),
    max_guests = COALESCE(p_max_guests, max_guests), neighborhood = COALESCE(p_neighborhood, neighborhood),
    description_ar = COALESCE(p_description_ar, description_ar),
    airbnb_url = COALESCE(p_airbnb_url, airbnb_url), gathern_url = COALESCE(p_gathern_url, gathern_url),
    airbnb_ical_url = COALESCE(p_airbnb_ical, airbnb_ical_url),
    gatherin_ical_url = COALESCE(p_gathern_ical, gatherin_ical_url),
    is_active = COALESCE(p_is_active, is_active), amenities = COALESCE(p_amenities, amenities),
    hero_image = COALESCE(p_hero_image, hero_image), gallery_images = COALESCE(p_gallery_images, gallery_images),
    odoo_product_id = COALESCE(p_odoo_product_id, odoo_product_id),
    odoo_product_name = COALESCE(p_odoo_product_name, odoo_product_name),
    odoo_sync_enabled = COALESCE(p_odoo_sync_enabled, odoo_sync_enabled),
    lat = COALESCE(p_lat, lat), lng = COALESCE(p_lng, lng)
  WHERE id = p_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'property_not_found'); END IF;
  RETURN jsonb_build_object('ok', true);
END $function$;
