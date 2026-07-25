import { Link } from "react-router-dom";
import { useLang } from "../lib/i18n";
import { Reveal } from "../lib/motion";

const WHATSAPP = "https://wa.me/966560903335";

type ValueLoc = { title: string; body: string };
type ValueEntry = Record<string, ValueLoc | undefined> & { ar: ValueLoc; en: ValueLoc };

const VALUES: ValueEntry[] = [
  {
    ar: { title: "الإتقان في التفاصيل", body: "كل تفصيلة صغيرة نحرص عليها تصنع فرقاً كبيراً في تجربة كل ضيف." },
    en: { title: "Mastery of Detail", body: "Every small detail we perfect makes a big difference in each guest's experience." },
    zh: { title: "匠心细节", body: "我们精雕细琢的每一个小细节，都会在每位宾客的体验中带来巨大不同。" },
    fr: { title: "La maîtrise du détail", body: "Chaque petit détail que nous peaufinons fait une grande différence dans l'expérience de chaque hôte." },
    es: { title: "Maestría en los detalles", body: "Cada pequeño detalle que perfeccionamos marca una gran diferencia en la experiencia de cada huésped." },
  },
  {
    ar: { title: "ضيافة بروح سعودية", body: "طاقم أفق سعودي 100% يجمع بين الاحترافية والضيافة الأصيلة." },
    en: { title: "Saudi-Spirited Hospitality", body: "Our 100% Saudi team combines professionalism with authentic hospitality." },
    zh: { title: "沙特精神的款待", body: "我们 100% 沙特本土的团队，将专业精神与地道的款待之道融为一体。" },
    fr: { title: "Hospitalité à l'âme saoudienne", body: "Notre équipe 100 % saoudienne allie professionnalisme et hospitalité authentique." },
    es: { title: "Hospitalidad de espíritu saudí", body: "Nuestro equipo 100 % saudí combina profesionalidad con hospitalidad auténtica." },
  },
  {
    ar: { title: "الشفافية والثقة", body: "شراكتنا مع الملاك مبنية على وضوح كامل وموثوقية في كل خطوة." },
    en: { title: "Transparency & Trust", body: "Our owner partnerships are built on full clarity and reliability at every step." },
    zh: { title: "透明与信任", body: "我们与业主的合作建立在完全透明与每一步的可靠之上。" },
    fr: { title: "Transparence et confiance", body: "Nos partenariats avec les propriétaires reposent sur une clarté totale et une fiabilité à chaque étape." },
    es: { title: "Transparencia y confianza", body: "Nuestras alianzas con propietarios se basan en total claridad y fiabilidad en cada paso." },
  },
  {
    ar: { title: "التجربة أولاً", body: "دائماً في قلب كل قرار نتخذه لضمان تجربة سلسة ومميزة للعميل." },
    en: { title: "Experience First", body: "At the heart of every decision we make — a seamless, memorable guest experience." },
    zh: { title: "体验至上", body: "流畅、难忘的宾客体验，始终是我们每个决策的核心。" },
    fr: { title: "L'expérience d'abord", body: "Au cœur de chacune de nos décisions : une expérience client fluide et mémorable." },
    es: { title: "La experiencia primero", body: "En el corazón de cada decisión: una experiencia de huésped fluida y memorable." },
  },
  {
    ar: { title: "التطوير المستمر", body: "نواكب السوق ونبتكر حلولاً ذكية لزيادة عائد الاستثمار وتحسين الأداء." },
    en: { title: "Continuous Improvement", body: "We track the market and innovate smart solutions to raise ROI and performance." },
    zh: { title: "持续改进", body: "我们紧跟市场，不断创新智能方案，提升投资回报与运营表现。" },
    fr: { title: "Amélioration continue", body: "Nous suivons le marché et innovons avec des solutions intelligentes pour augmenter le rendement et la performance." },
    es: { title: "Mejora continua", body: "Seguimos el mercado e innovamos con soluciones inteligentes para aumentar el ROI y el rendimiento." },
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
          style={{ backgroundImage: "url(https://bwffhalzuvvmuzjfmdyp.supabase.co/storage/v1/object/public/property-images/duplex-penthouse-4bd-1.webp)" }}
        />
        <div className="container">
          <Reveal>
            <h1>{t("about_h1")}</h1>
            <p>{t("about_lead")}</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <Reveal className="about-text">
            <p className="prose">{t("about_body1")}</p>
            <p className="prose" style={{ marginTop: 14 }}>{t("about_body2")}</p>
          </Reveal>
          <Reveal className="about-img" delay={100}>
            <img src="https://bwffhalzuvvmuzjfmdyp.supabase.co/storage/v1/object/public/property-images/royal-suite-3bd-1.webp" alt="Horizon Stays" loading="lazy" />
          </Reveal>
        </div>
      </section>

      <section className="section alt">
        <div className="container mv-grid">
          <Reveal className="mv-card">
            <h3>{t("about_mission_t")}</h3>
            <p>{t("about_mission")}</p>
          </Reveal>
          <Reveal className="mv-card" delay={90}>
            <h3>{t("about_vision_t")}</h3>
            <p>{t("about_vision")}</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <h2>
              {t("our_values")}
              <span className="gold-line" />
            </h2>
          </Reveal>
          <div className="value-grid">
            {VALUES.map((v, i) => {
              const loc = v[lang] || v.en;
              return (
                <Reveal key={v.ar.title} className="value-card" delay={i * 60}>
                  <h3>{loc.title}</h3>
                  <p>{loc.body}</p>
                </Reveal>
              );
            })}
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
              {t("about_cta")}
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
