
## Initial verification

The local build passed 5/5 Vitest tests. The public `/calendar` rendered 25 active units and the two-month availability grid. After logging into `/admin` with the validated admin session, the sidebar showed `التقويم الموحد`; navigating to `/calendar` rendered the admin title, the selected-property hint, and the full unit list without a client error.

## Selected property editor verification

In admin mode, selecting the second unit from the `/calendar` sidebar opened its existing full editor below the availability grid. The editor showed the real CDN gallery with 42 images, cover/order/delete controls, channel/ical settings, and the property details area. The first keyword probe for the pricing section did not match the exact heading, so the next check will inspect the lower section directly without changing data.

## Pricing merge verification

The selected-property page contains the merged weekly pricing panel. The verified unit displayed a 3,500 SAR base price and controls for weekday price, weekend price, and the actual weekend days, alongside the date override editor. No save action was pressed during verification.

## Legacy route verification

Navigating to local `/admin/pricing` resolved to `/calendar` and retained the authenticated admin shell. The merged calendar rendered the property list and the admin hint, confirming the old route no longer creates a separate pricing workflow.

## Admin-only visibility verification

After logging out in the local preview, opening `/calendar` redirected to `/admin` and showed only the admin login form. The public header/footer no longer includes a calendar link; the admin sidebar retains `التقويم الموحد`.

## Speed and action verification

The optimized preview loaded the 25-property summary list and availability calendar after authenticated admin checks. The selected-property action area is present in the merged workspace. The test also revealed that the outer public header/footer still wrapped `/calendar` because the app shell only treated `/admin/*` as an admin route; this is being corrected so the admin-only calendar uses the admin shell without public chrome.

## Speed, English, and Edit price verification

The optimized calendar now uses one lightweight property-summary request plus the availability query at initial load; full admin property/gallery data is fetched only when a unit is selected. The admin shell has no public header/footer on `/calendar`. Switching to English translated the admin shell, property names, calendar headings/months, pricing rules, weekend controls, and selected-date controls. Selecting a unit showed `View property` and `Edit price` side by side; clicking `Edit price` scrolled directly to the English pricing editor with weekday, weekend, date override, close, minimum-stay, save, and reset controls.

## Final performance verification

The production build now code-splits admin, property, booking, finance, integration, and calendar pages. The initial JavaScript chunk dropped from about 994 kB to about 728 kB minified, while the calendar is a separate approximately 41 kB chunk. Vitest remained 5/5 and the lazy-loaded `/calendar?perf=1` route rendered the admin-only English calendar correctly after navigation.
