import { describe, expect, it } from "vitest";
import { propertyPhotoUrls, STORAGE_BASE } from "./supabase";

describe("propertyPhotoUrls", () => {
  it("uses the complete verified storage gallery when a unit has no saved ordering", () => {
    const photos = propertyPhotoUrls("sky-lounge-suite", null, null);
    expect(photos).toHaveLength(34);
    expect(photos[0]).toBe(`${STORAGE_BASE}/sky-lounge-suite-1.webp`);
    expect(photos[33]).toBe(`${STORAGE_BASE}/sky-lounge-suite-34.webp`);
  });

  it("preserves a manager-selected cover and a manually ordered gallery without duplication", () => {
    const cover = "https://images.example.test/cover.webp";
    const gallery = ["https://images.example.test/second.webp", cover, "https://images.example.test/third.webp"];
    expect(propertyPhotoUrls("unknown-unit", cover, gallery)).toEqual([
      cover,
      "https://images.example.test/second.webp",
      "https://images.example.test/third.webp",
    ]);
  });
});
