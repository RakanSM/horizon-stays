import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MapFrame from "./MapFrame";

describe("MapFrame", () => {
  const locations = [
    { id: 1, name_ar: "وحدة كافد", name_en: "KAFD stay", neighborhood: "KAFD", price_per_night: 1250, lat: 24.7741, lng: 46.658 },
    { id: 2, name_ar: "وحدة العليا", name_en: "Olaya stay", neighborhood: "Al Olaya", price_per_night: 900, lat: 24.7136, lng: 46.6753 },
  ];

  it("renders one interactive pin for every coordinate on the collection map", () => {
    const markup = renderToStaticMarkup(<MapFrame locations={locations} lang="en" variant="collection" />);

    expect(markup.match(/property-map-pin(?:\s|\")/g)).toHaveLength(2);
    expect(markup).toContain("KAFD stay");
    expect(markup).toContain("Olaya stay");
    expect(markup).toContain("From 1,250 SAR / night");
    expect(markup).toContain('role="tooltip"');
  });

  it("renders exactly one precise pin on an individual property map", () => {
    const markup = renderToStaticMarkup(<MapFrame locations={locations} lang="ar" variant="property" />);

    expect(markup.match(/property-map-pin(?:\s|\")/g)).toHaveLength(1);
    expect(markup).toContain("وحدة كافد");
    expect(markup).toContain("من ١٬٢٥٠ ر.س / ليلة");
  });
});
