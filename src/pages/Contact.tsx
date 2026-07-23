const WHATSAPP = "https://wa.me/966560903335";

export default function Contact() {
  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <h2>
            تواصل معنا
            <span className="gold-line" />
          </h2>
        </div>
        <p>فريقنا جاهز للرد على استفساراتك وحجوزاتك على مدار الساعة.</p>
      </div>

      <div className="contact-grid">
        <div className="contact-card">
          <h3>قنوات التواصل</h3>
          <div className="contact-row">
            <b>واتساب:</b> <span dir="ltr">+966 56 090 3335</span>
          </div>
          <div className="contact-row">
            <b>الموقع:</b> الرياض، المملكة العربية السعودية
          </div>
          <div className="contact-row">
            <b>ساعات العمل:</b> دعم الضيوف متاح 24/7
          </div>
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="btn btn-gold" style={{ marginTop: 18 }}>
            راسلنا على واتساب
          </a>
        </div>

        <div className="contact-card">
          <h3>حجز الوحدات</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.9 }}>
            يمكنك الحجز مباشرة عبر واتساب لأفضل الأسعار، أو عبر صفحات الوحدات على Airbnb. تقويم
            التوفر في موقعنا محدث تلقائياً من جميع منصات الحجز كل ثلاث ساعات، فما تراه متاحاً هو
            متاح فعلاً.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.9, marginTop: 12 }}>
            لملاك العقارات الراغبين بإدارة وحداتهم وتشغيلها باحترافية، تواصلوا معنا لمناقشة نموذج
            الشراكة وخدمات التصميم والتشغيل المتكاملة.
          </p>
        </div>
      </div>
    </div>
  );
}
