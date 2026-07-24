import { useLang } from "../lib/i18n";
import { Reveal } from "../lib/motion";

const WHATSAPP = "https://wa.me/966560903335";

export default function Contact() {
  const { lang, t } = useLang();

  return (
    <div className="container section">
      <Reveal className="section-head">
        <div>
          <h2>
            {t("contact_title")}
            <span className="gold-line" />
          </h2>
        </div>
        <p>{t("contact_lead")}</p>
      </Reveal>

      <div className="contact-grid">
        <Reveal className="contact-card">
          <h3>{lang === "ar" ? "قنوات التواصل" : "Contact Channels"}</h3>
          <div className="contact-row">
            <b>{t("contact_whatsapp")}:</b> <span dir="ltr">+966 56 090 3335</span>
          </div>
          <div className="contact-row">
            <b>{t("contact_location")}:</b> {t("contact_location_d")}
          </div>
          <div className="contact-row">
            <b>{t("contact_hours")}:</b> {t("contact_hours_d")}
          </div>
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="btn btn-gold" style={{ marginTop: 18 }}>
            {lang === "ar" ? "راسلنا على واتساب" : "Message us on WhatsApp"}
          </a>
        </Reveal>

        <Reveal className="contact-card" delay={90}>
          <h3>{lang === "ar" ? "حجز الوحدات" : "Booking"}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.9 }}>
            {lang === "ar"
              ? "يمكنك الحجز مباشرة عبر واتساب لأفضل الأسعار، أو عبر صفحات الوحدات على Airbnb. تقويم التوفر في موقعنا محدث تلقائياً من جميع منصات الحجز كل ثلاث ساعات، فما تراه متاحاً هو متاح فعلاً."
              : "Book directly via WhatsApp for the best rates, or through each unit's Airbnb page. Our availability calendar is auto-synced from all booking platforms every three hours — what you see available is truly available."}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.9, marginTop: 12 }}>
            {lang === "ar"
              ? "لملاك العقارات الراغبين بإدارة وحداتهم وتشغيلها باحترافية، تواصلوا معنا لمناقشة نموذج الشراكة وخدمات التصميم والتشغيل المتكاملة."
              : "Property owners interested in professional unit management and operations — contact us to discuss our partnership model and end-to-end design and operations services."}
          </p>
        </Reveal>
      </div>
    </div>
  );
}
