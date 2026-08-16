-- Horizon Stays: future pricing calendar foundation.
-- Priority: per-date override → weekday/weekend rule → property base price.

CREATE TABLE IF NOT EXISTS public.property_weekly_prices (
  property_id integer PRIMARY KEY REFERENCES public.properties(id) ON DELETE CASCADE,
  weekday_price integer NULL CHECK (weekday_price IS NULL OR weekday_price >= 0),
  weekend_price integer NULL CHECK (weekend_price IS NULL OR weekend_price >= 0),
  weekend_days smallint[] NOT NULL DEFAULT ARRAY[5,6]::smallint[]
    CHECK (weekend_days <@ ARRAY[0,1,2,3,4,5,6]::smallint[]),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_date_prices (
  property_id integer NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  price_date date NOT NULL,
  nightly_price integer NULL CHECK (nightly_price IS NULL OR nightly_price >= 0),
  is_closed boolean NOT NULL DEFAULT false,
  minimum_stay smallint NULL CHECK (minimum_stay IS NULL OR minimum_stay BETWEEN 1 AND 30),
  note text NULL CHECK (note IS NULL OR char_length(note) <= 180),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (property_id, price_date)
);

CREATE INDEX IF NOT EXISTS property_date_prices_lookup_idx
  ON public.property_date_prices (property_id, price_date);

ALTER TABLE public.property_weekly_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_date_prices ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.admin_get_pricing_calendar(
  p_token text,
  p_property_id integer,
  p_start date,
  p_end date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_property public.properties%ROWTYPE;
  v_profile public.property_weekly_prices%ROWTYPE;
BEGIN
  IF NOT _is_admin(p_token) THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthorized'); END IF;
  IF p_start IS NULL OR p_end IS NULL OR p_end < p_start OR p_end > p_start + 366 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_date_range');
  END IF;

  SELECT * INTO v_property FROM public.properties WHERE id = p_property_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'property_not_found'); END IF;
  SELECT * INTO v_profile FROM public.property_weekly_prices WHERE property_id = p_property_id;

  RETURN jsonb_build_object(
    'ok', true,
    'property', jsonb_build_object('id', v_property.id, 'slug', v_property.slug, 'name_ar', v_property.name_ar, 'name_en', v_property.name_en, 'base_price', v_property.price_per_night),
    'weekly', jsonb_build_object(
      'weekday_price', v_profile.weekday_price,
      'weekend_price', v_profile.weekend_price,
      'weekend_days', COALESCE(v_profile.weekend_days, ARRAY[5,6]::smallint[])
    ),
    'days', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'date', day::date,
        'base_price', v_property.price_per_night,
        'rule_price', CASE WHEN extract(dow FROM day)::smallint = ANY(COALESCE(v_profile.weekend_days, ARRAY[5,6]::smallint[])) THEN v_profile.weekend_price ELSE v_profile.weekday_price END,
        'override_price', dp.nightly_price,
        'effective_price', COALESCE(dp.nightly_price, CASE WHEN extract(dow FROM day)::smallint = ANY(COALESCE(v_profile.weekend_days, ARRAY[5,6]::smallint[])) THEN v_profile.weekend_price ELSE v_profile.weekday_price END, v_property.price_per_night),
        'is_closed', COALESCE(dp.is_closed, false),
        'is_booked', EXISTS (SELECT 1 FROM public.blocked_dates bd WHERE bd.property_id = p_property_id AND bd.start_date <= day::date AND bd.end_date > day::date)
                    OR EXISTS (SELECT 1 FROM public.bookings b WHERE b.property_id = p_property_id AND b.status <> 'cancelled' AND b.check_in <= day::date AND b.check_out > day::date),
        'minimum_stay', dp.minimum_stay,
        'note', dp.note,
        'has_override', dp.property_id IS NOT NULL
      ) ORDER BY day)
      FROM generate_series(p_start, p_end, interval '1 day') AS day
      LEFT JOIN public.property_date_prices dp ON dp.property_id = p_property_id AND dp.price_date = day::date
    ), '[]'::jsonb)
  );
END $function$;

CREATE OR REPLACE FUNCTION public.admin_set_weekly_pricing(
  p_token text,
  p_property_id integer,
  p_weekday_price integer,
  p_weekend_price integer,
  p_weekend_days smallint[] DEFAULT ARRAY[5,6]::smallint[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT _is_admin(p_token) THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthorized'); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.properties WHERE id = p_property_id) THEN RETURN jsonb_build_object('ok', false, 'error', 'property_not_found'); END IF;
  IF (p_weekday_price IS NOT NULL AND p_weekday_price < 0) OR (p_weekend_price IS NOT NULL AND p_weekend_price < 0)
     OR NOT (COALESCE(p_weekend_days, ARRAY[5,6]::smallint[]) <@ ARRAY[0,1,2,3,4,5,6]::smallint[]) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_pricing_rule');
  END IF;
  INSERT INTO public.property_weekly_prices(property_id, weekday_price, weekend_price, weekend_days, updated_at)
  VALUES (p_property_id, p_weekday_price, p_weekend_price, COALESCE(p_weekend_days, ARRAY[5,6]::smallint[]), now())
  ON CONFLICT (property_id) DO UPDATE SET
    weekday_price = EXCLUDED.weekday_price,
    weekend_price = EXCLUDED.weekend_price,
    weekend_days = EXCLUDED.weekend_days,
    updated_at = now();
  RETURN jsonb_build_object('ok', true);
END $function$;

CREATE OR REPLACE FUNCTION public.admin_upsert_date_prices(
  p_token text,
  p_property_id integer,
  p_days jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  IF NOT _is_admin(p_token) THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthorized'); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.properties WHERE id = p_property_id) THEN RETURN jsonb_build_object('ok', false, 'error', 'property_not_found'); END IF;
  IF jsonb_typeof(p_days) <> 'array' OR jsonb_array_length(p_days) = 0 OR jsonb_array_length(p_days) > 366 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_days');
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_to_recordset(p_days) AS d(price_date date, nightly_price integer, is_closed boolean, minimum_stay smallint, note text)
    WHERE price_date IS NULL OR price_date < current_date OR (nightly_price IS NOT NULL AND nightly_price < 0)
      OR (minimum_stay IS NOT NULL AND minimum_stay NOT BETWEEN 1 AND 30) OR (note IS NOT NULL AND char_length(note) > 180)
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_day_value');
  END IF;

  INSERT INTO public.property_date_prices(property_id, price_date, nightly_price, is_closed, minimum_stay, note, updated_at)
  SELECT p_property_id, d.price_date, d.nightly_price, COALESCE(d.is_closed, false), d.minimum_stay, NULLIF(trim(d.note), ''), now()
  FROM jsonb_to_recordset(p_days) AS d(price_date date, nightly_price integer, is_closed boolean, minimum_stay smallint, note text)
  ON CONFLICT (property_id, price_date) DO UPDATE SET
    nightly_price = EXCLUDED.nightly_price,
    is_closed = EXCLUDED.is_closed,
    minimum_stay = EXCLUDED.minimum_stay,
    note = EXCLUDED.note,
    updated_at = now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN jsonb_build_object('ok', true, 'updated', v_count);
END $function$;

CREATE OR REPLACE FUNCTION public.admin_clear_date_prices(
  p_token text,
  p_property_id integer,
  p_dates jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  IF NOT _is_admin(p_token) THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthorized'); END IF;
  IF jsonb_typeof(p_dates) <> 'array' OR jsonb_array_length(p_dates) = 0 OR jsonb_array_length(p_dates) > 366 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_dates');
  END IF;
  DELETE FROM public.property_date_prices
  WHERE property_id = p_property_id
    AND price_date IN (SELECT jsonb_array_elements_text(p_dates)::date);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN jsonb_build_object('ok', true, 'cleared', v_count);
END $function$;

CREATE OR REPLACE FUNCTION public.property_price_quote(
  p_property_id integer,
  p_check_in date,
  p_check_out date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_property public.properties%ROWTYPE;
  v_profile public.property_weekly_prices%ROWTYPE;
  v_days jsonb;
  v_available boolean;
  v_total integer;
BEGIN
  IF p_check_in IS NULL OR p_check_out IS NULL OR p_check_out <= p_check_in OR p_check_out > p_check_in + 90 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_stay_dates');
  END IF;
  SELECT * INTO v_property FROM public.properties WHERE id = p_property_id AND is_active = true;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'property_not_found'); END IF;
  SELECT * INTO v_profile FROM public.property_weekly_prices WHERE property_id = p_property_id;

  SELECT jsonb_agg(jsonb_build_object(
      'date', day::date,
      'price', COALESCE(dp.nightly_price, CASE WHEN extract(dow FROM day)::smallint = ANY(COALESCE(v_profile.weekend_days, ARRAY[5,6]::smallint[])) THEN v_profile.weekend_price ELSE v_profile.weekday_price END, v_property.price_per_night),
      'is_closed', COALESCE(dp.is_closed, false),
      'is_booked', EXISTS (SELECT 1 FROM public.blocked_dates bd WHERE bd.property_id = p_property_id AND bd.start_date <= day::date AND bd.end_date > day::date)
                   OR EXISTS (SELECT 1 FROM public.bookings b WHERE b.property_id = p_property_id AND b.status <> 'cancelled' AND b.check_in <= day::date AND b.check_out > day::date),
      'minimum_stay', dp.minimum_stay
    ) ORDER BY day),
    bool_and(NOT COALESCE(dp.is_closed, false)
             AND NOT EXISTS (SELECT 1 FROM public.blocked_dates bd WHERE bd.property_id = p_property_id AND bd.start_date <= day::date AND bd.end_date > day::date)
             AND NOT EXISTS (SELECT 1 FROM public.bookings b WHERE b.property_id = p_property_id AND b.status <> 'cancelled' AND b.check_in <= day::date AND b.check_out > day::date)),
    sum(COALESCE(dp.nightly_price, CASE WHEN extract(dow FROM day)::smallint = ANY(COALESCE(v_profile.weekend_days, ARRAY[5,6]::smallint[])) THEN v_profile.weekend_price ELSE v_profile.weekday_price END, v_property.price_per_night))::integer
  INTO v_days, v_available, v_total
  FROM generate_series(p_check_in, p_check_out - 1, interval '1 day') AS day
  LEFT JOIN public.property_date_prices dp ON dp.property_id = p_property_id AND dp.price_date = day::date;

  RETURN jsonb_build_object('ok', true, 'available', COALESCE(v_available, false), 'nights', (p_check_out - p_check_in), 'total', CASE WHEN v_available THEN v_total ELSE NULL END, 'days', COALESCE(v_days, '[]'::jsonb));
END $function$;
