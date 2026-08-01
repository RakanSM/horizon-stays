import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { adminRpc, fmtSAR, type AdminProperty } from "../../lib/adminApi";

const NEIGHBORHOODS = ["KAFD", "Al Olaya", "Al Malqa", "Al Narjes", "Al Yasmin", "Boulevard"];
const TYPES = ["apartment", "villa", "penthouse", "studio", "suite"];

function PropertyEditor({ p, onSaved, onClose }: { p: AdminProperty; onSaved: () => void; onClose: () => void }) {
  const [d, setD] = useState({ ...p, amenities_text: (p.amenities || []).join("\n") });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [syncBusy, setSyncBusy] = useState(false);

  const set = (k: string, v: unknown) => setD((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setBusy(true); setMsg("");
    try {
      await adminRpc("admin_update_property", {
        p_id: p.id,
        p_name_ar: d.name_ar, p_name_en: d.name_en, p_type: d.type,
        p_price: Number(d.price_per_night) || 0,
        p_bedrooms: Number(d.bedrooms) || 0, p_bathrooms: Number(d.bathrooms) || 0,
        p_area: Number(d.area_m2) || 0, p_floor: d.floor, p_max_guests: Number(d.max_guests) || 1,
        p_neighborhood: d.neighborhood, p_description_ar: d.description_ar,
        p_airbnb_url: d.airbnb_url, p_gathern_url: d.gathern_url,
        p_airbnb_ical: d.airbnb_ical_url, p_gathern_ical: d.gatherin_ical_url,
        p_is_active: d.is_active,
        p_amenities: d.amenities_text.split("\n").map((s) => s.trim()).filter(Boolean),
      });
      setMsg("تم الحفظ ✓");
      onSaved();
      setTimeout(() => setMsg(""), 2500);
    } catch (e: any) {
      setMsg("فشل الحفظ: " + e.message);
    } finally { setBusy(false); }
  };

  const syncNow = async () => {
    setSyncBusy(true); setMsg("");
    try {
      const { getAdminToken } = await import("../../lib/ThemeContext");
      const tok = getAdminToken() || "";
      const r = await fetch(`/api/property/${p.slug}/sync`, { method: "POST", headers: { Authorization: `Bearer ${tok}` } });
      const j = await r.json().catch(() => ({}));
      setMsg(r.ok ? `تمت المزامنة ✓ (${j.events ?? "؟"} حدث)` : "فشلت المزامنة");
    } catch { setMsg("فشلت المزامنة"); }
    finally { setSyncBusy(false); setTimeout(() => setMsg(""), 3500); }
  };

  const icalExport = d.ical_token ? `https://horizonstay-sa.com/api/ical/${p.slug}?token=${d.ical_token}` : "";

  return (
    <div className="prop-editor">
      <div className="pe-head">
        <h3>{d.name_ar} <small dir="ltr">/{p.slug}</small></h3>
        <button className="btn-ghost sm" onClick={onClose}>إغلاق ✕</button>
      </div>

      <div className="pe-grid">
        <div className="sf-row"><label>الاسم (عربي)</label><input value={d.name_ar} onChange={(e) => set("name_ar", e.target.value)} /></div>
        <div className="sf-row"><label>الاسم (إنجليزي)</label><input dir="ltr" value={d.name_en} onChange={(e) => set("name_en", e.target.value)} /></div>
        <div className="sf-row"><label>النوع</label>
          <select value={d.type} onChange={(e) => set("type", e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="sf-row"><label>الحي</label>
          <select value={d.neighborhood || ""} onChange={(e) => set("neighborhood", e.target.value)}>
            {NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="sf-row"><label>السعر / ليلة (﷼)</label><input dir="ltr" type="number" value={d.price_per_night} onChange={(e) => set("price_per_night", e.target.value)} /></div>
        <div className="sf-row"><label>غرف النوم</label><input dir="ltr" type="number" value={d.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} /></div>
        <div className="sf-row"><label>دورات المياه</label><input dir="ltr" type="number" value={d.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} /></div>
        <div className="sf-row"><label>المساحة (م²)</label><input dir="ltr" type="number" value={d.area_m2} onChange={(e) => set("area_m2", e.target.value)} /></div>
        <div className="sf-row"><label>الدور</label><input value={d.floor || ""} onChange={(e) => set("floor", e.target.value)} /></div>
        <div className="sf-row"><label>أقصى عدد ضيوف</label><input dir="ltr" type="number" value={d.max_guests} onChange={(e) => set("max_guests", e.target.value)} /></div>
      </div>

      <div className="sf-row"><label>الوصف (عربي)</label>
        <textarea rows={3} value={d.description_ar || ""} onChange={(e) => set("description_ar", e.target.value)} />
      </div>
      <div className="sf-row"><label>المرافق (سطر لكل مرفق)</label>
        <textarea rows={4} dir="auto" value={d.amenities_text} onChange={(e) => set("amenities_text", e.target.value)} />
      </div>

      <h4 className="pe-sub">القنوات والمزامنة</h4>
      <div className="pe-grid">
        <div className="sf-row"><label>رابط Airbnb</label><input dir="ltr" value={d.airbnb_url || ""} onChange={(e) => set("airbnb_url", e.target.value)} placeholder="https://airbnb.com/rooms/…" /></div>
        <div className="sf-row"><label>رابط Gathern</label><input dir="ltr" value={d.gathern_url || ""} onChange={(e) => set("gathern_url", e.target.value)} placeholder="https://gathern.co/…" /></div>
        <div className="sf-row"><label>Airbnb iCal</label><input dir="ltr" value={d.airbnb_ical_url || ""} onChange={(e) => set("airbnb_ical_url", e.target.value)} placeholder="https://airbnb.com/calendar/ical/…" /></div>
        <div className="sf-row"><label>Gathern iCal</label><input dir="ltr" value={d.gatherin_ical_url || ""} onChange={(e) => set("gatherin_ical_url", e.target.value)} placeholder="https://gathern.co/ical/…" /></div>
      </div>
      {icalExport && (
        <div className="sf-row"><label>رابط تصدير Horizon (الصقه في Airbnb/Gathern)</label>
          <div className="pe-copy">
            <code dir="ltr">{icalExport}</code>
            <button className="btn-ghost sm" onClick={() => { navigator.clipboard.writeText(icalExport); setMsg("نُسخ ✓"); setTimeout(() => setMsg(""), 1500); }}>نسخ</button>
          </div>
        </div>
      )}

      <div className="pe-foot">
        <label className="pe-toggle">
          <input type="checkbox" checked={d.is_active} onChange={(e) => set("is_active", e.target.checked)} />
          الوحدة نشطة (تظهر في الموقع)
        </label>
        <div className="theme-actions">
          <button className="btn-ghost" onClick={syncNow} disabled={syncBusy}>{syncBusy ? "..." : "مزامنة الآن ⟳"}</button>
          <button className="btn-activate" onClick={save} disabled={busy}>{busy ? "..." : "حفظ التعديلات"}</button>
        </div>
      </div>
      {msg && <div className="admin-toast inline">{msg}</div>}
    </div>
  );
}

export default function AdminProperties() {
  const [props, setProps] = useState<AdminProperty[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const r = await adminRpc<{ properties: AdminProperty[] }>("admin_list_properties");
      setProps(r.properties || []);
    } catch (e: any) { setErr(e.message); }
  };
  useEffect(() => { load(); }, []);

  const filtered = props.filter((p) =>
    !q || p.name_ar.includes(q) || p.name_en.toLowerCase().includes(q.toLowerCase()) || p.slug.includes(q.toLowerCase())
  );

  return (
    <AdminLayout title="الوحدات" subtitle={`${props.length} وحدة — اضغط على أي وحدة لتعديل كامل تفاصيلها والـ iCal`}>
      {err && <div className="admin-err">{err}</div>}
      <div className="sf-row adm-search"><input placeholder="ابحث بالاسم أو slug…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="adm-prop-list">
        {filtered.map((p) => (
          <div key={p.id} className={`adm-prop-item ${p.is_active ? "" : "inactive"}`}>
            <button className="adm-prop-row" onClick={() => setOpenId(openId === p.id ? null : p.id)}>
              <img src={`https://bwffhalzuvvmuzjfmdyp.supabase.co/storage/v1/object/public/property-images/${p.slug}-1.webp`} alt="" loading="lazy" />
              <div className="adm-prop-info">
                <strong>{p.name_ar}</strong>
                <span>{p.neighborhood || "—"} · {fmtSAR(p.price_per_night)}/ليلة · {p.bedrooms} غرف</span>
                <small>
                  {p.airbnb_ical_url ? "Airbnb ✓" : "Airbnb ✗"} · {p.gatherin_ical_url ? "Gathern ✓" : "Gathern ✗"}
                  {p.landlord ? ` · مالك: ${p.landlord.name} (${p.landlord.commission_pct}%)` : ""}
                </small>
              </div>
              <span className={`adm-prop-state ${p.is_active ? "on" : "off"}`}>{p.is_active ? "نشطة" : "موقوفة"}</span>
            </button>
            {openId === p.id && <PropertyEditor p={p} onSaved={load} onClose={() => setOpenId(null)} />}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
