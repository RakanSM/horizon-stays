'use client';

import { useEffect, useRef, useState } from 'react';

const PROPERTIES = [
  { id: '8573dd1e-9f90-4fb9-a7c4-2f6b9cb7848e', name: '1-Bed Luxury KAFD',        price: 850,  lat: 24.7756, lng: 46.6369 },
  { id: '3979e76d-0000-0000-0000-000000000002', name: '2BR Cinema Suite',           price: 1500, lat: 24.7750, lng: 46.6390 },
  { id: '58c949a8-0000-0000-0000-000000000003', name: '3BR Triple Outdoor',         price: 2200, lat: 24.7760, lng: 46.6340 },
  { id: '56270fd5-0000-0000-0000-000000000004', name: 'Cozy 1BD Heart of Riyadh',   price: 750,  lat: 24.7735, lng: 46.6410 },
  { id: '94d76fb7-0000-0000-0000-000000000005', name: 'Private Rooftop Penthouse',  price: 1800, lat: 24.7720, lng: 46.6355 },
  { id: '733d07ff-0000-0000-0000-000000000006', name: 'Garden & HotTub Suite',      price: 1600, lat: 24.7745, lng: 46.6430 },
  { id: 'b4323704-0000-0000-0000-000000000007', name: 'La Ribera',                  price: 900,  lat: 24.7500, lng: 46.6500 },
  { id: 'f3d2f9f7-0000-0000-0000-000000000008', name: 'Luxurious 1BD 70" TV',       price: 950,  lat: 24.7740, lng: 46.6375 },
  { id: '20f0d307-0000-0000-0000-000000000009', name: 'Studio with Bathtub',        price: 550,  lat: 24.7610, lng: 46.6200 },
  { id: 'c6b6788c-0000-0000-0000-000000000010', name: 'Towers View Jacuzzi',        price: 3200, lat: 24.6908, lng: 46.6858 },
  { id: '55c9806e-0000-0000-0000-000000000011', name: 'Near Boulevard Loft',        price: 800,  lat: 24.7746, lng: 46.7363 },
  { id: '8e451b4f-0000-0000-0000-000000000012', name: 'Cozy Studio Outdoor',        price: 450,  lat: 24.7725, lng: 46.6400 },
  { id: 'a3aae746-0000-0000-0000-000000000013', name: 'KAFD View Penthouse 3BD',    price: 3500, lat: 24.7740, lng: 46.6360 },
  { id: 'ff3cd27f-0000-0000-0000-000000000014', name: 'Luxury Suite APT',           price: 1400, lat: 24.7600, lng: 46.6300 },
  { id: '9684c195-0000-0000-0000-000000000015', name: 'Rooftop Studio HotTub',      price: 700,  lat: 24.7580, lng: 46.6250 },
  { id: 'f759ffb6-0000-0000-0000-000000000016', name: 'Sound-Proof Loft KAFD',      price: 820,  lat: 24.7650, lng: 46.6450 },
];

interface PropertyMapProps {
  locale: string;
}

export default function PropertyMap({ locale }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;
    let map: import('leaflet').Map | null = null;

    const init = async () => {
      try {
        // Dynamically import Leaflet only in browser
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css' as string);

        if (!mapRef.current) return;
        // Prevent double-init
        if ((mapRef.current as HTMLElement & { _leaflet_id?: number })._leaflet_id) return;

        map = L.map(mapRef.current, {
          center: [24.7700, 46.6650],
          zoom: 12,
          zoomControl: true,
          scrollWheelZoom: false,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }).addTo(map);

        const makeIcon = (price: number, name: string, showName: boolean) => {
          const priceLabel = `SAR ${price.toLocaleString()}`;
          const html = showName
            ? `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.7));">
                <div style="background:#c9a96e;color:#0c0a08;font-weight:700;font-size:13px;padding:5px 10px;border-radius:999px;white-space:nowrap;min-width:44px;text-align:center;border:2px solid rgba(255,255,255,0.25);">${priceLabel}</div>
                <div style="background:#1a1814cc;color:#f5f0e8;font-size:10px;padding:2px 8px;border-radius:6px;white-space:nowrap;max-width:140px;overflow:hidden;text-overflow:ellipsis;border:1px solid #2a2520;">${name}</div>
                <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #c9a96e;margin-top:-1px;"></div>
              </div>`
            : `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.7));">
                <div style="background:#c9a96e;color:#0c0a08;font-weight:700;font-size:12px;padding:4px 9px;border-radius:999px;white-space:nowrap;min-width:44px;text-align:center;border:2px solid rgba(255,255,255,0.2);">${priceLabel}</div>
                <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #c9a96e;margin-top:-1px;"></div>
              </div>`;
          return L.divIcon({ html, className: '', iconAnchor: [0, showName ? 68 : 42], popupAnchor: [0, -42] });
        };

        const markers: import('leaflet').Marker[] = [];
        let showName = false;

        PROPERTIES.forEach((p) => {
          const marker = L.marker([p.lat, p.lng], { icon: makeIcon(p.price, p.name, false) })
            .bindPopup(`
              <div style="background:#1a1814;color:#f5f0e8;border-radius:12px;padding:12px 14px;font-family:inherit;min-width:180px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#c9a96e;margin-bottom:4px;font-weight:600;">Horizon Stays</div>
                <div style="font-weight:700;font-size:14px;margin-bottom:6px;line-height:1.3;">${p.name}</div>
                <div style="background:#c9a96e;color:#0c0a08;display:inline-block;border-radius:999px;padding:3px 10px;font-weight:700;font-size:13px;margin-bottom:10px;">SAR ${p.price.toLocaleString()} / night</div>
                <a href="/${locale}/properties/${p.id}" style="display:block;background:#c9a96e;color:#0c0a08;text-align:center;padding:7px 12px;border-radius:8px;font-weight:700;font-size:12px;text-decoration:none;">View Details →</a>
              </div>`, { className: 'hs-popup' })
            .addTo(map!);
          markers.push(marker);
        });

        map.on('zoomend', () => {
          if (!map) return;
          const newShow = map.getZoom() >= 14;
          if (newShow !== showName) {
            showName = newShow;
            markers.forEach((m, i) => {
              m.setIcon(makeIcon(PROPERTIES[i].price, PROPERTIES[i].name, showName));
            });
          }
        });

        // Enable scroll wheel zoom on interaction
        map.once('focus', () => map?.scrollWheelZoom.enable());

      } catch (e) {
        console.error('Map init failed:', e);
        setError(true);
      }
    };

    init();

    return () => {
      map?.remove();
    };
  }, [locale]);

  if (error) {
    return (
      <div className="w-full rounded-2xl overflow-hidden flex items-center justify-center bg-hs-bg2 border border-hs-border" style={{ height: '400px' }}>
        <span className="text-hs-muted text-sm">Map unavailable</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .hs-popup .leaflet-popup-content-wrapper { background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important;border-radius:12px!important;overflow:hidden; }
        .hs-popup .leaflet-popup-content { margin:0!important;width:auto!important; }
        .hs-popup .leaflet-popup-tip-container { display:none!important; }
        .hs-popup .leaflet-popup-close-button { color:#8a8070!important;top:6px!important;right:8px!important;font-size:18px!important; }
        .leaflet-container { font-family:inherit;background:#0c0a08!important; }
        @media (max-width:640px) { .leaflet-control-zoom { display:flex!important; } }
      `}</style>
      <div
        ref={mapRef}
        className="w-full rounded-2xl overflow-hidden"
        style={{ height: 'clamp(320px, 50vw, 520px)' }}
      />
    </>
  );
}
