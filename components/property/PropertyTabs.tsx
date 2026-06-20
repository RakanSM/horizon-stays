'use client';
import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import type { GuestReview, Booking } from '@/types';
import { formatDate } from '@/lib/utils';

interface Props {
  property: import('@/types').Property;
  reviews: GuestReview[];
  bookings: Pick<Booking, 'check_in' | 'check_out' | 'status'>[];
  locale: string;
}

export function PropertyTabs({ property, reviews, bookings, locale }: Props) {
  const isAr = locale === 'ar';
  const [tab, setTab] = useState('overview');
  const tabs = [
    { key: 'overview', label: isAr ? 'نظرة عامة' : 'Overview' },
    { key: 'availability', label: isAr ? 'التوفر' : 'Availability' },
    { key: 'reviews', label: isAr ? 'التقييمات' : 'Reviews' },
  ];

  const amenities = [
    { icon: '🛏️', label: isAr ? `${property.bedrooms} غرفة نوم` : `${property.bedrooms} Bedrooms` },
    { icon: '🚿', label: isAr ? `${property.bathrooms} حمام` : `${property.bathrooms} Bathrooms` },
    { icon: '📐', label: `${property.area_sqm} م²` },
    { icon: '🏢', label: isAr ? `الطابق ${property.floor}` : `Floor ${property.floor}` },
    { icon: '📶', label: 'WiFi' },
    { icon: '❄️', label: isAr ? 'تكييف' : 'A/C' },
    { icon: '🅿️', label: isAr ? 'موقف سيارة' : 'Parking' },
    { icon: '🍳', label: isAr ? 'مطبخ مجهز' : 'Full Kitchen' },
  ];

  return (
    <div className="mt-8">
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <div className="mt-6">
        {tab === 'overview' && (
          <div>
            <h3 className="text-lg font-serif font-semibold text-hs-text mb-4">{isAr ? 'المرافق والخدمات' : 'Amenities'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {amenities.map((a, i) => (
                <div key={i} className="flex items-center gap-2 bg-hs-bg2 border border-hs-border rounded-lg px-3 py-2 text-sm text-hs-muted">
                  <span>{a.icon}</span><span>{a.label}</span>
                </div>
              ))}
            </div>
            {/* Platform badges */}
            {property.platform_names && Object.keys(property.platform_names).length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-hs-muted mb-2">{isAr ? 'متاح على المنصات' : 'Available on'}</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(property.platform_names).map(p => (
                    <span key={p} className="text-xs px-3 py-1 rounded-full bg-hs-bg3 border border-hs-border text-hs-muted capitalize">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {tab === 'availability' && (
          <div>
            <p className="text-sm text-hs-muted mb-4">{isAr ? 'التواريخ المحجوزة:' : 'Booked dates:'}</p>
            {bookings.length === 0 ? (
              <p className="text-hs-green text-sm">✓ {isAr ? 'الوحدة متاحة حالياً' : 'Unit is currently available'}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {bookings.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 bg-hs-bg2 border border-hs-border rounded-lg px-4 py-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-hs-red" />
                    <span className="text-hs-muted">{b.check_in}</span>
                    <span className="text-hs-muted">→</span>
                    <span className="text-hs-muted">{b.check_out}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 'reviews' && (
          <div>
            {reviews.length === 0 ? (
              <p className="text-hs-muted text-sm">{isAr ? 'لا توجد تقييمات بعد' : 'No reviews yet'}</p>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map(r => (
                  <div key={r.id} className="bg-hs-bg2 border border-hs-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-hs-primary/20 flex items-center justify-center text-hs-primary text-sm font-semibold">
                          {r.guest_name?.[0] ?? 'G'}
                        </div>
                        <span className="text-sm font-medium text-hs-text">{r.guest_name ?? 'Guest'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < (r.rating ?? 5) ? 'text-hs-primary' : 'text-hs-muted'}>★</span>
                        ))}
                      </div>
                    </div>
                    {r.review_text && <p className="text-sm text-hs-muted">{r.review_text}</p>}
                    <p className="text-xs text-hs-muted/60 mt-2">{formatDate(r.created_at, locale === 'ar' ? 'ar-SA' : 'en-US')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
