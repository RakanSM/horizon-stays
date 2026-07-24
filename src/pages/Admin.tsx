import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { THEMES, getTheme, type ThemePreset } from "../lib/themes";
import { useTheme, getAdminToken, adminLogin, adminCheck, clearAdminToken } from "../lib/ThemeContext";

function ThemeSwatch({ t, active, onActivate, busy }: { t: ThemePreset; active: boolean; onActivate: () => void; busy: boolean }) {
  const k = t.tokens;
  return (
    <div className={`theme-card ${active ? "active" : ""}`}>
      <div className="theme-preview" style={{ background: k.bg }}>
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
          <span className="theme-mode">{t.nameEn} · {t.mode === "dark" ? "داكن" : "فاتح"}</span>
          <p>{t.description}</p>
        </div>
        <div className="theme-actions">
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

export default function Admin() {
  const { activeThemeId, overrides, saveSettings, refresh, odooUrl } = useTheme();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

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

  return (
    <div className="admin-wrap">
      <div className="admin-head">
        <div>
          <h1>الطُّبوع (الثيمات)</h1>
          <p>اختر أحد {THEMES.length} طُبوع جاهزة، أو خصّص الطابع الحالي من محرر الطابع</p>
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
      <div className="theme-grid">
        {THEMES.map((t) => (
          <ThemeSwatch key={t.id} t={t} active={t.id === activeThemeId} onActivate={() => activate(t.id)} busy={busyId === t.id} />
        ))}
      </div>
      <OdooSection />
      <div className="admin-foot">
        <button className="btn-ghost" onClick={() => refresh()}>تحديث الحالة</button>
      </div>
    </div>
  );
}
