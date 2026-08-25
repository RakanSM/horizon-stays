import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, Link, NavLink, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Services = lazy(() => import("./pages/Services"));
const Policies = lazy(() => import("./pages/Policies"));
const ThemeOption = lazy(() => import("./pages/ThemeOptions"));
const FullThemeOption = lazy(() => import("./pages/FullThemeOptions"));
const AvailabilityCalendar = lazy(() => import("./pages/AvailabilityCalendar"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminFinance = lazy(() => import("./pages/admin/AdminFinance"));
const AdminLandlords = lazy(() => import("./pages/admin/AdminLandlords"));
const AdminThemes = lazy(() => import("./pages/admin/AdminThemes"));
const AdminIntegrations = lazy(() => import("./pages/admin/AdminIntegrations"));
const AdminLocks = lazy(() => import("./pages/admin/AdminLocks"));
const AdminCleaning = lazy(() => import("./pages/admin/AdminCleaning"));
const AdminFeatures = lazy(() => import("./pages/admin/AdminFeatures"));
const AdminMaintenance = lazy(() => import("./pages/admin/AdminMaintenance"));
const AdminOperations = lazy(() => import("./pages/admin/AdminOperations"));
const Landlord = lazy(() => import("./pages/Landlord"));
const ThemeEditor = lazy(() => import("./pages/ThemeEditor"));
const Cleaner = lazy(() => import("./pages/Cleaner"));

const RouteFallback = () => <div className="page-loading" aria-live="polite">Loading…</div>;
import { ThemeProvider, useTheme } from "./lib/ThemeContext";
import { LangProvider, useLang, LANGS } from "./lib/i18n";
import { useScrollReveal } from "./lib/motion";

const WHATSAPP = "https://wa.me/966920035843";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const TITLES: Record<string, Record<string, string>> = {
  "/": {
    ar: "Horizon Stays | إقامة فاخرة في الرياض",
    en: "Horizon Stays | Luxury Stays in Riyadh",
    zh: "Horizon Stays | 利雅得奢华住宿",
    fr: "Horizon Stays | Séjours de luxe à Riyad",
    es: "Horizon Stays | Estancias de lujo en Riad",
  },
  "/about": {
    ar: "من نحن | Horizon Stays",
    en: "About Us | Horizon Stays",
    zh: "关于我们 | Horizon Stays",
    fr: "À propos | Horizon Stays",
    es: "Sobre nosotros | Horizon Stays",
  },
  "/contact": {
    ar: "تواصل معنا | Horizon Stays",
    en: "Contact Us | Horizon Stays",
    zh: "联系我们 | Horizon Stays",
    fr: "Contact | Horizon Stays",
    es: "Contacto | Horizon Stays",
  },
  "/services": {
    ar: "خدماتنا | Horizon Stays",
    en: "Services | Horizon Stays",
    zh: "服务 | Horizon Stays",
    fr: "Services | Horizon Stays",
    es: "Servicios | Horizon Stays",
  },
  "/policies": {
    ar: "السياسات وشروط الحجز | Horizon Stays",
    en: "Policies & Booking Terms | Horizon Stays",
    zh: "政策与预订条款 | Horizon Stays",
    fr: "Politiques et conditions | Horizon Stays",
    es: "Políticas y condiciones | Horizon Stays",
  },
  "/calendar": {
    ar: "تقويم التوفر | Horizon Stays",
    en: "Availability Calendar | Horizon Stays",
    zh: "可用日历 | Horizon Stays",
    fr: "Calendrier de disponibilité | Horizon Stays",
    es: "Calendario de disponibilidad | Horizon Stays",
  },
  "/option1": { ar: "الخيار 01 | Horizon Stays", en: "Option 01 | Horizon Stays", zh: "选项 01 | Horizon Stays", fr: "Option 01 | Horizon Stays", es: "Opción 01 | Horizon Stays" },
  "/option2": { ar: "الخيار 02 | Horizon Stays", en: "Option 02 | Horizon Stays", zh: "选项 02 | Horizon Stays", fr: "Option 02 | Horizon Stays", es: "Opción 02 | Horizon Stays" },
  "/option3": { ar: "الخيار 03 | Horizon Stays", en: "Option 03 | Horizon Stays", zh: "选项 03 | Horizon Stays", fr: "Option 03 | Horizon Stays", es: "Opción 03 | Horizon Stays" },
  "/option4": { ar: "الخيار 04 | Horizon Stays", en: "Option 04 | Horizon Stays", zh: "选项 04 | Horizon Stays", fr: "Option 04 | Horizon Stays", es: "Opción 04 | Horizon Stays" },
  "/option5": { ar: "الخيار 05 | Horizon Stays", en: "Option 05 | Horizon Stays", zh: "选项 05 | Horizon Stays", fr: "Option 05 | Horizon Stays", es: "Opción 05 | Horizon Stays" },
  "/option6": { ar: "الخيار 06 | Horizon Stays", en: "Option 06 | Horizon Stays", zh: "选项 06 | Horizon Stays", fr: "Option 06 | Horizon Stays", es: "Opción 06 | Horizon Stays" },
  "/option7": { ar: "الخيار 07 | Horizon Stays", en: "Option 07 | Horizon Stays", zh: "选项 07 | Horizon Stays", fr: "Option 07 | Horizon Stays", es: "Opción 07 | Horizon Stays" },
  "/option8": { ar: "الخيار 08 | Horizon Stays", en: "Option 08 | Horizon Stays", zh: "选项 08 | Horizon Stays", fr: "Option 08 | Horizon Stays", es: "Opción 08 | Horizon Stays" },
};

function PageTitle() {
  const { pathname } = useLocation();
  const { lang } = useLang();
  useEffect(() => {
    const entry = TITLES[pathname];
    if (entry) {
      document.title = entry[lang] || entry.en;
    } else if (pathname.startsWith("/property/")) {
      const slug = pathname.split("/property/")[1] || "";
      const pretty = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      document.title = `${pretty} | Horizon Stays`;
    } else {
      document.title = TITLES["/"][lang] || "Horizon Stays";
    }
  }, [pathname, lang]);
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
  const [langOpen, setLangOpen] = useState(false);
  const [trustOpen, setTrustOpen] = useState(false);
  const location = useLocation();
  const { content, featureFlags, theme, variant, toggleVariant } = useTheme();
  const { lang, t, setLang } = useLang();
  const isEditor = location.pathname.startsWith("/admin/editor");
  const isAdmin = location.pathname.startsWith("/admin") || location.pathname === "/calendar";
  useScrollReveal(content.animationsEnabled && !isEditor);

  useEffect(() => {
    setMenuOpen(false);
    setLangOpen(false);
    setTrustOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!trustOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTrustOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [trustOpen]);

  if (isEditor) {
    return (
      <>
        <ScrollToTop />
        <PageTitle />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/admin/editor" element={<ThemeEditor />} />
          </Routes>
        </Suspense>
      </>
    );
  }

  if (isAdmin || location.pathname.startsWith("/landlord")) {
    return (
      <>
        <ScrollToTop />
        <PageTitle />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route path="/admin/pricing" element={<Navigate to="/calendar" replace />} />
            <Route path="/calendar" element={<AvailabilityCalendar />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/finance" element={<AdminFinance />} />
            <Route path="/admin/landlords" element={<AdminLandlords />} />
            <Route path="/admin/themes" element={<AdminThemes />} />
            <Route path="/admin/integrations" element={<AdminIntegrations />} />
            <Route path="/admin/locks" element={<AdminLocks />} />
            <Route path="/admin/cleaning" element={<AdminCleaning />} />
            <Route path="/admin/features" element={<AdminFeatures />} />
            <Route path="/admin/maintenance" element={<AdminMaintenance />} />
            <Route path="/admin/operations" element={<AdminOperations />} />
            <Route path="/landlord" element={featureFlags.page_landlord ? <Landlord /> : <Navigate to="/admin" replace />} />
            <Route path="*" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </>
    );
  }

  const effectiveMode = variant === "flipped" ? (theme.mode === "dark" ? "light" : "dark") : theme.mode;
  const modeToggle = (
    <button
      className="mode-toggle"
      onClick={toggleVariant}
      aria-label={effectiveMode === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
      title={effectiveMode === "dark" ? (lang === "ar" ? "الوضع الفاتح" : "Light mode") : (lang === "ar" ? "الوضع الداكن" : "Dark mode")}
    >
      {effectiveMode === "dark" ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );

  const langToggle = (
    <div className={`lang-menu ${langOpen ? "open" : ""}`}>
      <button
        className="lang-toggle"
        onClick={() => setLangOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={langOpen}
        title="Language"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{lang === "ar" ? "عربي" : lang.toUpperCase()}</span>
      </button>
      {langOpen && (
        <div className="lang-dropdown" role="menu">
          {LANGS.map((l) => (
            <button
              key={l.code}
              role="menuitem"
              className={l.code === lang ? "active" : ""}
              onClick={() => {
                setLang(l.code);
                setLangOpen(false);
              }}
            >
              {l.native}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <ScrollToTop />
      <PageTitle />
      <header className="site-header horizon-shell-header">
        <div className="container horizon-header-inner">
          <Link to="/" className="horizon-wordmark" aria-label={content.brandEn}>
            <span className="horizon-wordmark-main">HORIZON</span>
            <span className="horizon-wordmark-sub">STAYS · RIYADH</span>
          </Link>
          <nav className={`nav horizon-nav ${menuOpen ? "open" : ""}`}>
            {featureFlags.nav_properties && (
              <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
                {t("nav_properties")}
              </NavLink>
            )}
            {featureFlags.nav_contact && (
              <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
                {t("nav_contact")}
              </NavLink>
            )}
            {featureFlags.booking_whatsapp && (
              <Link to="/#collection" className="horizon-nav-book">
                {lang === "ar" && content.ctaText ? content.ctaText : t("book_now")}
              </Link>
            )}
          </nav>
          <div className="horizon-header-tools">
            {modeToggle}
            {langToggle}
            <button className="menu-btn horizon-menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="menu" aria-expanded={menuOpen}>
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <main className="horizon-public-shell">
        <Suspense fallback={<RouteFallback />}>
              <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/property/:slug" element={featureFlags.nav_properties ? <PropertyDetail /> : <Navigate to="/" replace />} />
            <Route path="/about" element={featureFlags.nav_about ? <About /> : <Navigate to="/" replace />} />
            <Route path="/services" element={<Services />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/option1" element={<ThemeOption option="option1" />} />
            <Route path="/option2" element={<ThemeOption option="option2" />} />
            <Route path="/option3" element={<ThemeOption option="option3" />} />
            <Route path="/option4" element={<ThemeOption option="option4" />} />
            <Route path="/option/1" element={<Navigate to="/option1" replace />} />
            <Route path="/option/2" element={<Navigate to="/option2" replace />} />
            <Route path="/option/3" element={<Navigate to="/option3" replace />} />
            <Route path="/option/4" element={<Navigate to="/option4" replace />} />
            <Route path="/option5" element={<FullThemeOption option="option5" />} />
            <Route path="/option6" element={<FullThemeOption option="option6" />} />
            <Route path="/option7" element={<FullThemeOption option="option7" />} />
            <Route path="/option8" element={<FullThemeOption option="option8" />} />
            <Route path="/option/5" element={<Navigate to="/option5" replace />} />
            <Route path="/option/6" element={<Navigate to="/option6" replace />} />
            <Route path="/option/7" element={<Navigate to="/option7" replace />} />
            <Route path="/option/8" element={<Navigate to="/option8" replace />} />
            <Route path="/contact" element={featureFlags.nav_contact ? <Contact /> : <Navigate to="/" replace />} />
            <Route path="/calendar" element={<AvailabilityCalendar />} />
            <Route path="/cleaner" element={featureFlags.page_cleaner ? <Cleaner /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="site-footer horizon-footer">
        <div className="container">
          <div className="horizon-footer-grid">
            <div className="horizon-footer-intro">
              <span className="horizon-wordmark-main">HORIZON</span>
              <span className="horizon-wordmark-sub">STAYS · RIYADH</span>
              <p>{t("footer_tag")}</p>
            </div>
            <nav className="footer-nav horizon-footer-nav" aria-label={lang === "ar" ? "روابط الموقع" : "Site links"}>
              {featureFlags.nav_properties && <Link to="/">{t("nav_properties")}</Link>}
              {featureFlags.nav_about && <Link to="/about">{t("nav_about")}</Link>}
              <Link to="/services">{lang === "ar" ? "خدماتنا" : "Services"}</Link>
              <Link to="/policies">{lang === "ar" ? "السياسات" : "Policies"}</Link>
              {featureFlags.nav_contact && <Link to="/contact">{t("nav_contact")}</Link>}
              <a href="tel:920035843">920035843</a>
            </nav>
          </div>
          <div className="horizon-footer-bottom">
            <span>{lang === "ar" ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}</span>
            <span className="horizon-commercial-registration">{lang === "ar" ? "السجل التجاري: 7050485445" : "CR No. 7050485445"}</span>
            <button type="button" className="horizon-trust-trigger" onClick={() => setTrustOpen(true)} aria-haspopup="dialog">
              <span aria-hidden="true">✓</span>{lang === "ar" ? "موثّق" : "Verified"}
            </button>
            <span>© {new Date().getFullYear()} Horizon Stays</span>
          </div>
        </div>
      </footer>

      {trustOpen && <div className="horizon-trust-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setTrustOpen(false); }}>
        <section className="horizon-trust-dialog" role="dialog" aria-modal="true" aria-labelledby="horizon-trust-title">
          <button type="button" className="horizon-trust-close" onClick={() => setTrustOpen(false)} aria-label={lang === "ar" ? "إغلاق شهادة التوثيق" : "Close verification certificate"}>×</button>
          <div className="horizon-trust-heading">
            <span>{lang === "ar" ? "HORIZON / التحقق التجاري" : "HORIZON / BUSINESS VERIFICATION"}</span>
            <h2 id="horizon-trust-title">{lang === "ar" ? "متجر موثّق" : "Verified store"}</h2>
            <p>{lang === "ar" ? "رقم شهادة التوثيق: 0000305469" : "Verification certificate no. 0000305469"}</p>
          </div>
          <img src="/manus-storage/horizon-verified-certificate-clean_b7bc1d80.png" alt={lang === "ar" ? "صورة شهادة توثيق Horizon Stays" : "Horizon Stays verification certificate"} />
        </section>
      </div>}

      {featureFlags.booking_whatsapp && <a href={WHATSAPP} target="_blank" rel="noreferrer" className="wa-float" aria-label="WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>} 
    </>
  );
}
