# Map and Date Pricing Preview — 2026-08-25

The local public home page loaded successfully after the interactive-map implementation. The visible homepage content, Arabic layout, property data, and date-search module render normally. The map section is deferred further down the public scroll flow, so its collection-marker interaction requires a targeted follow-up check before release.

The local Duplex Penthouse property page also loaded successfully. Its individual Leaflet map, map controls, geographic marker, availability calendar, and base from-price render without browser errors. The date-comparison panel only appears after a check-in and check-out pair is selected, so that path remains to be verified before release.

Keyboard navigation reached the booking section. Before any dates are chosen, the card correctly shows only the base "from" nightly price, two date prompts, and the final-price note; no fabricated comparison or discount is visible.

After selecting 2026-09-02 to 2026-09-05, the page showed a real three-night comparison: the base estimate, the selected-date estimate, and a nightly breakdown for 2, 3, and 4 September. The verified quote returned the same SAR 4,500 nightly amount for that particular range, so the comparison correctly showed no artificial saving or surcharge.

The public home page remains a deferred scroll experience. Targeted collection-map marker hover testing will be completed after the release candidate is deployed, where the live scroll state can be refreshed independently from local interaction state.
