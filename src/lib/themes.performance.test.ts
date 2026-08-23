import { describe, expect, it } from "vitest";
import { getAllThemes, getTheme } from "./themes";

describe("theme catalogue performance", () => {
  it("resolves a generated selected theme without materialising the marketplace catalogue", () => {
    delete (globalThis as any).__HUGE_2500_THEMES_CACHE__;
    const theme = getTheme("luxury-horizon-650");
    expect(theme.id).toBe("luxury-horizon-650");
    expect((globalThis as any).__HUGE_2500_THEMES_CACHE__).toBeUndefined();
  });

  it("materialises the complete theme marketplace only on demand", () => {
    const themes = getAllThemes();
    expect(themes.length).toBeGreaterThanOrEqual(2600);
  });
});
