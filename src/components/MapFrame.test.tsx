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

  it("provides a side card with gallery browsing, a price, and a booking action", () => {
    expect(source).toContain("MapSidePanel");
    expect(source).toContain("map-frame-side-panel");
    expect(source).toContain("map-pin-card-photo-strip");
    expect(source).toContain("propertyPhotoUrls");
    expect(source).toContain('to={`/property/${location.slug}#availability`}');
    expect(source).toContain('"Book now"');
    expect(source).toContain("shortDescription");
    expect(source).not.toContain("<Popup");
  });

  it("previews a marker on hover and keeps the side card selected after click", () => {
    expect(source).toContain("previewPinId");
    expect(source).toContain("pinnedPinId");
    expect(source).toContain("mouseover: showPreview");
    expect(source).toContain("click: pinLocation");
    expect(source).toContain("setPinnedPinId(location.id)");
  });

  it("does not restore the collection chip list below the map", () => {
    expect(source).not.toContain("map-frame-places");
    expect(source).not.toContain("map-place-chip");
  });
});
