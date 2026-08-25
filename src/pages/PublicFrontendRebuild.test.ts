import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../..", import.meta.url);
const readSource = (path: string) => readFileSync(new URL(path, root), "utf8");

describe("public frontend rebuild", () => {
  it("keeps the homepage connected to live properties, pricing, and the map", () => {
    const home = readSource("src/pages/Home.tsx");
    expect(home).toContain("fetchProperties");
    expect(home).toContain("propertyPhotos");
    expect(home).toContain("const MapFrame = lazy");
    expect(home).toContain("DeferredMap locations={properties}");
    expect(home).toContain("horizon-property-card");
    expect(home).toContain("horizon-hero");
    expect(home).toContain("horizon-search-module");
    expect(home).toContain("checkIn");
    expect(home).toContain("checkOut");
    expect(home).toContain("TwoClickDateRangePicker");
    expect(home).not.toContain('<input type="date"');
    expect(home).toContain("ScrollScene properties={properties}");
    expect(home).not.toContain('className="horizon-section horizon-journey-section"');
    expect(home).not.toMatch(/testimonial|guest review|guest rating/i);
    expect(home).toContain('import { EditorContentContext } from "../lib/editorPreview"');
    expect(home).not.toContain('from "./ThemeEditor"');
  });

  it("keeps property-card hover controls connected to the property journey and local favourites", () => {
    const home = readSource("src/pages/Home.tsx");
    const styles = readSource("src/public-rebuild.css");
    expect(home).toContain('"horizon-favorite-properties"');
    expect(home).toContain("horizon-card-reveal");
    expect(home).toContain('to={`/property/${property.slug}`}');
    expect(home).toContain("horizon-favorite-button");
    expect(styles).toContain(".horizon-property-card:focus-within .horizon-card-reveal");
    expect(styles).toContain(".horizon-favorite-button");
  });

  it("uses a fixed scroll scene while residences reveal from verified live property data", () => {
    const home = readSource("src/pages/Home.tsx");
    const styles = readSource("src/public-rebuild.css");
    expect(home).toContain("function ScrollScene");
    expect(home).toContain("propertyPhotos(property)[0] || FALLBACK_HERO");
    expect(home).toContain("اختر ما يناسبك");
    expect(home).toContain("شاهد السعر والتوفر حسب تاريخك");
    expect(home).not.toContain("المدينة تتحرك\\nوأنت تختار");
    expect(styles).toContain("--h-electric: #a879f7");
    expect(styles).toContain("--h-space: #170d2b");
    expect(styles).toContain(".horizon-scene-fixed { position: sticky;");
    expect(styles).toContain(".horizon-scene-panel.is-visible");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("keeps the property page on the shared booking and availability flow", () => {
    const detail = readSource("src/pages/PropertyDetail.tsx");
    expect(detail).toContain("fetchPropertyPriceQuote");
    expect(detail).toContain("fetchBlockedDates");
    expect(detail).toContain("horizon-detail-page");
    expect(detail).toContain("MapFrame locations={[property]}");
    expect(detail).toContain("date-price-comparison");
    expect(detail).toContain("date-price-breakdown");
    expect(detail).toContain("Before dates");
    expect(detail).toContain("booking-policy-agreement");
    expect(detail).toContain("policyAccepted");
    expect(detail).toContain('to="/policies"');
  });

  it("prevents public background layers from creating horizontal page overflow", () => {
    const styles = readSource("src/public-rebuild.css");
    expect(styles).toContain("body:has(.horizon-public-shell) #root");
    expect(styles).toContain(".horizon-public-shell {");
    expect(styles).toContain("overflow-x: clip");
  });

  it("loads the public frontend layer after legacy styles so public routes are isolated", () => {
    const entry = readSource("src/main.tsx");
    const styles = readSource("src/public-rebuild.css");
    expect(entry.indexOf('import "./public-rebuild.css"')).toBeGreaterThan(entry.indexOf('import "./index.css"'));
    expect(styles).toContain(".horizon-public");
    expect(styles).toContain(".horizon-shell-header");
  });

  it("keeps the public shell's theme state in scope for the mode toggle", () => {
    const app = readSource("src/App.tsx");
    expect(app).toContain("const { content, featureFlags, theme, variant, toggleVariant } = useTheme();");
    expect(app).toContain("theme.mode");
  });

  it("uses a plum dark-mode foundation rather than the previous dark green palette", () => {
    const styles = readSource("src/public-rebuild.css");
    expect(styles).toContain('--h-paper: #181021');
    expect(styles).toContain('--h-deep: #0f0918');
    expect(styles).toContain('--h-ink: #261a34');
    expect(styles).toContain('--bg: var(--h-paper)');
    expect(styles).toContain('--hero-overlay: linear-gradient(180deg, rgba(24, 12, 35, 0.5), rgba(15, 9, 24, 0.94))');
    expect(styles).not.toContain('#15201d');
    expect(styles).not.toContain('#1e2d28');
    expect(styles).not.toContain('#0e1613');
  });

  it("keeps a language-aware public typography scale for Arabic and English", () => {
    const styles = readSource("src/public-rebuild.css");
    const i18n = readSource("src/lib/i18n.tsx");
    expect(styles).toContain(':root[lang="ar"]');
    expect(styles).toContain(':root[lang="en"]');
    expect(styles).toContain('--h-public-display');
    expect(styles).toContain('"IBM Plex Sans Arabic"');
    expect(styles).toContain('"Space Grotesk"');
    expect(styles).toContain('.horizon-public-shell .horizon-hero h1');
    expect(styles).toContain('.horizon-public-shell .horizon-section-head h2');
    expect(i18n).toContain('document.documentElement.lang = lang');
  });

  it("keeps the commercial registration as text and the trust certificate behind an accessible popup", () => {
    const app = readSource("src/App.tsx");
    const styles = readSource("src/public-rebuild.css");
    expect(app).toContain("7050485445");
    expect(app).toContain("horizon-commercial-registration");
    expect(app).toContain("horizon-trust-trigger");
    expect(app).toContain('role="dialog"');
    expect(app).toContain("0000305469");
    expect(app).toContain("horizon-verified-certificate-clean_b7bc1d80.png");
    expect(styles).toContain(".horizon-trust-overlay");
    expect(styles).toContain("background: var(--h-electric); box-shadow: 0 0 0 5px color-mix(in srgb, var(--h-electric) 22%, transparent);");
    expect(styles).not.toContain("#39b178");
  });

  it("keeps TTLock lock management isolated to an admin-only route", () => {
    const app = readSource("src/App.tsx");
    const locks = readSource("src/pages/admin/AdminLocks.tsx");
    expect(app).toContain('path="/admin/locks"');
    expect(locks).toContain("AdminLayout");
    expect(locks).toContain('("rename", { lockId: selected.lockId');
    expect(locks).toContain('("unlock", { lockId: selected.lockId');
    expect(locks).toContain("window.confirm");
    expect(locks).not.toContain("propertyId");
  });

  it("keeps the Odoo unit-linking form contained in the RTL property editor", () => {
    const properties = readSource("src/pages/admin/AdminProperties.tsx");
    const styles = readSource("src/index.css");
    expect(properties).toContain('className="pe-section odoo-property-link"');
    expect(properties).toContain('className="pe-grid pe-grid--odoo"');
    expect(styles).toContain(".pe-grid--odoo { grid-template-columns: repeat(2, minmax(0, 1fr)); }");
    expect(styles).toContain(".pe-grid .sf-row input, .pe-grid .sf-row select, .pe-grid .sf-row textarea");
    expect(styles).toContain(".pe-foot { display: flex; justify-content: space-between;");
  });
});
