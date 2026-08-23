# Fixed-Scene Preview — 2026-08-23

The production preview rendered the Horizon homepage with the new `ScrollScene` content after the live property collection. The removed booking-journey heading and three-card layout did not appear in the rendered page content. The new scene exposed three live property images with their verified property names, districts, capacities, and booking paths.

The connected browser extension timed out during the follow-up scroll inspection. Automated test coverage and the production build passed before preview. The implementation includes explicit desktop, mobile, and reduced-motion rules; a further visual scroll check can be run when the browser extension reconnects.
