import { Link } from "react-router-dom";
import { useLang } from "../lib/i18n";

const WHATSAPP = "https://wa.me/966920035843";

export default function Services() {
  const { lang } = useLang();
  const isArabic = lang === "ar";
  const copy = isArabic
    ? {
        eyebrow: "HORIZON SERVICES / للملاك",
        title: "خدمات تشغيل تجعل وحدتك أوضح وأسهل للضيف.",
        intro: "إذا كنت تملك أو تدير وحدة مميزة في الرياض، تساعدك Horizon Stays في تقديمها بصورة منظمة وربط تفاصيلها بتجربة ضيف واضحة.",
        blocks: [
          ["تجهيز الوحدة للعرض", "تنظيم صور الوحدة، تفاصيلها الأساسية، وتجهيزاتها حتى يرى الضيف ما يحتاجه قبل الحجز."],
          ["إدارة التوفر والأسعار", "إبقاء التواريخ وأسعار الإقامة منظمة، مع مساحة لمراجعة التغيرات الموسمية وقنوات الحجز."],
          ["تنسيق تجربة الضيف", "تجهيز مسار واضح للاستفسار والحجز والوصول، بما يناسب أسلوب تشغيل وحدتك."],
        ],
        cta: "تواصل معنا بخصوص وحدتك",
        back: "اكتشف الإقامات",
      }
    : {
        eyebrow: "HORIZON SERVICES / FOR OWNERS",
        title: "Operating services that make your residence clearer and easier for guests.",
        intro: "If you own or manage a distinctive Riyadh residence, Horizon Stays can help organise its presentation and connect its details to a clearer guest experience.",
        blocks: [
          ["Prepare your residence for discovery", "Organise photography, core residence details, and amenities so guests understand what they are choosing before they book."],
          ["Manage availability and pricing", "Keep stay dates and pricing organised, with room to review seasonal changes and booking channels."],
          ["Coordinate the guest journey", "Set up a clearer route for enquiry, booking, and arrival that fits the way you operate your residence."],
        ],
        cta: "Talk to us about your residence",
        back: "Explore stays",
      };

  return (
    <div className="container section horizon-info-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="horizon-info-hero">
        <span>{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </section>
      <section className="horizon-service-grid" aria-label={isArabic ? "خدمات Horizon للملاك" : "Horizon owner services"}>
        {copy.blocks.map(([title, text], index) => (
          <article key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <section className="horizon-info-cta">
        <p>{isArabic ? "نبدأ بمراجعة طريقة عرض وحدتك واحتياجها التشغيلي." : "We begin by reviewing how your residence is presented and what its operation needs."}</p>
        <div>
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="horizon-primary-btn">{copy.cta} <span aria-hidden>↗</span></a>
          <Link to="/" className="horizon-secondary-link">{copy.back} <span aria-hidden>→</span></Link>
        </div>
      </section>
    </div>
  );
}
