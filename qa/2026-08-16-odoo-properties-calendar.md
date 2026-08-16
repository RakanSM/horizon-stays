# QA — Odoo, Unit Settings, and Availability Calendar

## Local visual verification

- `/calendar` loaded 25 active units from Supabase and rendered two navigable month boards with Airbnb, Gathern, direct, and available-date indicators.
- `/admin/properties` accepted the verified admin session and loaded 26 stored units, including the inactive grand penthouse.
- The expanded `3br-apt-outdoor` editor rendered its complete 28-image Supabase Storage gallery, a selected cover image, move/cover/remove controls, the unit fields, channel/iCal controls, and Odoo product-mapping fields.
- The Odoo workspace rendered the expected safe `غير مكتمل` state without credentials, while the channel cards displayed the real 25/26 Airbnb and 20/26 Gathern counts.
- Calendar filtering selected the duplex penthouse and exposed its direct property link; advancing one month retained the selected unit and updated the two rendered months from August/September to September/October.
- No data-changing control was activated during visual verification.

## Automated verification

- `pnpm test`: 2/2 gallery URL/order tests passed.
- `pnpm build`: completed successfully.

## Production verification

- Production deployment on `horizonstay-sa.com` now serves the `/calendar` release. It loaded 25 active units and the current blocked-date data.
- Production `/admin/properties` authenticated successfully and displayed 26 stored units with real Supabase Storage thumbnails, verified image counts, iCal connection labels, and the expanded workspace.
- Production `/admin/integrations` displays the safe Odoo setup workspace and accurate channel totals: 25/26 Airbnb iCal links and 20/26 Gathern iCal links.
