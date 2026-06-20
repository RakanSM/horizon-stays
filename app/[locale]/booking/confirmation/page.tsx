import { createServerClient } from '@/lib/supabase/server';
import { NavBar } from '@/components/landing/NavBar';
import QRCode from 'qrcode';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'تأكيد الحجز | Horizon Stays', robots: { index: false } };

export default async function ConfirmationPage({ params, searchParams }: { params: { locale: string }; searchParams: { id?: string } }) {
  const bookingId = searchParams.id;
  const supabase = createServerClient() as any;
  const { data: booking } = bookingId ? await supabase.from('bookings').select('*, property:properties(internal_name, type)').eq('id', bookingId).single() : { data: null };
  const isAr = params.locale === 'ar';
  let zatcaQRDataUrl = '';
  if (booking?.zatca_qr) { try { zatcaQRDataUrl = await QRCode.toDataURL(booking.zatca_qr); } catch {} }
  return (
    <div className="min-h-screen bg-hs-bg" dir={isAr ? 'rtl' : 'ltr'}>
      <NavBar locale={params.locale} />
      <div className="max-w-lg mx-auto px-4 pt-28 pb-12">
        {booking ? (
          <div className="bg-hs-bg2 border border-hs-border rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-hs-green/15 border border-hs-green/30 flex items-center justify-center mx-auto text-3xl">✓</div>
            <h1 className="text-2xl font-serif font-bold text-hs-text">{isAr ? 'تم تأكيد حجزك!' : 'Booking Confirmed!'}</h1>
            <div className="bg-hs-bg3 rounded-xl p-4 text-sm text-right space-y-2">
              {[[isAr ? 'رقم الحجز' : 'Booking ID', booking.id.slice(0, 8).toUpperCase()], [isAr ? 'العقار' : 'Property', (booking.property as { internal_name?: string })?.internal_name], [isAr ? 'تسجيل الدخول' : 'Check-in', booking.check_in], [isAr ? 'تسجيل الخروج' : 'Check-out', booking.check_out], [isAr ? 'كود الباب' : 'Door Code', booking.door_code ?? (isAr ? 'سيُرسل عبر واتساب' : 'Will be sent via WhatsApp')]].map(([label, value], i) => (
                <div key={i} className="flex justify-between"><span className="text-hs-muted">{label}</span><span className={i === 4 ? 'text-hs-primary font-mono font-bold text-lg' : 'text-hs-text font-medium'}>{value}</span></div>
              ))}
            </div>
            {zatcaQRDataUrl && <div className="flex flex-col items-center gap-2"><p className="text-xs text-hs-muted">{isAr ? 'رمز الفاتورة الإلكترونية (ZATCA)' : 'ZATCA e-Invoice QR'}</p><img src={zatcaQRDataUrl} alt="ZATCA QR" className="w-24 h-24 rounded-lg" /></div>}
            <p className="text-xs text-hs-muted">{isAr ? 'سيتم إرسال تفاصيل الحجز وكود الدخول عبر واتساب' : 'Booking details and door code will be sent via WhatsApp'}</p>
          </div>
        ) : <div className="text-center text-hs-muted">{isAr ? 'لم يتم العثور على الحجز' : 'Booking not found'}</div>}
      </div>
    </div>
  );
}
