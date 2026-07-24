import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllThemes, getTheme, type ThemePreset, type ThemeSchedule } from "../lib/themes";
import { useTheme, getAdminToken, adminLogin, adminCheck, clearAdminToken } from "../lib/ThemeContext";
import TTLockSection from "../components/TTLockSection";

const DECOR_ICONS: Record<string, string> = {
  ramadan: "🏮",
  ramadan2: "🌙",
  "eid-fitr": "🎈",
  "eid-adha": "🕌",
  "parallax-art": "🎨",
};

function ThemeSwatch({
  t, active, scheduled, onActivate, busy,
}: {
  t: ThemePreset; active: boolean; scheduled: boolean; onActivate: () => void; busy: boolean;
}) {
  const k = t.tokens;
  return (
    <div className={`theme-card ${active ? "active" : ""}`}>
      <div className="theme-preview" style={{ background: k.bg }}>
        {t.decor && <span className="tp-decor">{DECOR_ICONS[t.decor] || "✨"}</span>}
        <div className="tp-header" style={{ background: k.headerBg, borderBottom: `1px solid ${k.border}` }}>
          <span style={{ color: k.accent, fontWeight: 700, fontSize: 10 }}>Horizon</span>
          <span className="tp-pill" style={{ background: k.accent, color: k.ctaText }} />
        </div>
        <div className="tp-hero" style={{ background: `linear-gradient(135deg, ${k.bg2}, ${k.bg})` }}>
          <div className="tp-line" style={{ background: k.text, width: "62%" }} />
          <div className="tp-line" style={{ background: k.textMuted, width: "40%", height: 4 }} />
          <div className="tp-btn" style={{ background: k.accent }} />
        </div>
        <div className="tp-cards">
          {[0, 1, 2].map((i) => (
            <div key={i} className="tp-card" style={{ background: k.card, border: `1px solid ${k.border}`, borderRadius: Math.min(parseInt(k.radius) || 6, 8) }}>
              <div className="tp-img" style={{ background: k.accentSoft }} />
              <div className="tp-line" style={{ background: k.textMuted, width: "70%", height: 3 }} />
            </div>
          ))}
        </div>
      </div>
      <div className="theme-meta">
        <div>
          <strong>{t.nameAr}</strong>
          <span className="theme-mode">
            {t.nameEn} · {t.mode === "dark" ? "داكن" : "فاتح"}
            {t.custom ? " · مخصص" : ""}
            {t.parallax ? " · Parallax" : ""}
          </span>
          <p>{t.description}</p>
        </div>
        <div className="theme-actions">
          {scheduled && <span className="badge-scheduled">مجدول 📅</span>}
          {active ? (
            <span className="badge-active">مفعّل ✓</span>
          ) : (
            <button className="btn-activate" onClick={onActivate} disabled={busy}>
              {busy ? "..." : "تفعيل"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Theme scheduling ---------- */
function ScheduleSection() {
  const { schedules, saveSchedules, activeScheduleId } = useTheme();
  const allThemes = getAllThemes();
  const [items, setItems] = useState<ThemeSchedule[]>(schedules);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<ThemeSchedule>({
    id: "", themeId: "ramadan-nights", startDate: "", endDate: "", label: "", enabled: true,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => setItems(schedules), [schedules]);

  const persist = async (next: ThemeSchedule[]) => {
    const tok = getAdminToken();
    if (!tok) return;
    setBusy(true);
    setMsg("");
    try {
      await saveSchedules(tok, next);
      setMsg("تم الحفظ ✓");
      setTimeout(() => setMsg(""), 2200);
    } catch {
      setMsg("فشل الحفظ — تحقق من الجلسة");
    } finally {
      setBusy(false);
    }
  };

  const add = async () => {
    if (!draft.startDate || !draft.endDate || draft.endDate < draft.startDate) {
      setMsg("تحقق من التواريخ — تاريخ النهاية يجب أن يكون بعد البداية");
      return;
    }
    const next = [...items, { ...draft, id: `sch_${Date.now()}` }];
    setItems(next);
    setAdding(false);
    setDraft({ id: "", themeId: "ramadan-nights", startDate: "", endDate: "", label: "", enabled: true });
    await persist(next);
  };

  const remove = async (id: string) => {
    const next = items.filter((s) => s.id !== id);
    setItems(next);
    await persist(next);
  };

  const toggle = async (id: string) => {
    const next = items.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setItems(next);
    await persist(next);
  };

  return (
    <div className="odoo-card schedule-card">
      <div className="odoo-card-head">
        <div>
          <h2>جدولة الطُّبوع 📅</h2>
          <p>حدد فترة زمنية ليتم تفعيل طابع تلقائياً — مثالي لرمضان والأعياد. عند انتهاء الفترة يعود الموقع للطابع الأساسي.</p>
        </div>
        <button className="btn-activate" onClick={() => setAdding((v) => !v)}>{adding ? "إغلاق" : "+ جدولة جديدة"}</button>
      </div>

      {adding && (
        <div className="schedule-form">
          <div className="sf-row">
            <label>الطابع</label>
            <select value={draft.themeId} onChange={(e) => setDraft({ ...draft, themeId: e.target.value })}>
              {allThemes.map((t) => (
                <option key={t.id} value={t.id}>{t.nameAr} ({t.nameEn})</option>
              ))}
            </select>
          </div>
          <div className="sf-row">
            <label>الاسم (اختياري)</label>
            <input type="text" value={draft.label || ""} placeholder="مثال: رمضان ١٤٤٨" onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
          </div>
          <div className="sf-dates">
            <div className="sf-row">
              <label>من تاريخ</label>
              <input type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} />
            </div>
            <div className="sf-row">
              <label>إلى تاريخ</label>
              <input type="date" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} />
            </div>
          </div>
          <button className="btn-activate" onClick={add} disabled={busy}>{busy ? "..." : "إضافة الجدولة"}</button>
        </div>
      )}

      {items.length === 0 && !adding && <p className="odoo-hint">لا توجد جدولات بعد — أضف جدولة لتفعيل طابع رمضان أو العيد تلقائياً في موعده.</p>}

      {items.length > 0 && (
        <div className="schedule-list">
          {items.map((s) => {
            const th = getTheme(s.themeId);
            const isLive = activeScheduleId === s.id;
            return (
              <div key={s.id} className={`schedule-item ${s.enabled ? "" : "disabled"} ${isLive ? "live" : ""}`}>
                <span className="si-dot" style={{ background: th.tokens.accent }} />
                <div className="si-info">
                  <strong>{s.label || th.nameAr}</strong>
                  <span dir="ltr">{s.startDate} → {s.endDate}</span>
                  <small>{th.nameAr}{isLive ? " — نشط الآن ✓" : ""}</small>
                </div>
                <div className="theme-actions">
                  <button className="btn-ghost sm" onClick={() => toggle(s.id)} disabled={busy}>{s.enabled ? "إيقاف" : "تفعيل"}</button>
                  <button className="btn-ghost sm danger" onClick={() => remove(s.id)} disabled={busy}>حذف</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {msg && <div className="admin-toast inline">{msg}</div>}
    </div>
  );
}

/* ---------- Odoo ---------- */
function OdooSection() {
  const { odooUrl, setOdooUrl } = useTheme();
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(odooUrl);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setUrl(odooUrl), [odooUrl]);

  const save = async () => {
    const tok = getAdminToken();
    if (!tok) return;
    let clean = url.trim();
    if (clean && !/^https?:\/\//i.test(clean)) clean = "https://" + clean;
    setBusy(true);
    setMsg("");
    try {
      await setOdooUrl(tok, clean);
      setMsg(clean ? "تم حفظ رابط Odoo وربطه بالزر في الأعلى ✓" : "تم مسح الرابط");
      setEditing(false);
    } catch {
      setMsg("فشل الحفظ — تحقق من الجلسة");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="odoo-card">
      <div className="odoo-card-head">
        <div>
          <h2>تكامل Odoo (ERP)</h2>
          <p>اربط نظام Odoo لإدارة الفواتير والمحاسبة والإيجارات — يظهر زر التبديل في أعلى لوحة التحكم</p>
        </div>
        <span className={`odoo-status ${odooUrl ? "on" : "off"}`}>{odooUrl ? "متصل ✓" : "غير مهيّأ"}</span>
      </div>
      {odooUrl && !editing ? (
        <div className="odoo-row">
          <code className="odoo-url">{odooUrl}</code>
          <div className="theme-actions">
            <a className="btn-activate" href={odooUrl} target="_blank" rel="noreferrer">فتح Odoo ↗</a>
            <button className="btn-ghost" onClick={() => setEditing(true)}>تعديل</button>
          </div>
        </div>
      ) : (
        <div className="odoo-row">
          <input
            className="odoo-input"
            dir="ltr"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourcompany.odoo.com"
          />
          <div className="theme-actions">
            <button className="btn-activate" onClick={save} disabled={busy}>{busy ? "..." : "حفظ"}</button>
            {editing && <button className="btn-ghost" onClick={() => { setEditing(false); setUrl(odooUrl); }}>إلغاء</button>}
          </div>
        </div>
      )}
      {!odooUrl && (
        <p className="odoo-hint">
          ليس لديك حساب Odoo بعد؟ أنشئ نسخة مجانية من <a href="https://www.odoo.com/trial" target="_blank" rel="noreferrer">odoo.com</a> (تطبيق واحد مجاناً — اختر Rental أو Invoicing)، ثم الصق رابط النسخة هنا. ولإضافة زر العودة إلى Horizon داخل Odoo: من Odoo فعّل وضع المطوّر ثم Settings ‹ Technical ‹ Menu Items وأضف قائمة برابط الموقع، أو ببساطة ثبّت الموقع كإشارة مرجعية.
        </p>
      )}
      {msg && <div className="admin-toast inline">{msg}</div>}
    </div>
  );
}

/* ---------- Cleaning (cleaner role) ---------- */
type AdminCleaner = { id: number; name: string; phone: string | null; pin: string; active: boolean };
type AdminCleanLog = { id: number; property_slug: string; notes: string | null; cleaned_at: string; cleaner_name: string; cleaner_phone: string | null };

function CleaningSection() {
  const [logs, setLogs] = useState<AdminCleanLog[]>([]);
  const [cleaners, setCleaners] = useState<AdminCleaner[]>([]);
  const [showManage, setShowManage] = useState(false);
  const [draft, setDraft] = useState({ name: "", phone: "", pin: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const tok = getAdminToken();
    if (!tok) return;
    const { supabase } = await import("../lib/supabase");
    const [l, c] = await Promise.all([
      supabase.rpc("admin_cleaning_logs", { p_token: tok }),
      supabase.rpc("admin_manage_cleaners", { p_token: tok, p_action: "list" }),
    ]);
    if (l.data?.ok) setLogs(l.data.logs || []);
    if (c.data?.ok) setCleaners(c.data.cleaners || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const manage = async (action: string, extra: Record<string, unknown> = {}) => {
    const tok = getAdminToken();
    if (!tok) return;
    setBusy(true);
    setMsg("");
    try {
      const { supabase } = await import("../lib/supabase");
      const { data, error } = await supabase.rpc("admin_manage_cleaners", { p_token: tok, p_action: action, p_name: null, p_phone: null, p_pin: null, p_cleaner_id: null, ...extra });
      if (error || !data?.ok) {
        setMsg("فشل التنفيذ — تحقق من البيانات");
        return;
      }
      setCleaners(data.cleaners || []);
      if (action === "add") {
        setDraft({ name: "", phone: "", pin: "" });
        setMsg("تمت إضافة العاملة ✓ — شاركها الرابط /cleaner ورمز الدخول");
      }
      setTimeout(() => setMsg(""), 4000);
    } finally {
      setBusy(false);
    }
  };

  const slugName = (slug: string) => slug.replace(/-/g, " ");

  return (
    <div className="odoo-card cleaning-card">
      <div className="odoo-card-head">
        <div>
          <h2>سجل النظافة 🧹</h2>
          <p>تسجّل عاملات النظافة إتمام تنظيف الوحدات من هواتفهن عبر صفحة <code>/cleaner</code> برمز دخول خاص.</p>
        </div>
        <button className="btn-activate" onClick={() => setShowManage((v) => !v)}>{showManage ? "إغلاق الإدارة" : "إدارة العاملات"}</button>
      </div>

      {showManage && (
        <div className="cleaners-manage">
          <div className="schedule-form">
            <div className="sf-dates">
              <div className="sf-row">
                <label>الاسم</label>
                <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="اسم العاملة" />
              </div>
              <div className="sf-row">
                <label>الجوال (اختياري)</label>
                <input type="text" dir="ltr" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="+9665…" />
              </div>
              <div className="sf-row">
                <label>رمز الدخول (4+ أرقام)</label>
                <input type="text" dir="ltr" value={draft.pin} onChange={(e) => setDraft({ ...draft, pin: e.target.value })} placeholder="1234" />
              </div>
            </div>
            <button className="btn-activate" disabled={busy || !draft.name || draft.pin.length < 4} onClick={() => manage("add", { p_name: draft.name, p_phone: draft.phone || null, p_pin: draft.pin })}>
              {busy ? "..." : "+ إضافة عاملة"}
            </button>
          </div>
          {cleaners.length > 0 && (
            <div className="schedule-list">
              {cleaners.map((c) => (
                <div key={c.id} className={`schedule-item ${c.active ? "" : "disabled"}`}>
                  <span className="si-dot" style={{ background: c.active ? "#22c55e" : "#6b7280" }} />
                  <div className="si-info">
                    <strong>{c.name}</strong>
                    <span dir="ltr">PIN: {c.pin}{c.phone ? ` · ${c.phone}` : ""}</span>
                    <small>{c.active ? "نشطة" : "موقوفة"}</small>
                  </div>
                  <div className="theme-actions">
                    <button className="btn-ghost sm" onClick={() => manage("toggle", { p_cleaner_id: c.id })} disabled={busy}>{c.active ? "إيقاف" : "تفعيل"}</button>
                    <button className="btn-ghost sm danger" onClick={() => manage("delete", { p_cleaner_id: c.id })} disabled={busy}>حذف</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {logs.length === 0 ? (
        <p className="odoo-hint">لا توجد سجلات نظافة بعد — عند إرسال أول تسجيل من صفحة /cleaner سيظهر هنا.</p>
      ) : (
        <div className="clean-log-table">
          {logs.map((l) => (
            <div key={l.id} className="clean-log-row">
              <div className="cl-main">
                <strong>{slugName(l.property_slug)}</strong>
                <span>{l.cleaner_name}{l.notes ? ` — ${l.notes}` : ""}</span>
              </div>
              <time dir="ltr">{new Date(l.cleaned_at).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" })}</time>
            </div>
          ))}
        </div>
      )}
      {msg && <div className="admin-toast inline">{msg}</div>}
    </div>
  );
}

export default function Admin() {
  const { activeThemeId, baseThemeId, overrides, saveSettings, refresh, odooUrl, schedules, activeScheduleId } = useTheme();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();
  const allThemes = getAllThemes();

  useEffect(() => {
    const tok = getAdminToken();
    if (!tok) {
      setAuthed(false);
      return;
    }
    adminCheck(tok).then((ok) => setAuthed(ok));
  }, []);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      await adminLogin(password);
      setAuthed(true);
    } catch (ex: any) {
      setErr(ex.message || "فشل تسجيل الدخول");
    }
  };

  const activate = async (id: string) => {
    const tok = getAdminToken();
    if (!tok) return setAuthed(false);
    setBusyId(id);
    try {
      await saveSettings(tok, id, overrides);
      setToast(`تم تفعيل طابع «${getTheme(id).nameAr}»`);
      setTimeout(() => setToast(""), 2500);
    } catch {
      setErr("انتهت الجلسة — سجّل الدخول مجدداً");
      clearAdminToken();
      setAuthed(false);
    } finally {
      setBusyId(null);
    }
  };

  if (authed === null) return <div className="admin-wrap"><div className="admin-loading">جارٍ التحقق...</div></div>;

  if (!authed) {
    return (
      <div className="admin-wrap admin-login-wrap">
        <form className="admin-login" onSubmit={doLogin}>
          <h1>لوحة التحكم</h1>
          <p>أدخل كلمة مرور المدير للمتابعة</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            autoFocus
          />
          {err && <div className="admin-err">{err}</div>}
          <button type="submit" className="btn-activate wide">دخول</button>
        </form>
      </div>
    );
  }

  const scheduledThemeIds = new Set(schedules.filter((s) => s.enabled).map((s) => s.themeId));

  return (
    <div className="admin-wrap">
      <div className="admin-head">
        <div>
          <h1>الطُّبوع (الثيمات)</h1>
          <p>
            {allThemes.length} طابعاً جاهزاً — بينها طُبوع موسمية لرمضان والعيدين وطابع فني بتأثير Parallax.
            {activeScheduleId ? " (الطابع الحالي مفعّل عبر جدولة)" : ""}
          </p>
        </div>
        <div className="admin-head-actions">
          {odooUrl && (
            <a className="btn-odoo" href={odooUrl} target="_blank" rel="noreferrer">
              ⇆ التبديل إلى Odoo
            </a>
          )}
          <button className="btn-editor" onClick={() => navigate("/admin/editor")}>
            ✨ محرر الطابع
          </button>
          <button className="btn-editor alt" onClick={() => navigate("/admin/editor?new=1")}>
            + إنشاء طابع جديد
          </button>
          <Link to="/" className="btn-ghost">عرض الموقع</Link>
          <button
            className="btn-ghost"
            onClick={() => {
              clearAdminToken();
              setAuthed(false);
            }}
          >
            خروج
          </button>
        </div>
      </div>
      {toast && <div className="admin-toast">{toast}</div>}
      {activeScheduleId && (
        <div className="schedule-banner">
          📅 يعمل الموقع الآن بطابع مجدول «{getTheme(activeThemeId).nameAr}» — الطابع الأساسي: «{getTheme(baseThemeId).nameAr}»
        </div>
      )}
      <div className="theme-grid">
        {allThemes.map((t) => (
          <ThemeSwatch
            key={t.id}
            t={t}
            active={t.id === activeThemeId}
            scheduled={scheduledThemeIds.has(t.id)}
            onActivate={() => activate(t.id)}
            busy={busyId === t.id}
          />
        ))}
      </div>
      <ScheduleSection />
      <CleaningSection />
      <TTLockSection />
      <OdooSection />
      <div className="admin-foot">
        <button className="btn-ghost" onClick={() => refresh()}>تحديث الحالة</button>
      </div>
    </div>
  );
}
