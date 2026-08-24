import { lazy, Suspense, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProperties, propertyPhotos, type Property } from "../lib/supabase";
import { useTheme } from "../lib/ThemeContext";
import { useLang, neighborhoodLabel, propName } from "../lib/i18n";
import { EditorContentContext } from "../lib/editorPreview";
import { TwoClickDateRangePicker } from "../components/TwoClickDateRangePicker";

const WHATSAPP = "https://wa.me/966920035843";
const FALLBACK_HERO = "https://bwffhalzuvvmuzjfmdyp.supabase.co/storage/v1/object/public/property-images/kafd-penthouse-3bd-1.webp";
const MapFrame = lazy(() => import("../components/MapFrame"));

type Copy = {
  heroKicker: string;
  heroTitle: string;
  heroText: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  apartmentType: string;
  search: string;
  explore: string;
  contact: string;
  availabilityNote: string;
  collectionKicker: string;
  collectionTitle: string;
  collectionText: string;
  results: (count: number) => string;
  perNight: string;
  location: string;
  destinationsKicker: string;
  destinationsTitle: string;
  journeyKicker: string;
  journeyTitle: string;
  serviceKicker: string;
  serviceTitle: string;
  mapKicker: string;
  mapTitle: string;
  mapText: string;
  partnershipKicker: string;
  partnershipTitle: string;
  partnershipText: string;
  partnershipCta: string;
  showAll: (count: number) => string;
  showLess: string;
  noResults: string;
  datesError: string;
  searchResult: string;
  types: Array<{ key: string; label: string }>;
  journey: Array<{ step: string; title: string; text: string }>;
  services: Array<{ title: string; text: string; mark: string }>;
};

function getCopy(lang: string): Copy {
  if (lang === "ar") {
    return {
      heroKicker: "HORIZON STAYS / RIYADH",
      heroTitle: "أفق جديد\nللإقامة اليومية.",
      heroText: "شقق وبنتهاوسات مختارة بعين دقيقة—لإقامة تتحرك بإيقاعك، لا بقالب فندقي مكرر.",
      destination: "الوجهة",
      checkIn: "الوصول",
      checkOut: "المغادرة",
      guests: "الضيوف",
      apartmentType: "نوع الوحدة",
      search: "ابدأ الاستكشاف",
      explore: "اكتشف الوحدات",
      contact: "تحدث معنا",
      availabilityNote: "التوفر النهائي والأسعار حسب التاريخ تظهر داخل كل وحدة.",
      collectionKicker: "01 / الإقامات المختارة",
      collectionTitle: "مساحتك التالية\nتبدأ من هنا.",
      collectionText: "اكتشف وحدات واقعية بتفاصيل واضحة، أسعار بداية مباشرة، ومسارات سريعة للوصول إلى الخيار المناسب.",
      results: (count) => `${count} وحدة ضمن خياراتك`,
      perNight: "لليلة",
      location: "الرياض",
      destinationsKicker: "02 / خريطة المدينة",
      destinationsTitle: "اختر إيقاع\nالحي الذي يناسبك.",
      journeyKicker: "03 / رحلة حجز أبسط",
      journeyTitle: "من الفكرة إلى\nباب الوحدة.",
      serviceKicker: "04 / معيار Horizon",
      serviceTitle: "كل ما تحتاجه\nبدون ضوضاء.",
      mapKicker: "05 / اكتشف موقعك",
      mapTitle: "قريب من\nكل ما يهمك.",
      mapText: "استكشف الوحدات في أحياء الرياض المختارة. اضغط الدبوس لتبدأ من المنطقة التي تناسب يومك.",
      partnershipKicker: "للملاك / HORIZON PARTNERS",
      partnershipTitle: "وحدتك تستحق\nمنصة أوسع.",
      partnershipText: "إذا كنت تدير وحدة مميزة في الرياض، تواصل معنا لنناقش كيف يمكن لـ Horizon Stays تقديمها بطريقة أكثر وضوحاً وأناقة.",
      partnershipCta: "ابدأ شراكة تشغيل",
      showAll: (count) => `عرض كل الوحدات (${count})`,
      showLess: "عرض عدد أقل",
      noResults: "لا توجد وحدات مطابقة الآن. غيّر نوع الوحدة أو عدد الضيوف.",
      datesError: "اختر تاريخ مغادرة بعد تاريخ الوصول.",
      searchResult: "هذه الوحدات تناسب بحثك. افتح أي وحدة لتأكيد السعر والتوفر حسب التواريخ.",
      types: [
        { key: "all", label: "كل الإقامات" },
        { key: "studio", label: "استوديو" },
        { key: "1", label: "غرفة واحدة" },
        { key: "2", label: "غرفتان" },
        { key: "3+", label: "3 غرف أو أكثر" },
      ],
      journey: [
        { step: "01", title: "اختر الإيقاع", text: "حدد تواريخك وعدد الضيوف ونوع المساحة التي تبحث عنها." },
        { step: "02", title: "شاهد الصورة كاملة", text: "استعرض الصور، تفاصيل الوحدة، الموقع، والسعر حسب تاريخك." },
        { step: "03", title: "رتّب وصولك", text: "أكمل طلب الحجز عبر المسار المناسب لك ثم نسّق تفاصيل الوصول." },
      ],
      services: [
        { mark: "01", title: "وضوح من البداية", text: "تفاصيل وصور ومسارات حجز مباشرة تساعدك على اتخاذ القرار بهدوء." },
        { mark: "02", title: "تقويم متصل", text: "تظهر حالة التوفر ضمن تجربة الوحدة حتى تعرف الخطوة التالية بوضوح." },
        { mark: "03", title: "ضيافة عصرية", text: "تجربة محلية منظمة تضع الخصوصية والمرونة في صميم الإقامة." },
      ],
    };
  }

  return {
    heroKicker: "HORIZON STAYS / RIYADH",
    heroTitle: "Stay beyond\nexpectations.",
    heroText: "Considered apartments and penthouses for a stay that moves at your pace—not a repeated hotel template.",
    destination: "Destination",
    checkIn: "Check in",
    checkOut: "Check out",
    guests: "Guests",
    apartmentType: "Stay type",
    search: "Start exploring",
    explore: "Explore stays",
    contact: "Talk to us",
    availabilityNote: "Final availability and date-specific pricing are shown inside every stay.",
    collectionKicker: "01 / Curated stays",
    collectionTitle: "Your next space\nstarts here.",
    collectionText: "Explore real homes with clear details, direct starting prices, and a quicker path to the right option.",
    results: (count) => `${count} stays in your selection`,
    perNight: "per night",
    location: "Riyadh",
    destinationsKicker: "02 / City rhythm",
    destinationsTitle: "Choose the district\nthat suits your day.",
    journeyKicker: "03 / A clearer booking path",
    journeyTitle: "From an idea\nto the front door.",
    serviceKicker: "04 / The Horizon standard",
    serviceTitle: "What you need,\nwithout the noise.",
    mapKicker: "05 / Find your place",
    mapTitle: "Close to what\nmatters most.",
    mapText: "Explore stays across selected Riyadh districts. Choose a pin to begin in the part of the city that works for you.",
    partnershipKicker: "FOR OWNERS / HORIZON PARTNERS",
    partnershipTitle: "Your residence\ndeserves a wider horizon.",
    partnershipText: "If you manage a distinctive Riyadh residence, talk to us about presenting it with more clarity, elegance, and reach.",
    partnershipCta: "Start an operating partnership",
    showAll: (count) => `View all ${count} stays`,
    showLess: "Show fewer",
    noResults: "No stays match this selection right now. Change the stay type or guest count.",
    datesError: "Choose a check-out date after your check-in date.",
    searchResult: "These stays fit your selection. Open any stay to confirm date-specific availability and pricing.",
    types: [
      { key: "all", label: "All stays" },
      { key: "studio", label: "Studio" },
      { key: "1", label: "1 bedroom" },
      { key: "2", label: "2 bedrooms" },
      { key: "3+", label: "3+ bedrooms" },
    ],
    journey: [
      { step: "01", title: "Set the rhythm", text: "Choose your dates, guest count, and the kind of space you want." },
      { step: "02", title: "See the full picture", text: "Explore photos, residence details, location, and date-specific pricing." },
      { step: "03", title: "Arrange arrival", text: "Continue through the booking path that suits you, then coordinate arrival details." },
    ],
    services: [
      { mark: "01", title: "Clarity from the start", text: "Direct details, photography, and booking paths to help you decide calmly." },
      { mark: "02", title: "Connected calendars", text: "Availability is visible in the residence experience, so the next step is clear." },
      { mark: "03", title: "Modern hospitality", text: "An organised local stay experience built around privacy and flexibility." },
    ],
  };
}

function Icon({ name }: { name: "pin" | "calendar" | "guests" | "spark" | "arrow" }) {
  const paths = {
    pin: <><circle cx="12" cy="10" r="3" /><path d="M19 10c0 5.1-7 11-7 11S5 15.1 5 10a7 7 0 1 1 14 0Z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    guests: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="10" r="2" /><path d="M3.5 20c.5-3.2 2.4-5 5.5-5s5 1.8 5.5 5M15 15.6c2.5.1 4.1 1.5 4.5 4.1" /></>,
    spark: <><path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2Z" /><path d="m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function DeferredMap({ locations, lang }: { locations: Property[]; lang: "ar" | "en" }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    if (!hostRef.current || !("IntersectionObserver" in window)) {
      setIsNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setIsNearViewport(true);
      observer.disconnect();
    }, { rootMargin: "520px 0px" });
    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={hostRef} className="horizon-map-deferred">
    {isNearViewport ? <Suspense fallback={<div className="horizon-map-loading">{lang === "ar" ? "يتم تجهيز خريطة الوحدات…" : "Preparing the stay map…"}</div>}><MapFrame locations={locations} lang={lang} variant="collection" /></Suspense> : <div className="horizon-map-loading">{lang === "ar" ? "تظهر الخريطة عند الاقتراب منها" : "The map loads as you reach it"}</div>}
  </div>;
}

function ScrollScene({ properties, lang }: { properties: Property[] | null; lang: "ar" | "en" }) {
  const panelRefs = useRef<Array<HTMLElement | null>>([]);
  const [visiblePanels, setVisiblePanels] = useState<number[]>([]);
  const sceneProperties = useMemo(() => (properties || []).slice(0, 3), [properties]);

  useEffect(() => {
    if (!sceneProperties.length || !("IntersectionObserver" in window)) {
      setVisiblePanels(sceneProperties.map((_, index) => index));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = Number((entry.target as HTMLElement).dataset.sceneIndex);
        setVisiblePanels((current) => current.includes(index) ? current : [...current, index]);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.22 });
    panelRefs.current.forEach((panel) => panel && observer.observe(panel));
    return () => observer.disconnect();
  }, [sceneProperties]);

  if (!sceneProperties.length) return null;
  const copy = lang === "ar"
    ? { kicker: "HORIZON / اختر إقامتك", title: "اختر ما يناسبك.\nواحجز بثقة.", text: "قارن الوحدات، شاهد السعر والتوفر حسب تاريخك، ثم أكمل الحجز من المكان نفسه.", scroll: "تابع لاستكشاف الوحدات", book: "افتح الحجز", perNight: "لليلة", residence: "إقامة مختارة" }
    : { kicker: "HORIZON / CHOOSE YOUR STAY", title: "Find your stay.\nBook with clarity.", text: "Compare residences, see date-specific price and availability, then continue to booking from one place.", scroll: "Scroll to explore stays", book: "Open booking", perNight: "per night", residence: "Selected residence" };

  return <section className="horizon-scroll-scene" aria-label={lang === "ar" ? "مشهد الإقامات المتحرك" : "Moving residence scene"}>
    <div className="horizon-scene-fixed" aria-hidden="true">
      <span className="horizon-scene-grid" /><span className="horizon-scene-glow horizon-scene-glow-a" /><span className="horizon-scene-glow horizon-scene-glow-b" />
      <div className="container horizon-scene-static-copy"><span>{copy.kicker}</span><h2>{copy.title}</h2><p>{copy.text}</p><small>{copy.scroll}<i /></small></div>
    </div>
    <div className="container horizon-scene-panels">
      {sceneProperties.map((property, index) => {
        const name = propName(property, lang);
        return <article key={property.id} data-scene-index={index} ref={(element) => { panelRefs.current[index] = element; }} className={`horizon-scene-panel horizon-scene-panel-${index + 1} ${visiblePanels.includes(index) ? "is-visible" : ""}`}>
          <div className="horizon-scene-panel-media"><img src={propertyPhotos(property)[0] || FALLBACK_HERO} alt={name} loading="lazy" decoding="async" sizes="(max-width: 720px) 90vw, 62vw" /><span>{String(index + 1).padStart(2, "0")}</span></div>
          <div className="horizon-scene-panel-copy"><span>{copy.residence} / {neighborhoodLabel(property.neighborhood, lang) || (lang === "ar" ? "الرياض" : "Riyadh")}</span><h3>{name}</h3><p>{property.bedrooms ? `${property.bedrooms} ${lang === "ar" ? "غرف" : "bedrooms"}` : (lang === "ar" ? "استوديو" : "Studio")} · {property.bathrooms} {lang === "ar" ? "حمام" : "baths"} · {property.max_guests} {lang === "ar" ? "ضيوف" : "guests"}</p><div><b>{property.price_per_night?.toLocaleString("en-US")} ﷼</b><small>{copy.perNight}</small><Link to={`/property/${property.slug}`}>{copy.book}<Icon name="arrow" /></Link></div></div>
        </article>;
      })}
    </div>
  </section>;
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
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [searchMessage, setSearchMessage] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    fetchProperties().then(setProperties).catch((cause) => setError(String(cause?.message || cause)));
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("horizon-favorite-properties") || "[]");
      if (Array.isArray(saved)) setFavorites(saved.filter((id): id is number => typeof id === "number"));
    } catch { /* An unavailable or malformed preference must not block discovery. */ }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("horizon-favorite-properties", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (propertyId: number) => {
    setFavorites((current) => current.includes(propertyId) ? current.filter((id) => id !== propertyId) : [...current, propertyId]);
  };

  const filteredProperties = useMemo(() => {
    if (!properties) return null;
    const count = Number(guests || 0);
    return properties.filter((property) => {
      const typeMatch = filter === "all" || (filter === "studio" ? property.bedrooms === 0 : filter === "3+" ? property.bedrooms >= 3 : property.bedrooms === Number(filter));
      const guestMatch = !count || property.max_guests >= count;
      return typeMatch && guestMatch;
    });
  }, [filter, guests, properties]);

  const visibleProperties = useMemo(() => {
    if (!filteredProperties) return null;
    return filter === "all" && !showAll ? filteredProperties.slice(0, 5) : filteredProperties;
  }, [filter, filteredProperties, showAll]);

  const featured = properties?.[0];
  const featuredName = featured ? propName(featured, lang) : content.brandEn;
  const featuredImage = featured ? propertyPhotos(featured)[0] || FALLBACK_HERO : FALLBACK_HERO;
  const destinationCards = useMemo(() => {
    const seen = new Set<string>();
    return (properties || []).filter((property) => {
      const key = property.neighborhood || "Riyadh";
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 4);
  }, [properties]);

  const runSearch = (range = { checkIn, checkOut }) => {
    if (range.checkIn && range.checkOut && range.checkOut <= range.checkIn) {
      setSearchMessage(copy.datesError);
      return;
    }
    setShowAll(true);
    setSearchMessage(copy.searchResult);
    window.setTimeout(() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  };

  return (
    <div className="horizon-public horizon-future-public">
      <div className="horizon-fixed-field" aria-hidden="true"><i /><i /><i /><span /></div>
      <section className="horizon-hero horizon-future-hero">
        <div className="horizon-orbit horizon-orbit-a" aria-hidden="true" />
        <div className="horizon-orbit horizon-orbit-b" aria-hidden="true" />
        <div className="container horizon-hero-grid horizon-hero-stage">
          <div className="horizon-hero-copy">
            <div>
              <span className="horizon-kicker"><i className="horizon-live-dot" />{copy.heroKicker}</span>
              <h1>{copy.heroTitle}</h1>
              <p className="horizon-hero-lead">{copy.heroText}</p>
            </div>
            <div className="horizon-hero-note horizon-signal-note">
              <div><b>{properties?.length || "25"}+</b><span>{lang === "ar" ? "وحدة مختارة داخل الرياض" : "considered stays in Riyadh"}</span></div>
              <div className="horizon-hero-signal"><span>{lang === "ar" ? "إتاحة حية" : "Live availability"}</span><i /></div>
            </div>
          </div>
          <div className="horizon-hero-media horizon-cinematic-card">
            <img src={featuredImage} alt={featuredName} fetchPriority="high" decoding="async" sizes="(max-width: 900px) 100vw, 54vw" />
            <span className="horizon-media-grain" aria-hidden="true" />
            <div className="horizon-hero-media-caption">
              <div><span>{lang === "ar" ? "الإقامة المختارة الآن" : "Selected residence now"}</span><b>{featuredName}</b></div>
              {featured && <span>{neighborhoodLabel(featured.neighborhood, lang) || copy.location}</span>}
            </div>
            <span className="horizon-cinematic-index" aria-hidden="true">01</span>
          </div>
        </div>
        <div className="container horizon-search-wrap">
          <form className="horizon-search-module" onSubmit={(event) => { event.preventDefault(); runSearch(); }}>
            <label className="horizon-search-field">
              <span><Icon name="pin" />{copy.destination}</span>
              <select aria-label={copy.destination} defaultValue="riyadh"><option value="riyadh">{copy.location}</option></select>
            </label>
            <div className="horizon-search-field horizon-search-date-range">
              <span><Icon name="calendar" />{copy.checkIn} / {copy.checkOut}</span>
              <TwoClickDateRangePicker
                value={{ checkIn, checkOut }}
                minDate={today}
                locale={lang === "ar" ? "ar-SA" : "en-US"}
                checkInLabel={copy.checkIn}
                checkOutLabel={copy.checkOut}
                onChange={(next) => { setCheckIn(next.checkIn); setCheckOut(next.checkOut); setSearchMessage(""); }}
                onComplete={runSearch}
              />
            </div>
            <label className="horizon-search-field horizon-search-guests">
              <span><Icon name="guests" />{copy.guests}</span>
              <select aria-label={copy.guests} value={guests} onChange={(event) => setGuests(event.target.value)}>{[1, 2, 3, 4, 5, 6, 8].map((value) => <option key={value} value={value}>{value}</option>)}</select>
            </label>
            <label className="horizon-search-field horizon-search-type">
              <span><Icon name="spark" />{copy.apartmentType}</span>
              <select aria-label={copy.apartmentType} value={filter} onChange={(event) => setFilter(event.target.value)}>{copy.types.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select>
            </label>
            <button className="horizon-search-submit" type="submit">{copy.search}<Icon name="arrow" /></button>
          </form>
          <p className={`horizon-search-note ${searchMessage ? "is-active" : ""}`}>{searchMessage || copy.availabilityNote}</p>
        </div>
      </section>

      {content.showStats && <div className="container horizon-metrics horizon-future-metrics" aria-label={lang === "ar" ? "مؤشرات Horizon Stays" : "Horizon Stays indicators"}>
        <div className="horizon-metric"><b>{properties?.length || "—"}</b><span>{lang === "ar" ? "وحدة مميزة" : "distinct stays"}</span></div>
        <div className="horizon-metric"><b>7+</b><span>{lang === "ar" ? "أحياء مختارة" : "selected districts"}</span></div>
        <div className="horizon-metric"><b>24/7</b><span>{lang === "ar" ? "تواصل للضيوف" : "guest communication"}</span></div>
        <div className="horizon-metric"><b>{lang === "ar" ? "حي" : "Live"}</b><span>{lang === "ar" ? "تحديث التوفر" : "availability updates"}</span></div>
      </div>}

      <section className="horizon-section horizon-destinations-section">
        <div className="container">
          <div className="horizon-section-head horizon-split-head">
            <div><span className="horizon-section-index">{copy.destinationsKicker}</span><h2>{copy.destinationsTitle}</h2></div>
            <p>{lang === "ar" ? "كل حي يقدّم مشهداً مختلفاً من الرياض. ابدأ من المكان الذي ينسجم مع موعدك، ثم اكتشف وحدته." : "Every district brings a different view of Riyadh. Begin with the place that matches your plans, then find its residence."}</p>
          </div>
          <div className="horizon-destination-rail">
            {destinationCards.map((property, index) => <Link key={property.id} className="horizon-destination-card" to={`/property/${property.slug}`}>
              <img src={propertyPhotos(property)[0] || FALLBACK_HERO} alt={propName(property, lang)} loading="lazy" />
              <span className="horizon-destination-card-count">0{index + 1}</span>
              <div><span>{neighborhoodLabel(property.neighborhood, lang) || copy.location}</span><b>{propName(property, lang)}</b><small>{property.max_guests} {lang === "ar" ? "ضيوف" : "guests"}</small></div>
            </Link>)}
          </div>
        </div>
      </section>

      {featureFlags.nav_properties && <section className="horizon-section horizon-collection-section" id="collection">
        <div className="container">
          <div className="horizon-section-head">
            <div><span className="horizon-section-index">{copy.collectionKicker}</span><h2>{copy.collectionTitle}</h2></div>
            <p>{copy.collectionText}</p>
          </div>
          <div className="horizon-catalogue-cue" aria-hidden="true"><span>{lang === "ar" ? "اسحب لاستكشاف الإيقاع" : "Scroll to explore the collection"}</span><i /></div>
          <div className="horizon-filter-row">
            <div className="horizon-filters" aria-label={lang === "ar" ? "تصفية الوحدات" : "Filter stays"}>
              {copy.types.map((item) => <button type="button" key={item.key} className={`horizon-filter ${filter === item.key ? "active" : ""}`} onClick={() => { setFilter(item.key); setShowAll(item.key !== "all"); }}>{item.label}</button>)}
            </div>
            {filteredProperties && <span className="horizon-results-count">{copy.results(filteredProperties.length)}</span>}
          </div>
          {error && <div className="empty-state">{t("load_failed")} {error}</div>}
          {!error && !visibleProperties && <div className="horizon-property-grid">{Array.from({ length: 5 }).map((_, index) => <div className="skeleton" style={{ minHeight: 420 }} key={index} />)}</div>}
          {visibleProperties?.length === 0 && <div className="horizon-empty-search"><Icon name="spark" /><p>{copy.noResults}</p><button type="button" className="horizon-quiet-btn" onClick={() => { setFilter("all"); setGuests("2"); }}>{lang === "ar" ? "إعادة الضبط" : "Reset search"}</button></div>}
          {visibleProperties && visibleProperties.length > 0 && <div className="horizon-property-grid">
            {visibleProperties.map((property, index) => {
              const name = propName(property, lang);
              const photo = propertyPhotos(property)[0] || FALLBACK_HERO;
              const isFavorite = favorites.includes(property.id);
              const summary = lang === "ar"
                ? `${property.bedrooms ? `${property.bedrooms} غرف` : "استوديو"} · ${property.bathrooms} حمام · ${property.area_m2 ? `${property.area_m2} م²` : "إقامة مجهزة"}`
                : `${property.bedrooms ? `${property.bedrooms} bedrooms` : "Studio"} · ${property.bathrooms} baths · ${property.area_m2 ? `${property.area_m2} m²` : "Ready-to-stay"}`;
              return <article className={`horizon-property-card horizon-property-card-${index + 1}`} key={property.id}>
                <Link className="horizon-card-media" to={`/property/${property.slug}`} aria-label={`${lang === "ar" ? "فتح" : "Open"} ${name}`}>
                  <img src={photo} alt={name} loading="lazy" decoding="async" sizes="(max-width: 620px) 100vw, (max-width: 900px) 50vw, 42vw" />
                </Link>
                <span className="horizon-card-orbit" aria-hidden="true" />
                <button type="button" className={`horizon-favorite-button ${isFavorite ? "active" : ""}`} onClick={() => toggleFavorite(property.id)} aria-pressed={isFavorite} aria-label={isFavorite ? (lang === "ar" ? "إزالة من المفضلة" : "Remove from favourites") : (lang === "ar" ? "حفظ في المفضلة" : "Save to favourites")}>{isFavorite ? "♥" : "♡"}</button>
                <div className="horizon-property-card-main">
                  <span className="horizon-property-card-type">{property.type || (lang === "ar" ? "إقامة مختارة" : "Curated stay")}</span>
                  <h3>{name}</h3>
                  <div className="horizon-property-card-meta">
                    <p>{copy.location} · {neighborhoodLabel(property.neighborhood, lang) || (lang === "ar" ? "حي مميز" : "Prime district")} · {property.max_guests} {lang === "ar" ? "ضيوف" : "guests"}</p>
                    <div className="horizon-property-card-price"><b>{property.price_per_night?.toLocaleString("en-US")} ﷼</b><span>{copy.perNight}</span></div>
                  </div>
                </div>
                <div className="horizon-card-reveal" aria-label={lang === "ar" ? `ملخص ${name}` : `${name} summary`}>
                  <span>{summary}</span>
                  <p>{property.description_ar || (lang === "ar" ? "تفاصيل واضحة وصور حقيقية وتجربة حجز مباشرة." : "Clear details, real photography, and a direct booking path.")}</p>
                  <div className="horizon-card-reveal-actions">
                    <Link className="horizon-card-book" to={`/property/${property.slug}`}>{lang === "ar" ? "احجز الآن" : "Book now"}<Icon name="arrow" /></Link>
                    <Link className="horizon-card-detail" to={`/property/${property.slug}`}>{lang === "ar" ? "عرض الملخص" : "View summary"}</Link>
                  </div>
                </div>
              </article>;
            })}
          </div>}
          {filteredProperties && filter === "all" && filteredProperties.length > 5 && <div className="horizon-show-more"><button type="button" className="horizon-quiet-btn" onClick={() => setShowAll((current) => !current)}>{showAll ? copy.showLess : copy.showAll(filteredProperties.length)}</button></div>}
        </div>
      </section>}

      <ScrollScene properties={properties} lang={lang} />

      <section className="horizon-section horizon-section-deep horizon-services-section">
        <div className="horizon-space-grid" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="container horizon-story-grid horizon-services-grid">
          <div><span className="horizon-section-index">{copy.serviceKicker}</span><h2 className="horizon-story-big">{copy.serviceTitle}</h2><a className="horizon-dark-cta" href="#collection">{copy.explore}<Icon name="arrow" /></a></div>
          <div className="horizon-story-list">{copy.services.map((item) => <article className="horizon-story-item" key={item.mark}><span className="horizon-story-number">{item.mark}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div>
        </div>
      </section>

      {featureFlags.feature_map && properties && <section className="horizon-section horizon-section-sand horizon-map-section">
        <div className="container horizon-map-grid"><div className="horizon-map-copy"><span className="horizon-section-index">{copy.mapKicker}</span><h2>{copy.mapTitle}</h2><p>{copy.mapText}</p><a className="horizon-quiet-btn" href="#collection">{copy.explore}<Icon name="arrow" /></a></div><div className="horizon-map-zone"><DeferredMap locations={properties} lang={lang} /></div></div>
      </section>}

      <section className="horizon-partnership-section"><div className="container horizon-partnership-grid"><div><span className="horizon-kicker">{copy.partnershipKicker}</span><h2>{copy.partnershipTitle}</h2></div><div><p>{copy.partnershipText}</p><Link className="horizon-primary-btn" to="/contact">{copy.partnershipCta}<Icon name="arrow" /></Link></div></div></section>
    </div>
  );
}
