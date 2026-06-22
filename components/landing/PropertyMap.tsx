'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon path issue in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: '', shadowUrl: '', iconRetinaUrl: '' });

const PROPERTIES = [
  { id: '8573dd1e-9f90-4fb9-a7c4-2f6b9cb7848e', name: '1-Bed Luxury KAFD',         price: 850,  lat: 24.7756, lng: 46.6369 },
  { id: '3979e76d',                              name: '2BR Cinema Suite',            price: 1500, lat: 24.7750, lng: 46.6390 },
  { id: '58c949a8',                              name: '3BR Triple Outdoor',          price: 2200, lat: 24.7760, lng: 46.6340 },
  { id: '56270fd5',                              name: 'Cozy 1BD Heart of Riyadh',    price: 750,  lat: 24.7735, lng: 46.6410 },
  { id: '94d76fb7',                              name: 'Private Rooftop Penthouse',   price: 1800, lat: 24.7720, lng: 46.6355 },
  { id: '733d07ff',                              name: 'Garden & HotTub Suite',       price: 1600, lat: 24.7745, lng: 46.6430 },
  { id: 'b4323704',                              name: 'La Ribera',                   price: 900,  lat: 24.7500, lng: 46.6500 },
  { id: 'f3d2f9f7',                              name: 'Luxurious 1BD 70" TV',        price: 950,  lat: 24.7740, lng: 46.6375 },
  { id: '20f0d307',                              name: 'Studio with Bathtub',         price: 550,  lat: 24.7610, lng: 46.6200 },
  { id: 'c6b6788c',                              name: 'Towers View Jacuzzi',         price: 3200, lat: 24.6908, lng: 46.6858 },
  { id: '55c9806e',                              name: 'Near Boulevard Loft',         price: 800,  lat: 24.7746, lng: 46.7363 },
  { id: '8e451b4f',                              name: 'Cozy Studio Outdoor',         price: 450,  lat: 24.7725, lng: 46.6400 },
  { id: 'a3aae746',                              name: 'KAFD View Penthouse 3BD',     price: 3500, lat: 24.7740, lng: 46.6360 },
  { id: 'ff3cd27f',                              name: 'Luxury Suite APT',            price: 1400, lat: 24.7600, lng: 46.6300 },
  { id: '9684c195',                              name: 'Rooftop Studio HotTub',       price: 700,  lat: 24.7580, lng: 46.6250 },
  { id: 'f759ffb6',                              name: 'Sound-Proof Loft KAFD',       price: 820,  lat: 24.7650, lng: 46.6450 },
];

function makePinIcon(price: number, name: string, showName: boolean) {
  const priceLabel = `SAR ${price.toLocaleString()}`;
  const html = showName
    ? `<div style="
          display:flex;flex-direction:column;align-items:center;gap:2px;
          cursor:pointer;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.7));
        ">
          <div style="
            background:#c9a96e;color:#0c0a08;font-weight:700;
            font-size:13px;padding:5px 10px;border-radius:999px;
            white-space:nowrap;line-height:1.2;min-width:44px;text-align:center;
            border:2px solid rgba(255,255,255,0.25);
          ">${priceLabel}</div>
          <div style="
            background:#1a1814cc;color:#f5f0e8;font-size:10px;
            padding:2px 8px;border-radius:6px;white-space:nowrap;
            max-width:140px;overflow:hidden;text-overflow:ellipsis;
            border:1px solid #2a2520;backdrop-filter:blur(4px);
          ">${name}</div>
          <div style="
            width:0;height:0;
            border-left:6px solid transparent;border-right:6px solid transparent;
            border-top:7px solid #c9a96e;margin-top:-1px;
          "></div>
        </div>`
    : `<div style="
          display:flex;flex-direction:column;align-items:center;gap:0;
          cursor:pointer;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.7));
        ">
          <div style="
            background:#c9a96e;color:#0c0a08;font-weight:700;
            font-size:12px;padding:4px 9px;border-radius:999px;
            white-space:nowrap;min-width:44px;text-align:center;
            border:2px solid rgba(255,255,255,0.2);
          ">${priceLabel}</div>
          <div style="
            width:0;height:0;
            border-left:5px solid transparent;border-right:5px solid transparent;
            border-top:6px solid #c9a96e;margin-top:-1px;
          "></div>
        </div>`;

  return L.divIcon({
    html,
    className: '',
    iconAnchor: [0, showName ? 72 : 46],
    popupAnchor: [0, showName ? -72 : -46],
  });
}

interface ZoomAwareMarkersProps {
  locale: string;
}

function ZoomAwareMarkers({ locale }: ZoomAwareMarkersProps) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  const showName = zoom >= 14;

  return (
    <>
      {PROPERTIES.map((prop) => (
        <Marker
          key={prop.id}
          position={[prop.lat, prop.lng]}
          icon={makePinIcon(prop.price, prop.name, showName)}
        >
          <Popup
            className="hs-map-popup"
            maxWidth={240}
          >
            <div style={{
              background: '#1a1814',
              color: '#f5f0e8',
              borderRadius: '12px',
              padding: '12px 14px',
              fontFamily: 'inherit',
              minWidth: '180px',
            }}>
              <div style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#c9a96e',
                marginBottom: '4px',
                fontWeight: 600,
              }}>
                Horizon Stays
              </div>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', lineHeight: 1.3 }}>
                {prop.name}
              </div>
              <div style={{
                background: '#c9a96e',
                color: '#0c0a08',
                display: 'inline-block',
                borderRadius: '999px',
                padding: '3px 10px',
                fontWeight: 700,
                fontSize: '13px',
                marginBottom: '10px',
              }}>
                SAR {prop.price.toLocaleString()} / night
              </div>
              <div>
                <a
                  href={`/${locale}/properties/${prop.id}`}
                  style={{
                    display: 'block',
                    background: '#c9a96e',
                    color: '#0c0a08',
                    textAlign: 'center',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '12px',
                    textDecoration: 'none',
                  }}
                >
                  View Details →
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

interface PropertyMapProps {
  locale: string;
}

export default function PropertyMap({ locale }: PropertyMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="w-full rounded-2xl overflow-hidden flex items-center justify-center bg-hs-bg2 border border-hs-border"
        style={{ height: '400px' }}
      >
        <span className="text-hs-muted text-sm">Loading map…</span>
      </div>
    );
  }

  return (
    <>
      {/* Inject popup overrides once in DOM */}
      <style>{`
        .hs-map-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .hs-map-popup .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .hs-map-popup .leaflet-popup-tip-container {
          display: none !important;
        }
        .hs-map-popup .leaflet-popup-close-button {
          color: #8a8070 !important;
          top: 6px !important;
          right: 8px !important;
          font-size: 18px !important;
        }
        .leaflet-container {
          font-family: inherit;
          background: #0c0a08 !important;
        }
      `}</style>
      <MapContainer
        center={[24.7700, 46.6650]}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full rounded-2xl overflow-hidden"
        style={{ height: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        <ZoomAwareMarkers locale={locale} />
      </MapContainer>
    </>
  );
}
