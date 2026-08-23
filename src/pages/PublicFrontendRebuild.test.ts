import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../..", import.meta.url);
const readSource = (path: string) => readFileSync(new URL(path, root), "utf8");

describe("public frontend rebuild", () => {
  it("keeps the homepage connected to live properties, pricing, and the map", () => {
    const home = readSource("src/pages/Home.tsx");
    expect(home).toContain("fetchProperties");
    expect(home).toContain("propertyPhotos");
    expect(home).toContain("MapFrame locations={properties}");
    expect(home).toContain("horizon-property-card");
    expect(home).toContain("horizon-hero");
    expect(home).toContain("horizon-search-module");
    expect(home).toContain("checkIn");
    expect(home).toContain("checkOut");
    expect(home).toContain("TwoClickDateRangePicker");
    expect(home).not.toContain('<input type="date"');
    expect(home).toContain("horizon-journey-grid");
    expect(home).not.toMatch(/testimonial|guest review|guest rating/i);
    expect(home).toContain('import { EditorContentContext } from "../lib/editorPreview"');
    expect(home).not.toContain('from "./ThemeEditor"');
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
});
