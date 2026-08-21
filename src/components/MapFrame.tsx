import type { Property } from "../lib/supabase";

type MapLocation = Pick<Property, "id" | "name_ar" | "name_en" | "neighborhood" | "lat" | "lng">;
type ValidMapLocation = MapLocation & { lat: number; lng: number };

type MapFrameProps = {
  locations: MapLocation[];
  lang: "ar" | "en";
  variant?: "collection" | "property";
};

const RIYADH = { lat: 24.7136, lng: 46.6753 };

function numericCoordinate(value: number | null) {
  const coordinate = typeof value === "number" ? value : Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

function labelFor(location: MapLocation, lang: "ar" | "en") {
  return lang === "ar" ? location.name_ar || location.name_en : location.name_en || location.name_ar;
}

function pointLink(location: ValidMapLocation) {
  return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
}

export default function MapFrame({ locations, lang, variant = "collection" }: MapFrameProps) {
  const validLocations = locations.reduce<ValidMapLocation[]>((accumulator, location) => {
    const lat = numericCoordinate(location.lat);
    const lng = numericCoordinate(location.lng);
    if (lat !== null && lng !== null) accumulator.push({ ...location, lat, lng });
    return accumulator;
  }, []);

  const visibleLocations = variant === "property" ? validLocations.slice(0, 1) : validLocations;
  const sourceLocations = visibleLocations.length ? visibleLocations : validLocations;
  const latitudes = sourceLocations.map((location) => location.lat);
  const longitudes = sourceLocations.map((location) => location.lng);
  const minLat = latitudes.length ? Math.min(...latitudes) : RIYADH.lat;
  const maxLat = latitudes.length ? Math.max(...latitudes) : RIYADH.lat;
  const minLng = longitudes.length ? Math.min(...longitudes) : RIYADH.lng;
  const maxLng = longitudes.length ? Math.max(...longitudes) : RIYADH.lng;
  const latPadding = Math.max(variant === "collection" ? 0.012 : 0.006, (maxLat - minLat) * 0.18);
  const lngPadding = Math.max(variant === "collection" ? 0.012 : 0.006, (maxLng - minLng) * 0.18);
  const bounds = {
    south: minLat - latPadding,
    north: maxLat + latPadding,
    west: minLng - lngPadding,
    east: maxLng + lngPadding,
  };
  const center = {
    lat: (bounds.south + bounds.north) / 2,
    lng: (bounds.west + bounds.east) / 2,
  };
  const bbox = [bounds.west, bounds.south, bounds.east, bounds.north]
    .map((value) => value.toFixed(6))
    .join(",");
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik`;
  const mapQuery = variant === "collection" && validLocations.length > 1
    ? "Riyadh, Saudi Arabia"
    : `${center.lat},${center.lng}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  const title = lang === "ar" ? "موقع الإقامة" : "Where you’ll be";
  const primary = visibleLocations[0];
  const subtitle =
    variant === "property" && primary?.neighborhood
      ? `${lang === "ar" ? "الرياض،" : "Riyadh,"} ${primary.neighborhood}`
      : lang === "ar"
        ? "الرياض، منطقة الرياض، المملكة العربية السعودية"
        : "Riyadh, Riyadh Province, Saudi Arabia";
  const mapLabel =
    variant === "collection"
      ? lang === "ar"
        ? `${validLocations.length || locations.length} وحدة ضمن مجموعتنا في الرياض`
        : `${validLocations.length || locations.length} stays across Riyadh`
      : primary
        ? labelFor(primary, lang)
        : lang === "ar"
          ? "موقع الوحدة في الرياض"
          : "Your stay in Riyadh";

  return (
    <section className={`map-frame-section map-frame-${variant}`} aria-label={title}>
      <div className="map-frame-head">
        <div>
          <span className="map-frame-kicker">HORIZON LOCATION</span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <a className="map-open-link" href={mapUrl} target="_blank" rel="noreferrer">
          {lang === "ar" ? "فتح في الخرائط" : "Open in Maps"} <span aria-hidden>↗</span>
        </a>
      </div>

      <div className="map-frame-shell">
        <iframe
          title={mapLabel}
          src={mapSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        {visibleLocations.length > 0 && (
          <div className="map-pins-layer" aria-label={lang === "ar" ? "دبابيس مواقع الوحدات" : "Property location pins"}>
            {visibleLocations.map((location) => {
              const left = ((location.lng - bounds.west) / (bounds.east - bounds.west)) * 100;
              const top = ((bounds.north - location.lat) / (bounds.north - bounds.south)) * 100;
              const name = labelFor(location, lang);
              return (
                <a
                  key={location.id}
                  className={`property-map-pin ${variant === "property" ? "is-property-pin" : ""}`}
                  href={pointLink(location)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${name} — ${lang === "ar" ? "فتح الموقع في الخرائط" : "open location in maps"}`}
                  style={{ left: `${Math.min(97, Math.max(3, left))}%`, top: `${Math.min(97, Math.max(3, top))}%` }}
                >
                  <span className="property-map-pin-core" aria-hidden>⌖</span>
                  <span className="property-map-pin-label">{name}</span>
                </a>
              );
            })}
          </div>
        )}
        <div className="map-frame-badge">
          <span className="map-frame-pin" aria-hidden>⌖</span>
          <span>{mapLabel}</span>
        </div>
        {visibleLocations.length === 0 && (
          <div className="map-frame-fallback">
            {lang === "ar"
              ? "لم يُحدد موقع دقيق لهذه الوحدة بعد؛ نعرض نطاق الرياض التقريبي حالياً."
              : "A precise location has not been set for this stay yet; the Riyadh area is shown for now."}
          </div>
        )}
      </div>

      {variant === "collection" && validLocations.length > 0 && (
        <div className="map-frame-places" aria-label={lang === "ar" ? "مواقع الوحدات" : "Property locations"}>
          {validLocations.slice(0, 8).map((location) => (
            <a key={location.id} className="map-place-chip" href={pointLink(location)} target="_blank" rel="noreferrer">
              <i aria-hidden /> {labelFor(location, lang)}
            </a>
          ))}
          {validLocations.length > 8 && (
            <span className="map-place-chip map-place-more">+{validLocations.length - 8}</span>
          )}
        </div>
      )}
    </section>
  );
}
