import { useEffect, useMemo, useState, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { fetchProperties, propertyPhotos, type Property } from "../lib/supabase";
import { useTheme } from "../lib/ThemeContext";
import { Reveal, Counter, useParallax } from "../lib/motion";
import { EditorContentContext } from "./ThemeEditor";

const FILTERS = [
  { key: "all", label: "الكل" },
  { key: "studio", label: "ستوديو" },
  { key: "1", label: "غرفة" },
  { key: "2", label: "غرفتان" },
  { key: "3+", label: "٣ غرف أو أكثر" },
];

const WHATSAPP = "https://wa.me/966560903335";

export default function Home() {
  const { content: liveContent } = useTheme();
  const editorContent = useContext(EditorContentContext);
  const content = editorContent || liveContent;

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

  const heroImg = "/assets/property-real/kafd-penthouse-3bd-1.jpg";

  return (
    <>
      <section className="hero">
        <div className="hero-bg" ref={heroBgRef} style={{ backgroundImage: `url(${heroImg})` }} />
        <div className="hero-glow" aria-hidden />
        <div className="container">
          <div className="hero-content">
            <span className="hero-eyebrow hero-anim-1">
              <span className="pulse-dot" />
              {content.heroBadge}
            </span>
            <h1 className="hero-anim-2">{content.heroTitle}</h1>
            <p className="hero-anim-3">{content.heroSubtitle}</p>
            <div className="hero-actions hero-anim-4">
              <a href="#properties" className="btn btn-gold">
                استعرض الوحدات
              </a>
              <a href={WHATSAPP} target="_blank" rel="noreferrer" className="btn btn-outline">
                تواصل واتساب
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
            <span>وحدة فاخرة</span>
          </Reveal>
          <Reveal className="stat" delay={60}>
            <b><Counter to={7} suffix="+" /></b>
            <span>أحياء راقية</span>
          </Reveal>
          <Reveal className="stat" delay={120}>
            <b>24/7</b>
            <span>دعم الضيوف</span>
          </Reveal>
          <Reveal className="stat" delay={180}>
            <b>آلي</b>
            <span>تزامن التقويم</span>
          </Reveal>
        </section>
      )}

      <section className="section" id="properties">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <h2>
                وحداتنا
                <span className="gold-line" />
              </h2>
            </div>
            <p>جميع الوحدات مدارة بالكامل من Horizon Stays مع توفر محدث تلقائياً من Airbnb وGathern.</p>
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

          {error && <div className="empty-state">تعذر تحميل الوحدات: {error}</div>}

          {!error && !filtered && (
            <div className="grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 360 }} />
              ))}
            </div>
          )}

          {filtered && filtered.length === 0 && (
            <div className="empty-state">لا توجد وحدات مطابقة لهذا الفلتر.</div>
          )}

          {filtered && filtered.length > 0 && (
            <div className="grid">
              {filtered.map((p, i) => {
                const photos = propertyPhotos(p);
                return (
                  <Reveal key={p.id} delay={(i % 3) * 70} className="card-wrap">
                    <Link to={`/property/${p.slug}`} className="card">
                      <div className="card-img">
                        {photos[0] && <img src={photos[0]} alt={p.name_ar} loading="lazy" />}
                        <span className="card-badge">{p.type || "وحدة فاخرة"}</span>
                      </div>
                      <div className="card-body">
                        <h3>{p.name_ar || p.name_en}</h3>
                        <div className="card-loc">الرياض — {p.neighborhood || "حي راقٍ"}</div>
                        <div className="card-meta">
                          <span>{p.bedrooms === 0 ? "ستوديو" : `${p.bedrooms} غرف`}</span>
                          <span>{p.bathrooms} حمام</span>
                          <span>{p.max_guests} ضيوف</span>
                          {p.area_m2 ? <span>{p.area_m2} م²</span> : null}
                        </div>
                        <div className="card-foot">
                          <div className="price">
                            <b>{p.price_per_night?.toLocaleString("en-US")} ﷼</b>{" "}
                            <span>/ ليلة</span>
                          </div>
                          <span className="card-link">التفاصيل ←</span>
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
