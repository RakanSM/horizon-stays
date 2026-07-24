import { useEffect, useMemo, useState, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { fetchProperties, propertyPhotos, type Property } from "../lib/supabase";
import { useTheme } from "../lib/ThemeContext";
import { useLang, propName } from "../lib/i18n";
import { Reveal, Counter, useParallax } from "../lib/motion";
import { EditorContentContext } from "./ThemeEditor";

const WHATSAPP = "https://wa.me/966560903335";

export default function Home() {
  const { content: liveContent } = useTheme();
  const editorContent = useContext(EditorContentContext);
  const content = editorContent || liveContent;
  const { lang, t } = useLang();

  const FILTERS = [
    { key: "all", label: lang === "ar" ? "الكل" : "All" },
    { key: "studio", label: lang === "ar" ? "ستوديو" : "Studio" },
    { key: "1", label: lang === "ar" ? "غرفة" : "1 Bedroom" },
    { key: "2", label: lang === "ar" ? "غرفتان" : "2 Bedrooms" },
    { key: "3+", label: lang === "ar" ? "٣ غرف أو أكثر" : "3+ Bedrooms" },
  ];

  const [properties, setProperties] = useState<Property[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const heroBgRef = useRef<HTMLDivElement>(null);
  useParallax(heroBgRef, 0.3);

  useEffect(() => {
    fetchProperties()
      .then(setProperties)
      .catch((e) => setError(String(e?.message || e)));
  }, []);

  const filtered = useMemo(() => {
    if (!properties) return null;
    if (filter === "all") return properties;
    if (filter === "studio") return properties.filter((p) => p.bedrooms === 0);
    if (filter === "1") return properties.filter((p) => p.bedrooms === 1);
    if (filter === "2") return properties.filter((p) => p.bedrooms === 2);
    return properties.filter((p) => p.bedrooms >= 3);
  }, [properties, filter]);

  const heroImg = "/assets/property-real/kafd-penthouse-3bd-1.webp";

  // Theme content overrides are authored in Arabic; use them for AR, t() for EN
  const heroBadge = lang === "ar" ? content.heroBadge : t("hero_badge");
  const heroTitle = lang === "ar" ? content.heroTitle : t("hero_title");
  const heroSubtitle = lang === "ar" ? content.heroSubtitle : t("hero_subtitle");

  return (
    <>
      <section className="hero">
        <div className="hero-bg" ref={heroBgRef} style={{ backgroundImage: `url(${heroImg})` }} />
        <div className="hero-glow" aria-hidden />
        <div className="container">
          <div className="hero-content">
            <span className="hero-eyebrow hero-anim-1">
              <span className="pulse-dot" />
              {heroBadge}
            </span>
            <h1 className="hero-anim-2">{heroTitle}</h1>
            <p className="hero-anim-3">{heroSubtitle}</p>
            <div className="hero-actions hero-anim-4">
              <a href="#properties" className="btn btn-gold">
                {t("explore_units")}
              </a>
              <a href={WHATSAPP} target="_blank" rel="noreferrer" className="btn btn-outline">
                {lang === "ar" ? "تواصل واتساب" : "WhatsApp Us"}
              </a>
            </div>
          </div>
        </div>
        <div className="scroll-hint" aria-hidden>
          <span />
        </div>
      </section>

      {content.showStats && (
        <section className="stats">
          <Reveal className="stat" delay={0}>
            <b>{properties ? <Counter to={properties.length} /> : "—"}</b>
            <span>{t("stat_units")}</span>
          </Reveal>
          <Reveal className="stat" delay={60}>
            <b><Counter to={7} suffix="+" /></b>
            <span>{t("stat_districts")}</span>
          </Reveal>
          <Reveal className="stat" delay={120}>
            <b>24/7</b>
            <span>{t("stat_support")}</span>
          </Reveal>
          <Reveal className="stat" delay={180}>
            <b>{lang === "ar" ? "آلي" : "Auto"}</b>
            <span>{lang === "ar" ? "تزامن التقويم" : "Calendar Sync"}</span>
          </Reveal>
        </section>
      )}

      <section className="section" id="properties">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <h2>
                {t("our_properties")}
                <span className="gold-line" />
              </h2>
            </div>
            <p>{t("props_sub")}</p>
          </Reveal>

          <Reveal className="filters" delay={80}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`chip ${filter === f.key ? "active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </Reveal>

          {error && <div className="empty-state">{lang === "ar" ? "تعذر تحميل الوحدات: " : "Failed to load: "}{error}</div>}

          {!error && !filtered && (
            <div className="grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 360 }} />
              ))}
            </div>
          )}

          {filtered && filtered.length === 0 && (
            <div className="empty-state">{t("no_results")}</div>
          )}

          {filtered && filtered.length > 0 && (
            <div className="grid">
              {filtered.map((p, i) => {
                const photos = propertyPhotos(p);
                const name = propName(p, lang);
                return (
                  <Reveal key={p.id} delay={(i % 3) * 70} className="card-wrap">
                    <Link to={`/property/${p.slug}`} className="card">
                      <div className="card-img">
                        {photos[0] && <img src={photos[0]} alt={name} loading="lazy" />}
                        <span className="card-badge">{p.type || (lang === "ar" ? "وحدة فاخرة" : "Luxury Unit")}</span>
                      </div>
                      <div className="card-body">
                        <h3>{name}</h3>
                        <div className="card-loc">
                          {lang === "ar" ? "الرياض" : "Riyadh"} — {p.neighborhood || (lang === "ar" ? "حي راقٍ" : "Prime district")}
                        </div>
                        <div className="card-meta">
                          <span>
                            {p.bedrooms === 0
                              ? lang === "ar" ? "ستوديو" : "Studio"
                              : lang === "ar" ? `${p.bedrooms} غرف` : `${p.bedrooms} BR`}
                          </span>
                          <span>{p.bathrooms} {lang === "ar" ? "حمام" : "Bath"}</span>
                          <span>{p.max_guests} {lang === "ar" ? "ضيوف" : "Guests"}</span>
                          {p.area_m2 ? <span>{p.area_m2} {t("sqm")}</span> : null}
                        </div>
                        <div className="card-foot">
                          <div className="price">
                            <b>{p.price_per_night?.toLocaleString("en-US")} ﷼</b>{" "}
                            <span>/ {t("night")}</span>
                          </div>
                          <span className="card-link">{t("view_details")} {lang === "ar" ? "←" : "→"}</span>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
