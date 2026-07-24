import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchPropertyBySlug,
  fetchBlockedDates,
  propertyPhotos,
  type Property,
  type BlockedDate,
} from "../lib/supabase";
import { useLang, propName, localizeAmenity, MONTHS, WEEKDAYS } from "../lib/i18n";

function monthMatrix(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const startDow = first.getUTCDay(); // 0 = Sunday
  const cells: Array<number | null> = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLang();
  const [property, setProperty] = useState<Property | null | undefined>(undefined);
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [mainPhoto, setMainPhoto] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  // Unified range selection: first click = check-in, second = check-out.
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);

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

  /** True if every night in [start, end) is available */
  const rangeIsFree = useCallback(
    (start: string, end: string) => {
      const s = new Date(start + "T00:00:00Z");
      const e = new Date(end + "T00:00:00Z");
      for (let d = new Date(s); d < e; d.setUTCDate(d.getUTCDate() + 1)) {
        if (blockedSet.has(d.toISOString().slice(0, 10))) return false;
      }
      return true;
    },
    [blockedSet]
  );

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const s = new Date(checkIn + "T00:00:00Z").getTime();
    const e = new Date(checkOut + "T00:00:00Z").getTime();
    return Math.max(0, Math.round((e - s) / 86400000));
  }, [checkIn, checkOut]);

  /** Smart click logic:
   * - no check-in yet → set check-in
   * - has check-in, no check-out:
   *    - clicked date AFTER check-in → set check-out (validate the range is free)
   *    - clicked date BEFORE or SAME as check-in → becomes the new check-in
   * - both set → start over with clicked date as new check-in
   */
  const onDayClick = useCallback(
    (dstr: string, isPast: boolean, isBlocked: boolean) => {
      if (isPast || isBlocked) return;
      setRangeError(null);
      if (!checkIn || (checkIn && checkOut)) {
        setCheckIn(dstr);
        setCheckOut(null);
        return;
      }
      // has check-in, selecting second date
      if (dstr <= checkIn) {
        setCheckIn(dstr); // earlier (or same) click becomes the new check-in
        return;
      }
      if (!rangeIsFree(checkIn, dstr)) {
        setRangeError(t("dates_unavailable"));
        setCheckIn(dstr); // restart from clicked date, matching common booking UX
        setCheckOut(null);
        return;
      }
      setCheckOut(dstr);
    },
    [checkIn, checkOut, rangeIsFree, t]
  );

  const clearDates = () => {
    setCheckIn(null);
    setCheckOut(null);
    setRangeError(null);
  };

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
          {t("not_found")}{" "}
          <Link to="/" style={{ color: "var(--gold)" }}>
            {t("back_to_all")}
          </Link>
        </div>
      </div>
    );
  }

  const photos = propertyPhotos(property);
  const amenities = Array.isArray(property.amenities) ? property.amenities : [];
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const name = propName(property, lang);

  const months = [0, 1].map((i) => {
    const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset + i, 1));
    return { year: base.getUTCFullYear(), month: base.getUTCMonth() };
  });

  const total = nights * (property.price_per_night || 0);

  const waText =
    lang === "ar"
      ? `مرحباً، أرغب بحجز: ${name}` +
        (checkIn && checkOut
          ? `\n${t("wa_from")}: ${checkIn}\n${t("wa_to")}: ${checkOut}\n${t("wa_nights")}: ${nights}\n${t("total")}: ${total.toLocaleString("en-US")} ﷼`
          : "")
      : `Hello, I would like to book: ${name}` +
        (checkIn && checkOut
          ? `\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nNights: ${nights}\nTotal: ${total.toLocaleString("en-US")} SAR`
          : "");

  /** Determine day cell class for the range calendar */
  const dayClass = (dstr: string, isPast: boolean, isBlocked: boolean) => {
    if (isPast) return "cal-day past";
    if (isBlocked) return "cal-day blocked";
    let cls = "cal-day free selectable";
    if (checkIn === dstr) cls += " sel-start";
    if (checkOut === dstr) cls += " sel-end";
    if (checkIn && checkOut && dstr > checkIn && dstr < checkOut) cls += " sel-mid";
    return cls;
  };

  return (
    <div className="container section">
      <nav style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
        <Link to="/">{t("back_to_all")}</Link> / {name}
      </nav>

      {photos.length > 0 && (
        <>
          <div className="detail-hero">
            <img
              className="main-img"
              src={photos[mainPhoto] || photos[0]}
              alt={name}
              onClick={() => setLightbox(mainPhoto)}
              style={{ cursor: "zoom-in" }}
            />
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
          {photos.length > 1 && (
            <div className="photo-strip">
              {photos.map((ph, i) => (
                <img
                  key={ph}
                  src={ph}
                  alt=""
                  loading="lazy"
                  className={i === mainPhoto ? "active" : ""}
                  onClick={() => setMainPhoto(i)}
                />
              ))}
              <button className="show-all-btn" onClick={() => setLightbox(0)}>
                {t("show_all_photos")} ({photos.length})
              </button>
            </div>
          )}
        </>
      )}

      {lightbox !== null && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lb-close" onClick={() => setLightbox(null)} aria-label="close">
            ✕
          </button>
          <button
            className="lb-prev"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((v) => (v! - 1 + photos.length) % photos.length);
            }}
            aria-label="previous"
          >
            ‹
          </button>
          <img src={photos[lightbox]} alt="" onClick={(e) => e.stopPropagation()} />
          <button
            className="lb-next"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((v) => (v! + 1) % photos.length);
            }}
            aria-label="next"
          >
            ›
          </button>
          <div className="lb-count">
            {lightbox + 1} / {photos.length}
          </div>
        </div>
      )}

      <div className="detail-cols">
        <div>
          <div className="detail-title">
            <h1>{name}</h1>
            <div className="detail-sub">
              {lang === "ar" ? "الرياض" : "Riyadh"} — {property.neighborhood || (lang === "ar" ? "حي راقٍ" : "Prime district")} ·{" "}
              {property.type || (lang === "ar" ? "وحدة فاخرة" : "Luxury unit")}
            </div>
          </div>

          <div className="spec-row">
            <span>
              <b>{property.bedrooms === 0 ? (lang === "ar" ? "ستوديو" : "Studio") : property.bedrooms}</b>{" "}
              {property.bedrooms === 0 ? "" : t("bedrooms")}
            </span>
            <span>
              <b>{property.bathrooms}</b> {t("bathrooms")}
            </span>
            <span>
              <b>{property.max_guests}</b> {t("guests")}
            </span>
            {property.area_m2 ? (
              <span>
                <b>{property.area_m2}</b> {t("sqm")}
              </span>
            ) : null}
            {property.floor ? (
              <span>
                <b>{property.floor}</b> {t("floor_lbl")}
              </span>
            ) : null}
          </div>

          {lang === "ar" && property.description_ar && property.description_ar.trim().length > 2 && (
            <>
              <h3 style={{ marginTop: 26, fontSize: "1.05rem" }}>{t("about_unit")}</h3>
              <p className="prose" style={{ marginBottom: 10 }}>
                {property.description_ar}
              </p>
            </>
          )}

          {amenities.length > 0 && (
            <>
              <h3 style={{ marginTop: 26, fontSize: "1.05rem" }}>{t("amenities")}</h3>
              <div className="amenities">
                {amenities.map((a) => (
                  <div key={a} className="amenity">
                    {localizeAmenity(a, lang)}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="calendar-wrap">
            <div className="cal-header">
              <h3>{t("availability")}</h3>
              <div className="cal-nav">
                <button onClick={() => setMonthOffset((v) => Math.max(0, v - 1))} aria-label="prev">
                  ‹
                </button>
                <button onClick={() => setMonthOffset((v) => Math.min(10, v + 1))} aria-label="next">
                  ›
                </button>
              </div>
            </div>
            <p className="cal-hint">{t("cal_hint")}</p>
            <div className="cal-months">
              {months.map(({ year, month }) => (
                <div key={`${year}-${month}`} className="cal-month">
                  <h4>
                    {MONTHS[lang][month]} {year}
                  </h4>
                  <div className="cal-grid">
                    {WEEKDAYS[lang].map((d) => (
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
                          className={dayClass(dstr, isPast, isBlocked)}
                          onClick={() => onDayClick(dstr, isPast, isBlocked)}
                          role={!isPast && !isBlocked ? "button" : undefined}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {rangeError && <div className="cal-error">{rangeError}</div>}
            <div className="cal-legend">
              <span>
                <i className="free-i" /> {t("available_legend")}
              </span>
              <span>
                <i className="blocked-i" /> {t("blocked_legend")}
              </span>
              <span>
                <i className="sel-i" /> {t("selected_legend")}
              </span>
            </div>
          </div>
        </div>

        <aside>
          <div className="book-box">
            <div className="bb-price">
              {property.price_per_night?.toLocaleString("en-US")} ﷼ <span>/ {t("night")}</span>
            </div>

            <div className="bb-dates">
              <div className="bb-date">
                <label>{t("check_in")}</label>
                <b>{checkIn || t("select_date")}</b>
              </div>
              <div className="bb-date">
                <label>{t("check_out")}</label>
                <b>{checkOut || t("select_date")}</b>
              </div>
            </div>

            {nights > 0 && (
              <div className="bb-summary">
                <div>
                  <span>
                    {property.price_per_night?.toLocaleString("en-US")} ﷼ × {nights} {lang === "ar" ? "ليالٍ" : "nights"}
                  </span>
                  <b>{total.toLocaleString("en-US")} ﷼</b>
                </div>
                <div className="bb-total">
                  <span>{t("total")}</span>
                  <b>{total.toLocaleString("en-US")} ﷼</b>
                </div>
              </div>
            )}

            {(checkIn || checkOut) && (
              <button className="bb-clear" onClick={clearDates}>
                {t("clear_dates")}
              </button>
            )}

            <a
              href={`https://wa.me/966560903335?text=${encodeURIComponent(waText)}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-gold"
            >
              {t("book_whatsapp")}
            </a>
            {property.airbnb_url && (
              <a href={property.airbnb_url} target="_blank" rel="noreferrer" className="btn btn-outline">
                {t("view_airbnb")}
              </a>
            )}
            <div className="bb-note">
              {lang === "ar"
                ? "التوفر محدث تلقائياً من Airbnb وGathern كل ٣ ساعات"
                : "Availability auto-synced from Airbnb & Gathern every 3 hours"}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
