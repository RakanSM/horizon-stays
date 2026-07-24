# Horizon Vercel Site TODO

## Completed (previous phases)
- [x] Supabase Hstays populated: 25 active properties with airbnb_ical_url, gatherin_ical_url (20), ical_token
- [x] blocked_dates table + sync RPCs (secrets table, upsert_blocked_dates, get_export_data)
- [x] New site built (Vite React, Arabic RTL, gold/dark premium design) with Supabase live data
- [x] iCal export endpoint /api/ical/[slug]?token= and /api/sync (cron every 3h + cloud PC safety cron)
- [x] Deployed to Vercel horizonstay-sa (production, verified live)
- [x] Code pushed to GitHub RakanSM/horizon-stays branch vercel-live-site
- [x] Gathern import: all 20 units have "Horizon Stays" synced calendar (Success)
- [ ] Airbnb import: 26 listings need Horizon calendar links added (waiting for user Airbnb login)

## New: Theme system + admin panel
- [x] themes/site_settings schema in Supabase (active theme, theme customizations JSON)
- [x] Admin auth (password-based, secret in Supabase private_config, session token) — fixed gen_random_bytes issue via md5 token
- [x] 10 theme presets (royal-gold default, midnight-neon, desert-rose, emerald-oasis, pearl-minimal, royal-purple, ocean-breeze, carbon-ember, sand-dune, aurora-glass)
- [x] Theme runtime: CSS variables applied from active theme + overrides, localStorage cache
- [x] Admin panel /admin: login, theme gallery with previews, one-click activate (verified locally + live)
- [x] Shopify-style theme editor /admin/editor: live preview, tabs (theme/colors/fonts/content), radius slider, publish/reset (verified locally)
- [x] Futuristic motion: scroll-reveal animations, parallax hero, counters, respects prefers-reduced-motion
- [x] Local build + visual verification (royal-gold + midnight-neon verified end-to-end)
- [x] Deploy to Vercel, verify live (/admin login works on production), push to GitHub

## New: Client-ready polish (Jul 24)
- [ ] Gather ALL property photos (Airbnb galleries for the 10 properties lacking local images; more photos for existing ones where possible)
- [ ] i18n: Arabic/English language toggle across all pages (header switch, full translations, dir switching)
- [ ] Property detail page upgrade: full gallery with lightbox, complete details/amenities, better layout
- [ ] About Us page: full professional bilingual content
- [ ] Unified booking calendar: 1st click = check-in, 2nd click = check-out; if 2nd click before 1st, it becomes new check-in; range highlight; blocked dates unselectable; selection feeds WhatsApp booking message
- [ ] Verify admin panel connectivity to live Supabase (settings load/save round-trip)
- [ ] Local build + visual verification (both languages, calendar logic, mobile)
- [ ] Deploy to Vercel production + verify live + push GitHub
- [ ] Odoo: identify instance, verify connection from site admin, header switch Horizon admin -> Odoo, and link in Odoo back to Horizon
