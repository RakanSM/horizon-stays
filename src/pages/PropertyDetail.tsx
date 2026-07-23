import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchPropertyBySlug,
  fetchBlockedDates,
  propertyPhotos,
  type Property,
  type BlockedDate,
} from "../lib/supabase";

const AMENITY_AR: Record<string, string> = {
  "Air Conditioning": "تكييف",
  "Free Parking": "موقف مجاني",
  "Fully Equipped Kitchen": "مطبخ مجهز",
  "Gaming Area": "منطقة ألعاب",
  "High-speed WiFi": "واي فاي سريع",
  Jacuzzi: "جاكوزي",
  "Outdoor Area": "جلسة خارجية",
  "Outdoor Jacuzzi": "جاكوزي خارجي",
  "Smart TV": "شاشة ذكية",
  Washer: "غسالة",
  "Self Check-in": "دخول ذاتي",
  "Cinema Room": "غرفة سينما",
  "Hot Tub": "هوت تب",
  Bathtub: "حوض استحمام",
  Elevator: "مصعد",
  Workspace: "مساحة عمل",
  "Coffee Maker": "ماكينة قهوة",
  Balcony: "بلكونة",
  "City View": "إطلالة على المدينة",
  "KAFD View": "إطلالة KAFD",
  Soundproofing: "عوازل صوتية",
  "75\" TV": "شاشة 75 بوصة",
  "70\" TV": "شاشة 70 بوصة",
  Rooftop: "روف خاص",
  "Private Entrance": "مدخل خاص",
  Garden: "حديقة",
  Pool: "مسبح",
  "Hockey Table": "طاولة هوكي",
  Netflix: "نتفلكس",
  "Board Games": "ألعاب طاولة",
  "Sound System": "نظام صوتي",
};

function monthMatrix(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const startDow = first.getUTCDay(); // 0 = Sunday
  const cells: Array<number | null> = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

const MONTH_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const DOW_AR = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

export default function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [property, setProperty] = useState<Property | null | undefined>(undefined);
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [mainPhoto, setMainPhoto] = useState(0);

  useEffect(() => {
    if (!slug) return;
    fetchPropertyBySlug(slug)
      .then((p) => {
        setProperty(p);
        if (p) fetchBlockedDates(p.id).then(setBlocked).catch(() => {});
      })
      .catch(() => setProperty(null));
  }, [slug]);

  const blockedSet = useMemo(() => {
    const s = new Set<string>();
    for (const b of blocked) {
      const start = new Date(b.start_date + "T00:00:00Z");
      const end = new Date(b.end_date + "T00:00:00Z");
      for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
        s.add(d.toISOString().slice(0, 10));
      }
    }
    return s;
  }, [blocked]);

  if (property === undefined) {
    return (
      <div className="container section">
        <div className="skeleton" style={{ height: 420 }} />
      </div>
    );
  }

  if (property === null) {
    return (
      <div className="container section">
        <div className="empty-state">
          الوحدة غير موجودة. <Link to="/" style={{ color: "var(--gold)" }}>العودة للوحدات</Link>
        </div>
      </div>
    );
  }

  const photos = propertyPhotos(property);
  const amenities = Array.isArray(property.amenities) ? property.amenities : [];
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const months = [0, 1].map((i) => {
    const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset + i, 1));
    return { year: base.getUTCFullYear(), month: base.getUTCMonth() };
  });

  return (
    <div className="container section">
      <nav style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
        <Link to="/">الوحدات</Link> / {property.name_ar || property.name_en}
      </nav>

      {photos.length > 0 && (
        <div className="detail-hero">
          <img className="main-img" src={photos[mainPhoto] || photos[0]} alt={property.name_ar} />
          <div className="side">
            {photos.slice(0, 4).map(
              (ph, i) =>
                i !== mainPhoto &&
                i < 3 && (
                  <img key={ph} src={ph} alt="" loading="lazy" onClick={() => setMainPhoto(i)} />
                )
            )}
          </div>
        </div>
      )}

      <div className="detail-cols">
        <div>
          <div className="detail-title">
            <h1>{property.name_ar || property.name_en}</h1>
            <div className="detail-sub">
              الرياض — {property.neighborhood || "حي راقٍ"} · {property.type || "وحدة فاخرة"}
            </div>
          </div>

          <div className="spec-row">
            <span>
              <b>{property.bedrooms === 0 ? "ستوديو" : property.bedrooms}</b>{" "}
              {property.bedrooms === 0 ? "" : "غرف نوم"}
            </span>
            <span>
              <b>{property.bathrooms}</b> حمام
            </span>
            <span>
              <b>{property.max_guests}</b> ضيوف
            </span>
            {property.area_m2 ? (
              <span>
                <b>{property.area_m2}</b> م²
              </span>
            ) : null}
          </div>

          {property.description_ar && property.description_ar.trim().length > 2 && (
            <p className="prose" style={{ marginBottom: 10 }}>
              {property.description_ar}
            </p>
          )}

          {amenities.length > 0 && (
            <>
              <h3 style={{ marginTop: 26, fontSize: "1.05rem" }}>المرافق والمزايا</h3>
              <div className="amenities">
                {amenities.map((a) => (
                  <div key={a} className="amenity">
                    {AMENITY_AR[a] || a}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="calendar-wrap">
            <div className="cal-header">
              <h3>تقويم التوفر</h3>
              <div className="cal-nav">
                <button onClick={() => setMonthOffset((v) => Math.max(0, v - 1))} aria-label="السابق">
                  ‹
                </button>
                <button onClick={() => setMonthOffset((v) => Math.min(10, v + 1))} aria-label="التالي">
                  ›
                </button>
              </div>
            </div>
            <div className="cal-months">
              {months.map(({ year, month }) => (
                <div key={`${year}-${month}`} className="cal-month">
                  <h4>
                    {MONTH_AR[month]} {year}
                  </h4>
                  <div className="cal-grid">
                    {DOW_AR.map((d) => (
                      <span key={d} className="cal-dow">
                        {d}
                      </span>
                    ))}
                    {monthMatrix(year, month).map((day, i) => {
                      if (day === null) return <span key={`e${i}`} />;
                      const dstr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
                        day
                      ).padStart(2, "0")}`;
                      const isPast = dstr < todayStr;
                      const isBlocked = blockedSet.has(dstr);
                      return (
                        <span
                          key={dstr}
                          className={`cal-day ${isPast ? "past" : isBlocked ? "blocked" : "free"}`}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="cal-legend">
              <span>
                <i className="free-i" /> متاح
              </span>
              <span>
                <i className="blocked-i" /> محجوز
              </span>
            </div>
          </div>
        </div>

        <aside>
          <div className="book-box">
            <div className="bb-price">
              {property.price_per_night?.toLocaleString("en-US")} ﷼ <span>/ ليلة</span>
            </div>
            <a
              href={`https://wa.me/966560903335?text=${encodeURIComponent(
                `مرحباً، أرغب بحجز: ${property.name_ar || property.name_en}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-gold"
            >
              احجز عبر واتساب
            </a>
            {property.airbnb_url && (
              <a href={property.airbnb_url} target="_blank" rel="noreferrer" className="btn btn-outline">
                احجز عبر Airbnb
              </a>
            )}
            <div className="bb-note">التوفر محدث تلقائياً من Airbnb وGathern كل ٣ ساعات</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
