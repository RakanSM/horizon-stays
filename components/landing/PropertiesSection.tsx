'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { BookingModal } from './BookingModal';
import type { LandingProperty } from './types';

type SearchFilters = { checkin?: string; checkout?: string; type?: string; guests?: string };

const fallbackProperties: LandingProperty[] = [
  { id: 'fallback-penthouse', name: 'Royal Horizon Penthouse', type: 'penthouse', bedrooms: 4, area_sqm: 420, base_price_night: 3200 },
  { id: 'fallback-suite', name: 'Olaya Executive Suite', type: 'suite', bedrooms: 2, area_sqm: 180, base_price_night: 1450 },
  { id: 'fallback-loft', name: 'Riyadh Skyline Loft', type: 'loft', bedrooms: 1, area_sqm: 125, base_price_night: 980 },
];

const formatType = (type: string, isAr: boolean) => {
  const map: Record<string, { ar: string; en: string }> = {
    penthouse: { ar: 'بنتهاوس', en: 'Penthouse' },
    suite: { ar: 'سويت', en: 'Suite' },
    loft: { ar: 'لوفت', en: 'Loft' },
    villa: { ar: 'فيلا', en: 'Villa' },
    apartment: { ar: 'شقة', en: 'Apartment' },
  };
  return map[type]?.[isAr ? 'ar' : 'en'] || type;
};

const propertyName = (property: LandingProperty) => property.name || property.title || property.property_name || 'Horizon Residence';
const propertyType = (property: LandingProperty) => property.type || property.property_type || 'suite';
const propertyArea = (property: LandingProperty) => property.area_sqm || property.area || 120;
const propertyPrice = (property: LandingProperty) => Number(property.base_price_night || property.price_per_night || property.nightly_price || 900);

export function PropertiesSection({ properties, locale }: { properties: LandingProperty[]; locale: string }) {
  const isAr = locale === 'ar';
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedProperty, setSelectedProperty] = useState<LandingProperty | null>(null);

  useEffect(() => {
    const apply = (event: Event) => setFilters((event as CustomEvent<SearchFilters>).detail || {});
    window.addEventListener('hs-search', apply);
    const params = new URLSearchParams(window.location.search);
    setFilters({
      checkin: params.get('checkin') || undefined,
      checkout: params.get('checkout') || undefined,
      type: params.get('type') || undefined,
      guests: params.get('guests') || undefined,
    });
    return () => window.removeEventListener('hs-search', apply);
  }, []);

  const displayProperties = useMemo(() => {
    const source = properties.length ? properties : fallbackProperties;
    return source.filter((property) => !filters.type || propertyType(property).toLowerCase() === filters.type?.toLowerCase());
  }, [filters.type, properties]);

  return (
    <section id="properties" className="bg-hs-bg px-6 py-24">
      {/* @section: properties-grid */}
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-hs-primary">
              {isAr ? 'مختاراتنا' : 'Curated stays'}
            </p>
            <h2 className="font-serif text-4xl font-semibold text-hs-text md:text-6xl">
              {isAr ? 'وحدات فاخرة جاهزة للإقامة' : 'Luxury homes ready for your stay'}
            </h2>
          </div>
          <p className="max-w-xl text-hs-muted">
            {isAr
              ? 'كل وحدة مصممة لتجمع بين الخصوصية، الخدمة الفندقية، والموقع المثالي داخل الرياض.'
              : 'Each residence blends privacy, hotel-grade service, and prime Riyadh access.'}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {displayProperties.map((property) => {
            const type = propertyType(property).toLowerCase();
            const bedrooms = property.bedrooms || 1;
            const area = propertyArea(property);
            const price = propertyPrice(property);
            return (
              <article key={property.id} className="group overflow-hidden rounded-3xl border border-hs-border bg-hs-bg2 shadow-2xl shadow-black/20 transition-all hover:-translate-y-2 hover:border-hs-primary/50">
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-hs-bg2 via-hs-bg3 to-hs-primary/20">
                  {property.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={property.image_url} alt={propertyName(property)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-28 w-28 rounded-full border border-hs-primary/30 bg-hs-primary/10 blur-sm" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-hs-bg/90 via-transparent to-transparent" />
                  <Badge variant="pending" label={formatType(type, isAr)} className="absolute right-4 top-4 border-hs-primary/40 bg-hs-bg/80 text-hs-primary" />
                </div>
                <div className="space-y-5 p-6">
                  <h3 className="font-serif text-2xl font-semibold text-hs-text">{propertyName(property)}</h3>
                  <div className="flex flex-wrap gap-2 text-sm text-hs-muted">
                    <span className="rounded-full border border-hs-border px-3 py-1">{isAr ? `${bedrooms} غرف` : `${bedrooms} beds`}</span>
                    <span className="rounded-full border border-hs-border px-3 py-1">{area} m²</span>
                    <span className="rounded-full border border-hs-border px-3 py-1">{isAr ? 'خدمة 24/7' : '24/7 service'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-hs-muted">{isAr ? 'ابتداءً من' : 'From'}</p>
                      <p className="text-3xl font-bold text-hs-primary">{price.toLocaleString(isAr ? 'ar-SA' : 'en-US')} SAR</p>
                      <p className="text-xs text-hs-muted">{isAr ? 'لليلة' : 'per night'}</p>
                    </div>
                    <Button onClick={() => setSelectedProperty(property)} className="rounded-full px-5">
                      {isAr ? 'احجز الآن' : 'Book Now'}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {displayProperties.length === 0 && (
          <div className="rounded-2xl border border-hs-border bg-hs-bg2 p-8 text-center text-hs-muted">
            {isAr ? 'لا توجد وحدات مطابقة للبحث حالياً.' : 'No properties match your current search.'}
          </div>
        )}
      </div>
      <BookingModal locale={locale} property={selectedProperty} open={Boolean(selectedProperty)} onClose={() => setSelectedProperty(null)} />
    </section>
  );
}
