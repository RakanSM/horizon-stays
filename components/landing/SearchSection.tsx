'use client';

import { FormEvent, useState } from 'react';
import { Input, Select, Button } from '@/components/ui';

export function SearchSection({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [type, setType] = useState('');
  const [guests, setGuests] = useState('2');

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (checkin) params.set('checkin', checkin);
    if (checkout) params.set('checkout', checkout);
    if (type) params.set('type', type);
    if (guests) params.set('guests', guests);

    const section = document.getElementById('properties');
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}#properties`);
    window.dispatchEvent(new CustomEvent('hs-search', { detail: { checkin, checkout, type, guests } }));
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-2xl border border-hs-border bg-hs-bg2/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl md:grid-cols-[1fr_1fr_1fr_0.7fr_auto] md:p-6"
      aria-label={isAr ? 'بحث عن الوحدات' : 'Property search'}
    >
      {/* @section: search-checkin */}
      <Input
        type="date"
        label={isAr ? 'تاريخ الوصول' : 'Check-in'}
        value={checkin}
        onChange={(event) => setCheckin(event.target.value)}
        className="min-h-11"
      />
      {/* @section: search-checkout */}
      <Input
        type="date"
        label={isAr ? 'تاريخ المغادرة' : 'Check-out'}
        value={checkout}
        onChange={(event) => setCheckout(event.target.value)}
        className="min-h-11"
      />
      {/* @section: search-type */}
      <Select
        label={isAr ? 'نوع الوحدة' : 'Property type'}
        value={type}
        onChange={(event) => setType(event.target.value)}
        placeholder={isAr ? 'كل الوحدات' : 'All properties'}
        options={[
          { value: 'penthouse', label: isAr ? 'بنتهاوس' : 'Penthouse' },
          { value: 'suite', label: isAr ? 'سويت' : 'Suite' },
          { value: 'loft', label: isAr ? 'لوفت' : 'Loft' },
          { value: 'villa', label: isAr ? 'فيلا' : 'Villa' },
          { value: 'apartment', label: isAr ? 'شقة' : 'Apartment' },
        ]}
        className="min-h-11"
      />
      {/* @section: search-guests */}
      <Input
        type="number"
        min="1"
        max="12"
        label={isAr ? 'الضيوف' : 'Guests'}
        value={guests}
        onChange={(event) => setGuests(event.target.value)}
        className="min-h-11"
      />
      {/* @section: search-submit */}
      <div className="flex items-end">
        <Button type="submit" size="lg" className="min-h-11 w-full rounded-full px-7">
          {isAr ? 'ابحث' : 'Search'}
        </Button>
      </div>
    </form>
  );
}
