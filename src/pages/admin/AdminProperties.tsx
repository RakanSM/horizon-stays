import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { adminRpc, fmtSAR, type AdminProperty } from "../../lib/adminApi";
import { useLang } from "../../lib/i18n";
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

export function PropertyEditor({ p, onSaved, onClose }: { p: AdminProperty; onSaved: () => void; onClose: () => void }) {
  const { lang } = useLang();
  const en = lang === "en";
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
      setMsg(en ? "Add a public image URL starting with https://" : "أضف رابط صورة عام يبدأ بـ https://");
      return;
    }
    if (d.gallery_images.includes(url)) {
      setMsg(en ? "This image is already in the gallery" : "الصورة موجودة بالفعل في المعرض");
      return;
    }
    setD((prev) => ({ ...prev, gallery_images: [...prev.gallery_images, url], hero_image: prev.hero_image || url }));
    setNewPhoto("");
    setMsg(en ? "Image added — save changes to publish it" : "أضيفت الصورة — احفظ التعديلات لتظهر في الموقع");
  };

  const save = async () => {
    const lat = d.lat === null || d.lat === undefined || d.lat === "" ? null : Number(d.lat);
    const lng = d.lng === null || d.lng === undefined || d.lng === "" ? null : Number(d.lng);
    if ((lat === null) !== (lng === null)) {
      setMsg(en ? "Enter both latitude and longitude, or leave both unchanged." : "أدخل خط العرض والطول معاً، أو اتركهما دون تغيير.");
      return;
    }
    if (lat !== null && (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 23 || lat > 27 || lng < 45 || lng > 48)) {
      setMsg(en ? "The map pin must be a valid Riyadh-area latitude and longitude." : "يجب أن تكون إحداثيات الدبوس صالحة ضمن نطاق الرياض.");
      return;
    }
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
        p_lat: lat, p_lng: lng,
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
      setMsg(en ? "Property settings and gallery saved ✓" : "تم حفظ إعدادات الوحدة والمعرض ✓");
      onSaved();
      setTimeout(() => setMsg(""), 3000);
    } catch (error: any) {
      setMsg((en ? "Save failed: " : "فشل الحفظ: ") + error.message);
    } finally { setBusy(false); }
  };

  const syncNow = async () => {
    setSyncBusy(true); setMsg("");
    try {
      const { getAdminToken } = await import("../../lib/ThemeContext");
      const token = getAdminToken() || "";
      const response = await fetch(`/api/property/${p.slug}/sync`, { method: "POST", headers: { "x-admin-token": token } });
      const data = await response.json().catch(() => ({}));
      setMsg(response.ok ? (en ? `Synced ✓ (${data.synced?.length || data.events || 0} sources/events)` : `تمت المزامنة ✓ (${data.synced?.length || data.events || 0} مصدر/حدث)`) : data.error || (en ? "Sync failed" : "فشلت المزامنة"));
      if (response.ok) onSaved();
    } catch { setMsg(en ? "Sync failed" : "فشلت المزامنة"); }
    finally { setSyncBusy(false); setTimeout(() => setMsg(""), 4000); }
  };

  const icalExport = d.ical_token ? `https://horizonstay-sa.com/api/ical/${p.slug}?token=${d.ical_token}` : "";

  return (
    <div className="prop-editor">
      <div className="pe-head">
        <div>
          <h3>{en ? d.name_en : d.name_ar} <small dir="ltr">/{p.slug}</small></h3>
          <p className="pe-meta">{photoCount} {en ? "photos" : "صورة"} · {p.calendar?.blocked_count || 0} {en ? "upcoming blocked periods" : "حجوزات/فترات محجوبة قادمة"} · {en ? "Last sync" : "آخر مزامنة"}: {p.calendar?.last_synced_at ? new Date(p.calendar.last_synced_at).toLocaleString(en ? "en-US" : "ar-SA") : "—"}</p>
        </div>
        <button className="btn-ghost sm" onClick={onClose}>{en ? "Close" : "إغلاق"} ✕</button>
      </div>

      <section className="pe-section">
        <div className="pe-section-head"><h4>{en ? "Photos & gallery" : "الصور ومعرض الوحدة"}</h4><span>{en ? "Choose a cover, reorder photos, or add a public image URL" : "اختَر الغلاف، حرّك الترتيب، أو أضف رابط صورة عام"}</span></div>
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
        ) : <div className="admin-empty">{en ? "No saved photos for this property yet." : "لا توجد صور محفوظة لهذه الوحدة بعد."}</div>}
        <div className="pe-add-photo">
          <input dir="ltr" value={newPhoto} onChange={(event) => setNewPhoto(event.target.value)} placeholder="https://…/unit-photo.webp" />
          <button type="button" className="btn-ghost" onClick={addPhoto}>{en ? "Add image URL" : "إضافة رابط صورة"}</button>
        </div>
      </section>

      <section className="pe-section">
        <div className="pe-section-head"><h4>{en ? "Property details" : "تفاصيل الوحدة"}</h4><span>{en ? "Shown directly on the site cards and property page" : "تنعكس مباشرة في بطاقات الموقع وصفحة الوحدة"}</span></div>
        <div className="pe-grid">
          <div className="sf-row"><label>{en ? "Name (Arabic)" : "الاسم (عربي)"}</label><input value={d.name_ar} onChange={(event) => set("name_ar", event.target.value)} /></div>
          <div className="sf-row"><label>{en ? "Name (English)" : "الاسم (إنجليزي)"}</label><input dir="ltr" value={d.name_en} onChange={(event) => set("name_en", event.target.value)} /></div>
          <div className="sf-row"><label>{en ? "Type" : "النوع"}</label><select value={d.type} onChange={(event) => set("type", event.target.value)}>{TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></div>
          <div className="sf-row"><label>{en ? "Neighborhood" : "الحي"}</label><select value={d.neighborhood || ""} onChange={(event) => set("neighborhood", event.target.value)}>{NEIGHBORHOODS.map((area) => <option key={area} value={area}>{area}</option>)}</select></div>
          <div className="sf-row"><label>{en ? "Price / night (SAR)" : "السعر / ليلة (﷼)"}</label><input dir="ltr" type="number" value={d.price_per_night} onChange={(event) => set("price_per_night", Number(event.target.value))} /></div>
          <div className="sf-row"><label>{en ? "Bedrooms" : "غرف النوم"}</label><input dir="ltr" type="number" value={d.bedrooms} onChange={(event) => set("bedrooms", Number(event.target.value))} /></div>
          <div className="sf-row"><label>{en ? "Bathrooms" : "دورات المياه"}</label><input dir="ltr" type="number" value={d.bathrooms} onChange={(event) => set("bathrooms", Number(event.target.value))} /></div>
          <div className="sf-row"><label>{en ? "Area (m²)" : "المساحة (م²)"}</label><input dir="ltr" type="number" value={d.area_m2 || 0} onChange={(event) => set("area_m2", Number(event.target.value))} /></div>
          <div className="sf-row"><label>{en ? "Floor" : "الدور"}</label><input value={d.floor || ""} onChange={(event) => set("floor", event.target.value)} /></div>
          <div className="sf-row"><label>{en ? "Max guests" : "أقصى عدد ضيوف"}</label><input dir="ltr" type="number" value={d.max_guests} onChange={(event) => set("max_guests", Number(event.target.value))} /></div>
        </div>
        <div className="sf-row"><label>الوصف (عربي)</label><textarea rows={3} value={d.description_ar || ""} onChange={(event) => set("description_ar", event.target.value)} /></div>
        <div className="sf-row"><label>{en ? "Amenities (one per line)" : "المرافق (سطر لكل مرفق)"}</label><textarea rows={4} dir="auto" value={d.amenities_text} onChange={(event) => set("amenities_text", event.target.value)} /></div>
      </section>

      <section className="pe-section">
        <div className="pe-section-head"><h4>{en ? "Verified map pin" : "دبوس موقع موثّق"}</h4><span>{en ? "iCal calendars do not include map coordinates. Save only a verified building or listing point." : "تقويم iCal لا يتضمن إحداثيات الموقع. احفظ دبوس مبنى أو إعلان تم التحقق منه فقط."}</span></div>
        <div className="pe-grid">
          <div className="sf-row"><label>{en ? "Latitude" : "خط العرض"}</label><input dir="ltr" type="number" step="0.000001" min="23" max="27" value={d.lat ?? ""} onChange={(event) => set("lat", event.target.value === "" ? null : Number(event.target.value))} placeholder="24.774100" /></div>
          <div className="sf-row"><label>{en ? "Longitude" : "خط الطول"}</label><input dir="ltr" type="number" step="0.000001" min="45" max="48" value={d.lng ?? ""} onChange={(event) => set("lng", event.target.value === "" ? null : Number(event.target.value))} placeholder="46.658000" /></div>
        </div>
        <p className="pe-map-help">{en ? "Open the listing or a verified building in a map, copy its latitude and longitude, preview below, then save. Do not use an iCal link as a location source." : "افتح الإعلان أو المبنى الموثّق في الخريطة، انسخ خط العرض والطول، عاين الموقع أدناه ثم احفظه. لا تستخدم رابط iCal كمصدر للموقع."}</p>
        {Number.isFinite(Number(d.lat)) && Number.isFinite(Number(d.lng)) && <a className="btn-ghost sm" href={`https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}`} target="_blank" rel="noreferrer">{en ? "Preview this pin ↗" : "معاينة الدبوس ↗"}</a>}
      </section>

      <section className="pe-section">
        <div className="pe-section-head"><h4>{en ? "Channels & calendar" : "القنوات والتقويم"}</h4><a href="/calendar" target="_blank" rel="noreferrer">{en ? "Open unified calendar ↗" : "عرض التقويم الموحد ↗"}</a></div>
        <div className="pe-grid">
          <div className="sf-row"><label>رابط Airbnb</label><input dir="ltr" value={d.airbnb_url || ""} onChange={(event) => set("airbnb_url", event.target.value)} placeholder="https://airbnb.com/rooms/…" /></div>
          <div className="sf-row"><label>رابط Gathern</label><input dir="ltr" value={d.gathern_url || ""} onChange={(event) => set("gathern_url", event.target.value)} placeholder="https://gathern.co/…" /></div>
          <div className="sf-row"><label>Airbnb iCal</label><input dir="ltr" value={d.airbnb_ical_url || ""} onChange={(event) => set("airbnb_ical_url", event.target.value)} placeholder="https://airbnb.com/calendar/ical/…" /></div>
          <div className="sf-row"><label>Gathern iCal</label><input dir="ltr" value={d.gatherin_ical_url || ""} onChange={(event) => set("gatherin_ical_url", event.target.value)} placeholder="https://gathern.co/ical/…" /></div>
        </div>
        {icalExport && <div className="sf-row"><label>رابط تصدير Horizon (الصقه في Airbnb/Gathern)</label><div className="pe-copy"><code dir="ltr">{icalExport}</code><button className="btn-ghost sm" onClick={() => { navigator.clipboard.writeText(icalExport); setMsg("نُسخ ✓"); }}>نسخ</button></div></div>}
      </section>

      <section className="pe-section">
        <div className="pe-section-head"><h4>{en ? "Odoo connection" : "ربط أودو"}</h4><span>{en ? "Optional until Odoo settings are complete" : "اختياري إلى أن تكتمل إعدادات Odoo"}</span></div>
        <div className="pe-grid">
          <div className="sf-row"><label>{en ? "Odoo Rental product ID" : "معرّف منتج Odoo Rental"}</label><input dir="ltr" type="number" value={d.odoo_product_id} onChange={(event) => set("odoo_product_id", event.target.value ? Number(event.target.value) : "")} placeholder="مثال: 42" /></div>
          <div className="sf-row"><label>{en ? "Odoo product name" : "اسم منتج Odoo"}</label><input dir="ltr" value={d.odoo_product_name} onChange={(event) => set("odoo_product_name", event.target.value)} placeholder="Riyadh Penthouse — Night" /></div>
        </div>
        <label className="pe-toggle"><input type="checkbox" checked={d.odoo_sync_enabled} onChange={(event) => set("odoo_sync_enabled", event.target.checked)} /> {en ? "Allow this property's bookings to sync with Odoo" : "السماح بمزامنة حجوزات هذه الوحدة مع Odoo"}</label>
      </section>

      <div className="pe-foot">
        <label className="pe-toggle"><input type="checkbox" checked={d.is_active} onChange={(event) => set("is_active", event.target.checked)} /> {en ? "Property is active (visible on site)" : "الوحدة نشطة (تظهر في الموقع)"}</label>
        <div className="theme-actions">
          <button className="btn-ghost" onClick={syncNow} disabled={syncBusy}>{syncBusy ? (en ? "Syncing…" : "جارٍ المزامنة…") : (en ? "Sync calendar now ⟳" : "مزامنة التقويم الآن ⟳")}</button>
          <button className="btn-activate" onClick={save} disabled={busy}>{busy ? (en ? "Saving…" : "جارٍ الحفظ…") : (en ? "Save all changes" : "حفظ جميع التعديلات")}</button>
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
