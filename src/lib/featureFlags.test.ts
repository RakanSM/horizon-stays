import { describe, expect, it } from "vitest";
import { DEFAULT_FEATURE_FLAGS, normalizeFeatureFlags } from "./featureFlags";

describe("feature visibility flags", () => {
  it("keeps every supported flag enabled by default", () => {
    const flags = normalizeFeatureFlags(null);
    expect(flags).toEqual(DEFAULT_FEATURE_FLAGS);
  });

  it("preserves explicit booleans and ignores unknown keys", () => {
    const flags = normalizeFeatureFlags({ booking_whatsapp: false, feature_gallery: false, unknown: false });
    expect(flags.booking_whatsapp).toBe(false);
    expect(flags.feature_gallery).toBe(false);
    expect(flags.nav_about).toBe(true);
    expect("unknown" in flags).toBe(false);
  });
});
