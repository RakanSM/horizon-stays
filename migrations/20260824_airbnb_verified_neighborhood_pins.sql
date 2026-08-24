-- Horizon Stays: public, neighbourhood-level map corrections.
-- Source: read-only verification in the authenticated Airbnb host session.
-- Privacy rule: these are general neighbourhood centroids, never property entrances or private addresses.

UPDATE public.properties
SET neighborhood = 'As Sahafah', lat = 24.7994926, lng = 46.6438189
WHERE id IN (1, 9);

UPDATE public.properties
SET neighborhood = 'Al Malqa', lat = 24.8142533, lng = 46.6106897
WHERE id IN (4, 8);

UPDATE public.properties
SET neighborhood = 'Al Yasmin', lat = 24.8245095, lng = 46.6470272
WHERE id IN (6, 19, 26, 29, 39);

UPDATE public.properties
SET neighborhood = 'Al Qirawan', lat = 24.828044, lng = 46.5916036
WHERE id = 7;

UPDATE public.properties
SET neighborhood = 'Al Izdihar', lat = 24.7802859, lng = 46.7189184
WHERE id = 11;

UPDATE public.properties
SET neighborhood = 'Al Nafal', lat = 24.77957, lng = 46.6740155
WHERE id = 17;

UPDATE public.properties
SET neighborhood = 'Hittin', lat = 24.7619999, lng = 46.6038327
WHERE id = 22;

UPDATE public.properties
SET neighborhood = 'Wadi Al Soumman', lat = 24.753087, lng = 46.6389609
WHERE id = 30;

UPDATE public.properties
SET neighborhood = 'Al Masif', lat = 24.7655999, lng = 46.6802973
WHERE id = 33;
