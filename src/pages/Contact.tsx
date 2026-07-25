import { useLang } from "../lib/i18n";
import { Reveal } from "../lib/motion";

const WHATSAPP = "https://wa.me/966560903335";

export default function Contact() {
  const { t } = useLang();

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
          <h3>{t("contact_channels")}</h3>
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
            {t("contact_msg_whatsapp")}
          </a>
        </Reveal>

        <Reveal className="contact-card" delay={90}>
          <h3>{t("booking_title")}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.9 }}>
            {t("booking_p1")}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.9, marginTop: 12 }}>
            {t("booking_p2")}
          </p>
        </Reveal>
      </div>
    </div>
  );
}
