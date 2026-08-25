import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../lib/i18n";
import { fetchProperties, propertyPhotos, type Property } from "../lib/supabase";
import "../theme-options.css";

export type ThemeOptionKey = "option1" | "option2" | "option3" | "option4";

type ThemeOptionProps = { option: ThemeOptionKey };

const copy = {
  option1: {
    ar: { label: "الخيار 01 / المشهد السينمائي", title: "إقامة تُرى قبل أن تُحجز.", text: "صورة واحدة كبيرة، سعر واضح، ووصول مباشر إلى تفاصيل الإقامة.", action: "استكشف الإقامة", collection: "لقطات من المجموعة" },
    en: { label: "OPTION 01 / CINEMATIC STAY", title: "See the stay before you book it.", text: "One immersive frame, a clear price, and a direct route into the residence.", action: "Explore this stay", collection: "Frames from the collection" },
  },
  option2: {
    ar: { label: "الخيار 02 / دليل الرياض", title: "ابدأ من الحي الذي يناسب يومك.", text: "واجهة هادئة تنظّم خيارات الإقامة بحسب الحي، المساحة، وعدد الضيوف.", action: "فتح تفاصيل الإقامة", collection: "إقامات مختارة" },
    en: { label: "OPTION 02 / RIYADH GUIDE", title: "Begin with the district that fits your day.", text: "A calm planning view organized around neighbourhood, space, and guests.", action: "Open stay details", collection: "Selected stays" },
  },
  option3: {
    ar: { label: "الخيار 03 / مجلة الإقامة", title: "مساحة تتبدل مع إيقاع رحلتك.", text: "تنسيق تحريري دافئ يضع الصورة والتفاصيل قبل قرار الحجز.", action: "قراءة تفاصيل الإقامة", collection: "من دفتر Horizon" },
    en: { label: "OPTION 03 / STAY JOURNAL", title: "A space that moves with your trip.", text: "A warm editorial layout that puts imagery and practical details before the booking decision.", action: "Read stay details", collection: "From the Horizon journal" },
  },
  option4: {
    ar: { label: "الخيار 04 / لوحة الاكتشاف", title: "قارن، بدّل، واختر بسهولة.", text: "لوحة مرنة للصور والأسعار والمعلومات الأساسية دون زحام.", action: "اختيار هذه الإقامة", collection: "لوحة الإقامات" },
    en: { label: "OPTION 04 / DISCOVERY BOARD", title: "Compare, switch, and choose with ease.", text: "A flexible board for imagery, prices, and essentials without the clutter.", action: "Choose this stay", collection: "The stay board" },
  },
} as const;

const nameFor = (property: Property, lang: string) => (lang === "ar" ? property.name_ar : property.name_en) || property.name_en || property.name_ar;
const neighbourhoodFor = (property: Property, lang: string) => property.neighborhood || (lang === "ar" ? "الرياض" : "Riyadh");
const priceFor = (property: Property, lang: string) => `${property.price_per_night?.toLocaleString("en-US")} ${lang === "ar" ? "ر.س / ليلة" : "SAR / night"}`;
const photoFor = (property?: Property) => property ? propertyPhotos(property)[0] || "" : "";

function StayMeta({ property, lang }: { property: Property; lang: string }) {
  return <span className="theme-option-meta">
    {neighbourhoodFor(property, lang)} <i /> {property.bedrooms ? `${property.bedrooms} ${lang === "ar" ? "غرف" : "beds"}` : (lang === "ar" ? "استوديو" : "Studio")} <i /> {property.max_guests} {lang === "ar" ? "ضيوف" : "guests"}
  </span>;
}

function EmptyOption({ lang }: { lang: string }) {
  return <section className="theme-option-empty"><p>{lang === "ar" ? "يتم تجهيز الإقامات المعروضة…" : "Preparing the stays…"}</p></section>;
}

function OptionOne({ stays, lang }: { stays: Property[]; lang: string }) {
  const text = copy.option1[lang === "ar" ? "ar" : "en"];
  const lead = stays[0];
  if (!lead) return <EmptyOption lang={lang} />;
  const frames = stays.slice(1, 5);
  return <div className="theme-option option-one" dir={lang === "ar" ? "rtl" : "ltr"}>
    <section className="option-one-hero">
      <img className="option-one-hero-image" src={photoFor(lead)} alt={nameFor(lead, lang)} />
      <div className="option-one-shade" />
      <div className="option-one-copy">
        <span>{text.label}</span>
        <h1>{text.title}</h1>
        <p>{text.text}</p>
        <Link to={`/property/${lead.slug}`}>{text.action} <b>↗</b></Link>
      </div>
      <article className="option-one-rate">
        <span>{lang === "ar" ? "الإقامة في المشهد" : "In the frame"}</span>
        <strong>{nameFor(lead, lang)}</strong>
        <StayMeta property={lead} lang={lang} />
        <b>{priceFor(lead, lang)}</b>
      </article>
    </section>
    <section className="option-one-frames">
      <div><span>01</span><h2>{text.collection}</h2></div>
      <div className="option-one-frame-grid">
        {frames.map((stay, index) => <Link to={`/property/${stay.slug}`} className="option-one-frame" key={stay.id}>
          <img src={photoFor(stay)} alt={nameFor(stay, lang)} loading="lazy" />
          <span>0{index + 2}</span><b>{nameFor(stay, lang)}</b>
        </Link>)}
      </div>
    </section>
  </div>;
}

function OptionTwo({ stays, lang }: { stays: Property[]; lang: string }) {
  const text = copy.option2[lang === "ar" ? "ar" : "en"];
  const [selectedId, setSelectedId] = useState<number | null>(stays[0]?.id || null);
  useEffect(() => { if (!selectedId && stays[0]) setSelectedId(stays[0].id); }, [selectedId, stays]);
  const selected = stays.find((stay) => stay.id === selectedId) || stays[0];
  if (!selected) return <EmptyOption lang={lang} />;
  return <div className="theme-option option-two" dir={lang === "ar" ? "rtl" : "ltr"}>
    <section className="option-two-head"><span>{text.label}</span><h1>{text.title}</h1><p>{text.text}</p></section>
    <section className="option-two-layout">
      <aside className="option-two-list" aria-label={text.collection}>
        <div><span>02</span><h2>{text.collection}</h2></div>
        {stays.slice(0, 5).map((stay, index) => <button type="button" key={stay.id} className={stay.id === selected.id ? "active" : ""} onClick={() => setSelectedId(stay.id)} aria-pressed={stay.id === selected.id}>
          <small>0{index + 1}</small><strong>{nameFor(stay, lang)}</strong><span>{neighbourhoodFor(stay, lang)}</span>
        </button>)}
      </aside>
      <article className="option-two-feature">
        <img src={photoFor(selected)} alt={nameFor(selected, lang)} />
        <div className="option-two-feature-info"><span>{neighbourhoodFor(selected, lang)}</span><h2>{nameFor(selected, lang)}</h2><StayMeta property={selected} lang={lang} /><b>{priceFor(selected, lang)}</b><Link to={`/property/${selected.slug}`}>{text.action} <b>→</b></Link></div>
      </article>
      <aside className="option-two-facts">
        <span>{lang === "ar" ? "في لمحة" : "At a glance"}</span>
        <dl><div><dt>{lang === "ar" ? "الغرف" : "Bedrooms"}</dt><dd>{selected.bedrooms || "—"}</dd></div><div><dt>{lang === "ar" ? "الحمامات" : "Bathrooms"}</dt><dd>{selected.bathrooms || "—"}</dd></div><div><dt>{lang === "ar" ? "الضيوف" : "Guests"}</dt><dd>{selected.max_guests || "—"}</dd></div><div><dt>{lang === "ar" ? "المساحة" : "Area"}</dt><dd>{selected.area_m2 ? `${selected.area_m2} m²` : "—"}</dd></div></dl>
      </aside>
    </section>
  </div>;
}

function OptionThree({ stays, lang }: { stays: Property[]; lang: string }) {
  const text = copy.option3[lang === "ar" ? "ar" : "en"];
  const lead = stays[1] || stays[0];
  if (!lead) return <EmptyOption lang={lang} />;
  const images = propertyPhotos(lead).slice(0, 3);
  return <div className="theme-option option-three" dir={lang === "ar" ? "rtl" : "ltr"}>
    <section className="option-three-masthead"><span>{text.label}</span><span>HORIZON STAYS / RIYADH</span></section>
    <section className="option-three-story">
      <div className="option-three-title"><span>03 / {neighbourhoodFor(lead, lang)}</span><h1>{text.title}</h1><p>{text.text}</p><Link to={`/property/${lead.slug}`}>{text.action} <b>↗</b></Link></div>
      <figure className="option-three-lead-image"><img src={images[0] || photoFor(lead)} alt={nameFor(lead, lang)} /><figcaption><strong>{nameFor(lead, lang)}</strong><span>{priceFor(lead, lang)}</span></figcaption></figure>
      <aside className="option-three-note"><span>{lang === "ar" ? "تفاصيل الإقامة" : "Stay details"}</span><StayMeta property={lead} lang={lang} /><p>{lead.description_ar || (lang === "ar" ? "تفاصيل الوحدة وصورها متاحة داخل صفحة الإقامة." : "The residence details and photography are available inside the stay page.")}</p></aside>
    </section>
    <section className="option-three-notes"><div><span>04</span><h2>{text.collection}</h2></div>{stays.slice(0, 3).map((stay) => <Link to={`/property/${stay.slug}`} key={stay.id} className="option-three-note-card"><img src={photoFor(stay)} alt={nameFor(stay, lang)} loading="lazy" /><span>{neighbourhoodFor(stay, lang)}</span><strong>{nameFor(stay, lang)}</strong><b>{priceFor(stay, lang)}</b></Link>)}</section>
  </div>;
}

function OptionFour({ stays, lang }: { stays: Property[]; lang: string }) {
  const text = copy.option4[lang === "ar" ? "ar" : "en"];
  const [selectedId, setSelectedId] = useState<number | null>(stays[0]?.id || null);
  const selected = stays.find((stay) => stay.id === selectedId) || stays[0];
  if (!selected) return <EmptyOption lang={lang} />;
  const previewPhotos = propertyPhotos(selected).slice(0, 4);
  return <div className="theme-option option-four" dir={lang === "ar" ? "rtl" : "ltr"}>
    <section className="option-four-intro"><div><span>{text.label}</span><h1>{text.title}</h1><p>{text.text}</p></div><p className="option-four-count">{stays.length}<small>{lang === "ar" ? "إقامة للعرض" : "stays to view"}</small></p></section>
    <section className="option-four-switcher" aria-label={text.collection}>{stays.slice(0, 6).map((stay, index) => <button type="button" className={stay.id === selected.id ? "active" : ""} onClick={() => setSelectedId(stay.id)} aria-pressed={stay.id === selected.id} key={stay.id}><span>0{index + 1}</span>{nameFor(stay, lang)}</button>)}</section>
    <section className="option-four-board">
      <div className="option-four-gallery"><img className="option-four-main" src={previewPhotos[0] || photoFor(selected)} alt={nameFor(selected, lang)} />{previewPhotos.slice(1).map((photo, index) => <img key={photo} src={photo} alt="" loading="lazy" className={`option-four-detail option-four-detail-${index + 1}`} />)}</div>
      <article className="option-four-card"><span>{neighbourhoodFor(selected, lang)}</span><h2>{nameFor(selected, lang)}</h2><StayMeta property={selected} lang={lang} /><div><b>{priceFor(selected, lang)}</b><p>{selected.description_ar || (lang === "ar" ? "صور وتفاصيل الإقامة متاحة قبل الحجز." : "Photography and stay details are available before booking.")}</p></div><Link to={`/property/${selected.slug}`}>{text.action} <b>→</b></Link></article>
    </section>
  </div>;
}

export default function ThemeOption({ option }: ThemeOptionProps) {
  const { lang } = useLang();
  const [stays, setStays] = useState<Property[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => { fetchProperties().then(setStays).catch(() => setFailed(true)); }, []);
  const selectedStays = useMemo(() => stays.slice(0, 6), [stays]);
  if (failed) return <section className="theme-option-empty"><p>{lang === "ar" ? "تعذر تجهيز خيارات الإقامات الآن." : "The stay options could not be prepared right now."}</p></section>;
  if (!selectedStays.length) return <EmptyOption lang={lang} />;
  if (option === "option1") return <OptionOne stays={selectedStays} lang={lang} />;
  if (option === "option2") return <OptionTwo stays={selectedStays} lang={lang} />;
  if (option === "option3") return <OptionThree stays={selectedStays} lang={lang} />;
  return <OptionFour stays={selectedStays} lang={lang} />;
}
