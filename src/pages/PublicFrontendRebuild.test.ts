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
