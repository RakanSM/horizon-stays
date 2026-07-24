import { useState, useEffect } from "react";
import { Routes, Route, Link, NavLink, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import ThemeEditor from "./pages/ThemeEditor";
import Cleaner from "./pages/Cleaner";
import { ThemeProvider, useTheme } from "./lib/ThemeContext";
import { LangProvider, useLang } from "./lib/i18n";
import { useScrollReveal, useParallaxSections } from "./lib/motion";
import SeasonalDecor from "./components/SeasonalDecor";

const WHATSAPP = "https://wa.me/966560903335";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AppShell />
      </LangProvider>
    </ThemeProvider>
  );
}

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { content } = useTheme();
  const { lang, t, setLang } = useLang();
  const { theme } = useTheme();
  const isEditor = location.pathname.startsWith("/admin/editor");
  const isAdmin = location.pathname.startsWith("/admin");
  useScrollReveal(content.animationsEnabled && !isEditor);
  useParallaxSections(!!theme.parallax && content.animationsEnabled && !isAdmin, location.pathname);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  if (isEditor) {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/admin/editor" element={<ThemeEditor />} />
        </Routes>
      </>
    );
  }

  const langToggle = (
    <button
      className="lang-toggle"
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      title={lang === "ar" ? "English" : "العربية"}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span>{lang === "ar" ? "EN" : "عربي"}</span>
    </button>
  );

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <SeasonalDecor />}
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <span className="brand-en">{content.brandEn}</span>
            <span className="brand-ar">{lang === "ar" ? content.brandAr : ""}</span>
          </Link>
          <nav className={`nav ${menuOpen ? "open" : ""}`}>
            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
              {t("nav_properties")}
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
              {t("nav_about")}
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
              {t("nav_contact")}
            </NavLink>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="cta">
              {lang === "ar" ? content.ctaText : t("book_now")}
            </a>
          </nav>
          <div className="header-actions">
            {langToggle}
            <button className="menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="menu">
              ☰
            </button>
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/property/:slug" element={<PropertyDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/cleaner" element={<Cleaner />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-inner">
            <div>
              <span className="brand-en">{content.brandEn}</span>
              <p>{t("footer_tag")}</p>
            </div>
            <nav className="footer-nav">
              <Link to="/">{t("nav_properties")}</Link>
              <Link to="/about">{t("nav_about")}</Link>
              <Link to="/contact">{t("nav_contact")}</Link>
            </nav>
          </div>
          <div className="copyright">
            © {new Date().getFullYear()} Horizon Stays — {t("footer_rights")}
          </div>
        </div>
      </footer>

      <a href={WHATSAPP} target="_blank" rel="noreferrer" className="wa-float" aria-label="WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </>
  );
}
