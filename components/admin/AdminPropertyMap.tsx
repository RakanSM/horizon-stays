'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';

interface Property {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  base_price_night: number;
  price?: number;
}

interface AdminPropertyMapProps {
  properties: Property[];
  onPinUpdate: (propertyId: string, lat: number, lng: number) => Promise<void>;
  locale: string;
}

export default function AdminPropertyMap({ properties, onPinUpdate, locale }: AdminPropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggedMarker, setDraggedMarker] = useState<{ id: string; marker: any } | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    let map: any = null;

    const init = async () => {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css' as string);

        if (!mapRef.current) return;
        if ((mapRef.current as any)._leaflet_id) return;

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

        const makeIcon = (isSelected: boolean) => {
          const bgColor = isSelected ? '#e8d5b7' : '#c9a96e';
          const borderColor = isSelected ? '#d4af37' : 'rgba(255,255,255,0.2)';
          const html = `<div style="display:flex;flex-direction:column;align-items:center;cursor:grab;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.8));">
            <div style="background:${bgColor};color:#0c0a08;font-weight:700;font-size:14px;padding:6px 12px;border-radius:999px;border:2px solid ${borderColor};transition:all 0.2s;min-width:48px;text-align:center;">📍</div>
            <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${bgColor};margin-top:-2px;"></div>
          </div>`;
          return L.divIcon({ html, className: '', iconAnchor: [0, 48], popupAnchor: [0, -48] });
        };

        const markers: { [key: string]: any } = {};

        properties.forEach((p) => {
          const marker = L.marker([p.latitude, p.longitude], { icon: makeIcon(false), draggable: true })
            .bindPopup(`
              <div style="background:#1a1814;color:#f5f0e8;border-radius:12px;padding:12px 14px;font-family:inherit;min-width:200px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#c9a96e;margin-bottom:4px;font-weight:600;">Horizon Stays</div>
                <div style="font-weight:700;font-size:14px;margin-bottom:6px;line-height:1.3;">${p.name}</div>
                <div style="background:#c9a96e;color:#0c0a08;display:inline-block;border-radius:999px;padding:3px 10px;font-weight:700;font-size:13px;margin-bottom:10px;">SAR ${(p.base_price_night || p.price || 0).toLocaleString()} / night</div>
                <div style="font-size:12px;color:#a8a090;margin-bottom:8px;">
                  <div>Lat: ${p.latitude.toFixed(6)}</div>
                  <div>Lng: ${p.longitude.toFixed(6)}</div>
                </div>
              </div>`, { className: 'hs-popup' })
            .addTo(map!);

          marker.on('click', () => setSelectedProperty(p.id));
          marker.on('dragstart', () => setDraggedMarker({ id: p.id, marker }));
          marker.on('dragend', async () => {
            const latLng = marker.getLatLng();
            setSaving(true);
            try {
              await onPinUpdate(p.id, latLng.lat, latLng.lng);
            } catch (err) {
              console.error('Failed to save pin location:', err);
              marker.setLatLng([p.latitude, p.longitude]);
            } finally {
              setSaving(false);
              setDraggedMarker(null);
            }
          });

          markers[p.id] = marker;
        });

        // Update marker icons when selection changes
        const updateMarkerIcons = () => {
          Object.entries(markers).forEach(([id, marker]) => {
            marker.setIcon(makeIcon(id === selectedProperty));
          });
        };

        map.on('click', () => setSelectedProperty(null));
        updateMarkerIcons();

        // Re-render markers when selectedProperty changes
        const interval = setInterval(updateMarkerIcons, 100);

        return () => clearInterval(interval);
      } catch (e) {
        console.error('Map init failed:', e);
        setError(true);
      }
    };

    init();

    return () => {
      map?.remove();
    };
  }, [properties, selectedProperty, onPinUpdate]);

  if (error) {
    return (
      <div className="w-full rounded-2xl overflow-hidden flex items-center justify-center bg-hs-bg2 border border-hs-border" style={{ height: '500px' }}>
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
      <div className="space-y-4">
        <div className="bg-hs-bg2 border border-hs-border rounded-2xl p-4">
          <p className="text-sm text-hs-muted mb-2">
            {locale === 'ar' ? 'اسحب الدبابيس لتحديث مواقع العقارات' : 'Drag pins to update property locations'}
          </p>
          {saving && <p className="text-xs text-hs-primary animate-pulse">{locale === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</p>}
        </div>
        <div
          ref={mapRef}
          className="w-full rounded-2xl overflow-hidden border border-hs-border"
          style={{ height: '500px' }}
        />
      </div>
    </>
  );
}
