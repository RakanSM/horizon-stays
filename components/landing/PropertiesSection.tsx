'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { BookingModal } from './BookingModal';
import type { LandingProperty } from './types';

type SearchFilters = { checkin?: string; checkout?: string; type?: string; guests?: string };

const fallbackProperties: LandingProperty[] = [
  { id: 'fallback-penthouse', name: 'Royal Horizon Penthouse', type: 'penthouse', bedrooms: 4, area_sqm: 420, base_price_night: 3200 },
  { id: 'fallback-suite',     name: 'Olaya Executive Suite',   type: 'suite',     bedrooms: 2, area_sqm: 180, base_price_night: 1450 },
  { id: 'fallback-loft',      name: 'Riyadh Skyline Loft',    type: 'loft',      bedrooms: 1, area_sqm: 125, base_price_night:  980 },
];

const formatType = (type: string, isAr: boolean) => {
  const map: Record<string, { ar: string; en: string }> = {
    penthouse: { ar: 'بنتهاوس', en: 'Penthouse' },
    suite:     { ar: 'سويت',    en: 'Suite'      },
    loft:      { ar: 'لوفت',    en: 'Loft'       },
    villa:     { ar: 'فيلا',    en: 'Villa'      },
    apartment: { ar: 'شقة',     en: 'Apartment'  },
  };
  return map[type]?.[isAr ? 'ar' : 'en'] || type;
};

const propertyName  = (p: LandingProperty) => p.name || p.title || p.property_name || 'Horizon Residence';
const propertyType  = (p: LandingProperty) => p.type  || p.property_type || 'suite';
const propertyArea  = (p: LandingProperty) => p.area_sqm || p.area || 120;
const propertyPrice = (p: LandingProperty) => Number(p.base_price_night || p.price_per_night || p.nightly_price || 900);

/* ── Heart / save icon (UI only) ── */
function HeartIcon() {
  const [saved, setSaved] = useState(false);
  return (
    <button
      aria-label="Save property"
      onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }}
      className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-hs-border bg-hs-bg/70 backdrop-blur transition-all duration-300 hover:border-hs-primary hover:scale-110"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 transition-colors duration-300 ${saved ? 'fill-hs-primary text-hs-primary' : 'fill-transparent text-hs-muted'}`}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

/* ── Shimmer card placeholder ── */
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-hs-border bg-hs-bg2">
      <div className="hs-skeleton h-64 w-full" />
      <div className="space-y-4 p-6">
        <div className="hs-skeleton h-6 w-3/4 rounded-md" />
        <div className="flex gap-2">
          <div className="hs-skeleton h-5 w-16 rounded-full" />
          <div className="hs-skeleton h-5 w-16 rounded-full" />
          <div className="hs-skeleton h-5 w-20 rounded-full" />
        </div>
        <div className="hs-skeleton h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

/* ── Section fade-in hook ── */
function useFadeIn() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add('hs-fade-in');
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('hs-visible'); io.disconnect(); } },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ────────────────────────────────────────────── */

export function PropertiesSection({ properties, locale }: { properties: LandingProperty[]; locale: string }) {
  const isAr = locale === 'ar';
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedProperty, setSelectedProperty] = useState<LandingProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = useFadeIn();

  /* Brief artificial load state for shimmer demo */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const apply = (event: Event) => setFilters((event as CustomEvent<SearchFilters>).detail || {});
    window.addEventListener('hs-search', apply);
    const params = new URLSearchParams(window.location.search);
    setFilters({
      checkin:  params.get('checkin')  || undefined,
      checkout: params.get('checkout') || undefined,
      type:     params.get('type')     || undefined,
      guests:   params.get('guests')   || undefined,
    });
    return () => window.removeEventListener('hs-search', apply);
  }, []);

  const displayProperties = useMemo(() => {
    const source = properties.length ? properties : fallbackProperties;
    return source.filter((p) => !filters.type || propertyType(p).toLowerCase() === filters.type?.toLowerCase());
  }, [filters.type, properties]);

  return (
    <section ref={ref as React.RefObject<HTMLElement>} id="properties" className="bg-hs-bg px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
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

        {/* Grid: 1-col mobile → 2-col tablet → 3-col desktop */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : displayProperties.map((property, idx) => {
                const type     = propertyType(property).toLowerCase();
                const bedrooms = property.bedrooms || 1;
                const area     = propertyArea(property);
                const price    = propertyPrice(property);
                const featured = idx < 3; // first 3 are featured

                return (
                  <article
                    key={property.id}
                    className="hs-property-card group relative overflow-hidden rounded-3xl border border-hs-border bg-hs-bg2 shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-2 hover:border-hs-primary/50"
                  >
                    {/* Image area */}
                    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-hs-bg2 via-hs-bg3 to-hs-primary/20">
                      {property.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={property.image_url}
                          alt={propertyName(property)}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <div className="h-28 w-28 rounded-full border border-hs-primary/30 bg-hs-primary/10 blur-sm" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-hs-bg/90 via-transparent to-transparent" />

                      {/* FEATURED badge — top-left */}
                      {featured && (
                        <span className="absolute left-4 top-4 z-10 rounded-full bg-hs-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-hs-bg shadow-lg">
                          {isAr ? 'مميز' : 'FEATURED'}
                        </span>
                      )}

                      {/* Type badge — repositioned to avoid overlap */}
                      <Badge
                        variant="pending"
                        label={formatType(type, isAr)}
                        className={`absolute ${featured ? 'left-4 top-11' : 'left-4 top-4'} z-10 border-hs-primary/40 bg-hs-bg/80 text-hs-primary`}
                      />

                      {/* Heart / save icon — top-right */}
                      <HeartIcon />
                    </div>

                    {/* Card body */}
                    <div className="space-y-5 p-6">
                      <h3 className="font-serif text-2xl font-semibold text-hs-text">{propertyName(property)}</h3>
                      <div className="flex flex-wrap gap-2 text-sm text-hs-muted">
                        <span className="rounded-full border border-hs-border px-3 py-1">
                          {isAr ? `${bedrooms} غرف` : `${bedrooms} beds`}
                        </span>
                        <span className="rounded-full border border-hs-border px-3 py-1">{area} m²</span>
                        <span className="rounded-full border border-hs-border px-3 py-1">
                          {isAr ? 'خدمة 24/7' : '24/7 service'}
                        </span>
                      </div>

                      {/* Price row */}
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-hs-muted">{isAr ? 'ابتداءً من' : 'From'}</p>
                          <p className="text-3xl font-bold text-hs-primary">
                            {price.toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                            <span className="ml-1 text-base font-semibold">SAR</span>
                          </p>
                          <p className="text-xs text-hs-muted">{isAr ? 'لليلة' : 'per night'}</p>
                        </div>
                        <Button
                          onClick={() => setSelectedProperty(property)}
                          className="rounded-full px-5 transition-all duration-300 hover:scale-105"
                        >
                          {isAr ? 'احجز الآن' : 'Book Now'}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
        </div>

        {/* Empty state */}
        {!loading && displayProperties.length === 0 && (
          <div className="rounded-2xl border border-hs-border bg-hs-bg2 p-8 text-center text-hs-muted">
            {isAr ? 'لا توجد وحدات مطابقة للبحث حالياً.' : 'No properties match your current search.'}
          </div>
        )}
      </div>

      <BookingModal
        locale={locale}
        property={selectedProperty}
        open={Boolean(selectedProperty)}
        onClose={() => setSelectedProperty(null)}
      />
    </section>
  );
}
