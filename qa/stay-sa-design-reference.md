# Stay.sa Reference Notes

Observed on 2026-08-20 for design inspiration only. No Stay branding, copy, media, or source code should be reused.

- The public page uses a spacious, white-first editorial canvas with a thin header, restrained uppercase navigation, a strong dark appointment CTA, and a map-led property discovery experience.
- The page hierarchy is intentionally sparse: navigation, an immediate location map, a clear property collection, and a minimal footer.
- Horizon Stays will adopt the underlying principles—generous whitespace, a direct discovery flow, framed location content, and calm high-contrast controls—while retaining Horizon typography, gold accents, Arabic-first hospitality copy, property media, and booking flows.

## Local verification note

The local Vite page returned the expected Horizon content after the MapFrame change, but the captured viewport was visually blank. This requires a browser-console and CSS inspection before release; the map cannot be treated as verified until its visible rendering is confirmed.

DOM verification confirmed that the homepage now contains a visible MapFrame element with a 1,040 px desktop width and a 442 px map iframe. It is positioned below the property collection, and the iframe points to a Riyadh Google Maps embed. The next check is viewport scrolling and the per-property map frame.

After switching the embed source to OpenStreetMap, the local homepage loaded with the new light Horizon Residence visual system, and the map frame is present in the rendered document beneath the property collection. A property-page check remains required before release.

The KAFD Penthouse property page now renders the `HORIZON LOCATION` section with the property’s saved coordinates. Browser inspection confirmed visible OpenStreetMap controls and a marker within the framed map block before the availability calendar.

Production verification after commit `990d5e9`: the Horizon Stays deployment rendered 22 interactive property-pin links on the homepage map layer, each targeting its stored latitude/longitude in Google Maps. The map frame and pins are therefore included in the production bundle rather than only the local source.
