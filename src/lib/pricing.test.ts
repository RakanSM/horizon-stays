import { describe, expect, it } from "vitest";
import { resolveNightlyPrice } from "./pricing";

describe("resolveNightlyPrice", () => {
  it("gives a date override priority over all recurring prices", () => {
    expect(resolveNightlyPrice({ date: "2026-08-21", basePrice: 1200, weekdayPrice: 1300, weekendPrice: 1800, overridePrice: 2222 })).toBe(2222);
  });

  it("uses the configurable Friday/Saturday weekend rule before the base price", () => {
    expect(resolveNightlyPrice({ date: "2026-08-21", basePrice: 1200, weekdayPrice: 1300, weekendPrice: 1800, weekendDays: [5, 6] })).toBe(1800);
    expect(resolveNightlyPrice({ date: "2026-08-23", basePrice: 1200, weekdayPrice: 1300, weekendPrice: 1800, weekendDays: [5, 6] })).toBe(1300);
  });

  it("falls back safely to the unit base price when no future rule exists", () => {
    expect(resolveNightlyPrice({ date: "2026-08-23", basePrice: 1200 })).toBe(1200);
  });
});
