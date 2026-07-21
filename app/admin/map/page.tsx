'use client';

import { useEffect, useState } from 'react';
import AdminPropertyMap from '@/components/admin/AdminPropertyMap';
import { Button } from '@/components/ui';
import { useParams } from 'next/navigation';

interface Property {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  base_price_night: number;
}

export default function AdminMapPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties/coordinates');
        if (!response.ok) throw new Error('Failed to fetch properties');
        const { data } = await response.json();
        setProperties(data || []);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(isAr ? 'فشل تحميل العقارات' : 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [isAr]);

  const handlePinUpdate = async (propertyId: string, lat: number, lng: number) => {
    try {
      const response = await fetch('/api/properties/coordinates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, latitude: lat, longitude: lng }),
      });

      if (!response.ok) throw new Error('Failed to update coordinates');

      // Update local state
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId ? { ...p, latitude: lat, longitude: lng } : p
        )
      );
    } catch (err) {
      console.error('Error updating pin:', err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-hs-bg p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-semibold text-hs-text mb-2">
            {isAr ? 'إدارة مواقع العقارات' : 'Property Locations'}
          </h1>
          <p className="text-hs-muted">
            {isAr
              ? 'اسحب الدبابيس على الخريطة لتحديث مواقع العقارات بدقة'
              : 'Drag pins on the map to update property locations accurately'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-hs-muted">{isAr ? 'جاري التحميل...' : 'Loading...'}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map */}
            <div className="lg:col-span-3">
              <AdminPropertyMap
                properties={properties}
                onPinUpdate={handlePinUpdate}
                locale={locale}
              />
            </div>

            {/* Properties List */}
            <div className="bg-hs-bg2 border border-hs-border rounded-2xl p-4 h-fit">
              <h2 className="font-serif text-lg font-semibold text-hs-text mb-4">
                {isAr ? 'العقارات' : 'Properties'}
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {properties.map((prop) => (
                  <button
                    key={prop.id}
                    onClick={() => setSelectedProperty(prop)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedProperty?.id === prop.id
                        ? 'bg-hs-primary/20 border border-hs-primary text-hs-primary'
                        : 'bg-hs-bg border border-hs-border text-hs-text hover:border-hs-primary/50'
                    }`}
                  >
                    <div className="font-semibold text-sm truncate">{prop.name}</div>
                    <div className="text-xs text-hs-muted mt-1">
                      {prop.latitude.toFixed(4)}, {prop.longitude.toFixed(4)}
                    </div>
                    <div className="text-xs text-hs-primary font-semibold mt-1">
                      SAR {prop.base_price_night.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Property Details */}
        {selectedProperty && (
          <div className="mt-6 bg-hs-bg2 border border-hs-border rounded-2xl p-6">
            <h3 className="font-serif text-2xl font-semibold text-hs-text mb-4">
              {selectedProperty.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-hs-muted mb-1">{isAr ? 'خط العرض' : 'Latitude'}</p>
                <p className="font-mono text-hs-text">{selectedProperty.latitude.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-xs text-hs-muted mb-1">{isAr ? 'خط الطول' : 'Longitude'}</p>
                <p className="font-mono text-hs-text">{selectedProperty.longitude.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-xs text-hs-muted mb-1">{isAr ? 'السعر' : 'Price'}</p>
                <p className="font-semibold text-hs-primary">
                  SAR {selectedProperty.base_price_night.toLocaleString()}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setSelectedProperty(null)}
              className="mt-4"
              variant="ghost"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
