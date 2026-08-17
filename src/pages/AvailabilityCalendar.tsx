import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase, type BlockedDate } from "../lib/supabase";
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
type PropertySummary = Pick<AdminProperty, "id" | "slug" | "name_ar" | "name_en" | "bedrooms" | "neighborhood" | "hero_image" | "price_per_night" | "is_active">;

type CalendarCopy = {
  pricingRules: string; pricingDescription: string; base: string; night: string; weekdayPrice: string; weekendPrice: string;
  leaveBlank: string; chooseWeekend: string; saveWeekly: string; selectedDates: string; clear: string; nightlyPrice: string;
  automaticPrice: string; minStay: string; optional: string; closeBooking: string; internalNote: string; notePlaceholder: string;
  applyDates: string; resetAutomatic: string; chooseDate: string; dateRange: string; days: string; clickRange: string;
  bookedReadOnly: string; closed: string; price: string; monthPrevious: string; monthNext: string; pricesShown: string;
  propertyEditPrice: string; viewProperty: string; propertySettings: string; allProperties: string; selectProperty: string;
};

function copyFor(lang: string): CalendarCopy {
  if (lang === "en") return { pricingRules: "Pricing rules", pricingDescription: "Base price first, then weekday/weekend rules, then date overrides.", base: "Base", night: "/ night", weekdayPrice: "Weekday price (SAR)", weekendPrice: "Weekend price (SAR)", leaveBlank: "Leave blank to use the base price", chooseWeekend: "Choose this unit's weekend days.", saveWeekly: "Save weekday & weekend prices", selectedDates: "Selected dates", clear: "Clear", nightlyPrice: "Nightly price (SAR)", automaticPrice: "Leave blank for automatic price", minStay: "Minimum stay (nights)", optional: "Optional", closeBooking: "Close for booking", internalNote: "Internal note", notePlaceholder: "Example: Riyadh Season", applyDates: "Apply to selected dates", resetAutomatic: "Reset to automatic", chooseDate: "Choose a date or range", dateRange: "days selected", days: "days", clickRange: "Select a date, then a second date to select a range. Booked dates are read-only.", bookedReadOnly: "Booked — current reservation is read-only", closed: "Closed", price: "Price", monthPrevious: "Previous month", monthNext: "Next month", pricesShown: "Prices for the two displayed months", propertyEditPrice: "Edit price", viewProperty: "View property", propertySettings: "Property settings", allProperties: "All properties", selectProperty: "Select a property" };
  return { pricingRules: "قواعد التسعير", pricingDescription: "السعر الأساسي ثم قاعدة أيام الأسبوع والويكند ثم أي سعر خاص للتاريخ.", base: "الأساسي", night: "/ ليلة", weekdayPrice: "سعر أيام الأسبوع (﷼)", weekendPrice: "سعر الويكند (﷼)", leaveBlank: "اترك الحقل فارغاً للعودة للسعر الأساسي", chooseWeekend: "حدد أيام الويكند الفعلية لهذه الوحدة.", saveWeekly: "حفظ أسعار الأسبوع والويكند", selectedDates: "التواريخ المختارة", clear: "مسح", nightlyPrice: "السعر لكل ليلة (﷼)", automaticPrice: "اتركه فارغاً للسعر التلقائي", minStay: "أقل إقامة (ليالي)", optional: "اختياري", closeBooking: "إغلاق للحجز", internalNote: "ملاحظة داخلية", notePlaceholder: "مثال: موسم الرياض", applyDates: "تطبيق على التواريخ", resetAutomatic: "إعادة للتلقائي", chooseDate: "اختر تاريخاً أو نطاقاً", dateRange: "أيام", days: "أيام", clickRange: "اضغط تاريخاً ثم تاريخاً ثانياً لتحديد مدى كامل. التواريخ المحجوزة واضحة ولا تتغير حجوزاتها الحالية.", bookedReadOnly: "محجوز — سيبقى السعر للعرض فقط", closed: "مغلق", price: "السعر", monthPrevious: "الشهر السابق", monthNext: "الشهر التالي", pricesShown: "أسعار الشهرين المعروضين", propertyEditPrice: "تعديل السعر", viewProperty: "عرض الوحدة", propertySettings: "إعدادات الوحدة", allProperties: "كل الوحدات", selectProperty: "اختر وحدة" };
}

const WEEKDAY_LABELS: Record<string, Record<number, string>> = {
  ar: { 0: "الأحد", 1: "الاثنين", 2: "الثلاثاء", 3: "الأربعاء", 4: "الخميس", 5: "الجمعة", 6: "السبت" },
  en: { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" },
};

const SOURCE_META: Record<string, { ar: string; en: string; className: string }> = {
  airbnb: { ar: "Airbnb", en: "Airbnb", className: "airbnb" },
  gathern: { ar: "Gathern", en: "Gathern", className: "gathern" },
  direct: { ar: "حجز مباشر", en: "Direct", className: "direct" },
  horizon: { ar: "Horizon", en: "Horizon", className: "horizon" },
};
const WEEKDAYS = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];

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

function PricingMonth({ year, month, days, selected, onPick, basePrice, weekdayPrice, weekendPrice, weekendDays, lang, copy }: { year: number; month: number; days: Map<string, PriceDay>; selected: Set<string>; onPick: (date: string) => void; basePrice: number; weekdayPrice: number | null; weekendPrice: number | null; weekendDays: number[]; lang: string; copy: CalendarCopy }) {
  const today = isoDate(new Date());
  return (
    <section className="pricing-month">
      <h3>{monthName(year, month, lang)}</h3>
      <div className="pricing-dows">{(lang === "en" ? ["S", "M", "T", "W", "T", "F", "S"] : WEEKDAYS).map((name, index) => <span key={`${name}-${index}`}>{name}</span>)}</div>
      <div className="pricing-grid">
        {monthCells(year, month).map((day, index) => {
          if (!day) return <span className="pricing-day empty" key={`empty-${index}`} />;
          const date = dateKey(year, month, day);
          const detail = days.get(date);
          const displayPrice = detail?.effective_price ?? resolveNightlyPrice({ date, basePrice, weekdayPrice, weekendPrice, weekendDays, overridePrice: detail?.override_price });
          const isPast = date < today;
          const status = detail?.is_booked ? "booked" : detail?.is_closed ? "closed" : detail?.has_override ? "override" : detail?.rule_price !== null && detail?.rule_price !== undefined ? "rule" : "base";
          return <button type="button" key={date} className={`pricing-day ${status} ${selected.has(date) ? "selected" : ""} ${isPast ? "past" : ""}`} onClick={() => !isPast && onPick(date)} disabled={isPast} title={detail?.is_booked ? copy.bookedReadOnly : detail?.is_closed ? copy.closed : `${copy.price} ${displayPrice.toLocaleString()} ${lang === "en" ? "SAR" : "﷼"}`}><b>{day}</b><small>{detail?.is_closed ? copy.closed : `${displayPrice.toLocaleString()} ${lang === "en" ? "SAR" : "﷼"}`}</small>{detail?.minimum_stay ? <em>{detail.minimum_stay} {lang === "en" ? "nights" : "ليالٍ"}</em> : null}</button>;
        })}
      </div>
    </section>
  );
}

function PricingEditor({ propertyId, offset, onChanged, lang, copy }: { propertyId: number; offset: number; onChanged: () => void; lang: string; copy: CalendarCopy }) {
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
  const selectedSummary = selectedDates.length === 0 ? copy.chooseDate : selectedDates.length === 1 ? selectedDates[0] : `${selectedDates[0]} ← ${selectedDates[selectedDates.length - 1]} · ${selectedDates.length} ${copy.dateRange}`;

  const pickDate = (date: string) => {
    if (!selectionAnchor || selectedDates.length > 1) { setSelectionAnchor(date); setSelectedDates([date]); }
    else { setSelectedDates(dateRange(selectionAnchor, date)); setSelectionAnchor(null); }
    const entry = dayMap.get(date);
    if (selectedDates.length <= 1 && entry) setDraft({ price: entry.override_price?.toString() || entry.effective_price?.toString() || "", closed: entry.is_closed, minimumStay: entry.minimum_stay?.toString() || "", note: entry.note || "" });
  };
  const flash = (text: string) => { setMessage(text); setTimeout(() => setMessage(""), 3500); };
  const saveWeekly = async () => {
    setBusy(true);
    try { await adminRpc("admin_set_weekly_pricing", { p_property_id: propertyId, p_weekday_price: weekly.weekday === "" ? null : Number(weekly.weekday), p_weekend_price: weekly.weekend === "" ? null : Number(weekly.weekend), p_weekend_days: weekly.weekendDays }); await load(); onChanged(); flash(lang === "en" ? "Weekday and weekend prices saved ✓" : "تم حفظ سعر الأساس والأسبوع والويكند ✓"); }
    catch (error: any) { setMessage(error.message || "فشل حفظ القاعدة الأسبوعية"); }
    finally { setBusy(false); }
  };
  const saveDates = async () => {
    if (!selectedDates.length) return;
    setBusy(true);
    try { await adminRpc("admin_upsert_date_prices", { p_property_id: propertyId, p_days: selectedDates.map((date) => ({ price_date: date, nightly_price: draft.price.trim() === "" ? null : Number(draft.price), is_closed: draft.closed, minimum_stay: draft.minimumStay === "" ? null : Number(draft.minimumStay), note: draft.note.trim() || null })) }); await load(); onChanged(); flash(lang === "en" ? `Applied to ${selectedDates.length} ${copy.days} ✓` : `تم تطبيق الإعداد على ${selectedDates.length} يوم ✓`); }
    catch (error: any) { setMessage(error.message || "فشل حفظ أسعار التواريخ"); }
    finally { setBusy(false); }
  };
  const clearOverrides = async () => {
    if (!selectedDates.length) return;
    setBusy(true);
    try { await adminRpc("admin_clear_date_prices", { p_property_id: propertyId, p_dates: selectedDates }); setDraft({ price: "", closed: false, minimumStay: "", note: "" }); await load(); onChanged(); flash(lang === "en" ? "Dates reset to automatic ✓" : "تمت إعادة التواريخ إلى السعر التلقائي ✓"); }
    catch (error: any) { setMessage(error.message || "تعذر حذف التعديل"); }
    finally { setBusy(false); }
  };
  const toggleWeekendDay = (day: number) => setWeekly((current) => ({ ...current, weekendDays: current.weekendDays.includes(day) ? current.weekendDays.filter((value) => value !== day) : [...current.weekendDays, day].sort() }));

  return (
    <section className="unified-pricing-section">
      <div className="unified-section-head"><div><span className="eyebrow">{copy.pricingRules}</span><h2>{lang === "en" ? "Price this property by date" : "تسعير الوحدة حسب الأيام والتواريخ"}</h2><p>{copy.pricingDescription}</p></div><strong>{fmtSAR(data?.property?.base_price || 0)} {copy.night}</strong></div>
      <div className="pricing-layout">
        <section className="pricing-calendar-card">
          <div className="pricing-legend"><span><i className="base" />{copy.base}</span><span><i className="rule" />{lang === "en" ? "Weekly rule" : "قاعدة أسبوعية"}</span><span><i className="override" />{lang === "en" ? "Date override" : "سعر مخصص"}</span><span><i className="booked" />{lang === "en" ? "Booked" : "محجوز"}</span><span><i className="closed" />{copy.closed}</span></div>
          <div className="pricing-months"><PricingMonth year={firstMonth.getUTCFullYear()} month={firstMonth.getUTCMonth()} days={dayMap} selected={selected} onPick={pickDate} basePrice={data?.property?.base_price || 0} weekdayPrice={data?.weekly?.weekday_price ?? null} weekendPrice={data?.weekly?.weekend_price ?? null} weekendDays={data?.weekly?.weekend_days || [5, 6]} lang={lang} copy={copy} /><PricingMonth year={secondMonth.getUTCFullYear()} month={secondMonth.getUTCMonth()} days={dayMap} selected={selected} onPick={pickDate} basePrice={data?.property?.base_price || 0} weekdayPrice={data?.weekly?.weekday_price ?? null} weekendPrice={data?.weekly?.weekend_price ?? null} weekendDays={data?.weekly?.weekend_days || [5, 6]} lang={lang} copy={copy} /></div>
          <p className="pricing-help">{copy.clickRange}</p>
        </section>
        <aside className="pricing-side">
          <section className="pricing-panel"><div className="pricing-panel-head"><div><span>{lang === "en" ? "Weekly prices" : "الأسعار الأسبوعية"}</span><strong>{fmtSAR(data?.property?.base_price || 0)} {copy.night}</strong></div><small>{copy.leaveBlank}</small></div><div className="pe-grid compact"><div className="sf-row"><label>{copy.weekdayPrice}</label><input dir="ltr" type="number" min="0" value={weekly.weekday} onChange={(event) => setWeekly((current) => ({ ...current, weekday: event.target.value }))} placeholder={String(data?.property?.base_price || "")} /></div><div className="sf-row"><label>{copy.weekendPrice}</label><input dir="ltr" type="number" min="0" value={weekly.weekend} onChange={(event) => setWeekly((current) => ({ ...current, weekend: event.target.value }))} placeholder={String(data?.property?.base_price || "")} /></div></div><p className="pricing-side-note">{copy.chooseWeekend}</p><div className="weekend-days">{[0, 1, 2, 3, 4, 5, 6].map((day) => <button key={day} type="button" className={weekly.weekendDays.includes(day) ? "active" : ""} onClick={() => toggleWeekendDay(day)}>{WEEKDAY_LABELS[lang === "en" ? "en" : "ar"][day]}</button>)}</div><button className="btn-ghost wide" onClick={saveWeekly} disabled={busy}>{busy ? (lang === "en" ? "Saving…" : "جارٍ الحفظ…") : copy.saveWeekly}</button></section>
          <section className="pricing-panel selected-editor"><div className="pricing-panel-head"><div><span>{copy.selectedDates}</span><strong dir="ltr">{selectedSummary}</strong></div><button className="btn-ghost sm" onClick={() => { setSelectedDates([]); setSelectionAnchor(null); }}>{copy.clear}</button></div><div className="sf-row"><label>{copy.nightlyPrice}</label><input dir="ltr" type="number" min="0" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))} placeholder={copy.automaticPrice} disabled={!selectedDates.length} /></div><div className="pe-grid compact"><div className="sf-row"><label>{copy.minStay}</label><input dir="ltr" type="number" min="1" max="30" value={draft.minimumStay} onChange={(event) => setDraft((current) => ({ ...current, minimumStay: event.target.value }))} placeholder={copy.optional} disabled={!selectedDates.length} /></div><label className="pricing-closed-toggle"><input type="checkbox" checked={draft.closed} onChange={(event) => setDraft((current) => ({ ...current, closed: event.target.checked }))} disabled={!selectedDates.length} /> {copy.closeBooking}</label></div><div className="sf-row"><label>{copy.internalNote}</label><input value={draft.note} maxLength={180} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} placeholder={copy.notePlaceholder} disabled={!selectedDates.length} /></div><div className="pricing-editor-actions"><button className="btn-activate" onClick={saveDates} disabled={busy || !selectedDates.length}>{busy ? (lang === "en" ? "Saving…" : "جارٍ الحفظ…") : copy.applyDates}</button><button className="btn-ghost danger" onClick={clearOverrides} disabled={busy || !selectedDates.length}>{copy.resetAutomatic}</button></div></section>
        </aside>
      </div>
      {message && <div className="admin-toast inline">{message}</div>}
    </section>
  );
}

export default function AvailabilityCalendar() {
  const { lang } = useLang();
  const copy = useMemo(() => copyFor(lang), [lang]);
  const [adminProperties, setAdminProperties] = useState<AdminProperty[]>([]);
  const [propertySummaries, setPropertySummaries] = useState<PropertySummary[]>([]);
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [selectedId, setSelectedId] = useState<number | "all">("all");
  const [monthOffset, setMonthOffset] = useState(0);
  const [pricingOffset, setPricingOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adminChecking, setAdminChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedLoading, setSelectedLoading] = useState(false);

  const loadPropertySummaries = useCallback(async () => {
    const { data, error: summaryError } = await supabase.from("properties").select("id, slug, name_ar, name_en, bedrooms, neighborhood, hero_image, price_per_night, is_active").eq("is_active", true).order("price_per_night", { ascending: false });
    if (summaryError) throw summaryError;
    setPropertySummaries((data || []) as PropertySummary[]);
  }, []);
  const loadAdminProperties = useCallback(async () => {
    const result = await adminRpc<{ properties: AdminProperty[] }>("admin_list_properties");
    setAdminProperties(result.properties || []);
  }, []);
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const start = new Date();
      const today = start.toISOString().slice(0, 10);
      const until = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 14, 1)).toISOString().slice(0, 10);
      const { data, error: queryError } = await supabase.from("blocked_dates").select("id, property_id, source, start_date, end_date").gte("end_date", today).lte("start_date", until).order("start_date", { ascending: true });
      if (queryError) throw queryError;
      setBlocked((data || []) as BlockedDate[]);
    } catch (loadError: any) { setError(loadError.message || (lang === "en" ? "Could not load availability" : "تعذر تحميل التقويم")); }
    finally { setLoading(false); }
  }, [lang]);
  useEffect(() => { if (isAdmin) loadData(); }, [isAdmin, loadData, refreshKey]);
  useEffect(() => {
    const token = getAdminToken();
    if (!token) { setAdminChecking(false); return; }
    adminCheck(token).then(async (ok) => { setIsAdmin(ok); if (ok) await loadPropertySummaries(); }).catch(() => setIsAdmin(false)).finally(() => setAdminChecking(false));
  }, [loadPropertySummaries]);
  useEffect(() => {
    if (!isAdmin || selectedId === "all") { setAdminProperties([]); return; }
    setSelectedLoading(true);
    loadAdminProperties().catch((loadError: any) => setError(loadError.message || (lang === "en" ? "Could not load property details" : "تعذر تحميل تفاصيل الوحدة"))).finally(() => setSelectedLoading(false));
  }, [isAdmin, selectedId, loadAdminProperties, lang]);

  const properties = propertySummaries;
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
  const title = lang === "en" ? "Unified properties & pricing calendar" : "التقويم الموحد للوحدات والأسعار";
  const subtitle = lang === "en" ? "Select a property to manage its photos, amenities, channels, and pricing rules from one workspace." : "اختر وحدة لفتح صورها ومميزاتها وقنواتها وقواعد أسعارها من نفس صفحة التقويم.";
  const body = (
    <div className={`availability-page container ${isAdmin ? "unified-calendar-admin" : ""}`}>
      <section className="availability-hero"><div><span className="eyebrow">Horizon calendar</span><h1>{title}</h1><p>{subtitle}</p></div>{selectedProperty && <div className="calendar-property-actions"><Link className="btn-ghost" to={`/property/${selectedProperty.slug}`}>{copy.viewProperty}</Link><button className="btn-activate" type="button" onClick={() => document.getElementById("unified-pricing-editor")?.scrollIntoView({ behavior: "smooth", block: "start" })}>{copy.propertyEditPrice}</button></div>}</section>
      <section className="availability-shell">
        <aside className="availability-sidebar"><div className="availability-filter-head"><strong>{lang === "ar" ? "الوحدات" : "Properties"}</strong><span>{properties.length}</span></div><button className={`availability-property ${selectedId === "all" ? "selected" : ""}`} onClick={() => chooseProperty("all")}><span>{copy.allProperties}</span><small>{lang === "ar" ? "عرض تداخل التوفر" : "See availability overlap"}</small></button><div className="availability-property-list">{properties.map((property) => <button key={property.id} className={`availability-property ${selectedId === property.id ? "selected" : ""}`} onClick={() => chooseProperty(property.id)}><span>{propName(property, lang)}</span><small>{property.neighborhood || "Riyadh"} · {property.bedrooms} {lang === "ar" ? "غرف" : "BR"}</small></button>)}</div></aside>
        <div className="availability-main"><div className="availability-toolbar"><div><strong>{selectedProperty ? propName(selectedProperty, lang) : lang === "ar" ? "كل الوحدات" : "All properties"}</strong><span>{selectedId === "all" ? (lang === "ar" ? "أي نقطة ملوّنة تعني أن وحدة واحدة على الأقل محجوزة أو محجوبة" : "A colored marker means at least one property is unavailable") : (lang === "ar" ? "توفر وحجوزات الوحدة المختارة" : "Availability and reservations for the selected property")}</span></div><div className="availability-nav"><button className="btn-ghost" onClick={() => setMonthOffset((value) => value - 1)} aria-label="Previous month">→</button><button className="btn-ghost" onClick={() => setMonthOffset(0)}>{lang === "ar" ? "اليوم" : "Today"}</button><button className="btn-ghost" onClick={() => setMonthOffset((value) => value + 1)} aria-label="Next month">←</button></div></div><div className="availability-legend"><span><i className="available" />{lang === "ar" ? "متاح" : "Available"}</span><span><i className="airbnb" />Airbnb</span><span><i className="gathern" />Gathern</span><span><i className="direct" />{lang === "ar" ? "مباشر" : "Direct"}</span></div>{loading ? <div className="availability-loading">{lang === "ar" ? "جارٍ تحميل التوفر…" : "Loading availability…"}</div> : error ? <div className="admin-err">{error}</div> : <div className="availability-months"><AvailabilityMonth year={current.year} month={current.month} states={calendarStates} lang={lang} /><AvailabilityMonth year={next.year} month={next.month} states={calendarStates} lang={lang} /></div>}</div>
      </section>
      {isAdmin && selectedId !== "all" && (selectedLoading || !adminSelected) && <div className="unified-editor-loading">{lang === "en" ? "Loading property editor…" : "جارٍ تحميل محرر الوحدة…"}</div>}
      {isAdmin && selectedId !== "all" && adminSelected && <><div id="unified-property-editor"><PropertyEditor p={adminSelected} onSaved={async () => { await loadAdminProperties(); refreshAll(); }} onClose={() => chooseProperty("all")} /></div><div id="unified-pricing-editor" className="unified-pricing-nav"><button className="btn-ghost" onClick={() => setPricingOffset((value) => Math.max(0, value - 1))} disabled={pricingOffset === 0}>{lang === "en" ? "← Previous month" : "← الشهر السابق"}</button><strong>{copy.pricesShown}</strong><button className="btn-ghost" onClick={() => setPricingOffset((value) => Math.min(10, value + 1))}>{lang === "en" ? "Next month →" : "الشهر التالي →"}</button></div><PricingEditor propertyId={selectedId} offset={pricingOffset} onChanged={refreshAll} lang={lang} copy={copy} /></>}
      {isAdmin && selectedId === "all" && <div className="calendar-admin-hint"><strong>{copy.selectProperty}</strong><span>{lang === "en" ? "After selection, the photo gallery, amenities, channel links, Odoo mapping, and weekday/weekend/date pricing controls appear here." : "بعد الاختيار ستظهر الصور والمميزات والروابط وإعدادات Odoo ثم قواعد سعر الأسبوع والويكند والتواريخ الخاصة تحت التقويم."}</span></div>}
    </div>
  );
  if (adminChecking) return <div className="availability-page container"><div className="availability-loading">جارٍ تجهيز التقويم…</div></div>;
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return <AdminLayout authVerified title={lang === "en" ? "Unified calendar" : "التقويم الموحد"} subtitle={lang === "en" ? "Availability, photos, property settings, and pricing rules" : "التوفر، الصور، إعدادات الوحدة، وقواعد الأسعار في مساحة تشغيل واحدة"}>{body}</AdminLayout>;
}
