import { createServerClient } from '@/lib/supabase/server';
import { NavBar } from '@/components/landing/NavBar';
import QRCode from 'qrcode';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Booking status | Horizon Stays', robots: { index: false } };

export default async function ConfirmationPage({ params, searchParams }: { params: { locale: string }; searchParams: { id?: string } }) {
  const bookingId = searchParams.id;
  const isAr = params.locale === 'ar';
  const supabase = createServerClient() as any;
  const { data: booking } = bookingId
    ? await supabase.from('bookings').select('id, check_in, check_out, payment_status, status, door_code, zatca_qr, property:properties(name_ar, name_en, type)').eq('id', bookingId).single()
    : { data: null };
  const paid = booking?.payment_status === 'paid' && booking?.status === 'confirmed';
  let zatcaQRDataUrl = '';
  if (paid && booking?.zatca_qr) { try { zatcaQRDataUrl = await QRCode.toDataURL(booking.zatca_qr); } catch {} }

  return <div className="min-h-screen bg-hs-bg" dir={isAr ? 'rtl' : 'ltr'}>
    <NavBar locale={params.locale} />
    <div className="mx-auto max-w-lg px-4 pb-12 pt-28">
      {!booking ? <div className="text-center text-hs-muted">{isAr ? 'لم يتم العثور على الحجز' : 'Booking not found'}</div> : paid ? (
        <div className="space-y-6 rounded-2xl border border-hs-border bg-hs-bg2 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-hs-green/30 bg-hs-green/15 text-3xl">✓</div>
          <div><h1 className="font-serif text-2xl font-bold text-hs-text">{isAr ? 'تم الدفع وتأكيد حجزك!' : 'Payment received — booking confirmed!'}</h1><p className="mt-2 text-sm text-hs-muted">{isAr ? 'تم التحقق من عملية الدفع مباشرةً من ماي فاتورة.' : 'Your payment was verified directly with MyFatoorah.'}</p></div>
          <div className="space-y-2 rounded-xl bg-hs-bg3 p-4 text-sm text-right">
            {[[isAr ? 'رقم الحجز' : 'Booking ID', booking.id.slice(0, 8).toUpperCase()], [isAr ? 'العقار' : 'Property', (() => { const property = booking.property as { name_ar?: string; name_en?: string } | null; return (isAr ? property?.name_ar : property?.name_en) || property?.name_ar || property?.name_en; })()], [isAr ? 'تسجيل الدخول' : 'Check-in', booking.check_in], [isAr ? 'تسجيل الخروج' : 'Check-out', booking.check_out], [isAr ? 'كود الباب' : 'Door Code', booking.door_code ?? (isAr ? 'قيد التجهيز وسيُرسل عبر واتساب' : 'Being prepared and will be sent via WhatsApp')]].map(([label, value], index) => <div key={index} className="flex justify-between gap-4"><span className="text-hs-muted">{label}</span><span className={index === 4 ? 'font-mono text-lg font-bold text-hs-primary' : 'font-medium text-hs-text'}>{value}</span></div>)}
          </div>
          {zatcaQRDataUrl && <div className="flex flex-col items-center gap-2"><p className="text-xs text-hs-muted">{isAr ? 'رمز الفاتورة الإلكترونية (ZATCA)' : 'ZATCA e-Invoice QR'}</p><img src={zatcaQRDataUrl} alt="ZATCA QR" className="h-24 w-24 rounded-lg" /></div>}
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl border border-amber-400/30 bg-hs-bg2 p-8 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-3xl">…</div><h1 className="font-serif text-2xl font-bold text-hs-text">{isAr ? 'الدفع غير مؤكد بعد' : 'Payment is not confirmed yet'}</h1><p className="text-sm text-hs-muted">{isAr ? 'لن يظهر الحجز كمؤكد حتى تتحقق المنصة من نجاح الدفع. إذا أتممت الدفع، انتظر قليلاً ثم حدّث الصفحة.' : 'This booking will not appear confirmed until the payment is verified. If you completed payment, wait briefly and refresh this page.'}</p><a href={`/${params.locale}/booking`} className="inline-flex rounded-full border border-hs-primary px-5 py-2 text-hs-primary">{isAr ? 'العودة للحجز' : 'Return to booking'}</a></div>
      )}
    </div>
  </div>;
}
