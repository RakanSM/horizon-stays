ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS feature_flags jsonb NOT NULL DEFAULT '{
    "nav_properties": true,
    "nav_about": true,
    "nav_contact": true,
    "nav_calendar": true,
    "page_landlord": true,
    "page_cleaner": true,
    "booking_whatsapp": true,
    "booking_airbnb": true,
    "booking_gathern": true,
    "booking_myfatoorah": true,
    "feature_gallery": true,
    "feature_amenities": true,
    "feature_map": true,
    "feature_social_share": true,
    "feature_theme_decor": true,
    "feature_scrollytelling": true
  }'::jsonb;

CREATE OR REPLACE FUNCTION public.admin_set_feature_flags(p_token text, p_flags jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_flags jsonb;
BEGIN
  IF NOT _is_admin(p_token) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  IF p_flags IS NULL OR jsonb_typeof(p_flags) <> 'object' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_flags');
  END IF;

  v_flags := jsonb_build_object(
    'nav_properties', COALESCE((p_flags->>'nav_properties')::boolean, true),
    'nav_about', COALESCE((p_flags->>'nav_about')::boolean, true),
    'nav_contact', COALESCE((p_flags->>'nav_contact')::boolean, true),
    'nav_calendar', COALESCE((p_flags->>'nav_calendar')::boolean, true),
    'page_landlord', COALESCE((p_flags->>'page_landlord')::boolean, true),
    'page_cleaner', COALESCE((p_flags->>'page_cleaner')::boolean, true),
    'booking_whatsapp', COALESCE((p_flags->>'booking_whatsapp')::boolean, true),
    'booking_airbnb', COALESCE((p_flags->>'booking_airbnb')::boolean, true),
    'booking_gathern', COALESCE((p_flags->>'booking_gathern')::boolean, true),
    'booking_myfatoorah', COALESCE((p_flags->>'booking_myfatoorah')::boolean, true),
    'feature_gallery', COALESCE((p_flags->>'feature_gallery')::boolean, true),
    'feature_amenities', COALESCE((p_flags->>'feature_amenities')::boolean, true),
    'feature_map', COALESCE((p_flags->>'feature_map')::boolean, true),
    'feature_social_share', COALESCE((p_flags->>'feature_social_share')::boolean, true),
    'feature_theme_decor', COALESCE((p_flags->>'feature_theme_decor')::boolean, true),
    'feature_scrollytelling', COALESCE((p_flags->>'feature_scrollytelling')::boolean, true)
  );

  UPDATE public.site_settings
  SET feature_flags = v_flags, updated_at = now()
  WHERE id = 1;

  RETURN jsonb_build_object('ok', true, 'feature_flags', v_flags);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.admin_set_feature_flags(text, jsonb) TO anon, authenticated;
