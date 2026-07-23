import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProperties, propertyPhotos, type Property } from "../lib/supabase";

const FILTERS = [
  { key: "all", label: "الكل" },
  { key: "studio", label: "ستوديو" },
  { key: "1", label: "غرفة" },
  { key: "2", label: "غرفتان" },
  { key: "3+", label: "٣ غرف أو أكثر" },
];

export default function Home() {
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

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
        <div className="hero-bg" style={{ backgroundImage: `url(${heroImg})` }} />
        <div className="container">
          <div className="hero-content">
            <span className="hero-eyebrow">HORIZON STAYS — RIYADH</span>
            <h1>
              إقامة <em>فاخرة</em> في قلب الرياض
            </h1>
            <p>
              بنتهاوس بإطلالات KAFD، شقق مصممة بعناية، وستوديوهات راقية في أرقى الأحياء — مع تقويم
              توفر محدث مباشرة من منصات الحجز.
            </p>
            <div className="hero-actions">
              <a href="#properties" className="btn btn-gold">
                استعرض الوحدات
              </a>
              <a
                href="https://wa.me/966560903335"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
              >
                تواصل واتساب
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat">
          <b>{properties ? properties.length : "—"}</b>
          <span>وحدة فاخرة</span>
        </div>
        <div className="stat">
          <b>٧+</b>
          <span>أحياء راقية</span>
        </div>
        <div className="stat">
          <b>24/7</b>
          <span>دعم الضيوف</span>
        </div>
        <div className="stat">
          <b>آلي</b>
          <span>تزامن التقويم</span>
        </div>
      </section>

      <section className="section" id="properties">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>
                وحداتنا
                <span className="gold-line" />
              </h2>
            </div>
            <p>جميع الوحدات مدارة بالكامل من Horizon Stays مع توفر محدث تلقائياً من Airbnb وGathern.</p>
          </div>

          <div className="filters">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`chip ${filter === f.key ? "active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

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
              {filtered.map((p) => {
                const photos = propertyPhotos(p);
                return (
                  <Link to={`/property/${p.slug}`} key={p.id} className="card">
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
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
