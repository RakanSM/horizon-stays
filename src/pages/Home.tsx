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
    { key: "all", label: t("filter_all") },
    { key: "studio", label: t("filter_studio") },
    { key: "1", label: t("filter_1br") },
    { key: "2", label: t("filter_2br") },
    { key: "3+", label: t("filter_3br") },
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

  const heroImg = "https://bwffhalzuvvmuzjfmdyp.supabase.co/storage/v1/object/public/property-images/kafd-penthouse-3bd-1.webp";

  // Theme content overrides are authored in Arabic; use them for AR, t() for other languages
  const heroBadge = lang === "ar" && content.heroBadge ? content.heroBadge : t("hero_badge");
  const heroTitle = lang === "ar" && content.heroTitle ? content.heroTitle : t("hero_title");
  const heroSubtitle = lang === "ar" && content.heroSubtitle ? content.heroSubtitle : t("hero_subtitle");

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
                {t("whatsapp_us")}
              </a>
            </div>
          </div>
        </div>
        <div className="scroll-hint" aria-hidden>
          <span />
        </div>
      </section>

      {content.showStats && (
        <section className="stats px-layer">
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
            <b>{t("stat_auto")}</b>
            <span>{t("stat_cal_sync")}</span>
          </Reveal>
        </section>
      )}

      <section className="section px-layer" id="properties">
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

          {error && <div className="empty-state">{t("load_failed")}{error}</div>}

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
                        <span className="card-badge">{p.type || t("luxury_unit")}</span>
                      </div>
                      <div className="card-body">
                        <h3>{name}</h3>
                        <div className="card-loc">
                          {t("riyadh")} — {p.neighborhood || t("prime_district")}
                        </div>
                        <div className="card-meta">
                          <span>
                            {p.bedrooms === 0 ? t("studio") : `${p.bedrooms} ${t("br_short")}`}
                          </span>
                          <span>{p.bathrooms} {t("bath_short")}</span>
                          <span>{p.max_guests} {t("guests_short")}</span>
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
