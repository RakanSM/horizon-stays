import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { adminRpc, fmtSAR, type AdminProperty } from "../../lib/adminApi";
import { propertyPhotoUrls } from "../../lib/supabase";

const NEIGHBORHOODS = ["KAFD", "Al Olaya", "Al Malqa", "Al Narjes", "Al Yasmin", "Boulevard"];
const TYPES = ["apartment", "villa", "penthouse", "studio", "suite"];

type PropertyDraft = AdminProperty & {
  amenities_text: string;
  hero_image: string;
  gallery_images: string[];
  odoo_product_id: number | "";
  odoo_product_name: string;
};

const unitPhotos = (property: Pick<AdminProperty, "slug" | "hero_image" | "gallery_images">) =>
  propertyPhotoUrls(property.slug, property.hero_image, property.gallery_images);

function makeDraft(property: AdminProperty): PropertyDraft {
  const photos = unitPhotos(property);
  return {
    ...property,
    amenities_text: (property.amenities || []).join("\n"),
    hero_image: property.hero_image || photos[0] || "",
    gallery_images: photos,
    odoo_product_id: property.odoo_product_id || "",
    odoo_product_name: property.odoo_product_name || "",
    odoo_sync_enabled: property.odoo_sync_enabled !== false,
  };
}

function PropertyEditor({ p, onSaved, onClose }: { p: AdminProperty; onSaved: () => void; onClose: () => void }) {
  const [d, setD] = useState<PropertyDraft>(() => makeDraft(p));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [syncBusy, setSyncBusy] = useState(false);
  const [newPhoto, setNewPhoto] = useState("");

  const set = <K extends keyof PropertyDraft>(key: K, value: PropertyDraft[K]) => setD((prev) => ({ ...prev, [key]: value }));
  const photoCount = d.gallery_images.length;

  const movePhoto = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= d.gallery_images.length) return;
    const photos = [...d.gallery_images];
    [photos[index], photos[nextIndex]] = [photos[nextIndex], photos[index]];
    set("gallery_images", photos);
  };

  const setCover = (url: string) => {
    const photos = [url, ...d.gallery_images.filter((photo) => photo !== url)];
    setD((prev) => ({ ...prev, hero_image: url, gallery_images: photos }));
  };

  const removePhoto = (url: string) => {
    const photos = d.gallery_images.filter((photo) => photo !== url);
    setD((prev) => ({ ...prev, gallery_images: photos, hero_image: prev.hero_image === url ? photos[0] || "" : prev.hero_image }));
  };

  const addPhoto = () => {
    const url = newPhoto.trim();
    if (!/^https?:\/\//i.test(url)) {
      setMsg("أضف رابط صورة عام يبدأ بـ https://");
      return;
    }
    if (d.gallery_images.includes(url)) {
      setMsg("الصورة موجودة بالفعل في المعرض");
      return;
    }
    setD((prev) => ({ ...prev, gallery_images: [...prev.gallery_images, url], hero_image: prev.hero_image || url }));
    setNewPhoto("");
    setMsg("أضيفت الصورة — احفظ التعديلات لتظهر في الموقع");
  };

  const save = async () => {
    setBusy(true);
    setMsg("");
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
        p_amenities: d.amenities_text.split("\n").map((item) => item.trim()).filter(Boolean),
        p_hero_image: d.hero_image || null,
        p_gallery_images: d.gallery_images,
        p_odoo_product_id: d.odoo_product_id === "" ? null : Number(d.odoo_product_id),
        p_odoo_product_name: d.odoo_product_name || null,
        p_odoo_sync_enabled: d.odoo_sync_enabled,
      });
      setMsg("تم حفظ إعدادات الوحدة والمعرض ✓");
      onSaved();
      setTimeout(() => setMsg(""), 3000);
    } catch (error: any) {
      setMsg("فشل الحفظ: " + error.message);
    } finally { setBusy(false); }
  };

  const syncNow = async () => {
    setSyncBusy(true); setMsg("");
    try {
      const { getAdminToken } = await import("../../lib/ThemeContext");
      const token = getAdminToken() || "";
      const response = await fetch(`/api/property/${p.slug}/sync`, { method: "POST", headers: { "x-admin-token": token } });
      const data = await response.json().catch(() => ({}));
      setMsg(response.ok ? `تمت المزامنة ✓ (${data.synced?.length || data.events || 0} مصدر/حدث)` : data.error || "فشلت المزامنة");
      if (response.ok) onSaved();
    } catch { setMsg("فشلت المزامنة"); }
    finally { setSyncBusy(false); setTimeout(() => setMsg(""), 4000); }
  };

  const icalExport = d.ical_token ? `https://horizonstay-sa.com/api/ical/${p.slug}?token=${d.ical_token}` : "";

  return (
    <div className="prop-editor">
      <div className="pe-head">
        <div>
          <h3>{d.name_ar} <small dir="ltr">/{p.slug}</small></h3>
          <p className="pe-meta">{photoCount} صورة · {p.calendar?.blocked_count || 0} حجوزات/فترات محجوبة قادمة · آخر مزامنة: {p.calendar?.last_synced_at ? new Date(p.calendar.last_synced_at).toLocaleString("ar-SA") : "—"}</p>
        </div>
        <button className="btn-ghost sm" onClick={onClose}>إغلاق ✕</button>
      </div>

      <section className="pe-section">
        <div className="pe-section-head"><h4>الصور ومعرض الوحدة</h4><span>اختَر الغلاف، حرّك الترتيب، أو أضف رابط صورة عام</span></div>
        {d.gallery_images.length ? (
          <div className="prop-gallery-manager">
            {d.gallery_images.map((url, index) => (
              <figure className={`prop-gallery-item ${url === d.hero_image ? "is-cover" : ""}`} key={`${url}-${index}`}>
                <img src={url} alt={`صورة ${index + 1} لـ ${d.name_ar}`} loading="lazy" />
                <figcaption>
                  <span>{url === d.hero_image ? "غلاف الموقع" : `صورة ${index + 1}`}</span>
                  <div>
                    <button className="btn-ghost xs" type="button" onClick={() => movePhoto(index, -1)} disabled={index === 0} aria-label="تحريك لليسار">←</button>
                    <button className="btn-ghost xs" type="button" onClick={() => movePhoto(index, 1)} disabled={index === d.gallery_images.length - 1} aria-label="تحريك لليمين">→</button>
                    <button className="btn-ghost xs" type="button" onClick={() => setCover(url)}>غلاف</button>
                    <button className="btn-ghost xs danger" type="button" onClick={() => removePhoto(url)}>حذف</button>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : <div className="admin-empty">لا توجد صور محفوظة لهذه الوحدة بعد.</div>}
        <div className="pe-add-photo">
          <input dir="ltr" value={newPhoto} onChange={(event) => setNewPhoto(event.target.value)} placeholder="https://…/unit-photo.webp" />
          <button type="button" className="btn-ghost" onClick={addPhoto}>إضافة رابط صورة</button>
        </div>
      </section>

      <section className="pe-section">
        <div className="pe-section-head"><h4>تفاصيل الوحدة</h4><span>تنعكس مباشرة في بطاقات الموقع وصفحة الوحدة</span></div>
        <div className="pe-grid">
          <div className="sf-row"><label>الاسم (عربي)</label><input value={d.name_ar} onChange={(event) => set("name_ar", event.target.value)} /></div>
          <div className="sf-row"><label>الاسم (إنجليزي)</label><input dir="ltr" value={d.name_en} onChange={(event) => set("name_en", event.target.value)} /></div>
          <div className="sf-row"><label>النوع</label><select value={d.type} onChange={(event) => set("type", event.target.value)}>{TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></div>
          <div className="sf-row"><label>الحي</label><select value={d.neighborhood || ""} onChange={(event) => set("neighborhood", event.target.value)}>{NEIGHBORHOODS.map((area) => <option key={area} value={area}>{area}</option>)}</select></div>
          <div className="sf-row"><label>السعر / ليلة (﷼)</label><input dir="ltr" type="number" value={d.price_per_night} onChange={(event) => set("price_per_night", Number(event.target.value))} /></div>
          <div className="sf-row"><label>غرف النوم</label><input dir="ltr" type="number" value={d.bedrooms} onChange={(event) => set("bedrooms", Number(event.target.value))} /></div>
          <div className="sf-row"><label>دورات المياه</label><input dir="ltr" type="number" value={d.bathrooms} onChange={(event) => set("bathrooms", Number(event.target.value))} /></div>
          <div className="sf-row"><label>المساحة (م²)</label><input dir="ltr" type="number" value={d.area_m2 || 0} onChange={(event) => set("area_m2", Number(event.target.value))} /></div>
          <div className="sf-row"><label>الدور</label><input value={d.floor || ""} onChange={(event) => set("floor", event.target.value)} /></div>
          <div className="sf-row"><label>أقصى عدد ضيوف</label><input dir="ltr" type="number" value={d.max_guests} onChange={(event) => set("max_guests", Number(event.target.value))} /></div>
        </div>
        <div className="sf-row"><label>الوصف (عربي)</label><textarea rows={3} value={d.description_ar || ""} onChange={(event) => set("description_ar", event.target.value)} /></div>
        <div className="sf-row"><label>المرافق (سطر لكل مرفق)</label><textarea rows={4} dir="auto" value={d.amenities_text} onChange={(event) => set("amenities_text", event.target.value)} /></div>
      </section>

      <section className="pe-section">
        <div className="pe-section-head"><h4>القنوات والتقويم</h4><a href="/calendar" target="_blank" rel="noreferrer">عرض التقويم الموحد ↗</a></div>
        <div className="pe-grid">
          <div className="sf-row"><label>رابط Airbnb</label><input dir="ltr" value={d.airbnb_url || ""} onChange={(event) => set("airbnb_url", event.target.value)} placeholder="https://airbnb.com/rooms/…" /></div>
          <div className="sf-row"><label>رابط Gathern</label><input dir="ltr" value={d.gathern_url || ""} onChange={(event) => set("gathern_url", event.target.value)} placeholder="https://gathern.co/…" /></div>
          <div className="sf-row"><label>Airbnb iCal</label><input dir="ltr" value={d.airbnb_ical_url || ""} onChange={(event) => set("airbnb_ical_url", event.target.value)} placeholder="https://airbnb.com/calendar/ical/…" /></div>
          <div className="sf-row"><label>Gathern iCal</label><input dir="ltr" value={d.gatherin_ical_url || ""} onChange={(event) => set("gatherin_ical_url", event.target.value)} placeholder="https://gathern.co/ical/…" /></div>
        </div>
        {icalExport && <div className="sf-row"><label>رابط تصدير Horizon (الصقه في Airbnb/Gathern)</label><div className="pe-copy"><code dir="ltr">{icalExport}</code><button className="btn-ghost sm" onClick={() => { navigator.clipboard.writeText(icalExport); setMsg("نُسخ ✓"); }}>نسخ</button></div></div>}
      </section>

      <section className="pe-section">
        <div className="pe-section-head"><h4>ربط أودو</h4><span>اختياري إلى أن تكتمل إعدادات Odoo</span></div>
        <div className="pe-grid">
          <div className="sf-row"><label>معرّف منتج Odoo Rental</label><input dir="ltr" type="number" value={d.odoo_product_id} onChange={(event) => set("odoo_product_id", event.target.value ? Number(event.target.value) : "")} placeholder="مثال: 42" /></div>
          <div className="sf-row"><label>اسم منتج Odoo</label><input dir="ltr" value={d.odoo_product_name} onChange={(event) => set("odoo_product_name", event.target.value)} placeholder="Riyadh Penthouse — Night" /></div>
        </div>
        <label className="pe-toggle"><input type="checkbox" checked={d.odoo_sync_enabled} onChange={(event) => set("odoo_sync_enabled", event.target.checked)} /> السماح بمزامنة حجوزات هذه الوحدة مع Odoo</label>
      </section>

      <div className="pe-foot">
        <label className="pe-toggle"><input type="checkbox" checked={d.is_active} onChange={(event) => set("is_active", event.target.checked)} /> الوحدة نشطة (تظهر في الموقع)</label>
        <div className="theme-actions">
          <button className="btn-ghost" onClick={syncNow} disabled={syncBusy}>{syncBusy ? "جارٍ المزامنة…" : "مزامنة التقويم الآن ⟳"}</button>
          <button className="btn-activate" onClick={save} disabled={busy}>{busy ? "جارٍ الحفظ…" : "حفظ جميع التعديلات"}</button>
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
      const response = await adminRpc<{ properties: AdminProperty[] }>("admin_list_properties");
      setProps(response.properties || []);
    } catch (error: any) { setErr(error.message); }
  };
  useEffect(() => { load(); }, []);

  const filtered = props.filter((property) => !q || property.name_ar.includes(q) || property.name_en.toLowerCase().includes(q.toLowerCase()) || property.slug.includes(q.toLowerCase()));

  return (
    <AdminLayout title="الوحدات" subtitle={`${props.length} وحدة — اضغط على وحدة لإدارة الصور والتفاصيل والقنوات والتقويم من مكان واحد`}>
      {err && <div className="admin-err">{err}</div>}
      <div className="sf-row adm-search"><input placeholder="ابحث بالاسم أو slug…" value={q} onChange={(event) => setQ(event.target.value)} /></div>
      <div className="adm-prop-list">
        {filtered.map((property) => {
          const photos = unitPhotos(property);
          return (
            <div key={property.id} className={`adm-prop-item ${property.is_active ? "" : "inactive"}`}>
              <button className="adm-prop-row" onClick={() => setOpenId(openId === property.id ? null : property.id)}>
                {photos[0] ? <img src={photos[0]} alt="" loading="lazy" /> : <span className="adm-prop-photo-fallback">لا توجد صورة</span>}
                <div className="adm-prop-info">
                  <strong>{property.name_ar}</strong>
                  <span>{property.neighborhood || "—"} · {fmtSAR(property.price_per_night)}/ليلة · {property.bedrooms} غرف</span>
                  <small>{photos.length} صورة · {property.airbnb_ical_url ? "Airbnb ✓" : "Airbnb ✗"} · {property.gatherin_ical_url ? "Gathern ✓" : "Gathern ✗"}{property.landlord ? ` · مالك: ${property.landlord.name} (${property.landlord.commission_pct}%)` : ""}</small>
                </div>
                <span className={`adm-prop-state ${property.is_active ? "on" : "off"}`}>{property.is_active ? "نشطة" : "موقوفة"}</span>
              </button>
              {openId === property.id && <PropertyEditor p={property} onSaved={load} onClose={() => setOpenId(null)} />}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
