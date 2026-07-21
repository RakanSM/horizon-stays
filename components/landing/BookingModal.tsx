'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal } from '@/components/ui';
import type { LandingProperty } from './types';

type BookingModalProps = { locale: string; property: LandingProperty | null; open: boolean; onClose: () => void };
type PaymentMethod = { id: number; name: string; nameAr: string; kind: 'card' | 'mada'; serviceCharge: number; totalAmount: number; currency: string };
type CheckoutStep = 'details' | 'payment' | 'redirecting';

export function BookingModal({ locale, property, open, onClose }: BookingModalProps) {
  const isAr = locale === 'ar';
  const [step, setStep] = useState<CheckoutStep>('details');
  const [loading, setLoading] = useState(false);
  const [methodsLoading, setMethodsLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [testMode, setTestMode] = useState(true);
  const [form, setForm] = useState({ guest_name: '', guest_phone: '', guest_email: '', check_in: '', check_out: '', guests_count: '2' });
  const setValue = (key: keyof typeof form, value: string) => setForm((previous) => ({ ...previous, [key]: value }));
  const nights = useMemo(() => {
    const duration = Date.parse(`${form.check_out}T00:00:00Z`) - Date.parse(`${form.check_in}T00:00:00Z`);
    return Number.isFinite(duration) && duration > 0 ? Math.ceil(duration / 86_400_000) : 0;
  }, [form.check_in, form.check_out]);
  const nightlyRate = Number(property?.base_price_night ?? property?.price_per_night ?? property?.nightly_price ?? 0);
  const estimatedAmount = property && nights && Number.isFinite(nightlyRate) ? nightlyRate * nights : 0;

  useEffect(() => {
    if (!open) { setStep('details'); setBookingId(''); setMethods([]); setSelectedMethod(null); setError(''); }
  }, [open]);

  const loadMethods = async (amount: number) => {
    setMethodsLoading(true);
    try {
      const response = await fetch(`/api/payments/myfatoorah?amount=${encodeURIComponent(amount.toFixed(2))}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Payment methods are unavailable.');
      const available = result.data?.methods ?? [];
      if (!available.length) throw new Error(isAr ? 'لا توجد طرق دفع مفعلة في حساب ماي فاتورة.' : 'No card payment methods are enabled in MyFatoorah.');
      setMethods(available);
      setSelectedMethod(available[0].id);
      setTestMode(Boolean(result.data?.testMode));
    } finally { setMethodsLoading(false); }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!property || nights < 1) { setError(isAr ? 'اختر تاريخ وصول ومغادرة صحيحاً.' : 'Choose valid check-in and check-out dates.'); return; }
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: property.id, ...form, guests_count: Number(form.guests_count || 1) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Booking request failed.');
      const id = result.data?.booking?.id;
      if (!id) throw new Error('Booking ID missing.');
      setBookingId(id);
      await loadMethods(Number(result.data.booking.amount_sar));
      setStep('payment');
    } catch (err) { setError(err instanceof Error ? err.message : 'Booking request failed.'); }
    finally { setLoading(false); }
  };

  const continueToGateway = async () => {
    if (!bookingId || !selectedMethod) return;
    setLoading(true); setError(''); setStep('redirecting');
    try {
      const response = await fetch('/api/payments/myfatoorah', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, paymentMethodId: selectedMethod, locale: isAr ? 'ar' : 'en' }),
      });
      const result = await response.json();
      if (!response.ok || !result.data?.paymentUrl) throw new Error(result.error || 'Payment initialization failed.');
      window.location.assign(result.data.paymentUrl);
    } catch (err) { setError(err instanceof Error ? err.message : 'Payment initialization failed.'); setStep('payment'); setLoading(false); }
  };

  return (
    <Modal open={open} onClose={loading ? () => undefined : onClose} title={isAr ? 'احجز إقامتك' : 'Book Your Stay'} size="lg">
      {property && <div className="mb-5 rounded-xl border border-hs-border bg-hs-bg3/70 p-4"><p className="text-sm text-hs-muted">{isAr ? 'الوحدة المختارة' : 'Selected property'}</p><h3 className="font-serif text-2xl text-hs-primary">{(isAr ? property.name_ar : property.name_en) || property.name_ar || property.name_en || property.name || 'Horizon Stays'}</h3>{estimatedAmount > 0 && <p className="mt-1 text-sm text-hs-muted">{estimatedAmount.toLocaleString()} SAR · {nights} {isAr ? 'ليالٍ' : 'nights'}</p>}</div>}
      {error && <div role="alert" className="mb-4 rounded-xl border border-hs-red/40 bg-hs-red/10 p-3 text-sm text-hs-red">{error}</div>}

      {step === 'details' && <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <Input required label={isAr ? 'الاسم' : 'Name'} value={form.guest_name} onChange={(e) => setValue('guest_name', e.target.value)} />
        <Input required label={isAr ? 'الجوال' : 'Phone'} value={form.guest_phone} onChange={(e) => setValue('guest_phone', e.target.value)} />
        <Input type="email" label={isAr ? 'البريد الإلكتروني' : 'Email'} value={form.guest_email} onChange={(e) => setValue('guest_email', e.target.value)} />
        <Input type="number" min="1" max="30" label={isAr ? 'عدد الضيوف' : 'Guests'} value={form.guests_count} onChange={(e) => setValue('guests_count', e.target.value)} />
        <Input required type="date" label={isAr ? 'الوصول' : 'Check-in'} value={form.check_in} onChange={(e) => setValue('check_in', e.target.value)} />
        <Input required type="date" min={form.check_in || undefined} label={isAr ? 'المغادرة' : 'Check-out'} value={form.check_out} onChange={(e) => setValue('check_out', e.target.value)} />
        <div className="md:col-span-2 rounded-xl border border-hs-primary/25 bg-hs-primary/5 p-4 text-sm text-hs-muted">{isAr ? 'سيتم احتساب السعر والتحقق من التوفر على الخادم، ثم تختار فيزا/ماستركارد أو مدى حسب الطرق المفعلة في ماي فاتورة.' : 'Price and availability are verified on the server, then you can choose Visa/Mastercard or Mada as enabled by MyFatoorah.'}</div>
        <Button type="submit" loading={loading || methodsLoading} size="lg" className="md:col-span-2 rounded-full">{isAr ? 'المتابعة للدفع الآمن' : 'Continue to secure payment'}</Button>
      </form>}

      {step === 'payment' && <div className="space-y-4">
        {testMode && <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-300"><strong>{isAr ? 'وضع الاختبار' : 'Test Mode'}</strong> — {isAr ? 'لن يتم خصم مبلغ حقيقي.' : 'No real money will be charged.'}</div>}
        <fieldset className="space-y-3"><legend className="mb-2 font-semibold text-hs-text">{isAr ? 'اختر طريقة الدفع' : 'Choose payment method'}</legend>
          {methods.map((method) => <label key={method.id} className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${selectedMethod === method.id ? 'border-hs-primary bg-hs-primary/10' : 'border-hs-border bg-hs-bg3/50'}`}><span className="flex items-center gap-3"><input type="radio" name="paymentMethod" checked={selectedMethod === method.id} onChange={() => setSelectedMethod(method.id)} /><span><span className="block font-semibold text-hs-text">{isAr ? method.nameAr : method.name}</span><span className="text-xs text-hs-muted">{method.kind === 'mada' ? 'Mada' : 'Visa · Mastercard'}</span></span></span><span className="text-sm text-hs-primary">{method.totalAmount.toLocaleString()} {method.currency}</span></label>)}
        </fieldset>
        <div className="flex gap-3"><Button type="button" variant="ghost" onClick={() => setStep('details')} disabled={loading}>{isAr ? 'رجوع' : 'Back'}</Button><Button type="button" className="flex-1" loading={loading} onClick={continueToGateway}>{isAr ? 'الانتقال إلى ماي فاتورة' : 'Continue to MyFatoorah'}</Button></div>
      </div>}

      {step === 'redirecting' && <div className="py-10 text-center"><div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-hs-primary/25 border-t-hs-primary" /><h3 className="text-lg font-semibold text-hs-text">{isAr ? 'جارٍ فتح بوابة الدفع الآمنة…' : 'Opening the secure payment gateway…'}</h3><p className="mt-2 text-sm text-hs-muted">{isAr ? 'لا تغلق هذه النافذة.' : 'Please do not close this window.'}</p></div>}
    </Modal>
  );
}
