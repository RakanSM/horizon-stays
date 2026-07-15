'use client';

import { FormEvent, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Input, Modal, Select } from '@/components/ui';
import type { LandingProperty } from './types';

type BookingModalProps = {
  locale: string;
  property: LandingProperty | null;
  open: boolean;
  onClose: () => void;
};

export function BookingModal({ locale, property, open, onClose }: BookingModalProps) {
  const isAr = locale === 'ar';
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState('');
  const [form, setForm] = useState({
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    check_in: '',
    check_out: '',
    guests_count: '2',
    payment_method: 'myfatoorah',
  });

  const setValue = (key: keyof typeof form, value: string) => setForm((previous) => ({ ...previous, [key]: value }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!property) return;
    setLoading(true);
    setSuccessId('');

    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          guest_name: form.guest_name,
          guest_phone: form.guest_phone,
          guest_email: form.guest_email,
          check_in: form.check_in,
          check_out: form.check_out,
          guests_count: Number(form.guests_count || 1),
          nights: Math.max(1, Math.ceil((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / (1000 * 60 * 60 * 24))),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Booking request failed');
      
      if (result.data?.paymentUrl) {
        window.location.href = result.data.paymentUrl;
      } else {
        await queryClient.invalidateQueries({ queryKey: ['bookings'] });
        setSuccessId(result.data?.booking?.id || `HS-${Date.now().toString().slice(-6)}`);
      }
    } catch (err: any) {
      alert(err.message || (isAr ? 'حدث خطأ أثناء إنشاء الحجز' : 'Error creating booking'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isAr ? 'احجز إقامتك' : 'Book Your Stay'} size="lg">
      {/* @section: booking-modal */}
      {property && (
        <div className="mb-5 rounded-xl border border-hs-border bg-hs-bg3/70 p-4">
          <p className="text-sm text-hs-muted">{isAr ? 'الوحدة المختارة' : 'Selected property'}</p>
          <h3 className="font-serif text-2xl text-hs-primary">{property.name}</h3>
        </div>
      )}
      {successId ? (
        <div className="rounded-xl border border-hs-green/40 bg-hs-green/10 p-5 text-hs-green">
          <p className="text-lg font-semibold">{isAr ? 'تم إرسال طلب الحجز بنجاح' : 'Booking request sent successfully'}</p>
          <p className="mt-2 text-sm opacity-90">{isAr ? 'رقم الطلب' : 'Booking ID'}: {successId}</p>
          <Button type="button" className="mt-5" onClick={onClose}>{isAr ? 'إغلاق' : 'Close'}</Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <Input required label={isAr ? 'الاسم' : 'Name'} value={form.guest_name} onChange={(e) => setValue('guest_name', e.target.value)} />
          <Input required label={isAr ? 'الجوال' : 'Phone'} value={form.guest_phone} onChange={(e) => setValue('guest_phone', e.target.value)} />
          <Input type="email" label={isAr ? 'البريد الإلكتروني' : 'Email'} value={form.guest_email} onChange={(e) => setValue('guest_email', e.target.value)} />
          <Input type="number" min="1" label={isAr ? 'عدد الضيوف' : 'Guests'} value={form.guests_count} onChange={(e) => setValue('guests_count', e.target.value)} />
          <Input required type="date" label={isAr ? 'الوصول' : 'Check-in'} value={form.check_in} onChange={(e) => setValue('check_in', e.target.value)} />
          <Input required type="date" label={isAr ? 'المغادرة' : 'Check-out'} value={form.check_out} onChange={(e) => setValue('check_out', e.target.value)} />
          <div className="md:col-span-2">
            <Select
              label={isAr ? 'طريقة الدفع' : 'Payment method'}
              value={form.payment_method}
              onChange={(e) => setValue('payment_method', e.target.value)}
              options={[
                { value: 'myfatoorah', label: 'MyFatoorah' },
                { value: 'bank_transfer', label: isAr ? 'تحويل بنكي' : 'Bank transfer' },
                { value: 'cash', label: isAr ? 'دفع عند الوصول' : 'Pay on arrival' },
              ]}
            />
          </div>
          <Button type="submit" loading={loading} size="lg" className="md:col-span-2 rounded-full">
            {isAr ? 'إرسال طلب الحجز' : 'Send Booking Request'}
          </Button>
        </form>
      )}
    </Modal>
  );
}
