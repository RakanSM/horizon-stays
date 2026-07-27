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
- [x] T6: Deployed to production (horizonstay-sa.vercel.app) + GitHub push; sno-edu.com currently hosts SNO Education site — domain move needs user's 2-click action in Vercel dashboard (documented in final report)
- [x] T7: Apartment images — sky-lounge-suite & massive-3br-2floors now 10 real photos each (Gathern galleries; Airbnb pages delisted). luxury-apt-blvd-70-tv & tranquil-stay-luxury-bath keep 1 hero each (only source still online)
- [x] T8: Airbnb guests — scraped ALL 4,722 reservations via internal API; 3,757 unique guests (575 repeat), 35 phones (all still-visible ones); imported to Supabase guests table + Excel deliverable. Older phones permanently hidden by Airbnb post-checkout policy
- [x] T9a: All themes fabulous/artsy visual upgrade (seasonal decor layers, richer previews)
- [x] T9b: Parallax scroll theme — Artistic Horizon, px-layer transforms verified
- [ ] T10: Two-way sync Horizon ↔ Odoo (needs Odoo instance from user)
- [x] T12: Mobile view audit — all pages 375px clean (no overflow, tap targets fixed, admin login form fixed)
- [x] T13: Cleaner role — /cleaner PIN portal + admin cleaning log & cleaner management, verified end-to-end
- [x] T14: Final QA — all 7 routes 200 on production, new images live, theme bundle verified, ttlock API auth-gated, sync endpoint secured (401 w/o secret), DB state clean (royal-gold active, no stray schedules/custom themes)

## Follow-up: Gathern guest data (user request Jul 24)
- [x] T15: Extracted ALL 336 Gathern reservations — 100% phone coverage (260 unique guests)
- [x] T15b: Merged into guests_master_v2.xlsx + Supabase guests table (4,017 guests, 295 phones total)

## New batch (user feedback Jul 25)
- [x] T16: Fix booking bug — sticky mobile booking bar + auto-scroll to booking box on range completion + hint guard
- [x] T17: Image quality — 174 HQ originals re-fetched (Airbnb im_w=1440 / Gathern 1920), q85 webp max1600px, served from Supabase Storage CDN (property-images bucket)
- [x] T18: Light mode for ALL themes — header sun/moon toggle, hand-tuned light palettes, hero contrast fix, persisted in localStorage
- [x] T19: 5 new themes (kafd-futurist, najdi-heritage, velvet-lounge, mono-editorial, riyadh-season — 20 total) + Shopify-style Code tab in editor (custom CSS live preview + custom JS, saved to site_settings)
- [x] T20: Connections verified — ical-relay ok, live sync 45/45 feeds 0 failed, blocked_dates fresh (airbnb+gathern), VM cron active
- [x] T21: Deployed (dpl_BRWj3QJFqt2RymGz3dQwz8ixZSbC READY) — all 6 routes 200, CDN images live, GitHub master+main pushed

## Scrollytelling landing section (user request Jul 27 — brought Gemini reference code + hybrid layout brief; I choose the approach)
- [ ] T39: Build 3-phase hybrid scrollytelling section on landing page (Phase 1 fixed canvas hook, Phase 2 stacking value cards, Phase 3 pinned horizontal showcase), adapted to Horizon gold/dark luxury design with real property photos/content — NOT the generic Gemini demo copy
- [ ] T40: i18n (AR/EN/ZH/FR/ES) + RTL-aware transforms + mobile (<768px) fallback to plain stacked blocks + prefers-reduced-motion respect + scroll progress dots
- [ ] T41: Local visual verification (desktop + mobile), deploy to horizon-stays project (owns horizonstay-sa.com), verify live, push GitHub
