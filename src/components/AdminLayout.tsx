import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme, getAdminToken, adminLogin, adminCheck, clearAdminToken } from "../lib/ThemeContext";
import { useLang } from "../lib/i18n";

const NAV = [
  { to: "/admin", icon: "📊", label: "الرئيسية", en: "Dashboard", exact: true },
  { to: "/admin/properties", icon: "🏢", label: "الوحدات", en: "Properties" },
  { to: "/calendar", icon: "🗓️", label: "التقويم الموحد", en: "Unified calendar" },
  { to: "/admin/bookings", icon: "📆", label: "الحجوزات والضيوف", en: "Bookings & guests" },
  { to: "/admin/finance", icon: "💰", label: "المالية", en: "Finance" },
  { to: "/admin/operations", icon: "◈", label: "مكتب العمليات", en: "Operations" },
  { to: "/admin/maintenance", icon: "🔧", label: "الصيانة والفواتير", en: "Maintenance" },
  { to: "/admin/landlords", icon: "🤝", label: "المُلّاك", en: "Landlords" },
  { to: "/admin/themes", icon: "🎨", label: "الطُّبوع", en: "Themes" },
  { to: "/admin/integrations", icon: "🔌", label: "التكاملات", en: "Integrations" },
  { to: "/admin/locks", icon: "🔐", label: "الأقفال الذكية", en: "Smart locks" },
  { to: "/admin/cleaning", icon: "🧹", label: "النظافة", en: "Cleaning" },
  { to: "/admin/features", icon: "🎛️", label: "ظهور الميزات", en: "Feature visibility" },
];

export default function AdminLayout({ title, subtitle, children, authVerified = false }: { title: string; subtitle?: string; children: ReactNode; authVerified?: boolean }) {
  const { odooUrl, featureFlags } = useTheme();
  const { lang, setLang } = useLang();
  const [authed, setAuthed] = useState<boolean | null>(authVerified ? true : null);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (authVerified) { setAuthed(true); return; }
    const tok = getAdminToken();
    if (!tok) { setAuthed(false); return; }
    adminCheck(tok).then((ok) => setAuthed(ok));
  }, [authVerified]);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      await adminLogin(password);
      // The admin data pages mount outside this layout. Reload once the token
      // is written so their first data request always includes the new session.
      window.location.reload();
    } catch (ex: any) {
      setErr(ex.message || "فشل تسجيل الدخول");
    }
  };

  if (authed === null) return <div className="admin-wrap"><div className="admin-loading">جارٍ التحقق...</div></div>;

  if (!authed) {
    return (
      <div className="admin-wrap admin-login-wrap">
        <form className="admin-login" onSubmit={doLogin}>
          <h1>لوحة التحكم</h1>
          <p>أدخل كلمة مرور المدير للمتابعة</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" autoFocus />
          {err && <div className="admin-err">{err}</div>}
          <button type="submit" className="btn-activate wide">دخول</button>
        </form>
      </div>
    );
  }

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <div className="admin-shell">
      <button className="adm-nav-toggle" onClick={() => setNavOpen((v) => !v)} aria-label="القائمة">☰</button>
      <aside className={`adm-sidebar ${navOpen ? "open" : ""}`}>
        <div className="adm-brand">
          <strong>Horizon</strong>
          <span>{lang === "en" ? "Admin portal" : "لوحة التحكم"}</span>
        </div>
        <nav className="adm-nav">
          {NAV.filter((n) => n.to !== "/calendar" || featureFlags.nav_calendar).map((n) => (
            <Link key={n.to} to={n.to} className={`adm-nav-item ${isActive(n) ? "active" : ""}`} onClick={() => setNavOpen(false)}>
              <span className="adm-nav-icon">{n.icon}</span>
              {lang === "en" ? n.en : n.label}
            </Link>
          ))}
        </nav>
        <div className="adm-side-foot">
          {odooUrl && <a className="adm-nav-item" href={odooUrl} target="_blank" rel="noreferrer"><span className="adm-nav-icon">⇆</span>Odoo</a>}
          <Link to="/" className="adm-nav-item"><span className="adm-nav-icon">🌐</span>{lang === "en" ? "View site" : "عرض الموقع"}</Link>
          <button
            className="adm-nav-item logout"
            onClick={() => { clearAdminToken(); navigate("/admin"); window.location.reload(); }}
          >
            <span className="adm-nav-icon">⎋</span>{lang === "en" ? "Log out" : "خروج"}
          </button>
        </div>
      </aside>
      <main className="adm-main">
        <header className="adm-page-head">
          <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
          <div className="adm-head-tools" role="group" aria-label="Language">
            <button type="button" className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>English</button>
            <button type="button" className={lang === "ar" ? "active" : ""} onClick={() => setLang("ar")}>عربي</button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
