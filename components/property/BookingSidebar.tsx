'use client';
import { useState } from 'react';
import { differenceInDays } from 'date-fns';
import { DatePicker, Button, Modal, Input, Select } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import type { Property } from '@/types';

interface BookingSidebarProps {
  property: Property;
  locale: string;
}

export function BookingSidebar({ property, locale }: BookingSidebarProps) {
  const isAr = locale === 'ar';
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('myfatoorah');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const qc = useQueryClient();

  const nights = checkIn && checkOut ? Math.max(0, differenceInDays(new Date(checkOut), new Date(checkIn))) : 0;
  const total = nights * property.base_price_night;

  async function handleSubmit() {
    if (!guestName || !guestPhone || !checkIn || !checkOut) return;
    setLoading(true);
    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id, guest_name: guestName, guest_phone: guestPhone,
          guest_email: guestEmail, check_in: checkIn, check_out: checkOut,
          nights, guests_count: 1,
        }),
      });
      const data = await res.json();
      
      if (data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else if (data.data?.booking?.id) {
        setSuccess(data.data.booking.id);
        qc.invalidateQueries({ queryKey: ['bookings'] });
        setModalOpen(false);
      }
    } catch (e) {
      console.error(e);
      alert(isAr ? 'حدث خطأ أثناء إنشاء الحجز' : 'Error creating booking');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sticky top-24 bg-hs-bg2 border border-hs-border rounded-2xl p-6 shadow-2xl">
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-3xl font-bold text-hs-primary font-serif">{formatCurrency(property.base_price_night)}</span>
        <span className="text-hs-muted text-sm">/ {isAr ? 'ليلة' : 'night'}</span>
      </div>
      <div className="flex flex-col gap-4 mb-4">
        <DatePicker label={isAr ? 'تسجيل الدخول' : 'Check-in'} value={checkIn} onChange={e => setCheckIn(e.target.value)} min={new Date().toISOString().split('T')[0]} />
        <DatePicker label={isAr ? 'تسجيل الخروج' : 'Check-out'} value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn} />
      </div>
      {nights > 0 && (
        <div className="border-t border-hs-border pt-4 mb-4 flex flex-col gap-2">
          <div className="flex justify-between text-sm text-hs-muted">
            <span>{formatCurrency(property.base_price_night)} × {nights} {isAr ? 'ليالٍ' : 'nights'}</span>
            <span className="text-hs-text">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between font-semibold text-hs-text">
            <span>{isAr ? 'الإجمالي' : 'Total'}</span>
            <span className="text-hs-primary">{formatCurrency(total)}</span>
          </div>
        </div>
      )}
      <Button className="w-full" size="lg" onClick={() => setModalOpen(true)} disabled={!checkIn || !checkOut || nights === 0}>
        {isAr ? 'احجز الآن' : 'Book Now'}
      </Button>
      {success && <p className="mt-3 text-center text-xs text-hs-green">✓ {isAr ? `تم الحجز: #${success.slice(0, 8)}` : `Booked: #${success.slice(0, 8)}`}</p>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isAr ? 'تأكيد الحجز' : 'Confirm Booking'}>
        <div className="flex flex-col gap-4">
          <Input label={isAr ? 'الاسم الكامل' : 'Full Name'} value={guestName} onChange={e => setGuestName(e.target.value)} required />
          <Input label={isAr ? 'رقم الجوال' : 'Phone'} value={guestPhone} onChange={e => setGuestPhone(e.target.value)} type="tel" required />
          <Input label={isAr ? 'البريد الإلكتروني' : 'Email'} value={guestEmail} onChange={e => setGuestEmail(e.target.value)} type="email" />
          <Select label={isAr ? 'طريقة الدفع' : 'Payment Method'} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
            options={[{ value: 'myfatoorah', label: 'بطاقة / Apple Pay / STC' }, { value: 'bank_transfer', label: isAr ? 'تحويل بنكي' : 'Bank Transfer' }]} />
          <div className="bg-hs-bg3 rounded-lg p-3 text-sm text-hs-muted">
            <div className="flex justify-between mb-1">
              <span>{isAr ? 'العقار' : 'Property'}</span><span className="text-hs-text">{property.internal_name}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>{isAr ? 'تسجيل الدخول' : 'Check-in'}</span><span className="text-hs-text">{checkIn}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>{isAr ? 'تسجيل الخروج' : 'Check-out'}</span><span className="text-hs-text">{checkOut}</span>
            </div>
            <div className="flex justify-between font-semibold text-hs-primary">
              <span>{isAr ? 'الإجمالي' : 'Total'}</span><span>{formatCurrency(total)}</span>
            </div>
          </div>
          <Button onClick={handleSubmit} loading={loading} className="w-full">
            {isAr ? 'تأكيد الحجز' : 'Confirm Booking'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
