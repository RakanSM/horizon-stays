import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { divIcon, latLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { propertyPhotoUrls, type Property } from "../lib/supabase";

type MapLocation = Pick<Property, "id" | "name_ar" | "name_en" | "neighborhood" | "price_per_night" | "lat" | "lng"> &
  Partial<Pick<Property, "slug" | "type" | "hero_image" | "gallery_images" | "description_ar">>;
type ValidMapLocation = MapLocation & { lat: number; lng: number };

type MapFrameProps = {
  locations: MapLocation[];
  lang: "ar" | "en";
  variant?: "collection" | "property";
};

const RIYADH: [number, number] = [24.7136, 46.6753];
const HORIZON_PIN = divIcon({
  className: "horizon-leaflet-pin-icon",
  html: '<span class="horizon-leaflet-pin" aria-hidden="true">⌖</span>',
  iconSize: [42, 48],
  iconAnchor: [21, 44],
  popupAnchor: [0, -42],
});

function numericCoordinate(value: number | null | undefined) {
  const coordinate = typeof value === "number" ? value : Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

function labelFor(location: MapLocation, lang: "ar" | "en") {
  return lang === "ar" ? location.name_ar || location.name_en : location.name_en || location.name_ar;
}

function pointLink(location: ValidMapLocation) {
  return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
}

function priceLabel(location: MapLocation, lang: "ar" | "en") {
  const price = Number(location.price_per_night);
  if (!Number.isFinite(price) || price <= 0) return null;
  const formatted = new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-US", { maximumFractionDigits: 0 }).format(price);
  return lang === "ar" ? `من ${formatted} ر.س / ليلة` : `From ${formatted} SAR / night`;
}

function shortDescription(location: MapLocation, lang: "ar" | "en") {
  const sourceDescription = location.description_ar?.trim();
  if (lang === "ar" && sourceDescription) return sourceDescription.slice(0, 128);
  const factualSummary = [location.type, location.neighborhood].filter(Boolean).join(" · ");
  return factualSummary || (lang === "ar" ? "إقامة مختارة في الرياض" : "A selected stay in Riyadh");
}

function MapViewport({ locations, variant }: { locations: ValidMapLocation[]; variant: "collection" | "property" }) {
  const map = useMap();
  const locationKey = locations.map((location) => `${location.id}:${location.lat}:${location.lng}`).join("|");

  useEffect(() => {
    if (!locations.length) {
      map.setView(RIYADH, 10, { animate: false });
      return;
    }
    if (variant === "property" || locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 13, { animate: false });
      return;
    }
    map.fitBounds(latLngBounds(locations.map((location) => [location.lat, location.lng])), { padding: [46, 46], maxZoom: 13, animate: false });
  }, [locationKey, locations, map, variant]);

  return null;
}

function MapPinCard({
  location,
  lang,
}: {
  location: ValidMapLocation;
  lang: "ar" | "en";
}) {
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const photos = useMemo(
    () => propertyPhotoUrls(location.slug || "", location.hero_image, location.gallery_images),
    [location.gallery_images, location.hero_image, location.slug]
  );
  const name = labelFor(location, lang);
  const price = priceLabel(location, lang);
  const description = shortDescription(location, lang);

  return (
    <article className="map-pin-card" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="map-pin-card-media">
        {photos.length ? (
          <img src={photos[selectedPhoto] || photos[0]} alt={name} loading="lazy" />
        ) : (
          <div className="map-pin-card-media-fallback" aria-hidden />
        )}
        {photos.length > 1 && <span className="map-pin-card-count">{selectedPhoto + 1} / {photos.length}</span>}
      </div>
      {photos.length > 1 && (
        <div className="map-pin-card-photo-strip" aria-label={lang === "ar" ? "صور الوحدة" : "Stay photos"}>
          {photos.slice(0, 12).map((photo, index) => (
            <button
              type="button"
              key={photo}
              className={index === selectedPhoto ? "is-selected" : ""}
              onClick={() => setSelectedPhoto(index)}
              aria-label={`${lang === "ar" ? "عرض الصورة" : "Show photo"} ${index + 1}`}
            >
              <img src={photo} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <div className="map-pin-card-copy">
        <div className="map-pin-card-title-row">
          <strong>{name}</strong>
          {price && <span>{price}</span>}
        </div>
        <p>{description}</p>
        <div className="map-pin-card-actions">
          {location.slug ? (
            <Link to={`/property/${location.slug}#availability`} className="map-pin-card-book">
              {lang === "ar" ? "احجز الآن" : "Book now"}
            </Link>
          ) : (
            <a href={pointLink(location)} target="_blank" rel="noreferrer" className="map-pin-card-book">
              {lang === "ar" ? "عرض الموقع" : "View location"}
            </a>
          )}
          <a href={pointLink(location)} target="_blank" rel="noreferrer" className="map-pin-card-location">
            {lang === "ar" ? "الخريطة ↗" : "Map ↗"}
          </a>
        </div>
      </div>
    </article>
  );
}

function MapSidePanel({
  location,
  lang,
  pinned,
  onClose,
  onPointerEnter,
  onPointerLeave,
}: {
  location: ValidMapLocation | null;
  lang: "ar" | "en";
  pinned: boolean;
  onClose: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  const isArabic = lang === "ar";
  return (
    <aside className={`map-frame-side-panel ${location ? "has-location" : "is-empty"}`} dir={isArabic ? "rtl" : "ltr"} aria-live="polite" onMouseEnter={onPointerEnter} onMouseLeave={onPointerLeave}>
      {location ? <>
        <div className="map-frame-side-panel-head">
          <span>{pinned ? (isArabic ? "وحدة مختارة" : "Selected stay") : (isArabic ? "معاينة الوحدة" : "Stay preview")}</span>
          <button type="button" className="map-frame-side-panel-close" onClick={onClose} aria-label={isArabic ? "إغلاق بطاقة الوحدة" : "Close stay card"}>×</button>
        </div>
        <MapPinCard key={location.id} location={location} lang={lang} />
      </> : <div className="map-frame-side-panel-empty">
        <span>HORIZON MAP</span>
        <strong>{isArabic ? "اختر موقعاً يناسب إقامتك." : "Find a stay that fits your trip."}</strong>
        <p>{isArabic ? "مرر فوق علامة لمعاينة الوحدة، واضغط عليها لتثبيت البطاقة هنا." : "Hover a pin to preview a stay, then click it to keep the card here."}</p>
      </div>}
    </aside>
  );
}

function MarkerWithSidePanel({
  location,
  pinned,
  showPreview,
  clearPreview,
  pinLocation,
}: {
  location: ValidMapLocation;
  pinned: boolean;
  showPreview: () => void;
  clearPreview: () => void;
  pinLocation: () => void;
}) {
  return (
    <Marker
      position={[location.lat, location.lng]}
      icon={HORIZON_PIN}
      eventHandlers={{
        mouseover: showPreview,
        mouseout: clearPreview,
        focus: showPreview,
        click: pinLocation,
      }}
      opacity={pinned ? 1 : undefined}
    />
  );
}

export default function MapFrame({ locations, lang, variant = "collection" }: MapFrameProps) {
  const [previewPinId, setPreviewPinId] = useState<number | null>(null);
  const [pinnedPinId, setPinnedPinId] = useState<number | null>(null);
  const previewCloseTimer = useRef<number | null>(null);
  const validLocations = locations.reduce<ValidMapLocation[]>((accumulator, location) => {
    const lat = numericCoordinate(location.lat);
    const lng = numericCoordinate(location.lng);
    if (lat !== null && lng !== null) accumulator.push({ ...location, lat, lng });
    return accumulator;
  }, []);
  const visibleLocations = variant === "property" ? validLocations.slice(0, 1) : validLocations;
  const primary = visibleLocations[0];
  const mapCenter: [number, number] = primary ? [primary.lat, primary.lng] : RIYADH;
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
        ? "استكشف الإقامات المختارة في الرياض"
        : "Explore selected stays across Riyadh"
      : primary
        ? labelFor(primary, lang)
        : lang === "ar"
          ? "موقع الوحدة في الرياض"
          : "Your stay in Riyadh";
  const mapUrl = primary ? pointLink(primary) : "https://www.google.com/maps/search/?api=1&query=Riyadh%2C%20Saudi%20Arabia";
  const isBrowser = typeof window !== "undefined";
  const sidePinId = previewPinId ?? pinnedPinId;
  const sideLocation = visibleLocations.find((location) => location.id === sidePinId) || null;
  const cancelPreviewClose = useCallback(() => {
    if (previewCloseTimer.current !== null) {
      window.clearTimeout(previewCloseTimer.current);
      previewCloseTimer.current = null;
    }
  }, []);
  const schedulePreviewClose = useCallback(() => {
    cancelPreviewClose();
    previewCloseTimer.current = window.setTimeout(() => setPreviewPinId(null), 190);
  }, [cancelPreviewClose]);

  useEffect(() => () => cancelPreviewClose(), [cancelPreviewClose]);

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
        <div className="map-frame-canvas">
          {isBrowser ? (
            <MapContainer className="horizon-leaflet-map" center={mapCenter} zoom={variant === "property" ? 13 : 11} scrollWheelZoom zoomControl aria-label={mapLabel}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapViewport locations={visibleLocations} variant={variant} />
              {visibleLocations.map((location) => (
                <MarkerWithSidePanel
                  key={location.id}
                  location={location}
                  pinned={pinnedPinId === location.id}
                  showPreview={() => { cancelPreviewClose(); setPreviewPinId(location.id); }}
                  clearPreview={schedulePreviewClose}
                  pinLocation={() => { cancelPreviewClose(); setPinnedPinId(location.id); setPreviewPinId(location.id); }}
                />
              ))}
            </MapContainer>
          ) : <div className="horizon-map-ssr-fallback" aria-label={mapLabel} />}
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
        <MapSidePanel
          location={sideLocation}
          lang={lang}
          pinned={pinnedPinId !== null}
          onClose={() => { cancelPreviewClose(); setPinnedPinId(null); setPreviewPinId(null); }}
          onPointerEnter={cancelPreviewClose}
          onPointerLeave={schedulePreviewClose}
        />
      </div>
    </section>
  );
}
