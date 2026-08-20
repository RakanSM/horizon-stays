import type { Property } from "../lib/supabase";

type MapLocation = Pick<Property, "id" | "name_ar" | "name_en" | "neighborhood" | "lat" | "lng">;

type MapFrameProps = {
  locations: MapLocation[];
  lang: "ar" | "en";
  variant?: "collection" | "property";
};

const RIYADH = { lat: 24.7136, lng: 46.6753 };

function labelFor(location: MapLocation, lang: "ar" | "en") {
  return lang === "ar" ? location.name_ar || location.name_en : location.name_en || location.name_ar;
}

export default function MapFrame({ locations, lang, variant = "collection" }: MapFrameProps) {
  const validLocations = locations.filter(
    (location) => Number.isFinite(location.lat) && Number.isFinite(location.lng)
  );
  const primary = validLocations[0];
  const center =
    variant === "collection" && validLocations.length > 1
      ? {
          lat: validLocations.reduce((sum, location) => sum + Number(location.lat), 0) / validLocations.length,
          lng: validLocations.reduce((sum, location) => sum + Number(location.lng), 0) / validLocations.length,
        }
      : primary
        ? { lat: Number(primary.lat), lng: Number(primary.lng) }
        : RIYADH;

  const mapQuery = variant === "collection" && validLocations.length > 1
    ? "Riyadh, Saudi Arabia"
    : `${center.lat},${center.lng}`;
  const delta = variant === "collection" ? 0.22 : 0.018;
  const bbox = [center.lng - delta, center.lat - delta, center.lng + delta, center.lat + delta]
    .map((value) => value.toFixed(6))
    .join(",");
  // OpenStreetMap's public embed keeps the framed map visible without exposing a Google Maps key.
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${center.lat.toFixed(6)}%2C${center.lng.toFixed(6)}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  const title = lang === "ar" ? "موقع الإقامة" : "Where you’ll be";
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
          <span className="map-frame-kicker">{lang === "ar" ? "HORIZON LOCATION" : "HORIZON LOCATION"}</span>
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
        <div className="map-frame-badge">
          <span className="map-frame-pin" aria-hidden>⌖</span>
          <span>{mapLabel}</span>
        </div>
        {!primary && (
          <div className="map-frame-fallback">
            {lang === "ar"
              ? "نعرض نطاق الحي التقريبي حفاظاً على خصوصية موقع الوحدة."
              : "The approximate neighbourhood is displayed to protect the property’s privacy."}
          </div>
        )}
      </div>

      {variant === "collection" && validLocations.length > 0 && (
        <div className="map-frame-places" aria-label={lang === "ar" ? "مواقع الوحدات" : "Property locations"}>
          {validLocations.slice(0, 8).map((location) => (
            <span key={location.id} className="map-place-chip">
              <i aria-hidden /> {labelFor(location, lang)}
            </span>
          ))}
          {validLocations.length > 8 && (
            <span className="map-place-chip map-place-more">+{validLocations.length - 8}</span>
          )}
        </div>
      )}
    </section>
  );
}
