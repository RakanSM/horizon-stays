import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProperties, supabase, type BlockedDate, type Property } from "../lib/supabase";
import { useLang, propName } from "../lib/i18n";
import { adminCheck, getAdminToken } from "../lib/ThemeContext";
import { adminRpc, fmtSAR, type AdminProperty } from "../lib/adminApi";
import { PropertyEditor } from "./admin/AdminProperties";
import { resolveNightlyPrice } from "../lib/pricing";
import AdminLayout from "../components/AdminLayout";

type DayState = { sources: string[]; isBlocked: boolean };
type PriceDay = {
  date: string;
  base_price: number;
  rule_price: number | null;
  override_price: number | null;
  effective_price: number;
  is_closed: boolean;
  is_booked: boolean;
  minimum_stay: number | null;
  note: string | null;
  has_override: boolean;
};
type PricingCalendarData = {
  property: { id: number; slug: string; name_ar: string; name_en: string; base_price: number };
  weekly: { weekday_price: number | null; weekend_price: number | null; weekend_days: number[] };
  days: PriceDay[];
};
type EditorDraft = { price: string; closed: boolean; minimumStay: string; note: string };

const SOURCE_META: Record<string, { ar: string; en: string; className: string }> = {
  airbnb: { ar: "Airbnb", en: "Airbnb", className: "airbnb" },
  gathern: { ar: "Gathern", en: "Gathern", className: "gathern" },
  direct: { ar: "حجز مباشر", en: "Direct", className: "direct" },
  horizon: { ar: "Horizon", en: "Horizon", className: "horizon" },
};
const WEEKDAYS = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];
const WEEKDAY_LABELS: Record<number, string> = { 0: "الأحد", 1: "الاثنين", 2: "الثلاثاء", 3: "الأربعاء", 4: "الخميس", 5: "الجمعة", 6: "السبت" };

function dateKey(year: number, month: number, day: number) { return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10); }
function monthCells(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [...Array(first.getUTCDay()).fill(null), ...Array.from({ length: days }, (_, index) => index + 1)];
}
function monthName(year: number, month: number, lang: string) {
  const locale = lang === "ar" ? "ar-SA" : lang === "zh" ? "zh-CN" : lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : "en-US";
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month, 1)));
}
function isoDate(value: Date) { return value.toISOString().slice(0, 10); }
function dateFromIso(value: string) { return new Date(`${value}T00:00:00Z`); }
function monthStart(offset: number) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
}
function monthEnd(offset: number) {
  const start = monthStart(offset + 1);
  start.setUTCDate(0);
  return start;
}
function addDays(value: string, amount: number) {
  const date = dateFromIso(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return isoDate(date);
}
function dateRange(start: string, end: string) {
  const low = start < end ? start : end;
  const high = start < end ? end : start;
  const result: string[] = [];
  for (let cursor = low; cursor <= high; cursor = addDays(cursor, 1)) result.push(cursor);
  return result;
}
function formatDaySources(sources: string[], lang: string) {
  return sources.map((source) => SOURCE_META[source]?.[lang === "ar" ? "ar" : "en"] || source).join(" · ");
}

function AvailabilityMonth({ year, month, states, lang }: { year: number; month: number; states: Map<string, DayState>; lang: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const weekdays = lang === "ar" ? ["ح", "ن", "ث", "ر", "خ", "ج", "س"] : ["S", "M", "T", "W", "T", "F", "S"];
  return (
    <section className="availability-month">
      <h2>{monthName(year, month, lang)}</h2>
      <div className="availability-weekdays">{weekdays.map((weekday, index) => <span key={`${weekday}-${index}`}>{weekday}</span>)}</div>
      <div className="availability-days">
        {monthCells(year, month).map((day, index) => {
          if (!day) return <span key={`empty-${index}`} className="availability-day empty" />;
          const key = dateKey(year, month, day);
          const state = states.get(key);
          const classes = ["availability-day", key < today ? "past" : "", state?.isBlocked ? "blocked" : "available", state?.sources?.length ? `source-${SOURCE_META[state.sources[0]]?.className || "horizon"}` : ""].filter(Boolean).join(" ");
          return <span className={classes} key={key} title={state?.sources?.length ? formatDaySources(state.sources, lang) : undefined}><b>{day}</b>{state?.sources?.length ? <i>{state.sources.slice(0, 2).map((source) => <em key={source} className={SOURCE_META[source]?.className || "horizon"} />)}</i> : null}</span>;
        })}
      </div>
    </section>
  );
}

function PricingMonth({ year, month, days, selected, onPick, basePrice, weekdayPrice, weekendPrice, weekendDays }: { year: number; month: number; days: Map<string, PriceDay>; selected: Set<string>; onPick: (date: string) => void; basePrice: number; weekdayPrice: number | null; weekendPrice: number | null; weekendDays: number[] }) {
  const today = isoDate(new Date());
  return (
    <section className="pricing-month">
      <h3>{monthName(year, month, "ar")}</h3>
      <div className="pricing-dows">{WEEKDAYS.map((name, index) => <span key={`${name}-${index}`}>{name}</span>)}</div>
      <div className="pricing-grid">
        {monthCells(year, month).map((day, index) => {
          if (!day) return <span className="pricing-day empty" key={`empty-${index}`} />;
          const date = dateKey(year, month, day);
          const detail = days.get(date);
          const displayPrice = detail?.effective_price ?? resolveNightlyPrice({ date, basePrice, weekdayPrice, weekendPrice, weekendDays, overridePrice: detail?.override_price });
          const isPast = date < today;
          const status = detail?.is_booked ? "booked" : detail?.is_closed ? "closed" : detail?.has_override ? "override" : detail?.rule_price !== null && detail?.rule_price !== undefined ? "rule" : "base";
          return <button type="button" key={date} className={`pricing-day ${status} ${selected.has(date) ? "selected" : ""} ${isPast ? "past" : ""}`} onClick={() => !isPast && onPick(date)} disabled={isPast} title={detail?.is_booked ? "محجوز — سيبقى السعر للعرض فقط" : detail?.is_closed ? "مغلق للحجز" : `السعر ${displayPrice.toLocaleString()} ﷼`}><b>{day}</b><small>{detail?.is_closed ? "مغلق" : `${displayPrice.toLocaleString()} ﷼`}</small>{detail?.minimum_stay ? <em>{detail.minimum_stay} ليالٍ</em> : null}</button>;
        })}
      </div>
    </section>
  );
}

function PricingEditor({ propertyId, offset, onChanged }: { propertyId: number; offset: number; onChanged: () => void }) {
  const [data, setData] = useState<PricingCalendarData | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectionAnchor, setSelectionAnchor] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditorDraft>({ price: "", closed: false, minimumStay: "", note: "" });
  const [weekly, setWeekly] = useState({ weekday: "", weekend: "", weekendDays: [5, 6] as number[] });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const rangeStart = isoDate(monthStart(offset));
  const rangeEnd = isoDate(monthEnd(offset + 1));

  const load = useCallback(async () => {
    const result = await adminRpc<{ ok: boolean } & PricingCalendarData>("admin_get_pricing_calendar", { p_property_id: propertyId, p_start: rangeStart, p_end: rangeEnd });
    if (!result.ok) throw new Error("تعذر تحميل أسعار الوحدة");
    setData(result);
    setWeekly({ weekday: result.weekly.weekday_price?.toString() || "", weekend: result.weekly.weekend_price?.toString() || "", weekendDays: result.weekly.weekend_days?.length ? result.weekly.weekend_days : [5, 6] });
  }, [propertyId, rangeStart, rangeEnd]);

  useEffect(() => { load().catch((error) => setMessage(error.message)); }, [load]);
  useEffect(() => { setSelectedDates([]); setSelectionAnchor(null); setDraft({ price: "", closed: false, minimumStay: "", note: "" }); }, [propertyId, offset]);
  const dayMap = useMemo(() => new Map((data?.days || []).map((day) => [day.date, day])), [data]);
  const selected = useMemo(() => new Set(selectedDates), [selectedDates]);
  const firstMonth = monthStart(offset);
  const secondMonth = monthStart(offset + 1);
  const selectedSummary = selectedDates.length === 0 ? "اختر تاريخاً أو نطاقاً" : selectedDates.length === 1 ? selectedDates[0] : `${selectedDates[0]} ← ${selectedDates[selectedDates.length - 1]} · ${selectedDates.length} أيام`;

  const pickDate = (date: string) => {
    if (!selectionAnchor || selectedDates.length > 1) { setSelectionAnchor(date); setSelectedDates([date]); }
    else { setSelectedDates(dateRange(selectionAnchor, date)); setSelectionAnchor(null); }
    const entry = dayMap.get(date);
    if (selectedDates.length <= 1 && entry) setDraft({ price: entry.override_price?.toString() || entry.effective_price?.toString() || "", closed: entry.is_closed, minimumStay: entry.minimum_stay?.toString() || "", note: entry.note || "" });
  };
  const flash = (text: string) => { setMessage(text); setTimeout(() => setMessage(""), 3500); };
  const saveWeekly = async () => {
    setBusy(true);
    try { await adminRpc("admin_set_weekly_pricing", { p_property_id: propertyId, p_weekday_price: weekly.weekday === "" ? null : Number(weekly.weekday), p_weekend_price: weekly.weekend === "" ? null : Number(weekly.weekend), p_weekend_days: weekly.weekendDays }); await load(); onChanged(); flash("تم حفظ سعر الأساس والأسبوع والويكند ✓"); }
    catch (error: any) { setMessage(error.message || "فشل حفظ القاعدة الأسبوعية"); }
    finally { setBusy(false); }
  };
  const saveDates = async () => {
    if (!selectedDates.length) return;
    setBusy(true);
    try { await adminRpc("admin_upsert_date_prices", { p_property_id: propertyId, p_days: selectedDates.map((date) => ({ price_date: date, nightly_price: draft.price.trim() === "" ? null : Number(draft.price), is_closed: draft.closed, minimum_stay: draft.minimumStay === "" ? null : Number(draft.minimumStay), note: draft.note.trim() || null })) }); await load(); onChanged(); flash(`تم تطبيق الإعداد على ${selectedDates.length} يوم ✓`); }
    catch (error: any) { setMessage(error.message || "فشل حفظ أسعار التواريخ"); }
    finally { setBusy(false); }
  };
  const clearOverrides = async () => {
    if (!selectedDates.length) return;
    setBusy(true);
    try { await adminRpc("admin_clear_date_prices", { p_property_id: propertyId, p_dates: selectedDates }); setDraft({ price: "", closed: false, minimumStay: "", note: "" }); await load(); onChanged(); flash("تمت إعادة التواريخ إلى السعر التلقائي ✓"); }
    catch (error: any) { setMessage(error.message || "تعذر حذف التعديل"); }
    finally { setBusy(false); }
  };
  const toggleWeekendDay = (day: number) => setWeekly((current) => ({ ...current, weekendDays: current.weekendDays.includes(day) ? current.weekendDays.filter((value) => value !== day) : [...current.weekendDays, day].sort() }));

  return (
    <section className="unified-pricing-section">
      <div className="unified-section-head"><div><span className="eyebrow">Pricing rules</span><h2>تسعير الوحدة حسب الأيام والتواريخ</h2><p>السعر الأساسي هو نقطة البداية، ثم قاعدة الأسبوع والويكند، ثم أي سعر خاص للتاريخ المحدد.</p></div><strong>{fmtSAR(data?.property?.base_price || 0)} / ليلة</strong></div>
      <div className="pricing-layout">
        <section className="pricing-calendar-card">
          <div className="pricing-legend"><span><i className="base" />السعر الأساسي</span><span><i className="rule" />قاعدة أسبوعية</span><span><i className="override" />سعر مخصص</span><span><i className="booked" />محجوز</span><span><i className="closed" />مغلق</span></div>
          <div className="pricing-months"><PricingMonth year={firstMonth.getUTCFullYear()} month={firstMonth.getUTCMonth()} days={dayMap} selected={selected} onPick={pickDate} basePrice={data?.property?.base_price || 0} weekdayPrice={data?.weekly?.weekday_price ?? null} weekendPrice={data?.weekly?.weekend_price ?? null} weekendDays={data?.weekly?.weekend_days || [5, 6]} /><PricingMonth year={secondMonth.getUTCFullYear()} month={secondMonth.getUTCMonth()} days={dayMap} selected={selected} onPick={pickDate} basePrice={data?.property?.base_price || 0} weekdayPrice={data?.weekly?.weekday_price ?? null} weekendPrice={data?.weekly?.weekend_price ?? null} weekendDays={data?.weekly?.weekend_days || [5, 6]} /></div>
          <p className="pricing-help">اضغط تاريخاً ثم تاريخاً ثانياً لتحديد مدى كامل. التواريخ المحجوزة واضحة ولا تتغير حجوزاتها الحالية.</p>
        </section>
        <aside className="pricing-side">
          <section className="pricing-panel"><div className="pricing-panel-head"><div><span>الأسعار الأسبوعية</span><strong>{fmtSAR(data?.property?.base_price || 0)} / ليلة</strong></div><small>اترك الحقل فارغاً للعودة للسعر الأساسي</small></div><div className="pe-grid compact"><div className="sf-row"><label>سعر أيام الأسبوع (﷼)</label><input dir="ltr" type="number" min="0" value={weekly.weekday} onChange={(event) => setWeekly((current) => ({ ...current, weekday: event.target.value }))} placeholder={String(data?.property?.base_price || "")} /></div><div className="sf-row"><label>سعر الويكند (﷼)</label><input dir="ltr" type="number" min="0" value={weekly.weekend} onChange={(event) => setWeekly((current) => ({ ...current, weekend: event.target.value }))} placeholder={String(data?.property?.base_price || "")} /></div></div><p className="pricing-side-note">حدد أيام الويكند الفعلية لهذه الوحدة.</p><div className="weekend-days">{[0, 1, 2, 3, 4, 5, 6].map((day) => <button key={day} type="button" className={weekly.weekendDays.includes(day) ? "active" : ""} onClick={() => toggleWeekendDay(day)}>{WEEKDAY_LABELS[day]}</button>)}</div><button className="btn-ghost wide" onClick={saveWeekly} disabled={busy}>{busy ? "جارٍ الحفظ…" : "حفظ أسعار الأسبوع والويكند"}</button></section>
          <section className="pricing-panel selected-editor"><div className="pricing-panel-head"><div><span>التواريخ المختارة</span><strong dir="ltr">{selectedSummary}</strong></div><button className="btn-ghost sm" onClick={() => { setSelectedDates([]); setSelectionAnchor(null); }}>مسح</button></div><div className="sf-row"><label>السعر لكل ليلة (﷼)</label><input dir="ltr" type="number" min="0" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))} placeholder="اتركه فارغاً للسعر التلقائي" disabled={!selectedDates.length} /></div><div className="pe-grid compact"><div className="sf-row"><label>أقل إقامة (ليالي)</label><input dir="ltr" type="number" min="1" max="30" value={draft.minimumStay} onChange={(event) => setDraft((current) => ({ ...current, minimumStay: event.target.value }))} placeholder="اختياري" disabled={!selectedDates.length} /></div><label className="pricing-closed-toggle"><input type="checkbox" checked={draft.closed} onChange={(event) => setDraft((current) => ({ ...current, closed: event.target.checked }))} disabled={!selectedDates.length} /> إغلاق للحجز</label></div><div className="sf-row"><label>ملاحظة داخلية</label><input value={draft.note} maxLength={180} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} placeholder="مثال: موسم الرياض" disabled={!selectedDates.length} /></div><div className="pricing-editor-actions"><button className="btn-activate" onClick={saveDates} disabled={busy || !selectedDates.length}>{busy ? "جارٍ الحفظ…" : "تطبيق على التواريخ"}</button><button className="btn-ghost danger" onClick={clearOverrides} disabled={busy || !selectedDates.length}>إعادة للتلقائي</button></div></section>
        </aside>
      </div>
      {message && <div className="admin-toast inline">{message}</div>}
    </section>
  );
}

export default function AvailabilityCalendar() {
  const { lang } = useLang();
  const [properties, setProperties] = useState<Property[]>([]);
  const [adminProperties, setAdminProperties] = useState<AdminProperty[]>([]);
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [selectedId, setSelectedId] = useState<number | "all">("all");
  const [monthOffset, setMonthOffset] = useState(0);
  const [pricingOffset, setPricingOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adminChecking, setAdminChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAdminProperties = useCallback(async () => {
    const result = await adminRpc<{ properties: AdminProperty[] }>("admin_list_properties");
    setAdminProperties(result.properties || []);
  }, []);
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const activeProperties = await fetchProperties();
      const start = new Date();
      const until = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 14, 1)).toISOString().slice(0, 10);
      const { data, error: queryError } = await supabase.from("blocked_dates").select("id, property_id, source, start_date, end_date").gte("end_date", new Date().toISOString().slice(0, 10)).lte("start_date", until).order("start_date", { ascending: true });
      if (queryError) throw queryError;
      setProperties(activeProperties);
      setBlocked((data || []) as BlockedDate[]);
    } catch (loadError: any) { setError(loadError.message || "تعذر تحميل التقويم"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadData(); }, [loadData, refreshKey]);
  useEffect(() => {
    const token = getAdminToken();
    if (!token) { setAdminChecking(false); return; }
    adminCheck(token).then(async (ok) => { setIsAdmin(ok); if (ok) await loadAdminProperties(); }).catch(() => setIsAdmin(false)).finally(() => setAdminChecking(false));
  }, [loadAdminProperties]);

  const selectedProperty = properties.find((property) => property.id === selectedId) || null;
  const adminSelected = adminProperties.find((property) => property.id === selectedId) || null;
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
  const current = useMemo(() => { const today = new Date(); const pointer = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + monthOffset, 1)); return { year: pointer.getUTCFullYear(), month: pointer.getUTCMonth() }; }, [monthOffset]);
  const next = useMemo(() => { const pointer = new Date(Date.UTC(current.year, current.month + 1, 1)); return { year: pointer.getUTCFullYear(), month: pointer.getUTCMonth() }; }, [current]);
  const chooseProperty = (id: number | "all") => { setSelectedId(id); setPricingOffset(0); };
  const refreshAll = () => setRefreshKey((value) => value + 1);
  const title = isAdmin ? "التقويم الموحد للوحدات والأسعار" : lang === "ar" ? "تقويم التوفر" : "Availability calendar";
  const subtitle = isAdmin ? "اختر وحدة لفتح صورها ومميزاتها وقنواتها وقواعد أسعارها من نفس صفحة التقويم." : lang === "ar" ? "عرض موحد للحجوزات والفترات المحجوبة من Airbnb وGathern والحجوزات المباشرة." : "One view for booked and blocked dates from Airbnb, Gathern, and direct reservations.";
  const body = (
    <div className={`availability-page container ${isAdmin ? "unified-calendar-admin" : ""}`}>
      <section className="availability-hero"><div><span className="eyebrow">Horizon calendar</span><h1>{title}</h1><p>{subtitle}</p></div>{selectedProperty && !isAdmin && <Link className="btn-activate" to={`/property/${selectedProperty.slug}`}>{lang === "ar" ? "عرض صفحة الوحدة" : "View property"}</Link>}</section>
      <section className="availability-shell">
        <aside className="availability-sidebar"><div className="availability-filter-head"><strong>{lang === "ar" ? "الوحدات" : "Properties"}</strong><span>{properties.length}</span></div><button className={`availability-property ${selectedId === "all" ? "selected" : ""}`} onClick={() => chooseProperty("all")}><span>{lang === "ar" ? "كل الوحدات" : "All properties"}</span><small>{lang === "ar" ? "عرض تداخل التوفر" : "See availability overlap"}</small></button><div className="availability-property-list">{properties.map((property) => <button key={property.id} className={`availability-property ${selectedId === property.id ? "selected" : ""}`} onClick={() => chooseProperty(property.id)}><span>{propName(property, lang)}</span><small>{property.neighborhood || "Riyadh"} · {property.bedrooms} {lang === "ar" ? "غرف" : "BR"}</small></button>)}</div></aside>
        <div className="availability-main"><div className="availability-toolbar"><div><strong>{selectedProperty ? propName(selectedProperty, lang) : lang === "ar" ? "كل الوحدات" : "All properties"}</strong><span>{selectedId === "all" ? (lang === "ar" ? "أي نقطة ملوّنة تعني أن وحدة واحدة على الأقل محجوزة أو محجوبة" : "A colored marker means at least one property is unavailable") : (lang === "ar" ? "توفر وحجوزات الوحدة المختارة" : "Availability and reservations for the selected property")}</span></div><div className="availability-nav"><button className="btn-ghost" onClick={() => setMonthOffset((value) => value - 1)} aria-label="Previous month">→</button><button className="btn-ghost" onClick={() => setMonthOffset(0)}>{lang === "ar" ? "اليوم" : "Today"}</button><button className="btn-ghost" onClick={() => setMonthOffset((value) => value + 1)} aria-label="Next month">←</button></div></div><div className="availability-legend"><span><i className="available" />{lang === "ar" ? "متاح" : "Available"}</span><span><i className="airbnb" />Airbnb</span><span><i className="gathern" />Gathern</span><span><i className="direct" />{lang === "ar" ? "مباشر" : "Direct"}</span></div>{loading ? <div className="availability-loading">{lang === "ar" ? "جارٍ تحميل التوفر…" : "Loading availability…"}</div> : error ? <div className="admin-err">{error}</div> : <div className="availability-months"><AvailabilityMonth year={current.year} month={current.month} states={calendarStates} lang={lang} /><AvailabilityMonth year={next.year} month={next.month} states={calendarStates} lang={lang} /></div>}</div>
      </section>
      {isAdmin && selectedId !== "all" && adminSelected && <><PropertyEditor p={adminSelected} onSaved={async () => { await loadAdminProperties(); refreshAll(); }} onClose={() => chooseProperty("all")} /><div className="unified-pricing-nav"><button className="btn-ghost" onClick={() => setPricingOffset((value) => Math.max(0, value - 1))} disabled={pricingOffset === 0}>← الشهر السابق</button><strong>أسعار الشهرين المعروضين</strong><button className="btn-ghost" onClick={() => setPricingOffset((value) => Math.min(10, value + 1))}>الشهر التالي →</button></div><PricingEditor propertyId={selectedId} offset={pricingOffset} onChanged={refreshAll} /></>}
      {isAdmin && selectedId === "all" && <div className="calendar-admin-hint"><strong>اختر وحدة من القائمة</strong><span>بعد الاختيار ستظهر الصور والمميزات والروابط وإعدادات Odoo ثم قواعد سعر الأسبوع والويكند والتواريخ الخاصة تحت التقويم.</span></div>}
    </div>
  );
  if (adminChecking) return <div className="availability-page container"><div className="availability-loading">جارٍ تجهيز التقويم…</div></div>;
  if (isAdmin) return <AdminLayout title="التقويم الموحد" subtitle="التوفر، الصور، إعدادات الوحدة، وقواعد الأسعار في مساحة تشغيل واحدة">{body}</AdminLayout>;
  return body;
}
