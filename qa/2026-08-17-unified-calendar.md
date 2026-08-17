
## Initial verification

The local build passed 5/5 Vitest tests. The public `/calendar` rendered 25 active units and the two-month availability grid. After logging into `/admin` with the validated admin session, the sidebar showed `التقويم الموحد`; navigating to `/calendar` rendered the admin title, the selected-property hint, and the full unit list without a client error.

## Selected property editor verification

In admin mode, selecting the second unit from the `/calendar` sidebar opened its existing full editor below the availability grid. The editor showed the real CDN gallery with 42 images, cover/order/delete controls, channel/ical settings, and the property details area. The first keyword probe for the pricing section did not match the exact heading, so the next check will inspect the lower section directly without changing data.

## Pricing merge verification

The selected-property page contains the merged weekly pricing panel. The verified unit displayed a 3,500 SAR base price and controls for weekday price, weekend price, and the actual weekend days, alongside the date override editor. No save action was pressed during verification.

## Legacy route verification

Navigating to local `/admin/pricing` resolved to `/calendar` and retained the authenticated admin shell. The merged calendar rendered the property list and the admin hint, confirming the old route no longer creates a separate pricing workflow.
