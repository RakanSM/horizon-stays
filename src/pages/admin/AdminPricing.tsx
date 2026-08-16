import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { adminRpc, fmtSAR, type AdminProperty } from "../../lib/adminApi";
import { resolveNightlyPrice } from "../../lib/pricing";

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

const WEEKDAYS = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];
const WEEKDAY_LABELS: Record<number, string> = { 0: "الأحد", 1: "الاثنين", 2: "الثلاثاء", 3: "الأربعاء", 4: "الخميس", 5: "الجمعة", 6: "السبت" };

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
function monthCells(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [...Array(first.getUTCDay()).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];
}
function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("ar-SA", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month, 1)));
}

function PriceMonth({ year, month, days, selected, onPick, basePrice, weekdayPrice, weekendPrice, weekendDays }: { year: number; month: number; days: Map<string, PriceDay>; selected: Set<string>; onPick: (date: string) => void; basePrice: number; weekdayPrice: number | null; weekendPrice: number | null; weekendDays: number[] }) {
  const today = isoDate(new Date());
  return (
    <section className="pricing-month">
      <h3>{monthLabel(year, month)}</h3>
      <div className="pricing-dows">{WEEKDAYS.map((name, index) => <span key={`${name}-${index}`}>{name}</span>)}</div>
      <div className="pricing-grid">
        {monthCells(year, month).map((day, index) => {
          if (!day) return <span className="pricing-day empty" key={`empty-${index}`} />;
          const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const detail = days.get(date);
          const displayPrice = detail?.effective_price ?? resolveNightlyPrice({ date, basePrice, weekdayPrice, weekendPrice, weekendDays, overridePrice: detail?.override_price });
          const isPast = date < today;
          const status = detail?.is_booked ? "booked" : detail?.is_closed ? "closed" : detail?.has_override ? "override" : detail?.rule_price !== null && detail?.rule_price !== undefined ? "rule" : "base";
          return (
            <button
              type="button"
              key={date}
              className={`pricing-day ${status} ${selected.has(date) ? "selected" : ""} ${isPast ? "past" : ""}`}
              onClick={() => !isPast && onPick(date)}
              disabled={isPast}
              title={detail?.is_booked ? "محجوز — سيبقى السعر للعرض فقط" : detail?.is_closed ? "مغلق للحجز" : `السعر ${displayPrice.toLocaleString()} ﷼`}
            >
              <b>{day}</b>
              <small>{detail?.is_closed ? "مغلق" : `${displayPrice.toLocaleString()} ﷼`}</small>
              {detail?.minimum_stay ? <em>{detail.minimum_stay} ليالٍ</em> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function AdminPricing() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [propertyId, setPropertyId] = useState<number | "">("");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<PricingCalendarData | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectionAnchor, setSelectionAnchor] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditorDraft>({ price: "", closed: false, minimumStay: "", note: "" });
  const [weekly, setWeekly] = useState({ weekday: "", weekend: "", weekendDays: [5, 6] as number[] });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const rangeStart = isoDate(monthStart(offset));
  const rangeEnd = isoDate(monthEnd(offset + 1));

  const loadProperties = useCallback(async () => {
    const result = await adminRpc<{ properties: AdminProperty[] }>("admin_list_properties");
    const active = (result.properties || []).filter((property) => property.is_active);
    setProperties(active);
    setPropertyId((current) => current || active[0]?.id || "");
  }, []);

  const loadCalendar = useCallback(async () => {
    if (!propertyId) return;
    const result = await adminRpc<{ ok: boolean } & PricingCalendarData>("admin_get_pricing_calendar", {
      p_property_id: propertyId,
      p_start: rangeStart,
      p_end: rangeEnd,
    });
    if (!result.ok) throw new Error("تعذر تحميل التقويم");
    setData(result);
    setWeekly({
      weekday: result.weekly.weekday_price?.toString() || "",
      weekend: result.weekly.weekend_price?.toString() || "",
      weekendDays: result.weekly.weekend_days?.length ? result.weekly.weekend_days : [5, 6],
    });
  }, [propertyId, rangeStart, rangeEnd]);

  useEffect(() => { loadProperties().catch((error) => setMessage(error.message)); }, [loadProperties]);
  useEffect(() => { loadCalendar().catch((error) => setMessage(error.message)); }, [loadCalendar]);
  useEffect(() => { setSelectedDates([]); setSelectionAnchor(null); setDraft({ price: "", closed: false, minimumStay: "", note: "" }); }, [propertyId, offset]);

  const dayMap = useMemo(() => new Map((data?.days || []).map((day) => [day.date, day])), [data]);
  const selected = useMemo(() => new Set(selectedDates), [selectedDates]);
  const selectedSummary = selectedDates.length === 0 ? "اختر تاريخاً أو نطاقاً من التقويم" : selectedDates.length === 1 ? selectedDates[0] : `${selectedDates[0]} ← ${selectedDates[selectedDates.length - 1]} · ${selectedDates.length} أيام`;

  const pickDate = (date: string) => {
    if (!selectionAnchor || selectedDates.length > 1) {
      setSelectionAnchor(date);
      setSelectedDates([date]);
    } else {
      setSelectedDates(dateRange(selectionAnchor, date));
      setSelectionAnchor(null);
    }
    const entry = dayMap.get(date);
    if (selectedDates.length <= 1 && entry) {
      setDraft({ price: entry.override_price?.toString() || entry.effective_price?.toString() || "", closed: entry.is_closed, minimumStay: entry.minimum_stay?.toString() || "", note: entry.note || "" });
    }
  };

  const refresh = async (doneMessage?: string) => {
    await loadCalendar();
    if (doneMessage) { setMessage(doneMessage); setTimeout(() => setMessage(""), 3500); }
  };

  const saveWeekly = async () => {
    if (!propertyId) return;
    setBusy(true);
    try {
      await adminRpc("admin_set_weekly_pricing", {
        p_property_id: propertyId,
        p_weekday_price: weekly.weekday === "" ? null : Number(weekly.weekday),
        p_weekend_price: weekly.weekend === "" ? null : Number(weekly.weekend),
        p_weekend_days: weekly.weekendDays,
      });
      await refresh("تم حفظ أسعار أيام الأسبوع وعطلة نهاية الأسبوع ✓");
    } catch (error: any) { setMessage(error.message || "فشل حفظ القاعدة الأسبوعية"); }
    finally { setBusy(false); }
  };

  const saveDates = async () => {
    if (!propertyId || !selectedDates.length) return;
    setBusy(true);
    try {
      const price = draft.price.trim() === "" ? null : Number(draft.price);
      await adminRpc("admin_upsert_date_prices", {
        p_property_id: propertyId,
        p_days: selectedDates.map((date) => ({
          price_date: date,
          nightly_price: price,
          is_closed: draft.closed,
          minimum_stay: draft.minimumStay === "" ? null : Number(draft.minimumStay),
          note: draft.note.trim() || null,
        })),
      });
      await refresh(`تم تطبيق الإعداد على ${selectedDates.length} يوم ✓`);
    } catch (error: any) { setMessage(error.message || "فشل حفظ أسعار التواريخ"); }
    finally { setBusy(false); }
  };

  const clearOverrides = async () => {
    if (!propertyId || !selectedDates.length) return;
    setBusy(true);
    try {
      await adminRpc("admin_clear_date_prices", { p_property_id: propertyId, p_dates: selectedDates });
      setDraft({ price: "", closed: false, minimumStay: "", note: "" });
      await refresh("تمت إعادة التواريخ إلى السعر التلقائي ✓");
    } catch (error: any) { setMessage(error.message || "تعذر حذف التعديل"); }
    finally { setBusy(false); }
  };

  const toggleWeekendDay = (day: number) => setWeekly((current) => ({
    ...current,
    weekendDays: current.weekendDays.includes(day) ? current.weekendDays.filter((value) => value !== day) : [...current.weekendDays, day].sort(),
  }));

  const firstMonth = monthStart(offset);
  const secondMonth = monthStart(offset + 1);

  return (
    <AdminLayout title="تقويم الأسعار" subtitle="حدّد التواريخ وعدّل سعر كل وحدة، أو أنشئ قاعدة مستقلة لأيام الأسبوع والويكند.">
      <div className="pricing-topbar">
        <div className="pricing-unit-select sf-row">
          <label>الوحدة</label>
          <select value={propertyId} onChange={(event) => setPropertyId(event.target.value ? Number(event.target.value) : "")}>
            <option value="">اختر وحدة</option>
            {properties.map((property) => <option key={property.id} value={property.id}>{property.name_ar} · {fmtSAR(property.price_per_night)}</option>)}
          </select>
        </div>
        <div className="pricing-month-nav">
          <button className="btn-ghost" onClick={() => setOffset((value) => Math.max(0, value - 1))} disabled={offset === 0}>→</button>
          <button className="btn-ghost" onClick={() => setOffset(0)}>الشهر الحالي</button>
          <button className="btn-ghost" onClick={() => setOffset((value) => Math.min(10, value + 1))}>←</button>
        </div>
      </div>

      <div className="pricing-layout">
        <section className="pricing-calendar-card">
          <div className="pricing-legend">
            <span><i className="base" />السعر الأساسي</span><span><i className="rule" />قاعدة أسبوعية</span><span><i className="override" />سعر مخصص</span><span><i className="booked" />محجوز</span><span><i className="closed" />مغلق</span>
          </div>
          <div className="pricing-months">
            <PriceMonth year={firstMonth.getUTCFullYear()} month={firstMonth.getUTCMonth()} days={dayMap} selected={selected} onPick={pickDate} basePrice={data?.property?.base_price || 0} weekdayPrice={data?.weekly?.weekday_price ?? null} weekendPrice={data?.weekly?.weekend_price ?? null} weekendDays={data?.weekly?.weekend_days || [5, 6]} />
            <PriceMonth year={secondMonth.getUTCFullYear()} month={secondMonth.getUTCMonth()} days={dayMap} selected={selected} onPick={pickDate} basePrice={data?.property?.base_price || 0} weekdayPrice={data?.weekly?.weekday_price ?? null} weekendPrice={data?.weekly?.weekend_price ?? null} weekendDays={data?.weekly?.weekend_days || [5, 6]} />
          </div>
          <p className="pricing-help">اضغط مرة لاختيار يوم، ثم اضغط تاريخاً ثانياً لاختيار المدى بينهما. التواريخ المحجوزة واضحة ولا تغيّر حجوزاتها الحالية.</p>
        </section>

        <aside className="pricing-side">
          <section className="pricing-panel">
            <div className="pricing-panel-head"><div><span>السعر الأساسي</span><strong>{fmtSAR(data?.property?.base_price || 0)} / ليلة</strong></div><small>يُستخدم إذا لم توجد قاعدة أو تعديل</small></div>
            <h3>قاعدة أيام الأسبوع</h3>
            <div className="pe-grid compact">
              <div className="sf-row"><label>من الأحد إلى الخميس (﷼)</label><input dir="ltr" type="number" min="0" value={weekly.weekday} onChange={(event) => setWeekly((current) => ({ ...current, weekday: event.target.value }))} placeholder={String(data?.property?.base_price || "")} /></div>
              <div className="sf-row"><label>سعر الويكند (﷼)</label><input dir="ltr" type="number" min="0" value={weekly.weekend} onChange={(event) => setWeekly((current) => ({ ...current, weekend: event.target.value }))} placeholder={String(data?.property?.base_price || "")} /></div>
            </div>
            <p className="pricing-side-note">اختر أيام الويكند الفعلية لهذه الوحدة.</p>
            <div className="weekend-days">{[0, 1, 2, 3, 4, 5, 6].map((day) => <button key={day} type="button" className={weekly.weekendDays.includes(day) ? "active" : ""} onClick={() => toggleWeekendDay(day)}>{WEEKDAY_LABELS[day]}</button>)}</div>
            <button className="btn-ghost wide" onClick={saveWeekly} disabled={busy || !propertyId}>{busy ? "جارٍ الحفظ…" : "حفظ القاعدة الأسبوعية"}</button>
          </section>

          <section className="pricing-panel selected-editor">
            <div className="pricing-panel-head"><div><span>التواريخ المختارة</span><strong dir="ltr">{selectedSummary}</strong></div><button className="btn-ghost sm" onClick={() => { setSelectedDates([]); setSelectionAnchor(null); }}>مسح</button></div>
            <div className="sf-row"><label>السعر لكل ليلة (﷼)</label><input dir="ltr" type="number" min="0" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))} placeholder="اتركه فارغاً لاستخدام القاعدة" disabled={!selectedDates.length} /></div>
            <div className="pe-grid compact">
              <div className="sf-row"><label>أقل إقامة (ليالي)</label><input dir="ltr" type="number" min="1" max="30" value={draft.minimumStay} onChange={(event) => setDraft((current) => ({ ...current, minimumStay: event.target.value }))} placeholder="اختياري" disabled={!selectedDates.length} /></div>
              <label className="pricing-closed-toggle"><input type="checkbox" checked={draft.closed} onChange={(event) => setDraft((current) => ({ ...current, closed: event.target.checked }))} disabled={!selectedDates.length} /> إغلاق للحجز</label>
            </div>
            <div className="sf-row"><label>ملاحظة داخلية</label><input value={draft.note} maxLength={180} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} placeholder="مثال: موسم الرياض" disabled={!selectedDates.length} /></div>
            <div className="pricing-editor-actions"><button className="btn-activate" onClick={saveDates} disabled={busy || !selectedDates.length}>{busy ? "جارٍ الحفظ…" : "تطبيق على التواريخ"}</button><button className="btn-ghost danger" onClick={clearOverrides} disabled={busy || !selectedDates.length}>إعادة للتلقائي</button></div>
          </section>
        </aside>
      </div>
      {message && <div className="admin-toast inline">{message}</div>}
    </AdminLayout>
  );
}
