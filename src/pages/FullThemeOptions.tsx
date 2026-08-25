import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MapFrame from "../components/MapFrame";
import { useLang } from "../lib/i18n";
import { fetchProperties, propertyPhotos, type Property } from "../lib/supabase";
import "../full-theme-options.css";

export type FullThemeOption = "option5" | "option6" | "option7" | "option8";
type Props = { option: FullThemeOption };

const copy = {
  option5: {
    ar: { eyebrow: "Option 05 / سوق الإقامات", title: "ابحث عن مساحة تلائم رحلتك إلى الرياض.", text: "ابدأ بالإقامة، الحي، والسعر الواضح. كل صورة وتفصيل هنا مرتبط بوحدة حقيقية.", browse: "عرض الإقامات", featured: "إقامات جاهزة للاكتشاف", map: "اختر الحي أولاً", guide: "خطوة واضحة قبل الحجز", process: ["اختر مساحة", "راجع التواريخ", "أكمل طلب الحجز"] },
    en: { eyebrow: "OPTION 05 / STAY MARKETPLACE", title: "Find a space that fits your time in Riyadh.", text: "Begin with the stay, the district, and a clear starting price. Every photograph and detail belongs to a real residence.", browse: "Browse stays", featured: "Ready to explore", map: "Begin with the district", guide: "A clear path before booking", process: ["Choose a space", "Review your dates", "Continue to booking"] },
  },
  option6: {
    ar: { eyebrow: "Option 06 / المجموعة", title: "مجموعة هادئة من مساحات الرياض.", text: "نمط تحريري عميق يجمع الصورة الكبيرة مع الحقائق التي تحتاجها قبل اتخاذ القرار.", browse: "افتح تفاصيل الإقامة", featured: "داخل المجموعة", map: "كل طريق يبدأ من موقع", guide: "تفاصيل مفيدة، بلا ضجيج", process: ["استكشف المجموعة", "قارن التفاصيل", "انتقل للحجز"] },
    en: { eyebrow: "OPTION 06 / THE COLLECTION", title: "A quieter collection of Riyadh spaces.", text: "A deep editorial experience that combines an immersive image with the facts you need before deciding.", browse: "Open stay details", featured: "Inside the collection", map: "Every route begins with a place", guide: "Useful details, without the noise", process: ["Explore the collection", "Compare the details", "Continue to booking"] },
  },
  option7: {
    ar: { eyebrow: "Option 07 / مخطط الرحلة", title: "رتّب إقامتك كما ترتّب يومك.", text: "صفحة خفيفة تبدأ بالاختيار العملي، ثم تعرض الوحدات والأحياء قبل أن تنتقل للحجز.", browse: "ابدأ الاختيار", featured: "خيارات حسب أسلوب الرحلة", map: "صورة أوسع للمدينة", guide: "ثلاث محطات لقرار أسرع", process: ["حدد أولوياتك", "قارن الوحدات", "اختر تواريخك"] },
    en: { eyebrow: "OPTION 07 / TRIP PLANNER", title: "Plan your stay the way you plan your day.", text: "A lighter page that starts with practical choices, then reveals stays and districts before you move to booking.", browse: "Start choosing", featured: "Choices for your trip", map: "A wider view of the city", guide: "Three stops to a clearer decision", process: ["Set your priorities", "Compare the stays", "Choose your dates"] },
  },
  option8: {
    ar: { eyebrow: "Option 08 / بيت Horizon", title: "إقامات فيها مساحة للحياة اليومية.", text: "واجهة دافئة ومفتوحة تضع الصور، التفاصيل، والوصول للحجز في مكان واحد مريح.", browse: "اكتشف الإقامات", featured: "زوايا من الإقامات", map: "الإقامة تبدأ من مكانها", guide: "من الصورة إلى قرار الإقامة", process: ["شاهد المساحة", "تعرّف على الحي", "تابع للحجز"] },
    en: { eyebrow: "OPTION 08 / HORIZON HOUSE", title: "Stays with room for everyday living.", text: "A warm, open page that brings imagery, stay details, and the booking path together in one comfortable place.", browse: "Discover stays", featured: "Corners of the stays", map: "A stay begins with its place", guide: "From image to stay decision", process: ["See the space", "Get to know the district", "Continue to booking"] },
  },
} as const;

const isArabic = (lang: string) => lang === "ar";
const stayName = (p: Property, lang: string) => isArabic(lang) ? p.name_ar || p.name_en : p.name_en || p.name_ar;
const stayArea = (p: Property, lang: string) => p.neighborhood || (isArabic(lang) ? "الرياض" : "Riyadh");
const stayPrice = (p: Property, lang: string) => `${new Intl.NumberFormat(isArabic(lang) ? "ar-SA" : "en-US").format(p.price_per_night)} ${isArabic(lang) ? "ر.س / ليلة" : "SAR / night"}`;
const primaryPhoto = (p: Property) => propertyPhotos(p)[0] || "";
const factualDescription = (p: Property, lang: string) => isArabic(lang) && p.description_ar ? p.description_ar.slice(0, 160) : `${p.bedrooms ? `${p.bedrooms} ${isArabic(lang) ? "غرف نوم" : "bedrooms"}` : (isArabic(lang) ? "استوديو" : "Studio")} · ${p.max_guests} ${isArabic(lang) ? "ضيوف" : "guests"}${p.area_m2 ? ` · ${p.area_m2} m²` : ""}`;

function Loading({ lang }: { lang: string }) { return <section className="full-option-loading">{isArabic(lang) ? "يتم تجهيز الإقامات…" : "Preparing stays…"}</section>; }

function Meta({ stay, lang }: { stay: Property; lang: string }) {
  return <span className="full-stay-meta"><span>{stayArea(stay, lang)}</span><i /> <span>{stay.bedrooms ? `${stay.bedrooms} ${isArabic(lang) ? "غرف" : "beds"}` : (isArabic(lang) ? "استوديو" : "Studio")}</span><i /> <span>{stay.max_guests} {isArabic(lang) ? "ضيوف" : "guests"}</span></span>;
}

function StayCard({ stay, lang, variant = "standard" }: { stay: Property; lang: string; variant?: "standard" | "wide" | "tile" }) {
  return <article className={`full-stay-card full-stay-card-${variant}`}>
    <Link to={`/property/${stay.slug}`} aria-label={stayName(stay, lang)}><img src={primaryPhoto(stay)} alt={stayName(stay, lang)} loading="lazy" /></Link>
    <div><Meta stay={stay} lang={lang} /><h3>{stayName(stay, lang)}</h3><p>{factualDescription(stay, lang)}</p><div className="full-stay-card-bottom"><b>{stayPrice(stay, lang)}</b><Link to={`/property/${stay.slug}`}>{isArabic(lang) ? "التفاصيل" : "Details"} <span>↗</span></Link></div></div>
  </article>;
}

function Steps({ values, lang, title }: { values: readonly string[]; lang: string; title: string }) {
  return <section className="full-option-steps"><div className="full-section-label"><span>02</span><h2>{title}</h2></div><ol>{values.map((value, index) => <li key={value}><small>0{index + 1}</small><strong>{value}</strong><p>{isArabic(lang) ? "انتقل إلى التفاصيل الفعلية للوحدة قبل بدء الحجز." : "Move into the actual stay details before beginning the booking path."}</p></li>)}</ol></section>;
}

function MapBlock({ stays, lang, title }: { stays: Property[]; lang: "ar" | "en"; title: string }) {
  return <section className="full-option-map"><div className="full-section-label"><span>04</span><h2>{title}</h2></div><MapFrame locations={stays} lang={lang} variant="collection" /></section>;
}

function FooterNudge({ lang }: { lang: string }) {
  return <section className="full-option-nudge"><p>{isArabic(lang) ? "تحتاج مساعدة في تحديد المساحة المناسبة؟" : "Need help choosing a suitable space?"}</p><Link to="/contact">{isArabic(lang) ? "تواصل مع Horizon" : "Contact Horizon"} <span>→</span></Link></section>;
}

function OptionFive({ stays, lang }: { stays: Property[]; lang: string }) {
  const t = copy.option5[isArabic(lang) ? "ar" : "en"]; const lead = stays[0]; const districts = new Set(stays.map((stay) => stay.neighborhood).filter(Boolean)).size;
  if (!lead) return <Loading lang={lang} />;
  return <div className="full-option option-five" dir={isArabic(lang) ? "rtl" : "ltr"}>
    <section className="five-hero"><div className="five-hero-copy"><span>{t.eyebrow}</span><h1>{t.title}</h1><p>{t.text}</p><div className="five-search"><span>{isArabic(lang) ? "الرياض" : "Riyadh"}</span><span>{isArabic(lang) ? "تواريخك داخل صفحة الإقامة" : "Dates inside the stay page"}</span><Link to={`/property/${lead.slug}`}>{t.browse} <b>→</b></Link></div></div><img src={primaryPhoto(lead)} alt={stayName(lead, lang)} /><article className="five-hero-stay"><small>{isArabic(lang) ? "إقامة بارزة" : "Featured stay"}</small><h2>{stayName(lead, lang)}</h2><Meta stay={lead} lang={lang} /><b>{stayPrice(lead, lang)}</b></article></section>
    <section className="five-proof"><div><b>{stays.length}</b><span>{isArabic(lang) ? "إقامة متاحة للعرض" : "stays to explore"}</span></div><div><b>{districts || "—"}</b><span>{isArabic(lang) ? "أحياء ضمن الاختيارات" : "districts in the selection"}</span></div><p>{isArabic(lang) ? "الصور والأسعار الظاهرة تعود للوحدات نفسها، والتوفر النهائي يظهر بعد تحديد التواريخ." : "Visible images and starting prices belong to the stays themselves; final availability appears after dates are chosen."}</p></section>
    <section className="five-showcase"><div className="full-section-label"><span>01</span><h2>{t.featured}</h2><Link to="/">{isArabic(lang) ? "كل الإقامات" : "All stays"} →</Link></div><div className="five-cards">{stays.slice(0, 4).map((stay) => <StayCard stay={stay} lang={lang} key={stay.id} />)}</div></section>
    <Steps values={t.process} lang={lang} title={t.guide} /><MapBlock stays={stays} lang={isArabic(lang) ? "ar" : "en"} title={t.map} /><FooterNudge lang={lang} />
  </div>;
}

function OptionSix({ stays, lang }: { stays: Property[]; lang: string }) {
  const t = copy.option6[isArabic(lang) ? "ar" : "en"]; const lead = stays[1] || stays[0]; if (!lead) return <Loading lang={lang} />;
  return <div className="full-option option-six" dir={isArabic(lang) ? "rtl" : "ltr"}>
    <section className="six-opening"><div className="six-opening-top"><span>{t.eyebrow}</span><span>HORIZON STAYS / RIYADH</span></div><div className="six-opening-copy"><h1>{t.title}</h1><p>{t.text}</p><Link to={`/property/${lead.slug}`}>{t.browse} <b>↗</b></Link></div><figure><img src={primaryPhoto(lead)} alt={stayName(lead, lang)} /><figcaption><span>01 / {stayArea(lead, lang)}</span><strong>{stayName(lead, lang)}</strong><b>{stayPrice(lead, lang)}</b></figcaption></figure></section>
    <section className="six-rail"><div className="full-section-label"><span>02</span><h2>{t.featured}</h2></div><div className="six-rail-items">{stays.slice(0, 5).map((stay, index) => <Link to={`/property/${stay.slug}`} key={stay.id}><small>0{index + 1}</small><img src={primaryPhoto(stay)} alt={stayName(stay, lang)} loading="lazy" /><span>{stayArea(stay, lang)}</span><strong>{stayName(stay, lang)}</strong><b>{stayPrice(stay, lang)}</b></Link>)}</div></section>
    <section className="six-editorial"><div><span>{isArabic(lang) ? "تفاصيل الإقامة" : "Stay details"}</span><h2>{isArabic(lang) ? "صور واضحة، ومعلومات تساعد على الاختيار." : "Clear photography and details that support a decision."}</h2></div><p>{isArabic(lang) ? "تفتح كل إقامة صفحتها الخاصة لتظهر سعر التواريخ التي تختارها، وتوفرها، والتفاصيل قبل متابعة الحجز." : "Each residence opens its own page to show your selected-date price, availability, and stay details before you continue to booking."}</p><Link to={`/property/${lead.slug}`}>{isArabic(lang) ? "عرض تفاصيل الإقامة" : "View stay details"} →</Link></section>
    <MapBlock stays={stays} lang={isArabic(lang) ? "ar" : "en"} title={t.map} /><Steps values={t.process} lang={lang} title={t.guide} /><FooterNudge lang={lang} />
  </div>;
}

function OptionSeven({ stays, lang }: { stays: Property[]; lang: string }) {
  const t = copy.option7[isArabic(lang) ? "ar" : "en"]; const lead = stays[2] || stays[0]; if (!lead) return <Loading lang={lang} />;
  return <div className="full-option option-seven" dir={isArabic(lang) ? "rtl" : "ltr"}>
    <section className="seven-hero"><div className="seven-hero-top"><span>{t.eyebrow}</span><span>{isArabic(lang) ? "الرياض / الإقامة" : "RIYADH / STAYS"}</span></div><div className="seven-hero-layout"><div><h1>{t.title}</h1><p>{t.text}</p><Link to="#seven-stays">{t.browse} <b>↓</b></Link></div><div className="seven-plan"><small>{isArabic(lang) ? "مخطط سريع" : "QUICK PLAN"}</small>{t.process.map((item, index) => <div key={item}><b>0{index + 1}</b><span>{item}</span></div>)}</div><img src={primaryPhoto(lead)} alt={stayName(lead, lang)} /></div></section>
    <section className="seven-stays" id="seven-stays"><div className="full-section-label"><span>01</span><h2>{t.featured}</h2></div><div className="seven-stay-grid">{stays.slice(0, 6).map((stay, index) => <article key={stay.id} className={`seven-stay seven-stay-${index + 1}`}><StayCard stay={stay} lang={lang} variant={index === 0 ? "wide" : "tile"} /></article>)}</div></section>
    <section className="seven-notes"><div><span>03</span><h2>{isArabic(lang) ? "تفاصيل تساعدك قبل الانتقال للحجز." : "Details that help before you move to booking."}</h2></div><div><p>{isArabic(lang) ? "افتح أي إقامة لمعرفة صورها، سعرها الأساسي، وسعرها لتواريخك، ثم أكمل عبر مسار الحجز المتاح." : "Open any stay to see its imagery, starting price, selected-date price, and then continue via the available booking path."}</p><Link to={`/property/${lead.slug}`}>{isArabic(lang) ? "ابدأ من هذه الإقامة" : "Begin with this stay"} ↗</Link></div></section>
    <MapBlock stays={stays} lang={isArabic(lang) ? "ar" : "en"} title={t.map} /><FooterNudge lang={lang} />
  </div>;
}

function OptionEight({ stays, lang }: { stays: Property[]; lang: string }) {
  const t = copy.option8[isArabic(lang) ? "ar" : "en"]; const lead = stays[3] || stays[0]; if (!lead) return <Loading lang={lang} />;
  const mosaic = [lead, ...stays.filter((stay) => stay.id !== lead.id)].slice(0, 5);
  return <div className="full-option option-eight" dir={isArabic(lang) ? "rtl" : "ltr"}>
    <section className="eight-hero"><div className="eight-copy"><span>{t.eyebrow}</span><h1>{t.title}</h1><p>{t.text}</p><Link to={`/property/${lead.slug}`}>{t.browse} <b>→</b></Link></div><div className="eight-mosaic">{mosaic.map((stay, index) => <Link to={`/property/${stay.slug}`} className={`eight-photo eight-photo-${index + 1}`} key={stay.id}><img src={primaryPhoto(stay)} alt={stayName(stay, lang)} loading={index === 0 ? "eager" : "lazy"} /><span>{index === 0 ? stayName(stay, lang) : `0${index + 1}`}</span></Link>)}</div></section>
    <section className="eight-intro"><div><span>01</span><h2>{t.featured}</h2></div><p>{isArabic(lang) ? "كل بطاقة تأخذك إلى صفحة الإقامة نفسها، حيث تستطيع مراجعة الصور والتوفر قبل إرسال طلب الحجز." : "Every card leads to the stay itself, where you can review photography and availability before sending a booking request."}</p><Link to="/">{isArabic(lang) ? "تصفح كل الإقامات" : "Browse all stays"} →</Link></section>
    <section className="eight-cards">{stays.slice(0, 3).map((stay) => <StayCard stay={stay} lang={lang} key={stay.id} variant="wide" />)}</section>
    <Steps values={t.process} lang={lang} title={t.guide} /><MapBlock stays={stays} lang={isArabic(lang) ? "ar" : "en"} title={t.map} /><FooterNudge lang={lang} />
  </div>;
}

export default function FullThemeOptionPage({ option }: Props) {
  const { lang } = useLang(); const [stays, setStays] = useState<Property[]>([]); const [failed, setFailed] = useState(false);
  useEffect(() => { fetchProperties().then(setStays).catch(() => setFailed(true)); }, []);
  const selected = useMemo(() => stays.slice(0, 8), [stays]);
  if (failed) return <section className="full-option-loading">{isArabic(lang) ? "تعذر تجهيز هذه الصفحة الآن." : "This page could not be prepared right now."}</section>;
  if (!selected.length) return <Loading lang={lang} />;
  if (option === "option5") return <OptionFive stays={selected} lang={lang} />;
  if (option === "option6") return <OptionSix stays={selected} lang={lang} />;
  if (option === "option7") return <OptionSeven stays={selected} lang={lang} />;
  return <OptionEight stays={selected} lang={lang} />;
}
