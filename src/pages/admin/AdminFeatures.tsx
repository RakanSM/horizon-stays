import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getAdminToken, useTheme } from "../../lib/ThemeContext";
import { FEATURE_FLAG_GROUPS, type FeatureFlags } from "../../lib/featureFlags";
import { useLang } from "../../lib/i18n";

export default function AdminFeatures() {
  const { featureFlags, saveFeatureFlags } = useTheme();
  const { lang } = useLang();
  const [draft, setDraft] = useState<FeatureFlags>(featureFlags);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => setDraft(featureFlags), [featureFlags]);

  const changed = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(featureFlags),
    [draft, featureFlags],
  );

  const setFlag = (key: keyof FeatureFlags, value: boolean) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setMessage("");
  };

  const save = async () => {
    const token = getAdminToken();
    if (!token) {
      setMessage(lang === "en" ? "Your admin session has expired." : "انتهت جلسة الأدمن — سجّل الدخول مرة أخرى.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await saveFeatureFlags(token, draft);
      setMessage(lang === "en" ? "Visibility settings saved ✓" : "تم حفظ إعدادات الظهور ✓");
    } catch (error: any) {
      setMessage(error?.message || (lang === "en" ? "Save failed." : "فشل الحفظ."));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setDraft(featureFlags);
    setMessage("");
  };

  const allOn = () => setDraft((current) => Object.fromEntries(Object.keys(current).map((key) => [key, true])) as FeatureFlags);
  const allOff = () => setDraft((current) => Object.fromEntries(Object.keys(current).map((key) => [key, false])) as FeatureFlags);

  return (
    <AdminLayout
      title={lang === "en" ? "Feature visibility" : "ظهور الميزات والأزرار"}
      subtitle={lang === "en" ? "Control what guests can see without changing code." : "تحكم فيما يراه الضيوف دون تعديل الكود."}
    >
      <div className="feature-flags-page" dir={lang === "en" ? "ltr" : "rtl"}>
        <div className="odoo-card feature-flags-hero">
          <div className="odoo-card-head">
            <div>
              <h2>{lang === "en" ? "Public site controls" : "تحكم الموقع العام"}</h2>
              <p>{lang === "en" ? "Turn pages, booking channels, and property sections on or off instantly. Hidden items remain safely stored and can be restored at any time." : "فعّل أو أخفِ الصفحات وقنوات الحجز وأجزاء الوحدات فوراً. العناصر المخفية تبقى محفوظة ويمكن إعادتها في أي وقت."}</p>
            </div>
            <span className="feature-flags-count">{Object.values(draft).filter(Boolean).length}/{Object.keys(draft).length} {lang === "en" ? "on" : "مفعّل"}</span>
          </div>
          <div className="feature-flags-actions">
            <button className="btn-ghost" type="button" onClick={allOn}>{lang === "en" ? "Enable all" : "تفعيل الكل"}</button>
            <button className="btn-ghost" type="button" onClick={allOff}>{lang === "en" ? "Hide all" : "إخفاء الكل"}</button>
            <button className="btn-ghost" type="button" onClick={reset} disabled={!changed}>{lang === "en" ? "Discard changes" : "تجاهل التغييرات"}</button>
            <button className="btn-activate" type="button" onClick={save} disabled={busy || !changed}>{busy ? (lang === "en" ? "Saving…" : "جارٍ الحفظ…") : (lang === "en" ? "Save visibility" : "حفظ الظهور")}</button>
          </div>
          {message && <div className="admin-toast inline">{message}</div>}
        </div>

        <div className="feature-flags-grid">
          {FEATURE_FLAG_GROUPS.map((group) => (
            <section className="odoo-card feature-flag-group" key={group.id}>
              <div className="odoo-card-head">
                <div>
                  <h2>{lang === "en" ? group.items[0]?.en && group.id === "navigation" ? "Navigation & pages" : group.id === "booking" ? "Booking & payment" : group.id === "property" ? "Property details" : "Site experience" : group.title}</h2>
                  <p>{lang === "en" ? group.id === "navigation" ? "Control public navigation and role portals." : group.id === "booking" ? "Control the booking channels offered to guests." : group.id === "property" ? "Show or hide property content blocks." : "Control visual and interactive experiences." : group.description}</p>
                </div>
              </div>
              <div className="feature-flag-list">
                {group.items.map((item) => {
                  const checked = draft[item.key];
                  return (
                    <label className={`feature-flag-row ${checked ? "is-on" : "is-off"}`} key={item.key}>
                      <span className="feature-flag-copy">
                        <strong>{lang === "en" ? item.en : item.ar}</strong>
                        {item.hint && <small>{lang === "en" ? item.hint : item.hint}</small>}
                      </span>
                      <span className="feature-switch">
                        <input type="checkbox" checked={checked} onChange={(event) => setFlag(item.key, event.target.checked)} />
                        <span className="feature-switch-track" aria-hidden="true"><span /></span>
                        <em>{checked ? (lang === "en" ? "Shown" : "ظاهر") : (lang === "en" ? "Hidden" : "مخفي")}</em>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
