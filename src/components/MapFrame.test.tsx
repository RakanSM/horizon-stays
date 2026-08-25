import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./MapFrame.tsx", import.meta.url), "utf8");

describe("MapFrame", () => {
  it("uses coordinate-bound Leaflet markers rather than an absolute layer over an iframe", () => {
    expect(source).toContain("MapContainer");
    expect(source).toContain("<Marker");
    expect(source).toContain("MapViewport");
    expect(source).toContain("map.fitBounds");
    expect(source).not.toContain("map-pins-layer");
    expect(source).not.toContain("export/embed.html");
  });

  it("provides an Airbnb-style pin card with gallery browsing, a price, and a booking action", () => {
    expect(source).toContain("map-pin-card-photo-strip");
    expect(source).toContain("propertyPhotoUrls");
    expect(source).toContain('to={`/property/${location.slug}#availability`}');
    expect(source).toContain('"Book now"');
    expect(source).toContain("shortDescription");
  });

  it("does not restore the collection chip list below the map", () => {
    expect(source).not.toContain("map-frame-places");
    expect(source).not.toContain("map-place-chip");
  });
});
