import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProperties, propertyPhotos, type Property } from "../lib/supabase";
import { useTheme } from "../lib/ThemeContext";
import { useLang, neighborhoodLabel, propName } from "../lib/i18n";
import { EditorContentContext } from "./ThemeEditor";
import MapFrame from "../components/MapFrame";

const WHATSAPP = "https://wa.me/966920035843";
const FALLBACK_HERO = "https://bwffhalzuvvmuzjfmdyp.supabase.co/storage/v1/object/public/property-images/kafd-penthouse-3bd-1.webp";

type Copy = {
  browseKicker: string;
  browseTitle: string;
  browseText: string;
  results: (count: number) => string;
  storyKicker: string;
  storyTitle: string;
  mapKicker: string;
  mapTitle: string;
  mapText: string;
  explore: string;
  contact: string;
  perNight: string;
  location: string;
  heroCaption: string;
  serviceItems: Array<{ title: string; text: string }>;
  storyItems: Array<{ title: string; text: string }>;
};

function getCopy(lang: string): Copy {
  if (lang === "ar") {
    return {
      browseKicker: "01 / اكتشف الإقامة",
      browseTitle: "مساحات لها طابعها الخاص.",
      browseText: "اختر الإيقاع الذي يناسب رحلتك، من بنتهاوسات واسعة إلى أجنحة هادئة داخل أكثر أحياء الرياض حيوية.",
      results: (count) => `${count} وحدة متاحة للاستكشاف`,
      storyKicker: "02 / معيار هورايزن",
      storyTitle: "تفاصيل تعطي الإقامة <em>معناها.</em>",
      mapKicker: "03 / في قلب المدينة",
      mapTitle: "قريب من كل ما يهمك.",
      mapText: "تنتشر وحداتنا في أحياء مختارة في الرياض. استكشف المواقع، ثم اختر المساحة التي تناسب جدولك.",
      explore: "اكتشف الوحدات",
      contact: "تحدث معنا",
      perNight: "لليلة",
      location: "الرياض",
      heroCaption: "إقامة مختارة بعناية، على طريقتك.",
      serviceItems: [
        { title: "حجز مباشر", text: "تواصل واضح وسريع لبدء ترتيبات الإقامة." },
        { title: "توفر متجدد", text: "التقويم مرتبط بقنوات الوحدات لتبقى الخيارات واضحة." },
        { title: "مساحات كاملة", text: "صور وتفاصيل عملية تساعدك على اتخاذ القرار قبل الوصول." },
      ],
      storyItems: [
        { title: "اختيار مدروس", text: "كل وحدة تُعرض بتفاصيلها الأساسية وموقعها ضمن المدينة." },
        { title: "تجربة مرنة", text: "من الليالي السريعة إلى الإقامات الأطول، مع أسعار حسب تاريخك." },
        { title: "دعم حاضر", text: "فريق Horizon Stays حاضر لمساعدتك قبل الإقامة وأثناءها." },
      ],
    };
  }

  return {
    browseKicker: "01 / Explore stays",
    browseTitle: "Spaces with their own point of view.",
    browseText: "Choose the rhythm that fits your trip—from expansive penthouses to quiet suites across Riyadh’s most connected districts.",
    results: (count) => `${count} stays to explore`,
    storyKicker: "02 / The Horizon standard",
    storyTitle: "Details that give a stay its <em>meaning.</em>",
    mapKicker: "03 / In the heart of the city",
    mapTitle: "Close to what matters.",
    mapText: "Our stays are set across selected Riyadh districts. Explore the collection, then choose the space that works with your schedule.",
    explore: "Explore stays",
    contact: "Talk to us",
    perNight: "per night",
    location: "Riyadh",
    heroCaption: "A considered stay, on your terms.",
    serviceItems: [
      { title: "Direct booking", text: "A clear, quick conversation to begin arranging your stay." },
      { title: "Updated availability", text: "Connected calendars keep the available dates visible and current." },
      { title: "Complete spaces", text: "Photographs and practical details help you decide before arrival." },
    ],
    storyItems: [
      { title: "Considered selection", text: "Every stay is shown with its essential details and place in the city." },
      { title: "Flexible rhythm", text: "From quick nights to longer stays, with prices resolved for your dates." },
      { title: "Present support", text: "The Horizon Stays team is here before and throughout your stay." },
    ],
  };
}

export default function Home() {
  const { content: liveContent, featureFlags } = useTheme();
  const editorContent = useContext(EditorContentContext);
  const content = editorContent || liveContent;
  const { lang, t } = useLang();
  const copy = getCopy(lang);
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchProperties().then(setProperties).catch((cause) => setError(String(cause?.message || cause)));
  }, []);

  const filters = useMemo(
    () => [
      { key: "all", label: lang === "ar" ? "الكل" : "All stays" },
      { key: "studio", label: lang === "ar" ? "استوديو" : "Studio" },
      { key: "1", label: lang === "ar" ? "غرفة واحدة" : "1 bedroom" },
      { key: "2", label: lang === "ar" ? "غرفتان" : "2 bedrooms" },
      { key: "3+", label: lang === "ar" ? "3 غرف أو أكثر" : "3+ bedrooms" },
    ],
    [lang]
  );

  const filteredProperties = useMemo(() => {
    if (!properties) return null;
    if (filter === "all") return properties;
    if (filter === "studio") return properties.filter((property) => property.bedrooms === 0);
    if (filter === "3+") return properties.filter((property) => property.bedrooms >= 3);
    return properties.filter((property) => property.bedrooms === Number(filter));
  }, [filter, properties]);

  const visibleProperties = useMemo(() => {
    if (!filteredProperties) return null;
    return filter === "all" && !showAll ? filteredProperties.slice(0, 5) : filteredProperties;
  }, [filter, filteredProperties, showAll]);

  const featured = properties?.[0];
  const featuredName = featured ? propName(featured, lang) : content.brandEn;
  const featuredImage = featured ? propertyPhotos(featured)[0] || FALLBACK_HERO : FALLBACK_HERO;
  const heroTitle = lang === "ar" && content.heroTitle ? content.heroTitle : lang === "ar" ? "إقامة استثنائية في قلب الرياض" : "A stay with a sense of place.";
  const heroSubtitle = lang === "ar" && content.heroSubtitle ? content.heroSubtitle : lang === "ar" ? "وحدات مختارة بعناية، بتفاصيل واضحة وحجز مباشر." : "Considered residences, clear details and a direct way to book.";
  const heroBadge = lang === "ar" && content.heroBadge ? content.heroBadge : lang === "ar" ? "إقامات مختارة في الرياض" : "A curated Riyadh collection";

  return (
    <div className="horizon-public">
      <section className="horizon-hero">
        <div className="container horizon-hero-grid">
          <div className="horizon-hero-copy">
            <div>
              <span className="horizon-kicker">{heroBadge}</span>
              <h1>{heroTitle}</h1>
              <p className="horizon-hero-lead">{heroSubtitle}</p>
              <div className="horizon-hero-actions">
                <a className="horizon-primary-btn" href="#collection">{copy.explore}</a>
                {featureFlags.booking_whatsapp && <a className="horizon-quiet-btn" href={WHATSAPP} target="_blank" rel="noreferrer">{copy.contact} <span aria-hidden>↗</span></a>}
              </div>
            </div>
            <div className="horizon-hero-note">
              <b>{properties?.length || "25"}+</b>
              <span>{lang === "ar" ? "وحدة سكنية مختارة في الرياض" : "Curated residences across Riyadh"}</span>
            </div>
          </div>
          <div className="horizon-hero-media">
            <img src={featuredImage} alt={featuredName} fetchPriority="high" />
            <div className="horizon-hero-media-caption">
              <div>
                <span>{copy.heroCaption}</span>
                <b>{featuredName}</b>
              </div>
              {featured && <span>{featured.neighborhood || copy.location}</span>}
            </div>
          </div>
        </div>
      </section>

      {content.showStats && <div className="container horizon-metrics" aria-label={lang === "ar" ? "أرقام Horizon Stays" : "Horizon Stays figures"}>
        <div className="horizon-metric"><b>{properties?.length || "—"}</b><span>{lang === "ar" ? "وحدة فاخرة" : "curated stays"}</span></div>
        <div className="horizon-metric"><b>7+</b><span>{lang === "ar" ? "أحياء مميزة" : "prime districts"}</span></div>
        <div className="horizon-metric"><b>24/7</b><span>{lang === "ar" ? "دعم للضيوف" : "guest support"}</span></div>
        <div className="horizon-metric"><b>{lang === "ar" ? "حي" : "Live"}</b><span>{lang === "ar" ? "تحديث التوفر" : "availability updates"}</span></div>
      </div>}

      {featureFlags.nav_properties && <section className="horizon-section" id="collection">
        <div className="container">
          <div className="horizon-section-head">
            <div>
              <span className="horizon-section-index">{copy.browseKicker}</span>
              <h2>{copy.browseTitle}</h2>
            </div>
            <p>{copy.browseText}</p>
          </div>

          <div className="horizon-filter-row">
            <div className="horizon-filters" aria-label={lang === "ar" ? "تصفية الوحدات" : "Filter stays"}>
              {filters.map((item) => <button key={item.key} className={`horizon-filter ${filter === item.key ? "active" : ""}`} onClick={() => { setFilter(item.key); setShowAll(item.key !== "all"); }}>{item.label}</button>)}
            </div>
            {filteredProperties && <span className="horizon-results-count">{copy.results(filteredProperties.length)}</span>}
          </div>

          {error && <div className="empty-state">{t("load_failed")} {error}</div>}
          {!error && !visibleProperties && <div className="horizon-property-grid">{Array.from({ length: 5 }).map((_, index) => <div className="skeleton" style={{ minHeight: 420 }} key={index} />)}</div>}
          {visibleProperties?.length === 0 && <div className="empty-state">{t("no_results")}</div>}
          {visibleProperties && visibleProperties.length > 0 && <div className="horizon-property-grid">
            {visibleProperties.map((property) => {
              const name = propName(property, lang);
              const photo = propertyPhotos(property)[0] || FALLBACK_HERO;
              return <Link className="horizon-property-card" to={`/property/${property.slug}`} key={property.id}>
                <img src={photo} alt={name} loading="lazy" />
                <div className="horizon-property-card-main">
                  <span className="horizon-property-card-type">{property.type || (lang === "ar" ? "إقامة مختارة" : "Curated stay")}</span>
                  <h3>{name}</h3>
                  <div className="horizon-property-card-meta">
                    <p>{copy.location} · {neighborhoodLabel(property.neighborhood, lang) || (lang === "ar" ? "حي مميز" : "Prime district")}</p>
                    <div className="horizon-property-card-price"><b>{property.price_per_night?.toLocaleString("en-US")} ﷼</b><span>{copy.perNight}</span></div>
                  </div>
                </div>
              </Link>;
            })}
          </div>}
          {filteredProperties && filter === "all" && filteredProperties.length > 5 && <div className="horizon-show-more"><button className="horizon-quiet-btn" onClick={() => setShowAll((current) => !current)}>{showAll ? (lang === "ar" ? "عرض عدد أقل" : "Show fewer") : (lang === "ar" ? `عرض كل الوحدات (${filteredProperties.length})` : `View all ${filteredProperties.length} stays`)}</button></div>}
        </div>
      </section>}

      <section className="horizon-section horizon-section-deep">
        <div className="container horizon-story-grid">
          <div>
            <span className="horizon-section-index">{copy.storyKicker}</span>
            <h2 className="horizon-story-big" dangerouslySetInnerHTML={{ __html: copy.storyTitle }} />
          </div>
          <div className="horizon-story-list">
            {copy.storyItems.map((item, index) => <article className="horizon-story-item" key={item.title}>
              <span className="horizon-story-number">0{index + 1}</span>
              <div><h3>{item.title}</h3><p>{item.text}</p></div>
            </article>)}
          </div>
        </div>
      </section>

      {featureFlags.feature_map && properties && <section className="horizon-section horizon-section-sand">
        <div className="container horizon-map-grid">
          <div className="horizon-map-copy">
            <span className="horizon-section-index">{copy.mapKicker}</span>
            <h2>{copy.mapTitle}</h2>
            <p>{copy.mapText}</p>
          </div>
          <div className="horizon-map-zone"><MapFrame locations={properties} lang={lang} variant="collection" /></div>
        </div>
      </section>}

      <section className="horizon-section">
        <div className="container">
          <div className="horizon-section-head">
            <div><span className="horizon-section-index">04 / {lang === "ar" ? "قبل الوصول" : "Before you arrive"}</span><h2>{lang === "ar" ? "الأساسيات واضحة." : "The essentials, clear."}</h2></div>
            <p>{lang === "ar" ? "نبقي تفاصيل الإقامة بسيطة من أول استكشاف الوحدة إلى ترتيب موعد الوصول." : "We keep the stay straightforward, from discovering a space to arranging your arrival."}</p>
          </div>
          <div className="horizon-story-list" style={{ borderColor: "var(--h-line)" }}>
            {copy.serviceItems.map((item, index) => <article className="horizon-story-item" style={{ borderColor: "var(--h-line)" }} key={item.title}>
              <span className="horizon-story-number">0{index + 1}</span>
              <div><h3 style={{ color: "var(--h-ink)" }}>{item.title}</h3><p style={{ color: "var(--h-ink-soft)" }}>{item.text}</p></div>
            </article>)}
          </div>
        </div>
      </section>
    </div>
  );
}
