import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme, getAdminToken, adminLogin, adminCheck, clearAdminToken } from "../lib/ThemeContext";

const NAV = [
  { to: "/admin", icon: "📊", label: "الرئيسية", exact: true },
  { to: "/admin/properties", icon: "🏢", label: "الوحدات" },
  { to: "/admin/bookings", icon: "📆", label: "الحجوزات والضيوف" },
  { to: "/admin/finance", icon: "💰", label: "المالية" },
  { to: "/admin/landlords", icon: "🤝", label: "المُلّاك" },
  { to: "/admin/themes", icon: "🎨", label: "الطُّبوع" },
  { to: "/admin/integrations", icon: "🔌", label: "التكاملات" },
  { to: "/admin/cleaning", icon: "🧹", label: "النظافة" },
];

export default function AdminLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { odooUrl } = useTheme();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const tok = getAdminToken();
    if (!tok) { setAuthed(false); return; }
    adminCheck(tok).then((ok) => setAuthed(ok));
  }, []);

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
          <span>لوحة التحكم</span>
        </div>
        <nav className="adm-nav">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={`adm-nav-item ${isActive(n) ? "active" : ""}`} onClick={() => setNavOpen(false)}>
              <span className="adm-nav-icon">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="adm-side-foot">
          {odooUrl && <a className="adm-nav-item" href={odooUrl} target="_blank" rel="noreferrer"><span className="adm-nav-icon">⇆</span>Odoo</a>}
          <Link to="/" className="adm-nav-item"><span className="adm-nav-icon">🌐</span>عرض الموقع</Link>
          <button
            className="adm-nav-item logout"
            onClick={() => { clearAdminToken(); navigate("/admin"); window.location.reload(); }}
          >
            <span className="adm-nav-icon">⎋</span>خروج
          </button>
        </div>
      </aside>
      <main className="adm-main">
        <header className="adm-page-head">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </header>
        {children}
      </main>
    </div>
  );
}
