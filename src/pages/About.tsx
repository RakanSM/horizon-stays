import { Link } from "react-router-dom";
import { useLang } from "../lib/i18n";
import { Reveal } from "../lib/motion";

const WHATSAPP = "https://wa.me/966560903335";

const VALUES = [
  {
    ar: { title: "الإتقان في التفاصيل", body: "كل تفصيلة صغيرة نحرص عليها تصنع فرقاً كبيراً في تجربة كل ضيف." },
    en: { title: "Mastery of Detail", body: "Every small detail we perfect makes a big difference in each guest's experience." },
  },
  {
    ar: { title: "ضيافة بروح سعودية", body: "طاقم أفق سعودي 100% يجمع بين الاحترافية والضيافة الأصيلة." },
    en: { title: "Saudi-Spirited Hospitality", body: "Our 100% Saudi team combines professionalism with authentic hospitality." },
  },
  {
    ar: { title: "الشفافية والثقة", body: "شراكتنا مع الملاك مبنية على وضوح كامل وموثوقية في كل خطوة." },
    en: { title: "Transparency & Trust", body: "Our owner partnerships are built on full clarity and reliability at every step." },
  },
  {
    ar: { title: "التجربة أولاً", body: "دائماً في قلب كل قرار نتخذه لضمان تجربة سلسة ومميزة للعميل." },
    en: { title: "Experience First", body: "At the heart of every decision we make — a seamless, memorable guest experience." },
  },
  {
    ar: { title: "التطوير المستمر", body: "نواكب السوق ونبتكر حلولاً ذكية لزيادة عائد الاستثمار وتحسين الأداء." },
    en: { title: "Continuous Improvement", body: "We track the market and innovate smart solutions to raise ROI and performance." },
  },
];

export default function About() {
  const { lang, t } = useLang();

  const whys = [
    { icon: "📍", title: t("why_1_t"), desc: t("why_1_d") },
    { icon: "🏨", title: t("why_2_t"), desc: t("why_2_d") },
    { icon: "🤝", title: t("why_3_t"), desc: t("why_3_d") },
    { icon: "🕐", title: t("why_4_t"), desc: t("why_4_d") },
  ];

  return (
    <>
      <section className="page-hero">
        <div
          className="page-hero-bg"
          style={{ backgroundImage: "url(/assets/property-real/duplex-penthouse-4bd-1.webp)" }}
        />
        <div className="container">
          <Reveal>
            <h1>{lang === "ar" ? "من نحن — شركة أفق" : "About Us — Ofoq (Horizon)"}</h1>
            <p>{t("about_lead")}</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <Reveal className="about-text">
            {lang === "ar" ? (
              <>
                <p className="prose">
                  نحن في شركة أفق نؤمن أن الضيافة تبدأ من التفاصيل الصغيرة وتصنع فرقاً كبيراً في
                  تجربة كل ضيف. طاقمنا سعودي 100% بخبرة واسعة في إدارة الضيافة والحجوزات، نفهم
                  السوق المحلي واحتياجاته، ونجيد التعامل مع الضيوف بمختلف ثقافاتهم وتوقعاتهم.
                </p>
                <p className="prose" style={{ marginTop: 14 }}>
                  نحن لا ندير الحجوزات فحسب، بل نجهز الشقق بالكامل — من تأثيث وتصميم داخلي وتنفيذ
                  وتشغيل — لضمان تقديم تجربة ضيافة استثنائية تجمع بين الاحترافية والود، مع متابعة
                  دقيقة لكل تفاصيل الحجز.
                </p>
              </>
            ) : (
              <>
                <p className="prose">
                  At Ofoq (Horizon), we believe hospitality begins with the smallest details — and
                  those details transform every guest's experience. Our 100% Saudi team brings deep
                  expertise in hospitality and reservations management, an intimate understanding of
                  the local market, and fluency in serving guests of every culture and expectation.
                </p>
                <p className="prose" style={{ marginTop: 14 }}>
                  We don't just manage bookings — we prepare apartments end to end: furnishing,
                  interior design, fit-out, and operations — delivering an exceptional hospitality
                  experience that blends professionalism with warmth, and meticulous attention to
                  every booking detail.
                </p>
              </>
            )}
          </Reveal>
          <Reveal className="about-img" delay={100}>
            <img src="/assets/property-real/royal-suite-3bd-1.webp" alt="Horizon Stays" loading="lazy" />
          </Reveal>
        </div>
      </section>

      <section className="section alt">
        <div className="container mv-grid">
          <Reveal className="mv-card">
            <h3>{t("about_mission_t")}</h3>
            <p>
              {lang === "ar"
                ? "نضع الضيف في قلب كل قرار، والمالك في قلب كل استثمار. مهمتنا أن نحوّل العقارات إلى تجارب إقامة متكاملة — من تصميم داخلي راقٍ وتشغيل احترافي — لنخلق توازناً مثالياً بين راحة الضيف وعائد المالك."
                : "We put the guest at the heart of every decision, and the owner at the heart of every investment. Our mission is to turn properties into complete stay experiences — refined interiors and professional operations — striking the perfect balance between guest comfort and owner returns."}
            </p>
          </Reveal>
          <Reveal className="mv-card" delay={90}>
            <h3>{t("about_vision_t")}</h3>
            <p>
              {lang === "ar"
                ? "أن نكون الوجهة السعودية الأولى في تصميم وتشغيل عقارات الضيافة الذكية، حيث يلتقي الإتقان المحلي مع المعايير العالمية لصناعة تجارب ضيافة تُحكى وتُستثمر."
                : "To become Saudi Arabia's leading name in designing and operating smart hospitality properties — where local mastery meets global standards to craft stay experiences worth telling and worth investing in."}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <h2>
              {lang === "ar" ? "قيمنا" : "Our Values"}
              <span className="gold-line" />
            </h2>
          </Reveal>
          <div className="value-grid">
            {VALUES.map((v, i) => (
              <Reveal key={v.ar.title} className="value-card" delay={i * 60}>
                <h3>{v[lang].title}</h3>
                <p>{v[lang].body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <Reveal className="section-head">
            <h2>
              {t("about_why")}
              <span className="gold-line" />
            </h2>
          </Reveal>
          <div className="why-grid">
            {whys.map((w, i) => (
              <Reveal key={w.title} className="why-card" delay={i * 70}>
                <span className="why-icon">{w.icon}</span>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <Reveal>
            <p
              style={{
                color: "var(--gold)",
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                marginBottom: 18,
              }}
            >
              {lang === "ar"
                ? "ابدأ تجربتك مع أفق — ضيافة استثنائية واستثمار ناجح"
                : "Start your journey with Horizon — exceptional hospitality, successful investment"}
            </p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <Link to="/" className="btn btn-gold">
                {t("explore_units")}
              </Link>
              <a href={WHATSAPP} target="_blank" rel="noreferrer" className="btn btn-outline">
                {t("contact_whatsapp")}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
