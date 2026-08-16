import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProperties, supabase, type BlockedDate, type Property } from "../lib/supabase";
import { useLang, propName } from "../lib/i18n";

type DayState = { sources: string[]; isBlocked: boolean };

const SOURCE_META: Record<string, { ar: string; en: string; className: string }> = {
  airbnb: { ar: "Airbnb", en: "Airbnb", className: "airbnb" },
  gathern: { ar: "Gathern", en: "Gathern", className: "gathern" },
  direct: { ar: "حجز مباشر", en: "Direct", className: "direct" },
  horizon: { ar: "Horizon", en: "Horizon", className: "horizon" },
};

function dateKey(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

function monthCells(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [...Array(first.getUTCDay()).fill(null), ...Array.from({ length: days }, (_, index) => index + 1)];
}

function monthName(year: number, month: number, lang: string) {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : lang === "zh" ? "zh-CN" : lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : "en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month, 1)));
}

function formatDaySources(sources: string[], lang: string) {
  return sources.map((source) => SOURCE_META[source]?.[lang === "ar" ? "ar" : "en"] || source).join(" · ");
}

function MonthBoard({ year, month, states, lang }: { year: number; month: number; states: Map<string, DayState>; lang: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const weekdays = lang === "ar" ? ["ح", "ن", "ث", "ر", "خ", "ج", "س"] : ["S", "M", "T", "W", "T", "F", "S"];
  const cells = monthCells(year, month);

  return (
    <section className="availability-month">
      <h2>{monthName(year, month, lang)}</h2>
      <div className="availability-weekdays">{weekdays.map((weekday, index) => <span key={`${weekday}-${index}`}>{weekday}</span>)}</div>
      <div className="availability-days">
        {cells.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} className="availability-day empty" />;
          const key = dateKey(year, month, day);
          const state = states.get(key);
          const classes = ["availability-day", key < today ? "past" : "", state?.isBlocked ? "blocked" : "available", state?.sources?.length ? `source-${SOURCE_META[state.sources[0]]?.className || "horizon"}` : ""].filter(Boolean).join(" ");
          return (
            <span className={classes} key={key} title={state?.sources?.length ? formatDaySources(state.sources, lang) : undefined}>
              <b>{day}</b>
              {state?.sources?.length ? <i>{state.sources.slice(0, 2).map((source) => <em key={source} className={SOURCE_META[source]?.className || "horizon"} />)}</i> : null}
            </span>
          );
        })}
      </div>
    </section>
  );
}

export default function AvailabilityCalendar() {
  const { lang } = useLang();
  const [properties, setProperties] = useState<Property[]>([]);
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [selectedId, setSelectedId] = useState<number | "all">("all");
  const [monthOffset, setMonthOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const activeProperties = await fetchProperties();
        const start = new Date();
        const until = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 14, 1)).toISOString().slice(0, 10);
        const { data, error: queryError } = await supabase
          .from("blocked_dates")
          .select("id, property_id, source, start_date, end_date")
          .gte("end_date", new Date().toISOString().slice(0, 10))
          .lte("start_date", until)
          .order("start_date", { ascending: true });
        if (queryError) throw queryError;
        setProperties(activeProperties);
        setBlocked((data || []) as BlockedDate[]);
      } catch (loadError: any) {
        setError(loadError.message || "تعذر تحميل التقويم");
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const selectedProperty = properties.find((property) => property.id === selectedId) || null;
  const calendarStates = useMemo(() => {
    const states = new Map<string, DayState>();
    const ranges = blocked.filter((range) => selectedId === "all" || range.property_id === selectedId);
    for (const range of ranges) {
      const cursor = new Date(`${range.start_date}T00:00:00Z`);
      const end = new Date(`${range.end_date}T00:00:00Z`);
      while (cursor < end) {
        const key = cursor.toISOString().slice(0, 10);
        const current = states.get(key) || { sources: [], isBlocked: true };
        if (!current.sources.includes(range.source)) current.sources.push(range.source);
        states.set(key, current);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
    }
    return states;
  }, [blocked, selectedId]);

  const current = useMemo(() => {
    const today = new Date();
    const pointer = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + monthOffset, 1));
    return { year: pointer.getUTCFullYear(), month: pointer.getUTCMonth() };
  }, [monthOffset]);
  const next = useMemo(() => {
    const pointer = new Date(Date.UTC(current.year, current.month + 1, 1));
    return { year: pointer.getUTCFullYear(), month: pointer.getUTCMonth() };
  }, [current]);

  const title = lang === "ar" ? "تقويم التوفر" : "Availability calendar";
  const subtitle = lang === "ar" ? "عرض موحد للحجوزات والفترات المحجوبة من Airbnb وGathern والحجوزات المباشرة." : "One view for booked and blocked dates from Airbnb, Gathern, and direct reservations.";

  return (
    <div className="availability-page container">
      <section className="availability-hero">
        <div>
          <span className="eyebrow">Horizon calendar</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {selectedProperty && <Link className="btn-activate" to={`/property/${selectedProperty.slug}`}>{lang === "ar" ? "عرض صفحة الوحدة" : "View property"}</Link>}
      </section>

      <section className="availability-shell">
        <aside className="availability-sidebar">
          <div className="availability-filter-head"><strong>{lang === "ar" ? "الوحدات" : "Properties"}</strong><span>{properties.length}</span></div>
          <button className={`availability-property ${selectedId === "all" ? "selected" : ""}`} onClick={() => setSelectedId("all")}>
            <span>{lang === "ar" ? "كل الوحدات" : "All properties"}</span><small>{lang === "ar" ? "عرض تداخل التوفر" : "See availability overlap"}</small>
          </button>
          <div className="availability-property-list">
            {properties.map((property) => (
              <button key={property.id} className={`availability-property ${selectedId === property.id ? "selected" : ""}`} onClick={() => setSelectedId(property.id)}>
                <span>{propName(property, lang)}</span><small>{property.neighborhood || "Riyadh"} · {property.bedrooms} {lang === "ar" ? "غرف" : "BR"}</small>
              </button>
            ))}
          </div>
        </aside>

        <div className="availability-main">
          <div className="availability-toolbar">
            <div>
              <strong>{selectedProperty ? propName(selectedProperty, lang) : lang === "ar" ? "كل الوحدات" : "All properties"}</strong>
              <span>{selectedId === "all" ? (lang === "ar" ? "أي نقطة ملوّنة تعني أن وحدة واحدة على الأقل محجوزة أو محجوبة" : "A colored marker means at least one property is unavailable") : (lang === "ar" ? "توفر وحجوزات الوحدة المختارة" : "Availability and reservations for the selected property")}</span>
            </div>
            <div className="availability-nav">
              <button className="btn-ghost" onClick={() => setMonthOffset((value) => value - 1)} aria-label="Previous month">→</button>
              <button className="btn-ghost" onClick={() => setMonthOffset(0)}>{lang === "ar" ? "اليوم" : "Today"}</button>
              <button className="btn-ghost" onClick={() => setMonthOffset((value) => value + 1)} aria-label="Next month">←</button>
            </div>
          </div>

          <div className="availability-legend">
            <span><i className="available" />{lang === "ar" ? "متاح" : "Available"}</span>
            <span><i className="airbnb" />Airbnb</span>
            <span><i className="gathern" />Gathern</span>
            <span><i className="direct" />{lang === "ar" ? "مباشر" : "Direct"}</span>
          </div>

          {loading ? <div className="availability-loading">{lang === "ar" ? "جارٍ تحميل التوفر…" : "Loading availability…"}</div> : error ? <div className="admin-err">{error}</div> : (
            <div className="availability-months">
              <MonthBoard year={current.year} month={current.month} states={calendarStates} lang={lang} />
              <MonthBoard year={next.year} month={next.month} states={calendarStates} lang={lang} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
