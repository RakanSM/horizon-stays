-- Make the verified Supabase Storage galleries the durable per-unit source of truth.
WITH gallery_sizes(slug, photo_count) AS (
  VALUES
    ('3br-apt-outdoor', 28), ('al-yasmeen-apt-self-checkin', 17), ('artistic-design-suite', 20),
    ('cinema-suite-2br', 30), ('city-view-suite', 19), ('designer-loft-2bd', 16),
    ('duplex-penthouse-4bd', 27), ('executive-studio', 17), ('garden-hottub-suite', 23),
    ('kafd-penthouse-3bd', 42), ('luxury-1bd-70tv', 25), ('luxury-apt-3bd-gaming-area', 39),
    ('luxury-apt-al-yasmin', 30), ('luxury-apt-blvd-70-tv', 1), ('massive-3br-2floors', 29),
    ('minimalist-1bd', 15), ('pool-view-apartment', 37), ('private-rooftop-penthouse', 28),
    ('royal-suite-3bd', 20), ('self-checkin-apt-75tv-blvd', 22), ('sky-lounge-suite', 34),
    ('spacious-2bd-cinema', 26), ('spacious-apt-luxury-bath-75tv', 22), ('towers-jacuzzi-suite', 25),
    ('tranquil-stay-luxury-bath', 36)
)
UPDATE public.properties p
SET hero_image = format('https://bwffhalzuvvmuzjfmdyp.supabase.co/storage/v1/object/public/property-images/%s-1.webp', g.slug),
    gallery_images = (
      SELECT jsonb_agg(format('https://bwffhalzuvvmuzjfmdyp.supabase.co/storage/v1/object/public/property-images/%s-%s.webp', g.slug, n) ORDER BY n)
      FROM generate_series(1, g.photo_count) AS n
    )
FROM gallery_sizes g
WHERE p.slug = g.slug;

CREATE OR REPLACE FUNCTION public.admin_list_properties(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT _is_admin(p_token) THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthorized'); END IF;
  RETURN jsonb_build_object('ok', true, 'properties', COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', pr.id, 'slug', pr.slug, 'name_ar', pr.name_ar, 'name_en', pr.name_en, 'type', pr.type,
      'price_per_night', pr.price_per_night, 'bedrooms', pr.bedrooms, 'bathrooms', pr.bathrooms,
      'area_m2', pr.area_m2, 'floor', pr.floor, 'max_guests', pr.max_guests, 'neighborhood', pr.neighborhood,
      'description_ar', pr.description_ar, 'airbnb_url', pr.airbnb_url, 'gathern_url', pr.gathern_url,
      'airbnb_ical_url', pr.airbnb_ical_url, 'gatherin_ical_url', pr.gatherin_ical_url,
      'ical_token', pr.ical_token, 'is_active', pr.is_active, 'amenities', pr.amenities,
      'hero_image', pr.hero_image, 'gallery_images', pr.gallery_images,
      'odoo_product_id', pr.odoo_product_id, 'odoo_product_name', pr.odoo_product_name, 'odoo_sync_enabled', pr.odoo_sync_enabled,
      'calendar', jsonb_build_object(
        'blocked_count', (SELECT count(*) FROM public.blocked_dates bd WHERE bd.property_id = pr.id AND bd.end_date >= current_date),
        'last_synced_at', (SELECT max(bd.updated_at) FROM public.blocked_dates bd WHERE bd.property_id = pr.id)
      ),
      'landlord', (SELECT jsonb_build_object('id', l.id, 'name', l.name,
                     'commission_pct', COALESCE(pl.commission_pct, l.default_commission_pct))
                   FROM public.property_landlords pl JOIN public.landlords l ON l.id = pl.landlord_id
                   WHERE pl.property_id = pr.id LIMIT 1)
    ) ORDER BY pr.name_en) FROM public.properties pr
  ), '[]'::jsonb));
END $function$;

DROP FUNCTION IF EXISTS public.admin_update_property(text, integer, text, text, text, integer, integer, integer, integer, text, integer, text, text, text, text, text, text, boolean, jsonb);

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
  p_odoo_sync_enabled boolean DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT _is_admin(p_token) THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthorized'); END IF;
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
    odoo_sync_enabled = COALESCE(p_odoo_sync_enabled, odoo_sync_enabled)
  WHERE id = p_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'property_not_found'); END IF;
  RETURN jsonb_build_object('ok', true);
END $function$;
