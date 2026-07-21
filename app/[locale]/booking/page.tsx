const messages: Record<string, { en: string; ar: string }> = {
  payment_failed: { en: 'Payment was not completed. Your booking remains pending and no confirmation has been issued.', ar: 'لم تكتمل عملية الدفع. سيبقى الحجز معلقاً ولم يصدر تأكيد.' },
  payment_pending: { en: 'Payment is still pending. Please wait briefly before trying again.', ar: 'عملية الدفع ما زالت معلقة. يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.' },
  payment_canceled: { en: 'Payment was canceled. You can return and start a new secure payment attempt.', ar: 'تم إلغاء الدفع. يمكنك الرجوع وبدء محاولة دفع آمنة جديدة.' },
  payment_cancelled: { en: 'Payment was cancelled. You can return and start a new secure payment attempt.', ar: 'تم إلغاء الدفع. يمكنك الرجوع وبدء محاولة دفع آمنة جديدة.' },
  payment_expired: { en: 'The payment session expired before completion. Please start a new secure payment attempt.', ar: 'انتهت صلاحية جلسة الدفع قبل اكتمالها. يرجى بدء محاولة دفع آمنة جديدة.' },
  missing_payment_id: { en: 'The gateway did not return a payment identifier.', ar: 'لم تُرجع بوابة الدفع معرّف العملية.' },
  callback_failed: { en: 'We could not verify the payment. No booking was marked paid. Please contact support if your card was charged.', ar: 'تعذر التحقق من الدفع، ولم يتم اعتبار الحجز مدفوعاً. تواصل مع الدعم إذا تم الخصم من بطاقتك.' },
};

export default function BookingPage({ params, searchParams }: { params: { locale: string }; searchParams: { error?: string; id?: string } }) {
  const isAr = params.locale === 'ar';
  const error = searchParams.error ? (messages[searchParams.error] ?? messages.callback_failed) : null;
  return <main className="flex min-h-screen items-center justify-center bg-hs-bg px-6 text-center text-hs-text">
    <section className="max-w-xl space-y-5 rounded-2xl border border-hs-border bg-hs-bg2 p-8">
      <h1 className="font-heading text-4xl font-semibold text-hs-primary">{error ? (isAr ? 'حالة الدفع' : 'Payment status') : (isAr ? 'الحجز' : 'Booking')}</h1>
      <p className="text-hs-muted">{error ? (isAr ? error.ar : error.en) : (isAr ? 'اختر وحدتك من الصفحة الرئيسية لبدء الحجز.' : 'Choose a property from the home page to start a booking.')}</p>
      {searchParams.id && <p className="text-xs text-hs-muted">{isAr ? 'مرجع الحجز' : 'Booking reference'}: {searchParams.id.slice(0, 8).toUpperCase()}</p>}
      <a href={`/${params.locale}`} className="inline-flex rounded-full bg-hs-primary px-6 py-3 font-semibold text-hs-bg">{isAr ? 'العودة للرئيسية' : 'Return home'}</a>
    </section>
  </main>;
}
