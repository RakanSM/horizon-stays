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
- [x] Gather ALL property photos (Airbnb galleries for the 10 properties lacking local images; more photos for existing ones where possible)
- [x] i18n: Arabic/English language toggle across all pages (header switch, full translations, dir switching)
- [x] Property detail page upgrade: full gallery with lightbox, complete details/amenities, better layout
- [x] About Us page: full professional bilingual content
- [x] Unified booking calendar: 1st click = check-in, 2nd click = check-out; if 2nd click before 1st, it becomes new check-in; range highlight; blocked dates unselectable; selection feeds WhatsApp booking message
- [x] Verify admin panel connectivity to live Supabase (settings load/save round-trip)
- [x] Local build + visual verification (both languages, calendar logic, mobile)
- [x] Deploy to Vercel production + verify live + push GitHub
- [ ] Odoo: identify instance, verify connection from site admin, header switch Horizon admin -> Odoo, and link in Odoo back to Horizon (UI built; waiting for user's Odoo signup)

## New batch (user's 14-task list, Jul 24)
- [x] T2: Verify theme editing works end-to-end (save → apply → persist; verified locally, prod verify after deploy)
- [x] T3a: Ramadan theme variant 1 (lanterns/crescent decoration) — Ramadan Nights, verified
- [x] T3b: Ramadan theme variant 2 (distinct style) — Ramadan Serenity
- [x] T3c: Eid Al-Fitr decoration theme — festive light w/ balloons
- [x] T3d: Eid Al-Adha decoration theme — maroon/Hejazi gold
- [x] T3e: Theme scheduling — admin sets date/range, theme auto-activates (schedules column + admin UI + resolver)
- [x] T4: Admin portal settings smooth + full theme creation capability (custom theme creator in editor)
- [x] T5: TTLock integration — /api/ttlock serverless proxy + admin section (setup, locks, guest passcodes, remote unlock); awaits user's TTLock developer credentials to go live
- [ ] T6: Push everything to sno-ed.com domain
- [ ] T7: Download and import remaining apartment images to Horizon
- [ ] T8: Airbnb customers info (phone numbers; private message workflow if hidden)
- [x] T9a: All themes fabulous/artsy visual upgrade (seasonal decor layers, richer previews)
- [x] T9b: Parallax scroll theme — Artistic Horizon, px-layer transforms verified
- [ ] T10: Two-way sync Horizon ↔ Odoo (needs Odoo instance from user)
- [x] T12: Mobile view audit — all pages 375px clean (no overflow, tap targets fixed, admin login form fixed)
- [x] T13: Cleaner role — /cleaner PIN portal + admin cleaning log & cleaner management, verified end-to-end
- [ ] T14: Final thorough QA of everything
