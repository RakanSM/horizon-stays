# Horizon Stays — Property Media & Location Audit

**Audit date:** 22 August 2026

## Current verified result

| Check | Result | Action taken |
|---|---:|---|
| Active property hero images | 25 of 25 accessible | No replacement required. Each stored hero URL returned a successful response from the Horizon Stays storage path. |
| Properties with an Airbnb listing URL | 25 of 25 | Retained as the matching source for later host-side verification. |
| Galleries with at least five saved images | 24 of 25 | No media action required. |
| Gallery requiring a verified source | 1 property | **Near to Blvd \| Luxury Apt \| 70\" Smart TV** (`luxury-apt-blvd-70-tv`) has one saved image. Its public Airbnb page did not return a usable gallery during this audit. No image has been invented, copied, or replaced. |
| Visually identical hero-image candidates | 1 pair | **Minimalist 1BD** (`minimalist-1bd`) and **Near to Blvd \| Luxury Apt \| 70\" Smart TV** (`luxury-apt-blvd-70-tv`) have an identical low-resolution difference hash. This flags the latter property’s single cover image for host-side verification; it is not sufficient evidence to replace it automatically. |
| Exact coordinate source from iCal | 0 of 45 feeds | None of the available Airbnb/Gathern calendars contains `LOCATION`, `GEO`, or an equivalent coordinate field. |

## Location controls

The public map already renders a touch, click, hover, and keyboard-accessible property pin with the name and nightly price. The admin property editor accepts a verified latitude/longitude pair with Riyadh-area validation and a map preview link. Existing points are retained until a location can be verified from the Airbnb host account or another owner-approved source.

## Next safe action

When the connected Airbnb host browser responds, review the exact listing map placement and media gallery for each unit. Update Horizon Stays only where a direct, property-specific match is visible. Listings that reveal only a city or broad neighbourhood remain marked for owner confirmation rather than being moved to an inferred point.
