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
- [x] T39: 3-phase hybrid scrollytelling section live on landing (ScrollStory.tsx, 420vh runway, native scroll+rAF, no framer-motion; gold/dark luxury styling, real CDN property photos, showcase links to 4 property pages)
- [x] T40: story_* i18n keys in AR/EN/ZH/FR/ES; RTL-aware rail direction (verified +x in AR, -x in EN); mobile/reduced-motion fallback (.ss-fallback stacked blocks); phase progress dots
- [x] T41: Verified locally (Phase 1 callouts, Phase 2 card stack, Phase 3 rail, dots) in AR+EN; deployed to both Vercel projects; horizonstay-sa.com serving new bundle (ss-root CSS + story code confirmed live); pushed to GitHub master + vercel-live-site

## Full site visual redesign (user request Jul 27 — "reshape and design the whole site bg and banners, don't forget anything")
- [x] T42: New visual system defined — token-driven (color-mix on theme vars so all 20 themes + light mode inherit): gold-dust radial glows + SVG grain on body, glass surfaces, gradient gold accents
- [x] T43: Global background system live — body::before/::after fixed glow + grain layers, section ornamental center dividers, section.alt radial tint, light-mode variants
- [x] T44: Banners redesigned — hero (richer overlay, glass eyebrow w/ RTL-aware shine animation, gradient em headline, bottom gold hairline), page-hero for About/Contact (radial gold overlay + h1 underline bar), detail-hero gold frame
- [x] T45: Surfaces refreshed — glass blur header w/ gradient border-image, gradient gold CTAs w/ shine sweep, glass filter chips, upgraded property cards (hover hairline + glow), gradient stat numbers, footer glow, book-box, calendar months, amenities, mv/why/contact/odoo admin cards, WhatsApp float pulse (reduced-motion respected)
- [x] T46: Verified locally — AR dark + light variant, homepage/About, scrollytelling unaffected; mobile-only rules untouched (low risk)
- [x] T47: Deployed to both Vercel projects; horizonstay-sa.com serving new CSS (eyebrow-shine/book-box/ss-root confirmed in live bundle), all pages 200; pushed GitHub master + vercel-live-site

## Channel + data audit (user request Jul 27)
- [x] T48: All 3 channels verified — live sync 45/45 feeds ok 0 failed (25 Airbnb + 20 Gathern; 5 units not listed on Gathern so no feed by design); Horizon export ICS verified valid on 3 sample slugs; blocked_dates fresh (cron 12:30 UTC + manual run)
- [x] T49: Locations fixed — neighborhoods normalized to canonical EN in DB (KAFD/Al Olaya/Al Malqa/Al Narjes/Al Yasmin/Boulevard), localized display in all 5 langs via neighborhoodLabel(); 3 coordinate mismatches corrected (luxury-1bd-70tv→KAFD, tranquil-stay-luxury-bath+sky-lounge-suite→Al Malqa)
- [x] T50: Photo audit — 628/628 CDN gallery images return 200, 0 broken (counts 15-42/unit; luxury-apt-blvd-70-tv=1 known, source delisted)
- [x] T51: admin_login RPC verified returns session token with stored password; deployed both projects, live pages 200, pushed GitHub; credentials delivered to user

## Admin portal rebuild + financial + bookings + artsy properties (user request Jul 30)
- [ ] T52: Audit current Admin.tsx; design multi-page admin structure (sidebar/tab routes per feature, admin-gated): Properties, Financial, Bookings/Users, Invoices, Channels, TTLock, Cleaning, Themes, Settings
- [ ] T53: DB: bookings table (property, guest name/phone/email, source airbnb/gathern/direct, check-in/out, nights, amount, status), invoices table (number, booking_id, amounts, VAT, issued_at), admin RPCs (list/create/update/delete bookings, generate invoice, financial summaries)
- [ ] T54: Properties admin page — full CRUD on details (names AR/EN, price, desc, beds/baths/guests/area/floor, neighborhood, type, active toggle), per-property iCal fields (moved from Channels), photo count/reorder note, Airbnb/Gathern URLs
- [ ] T55: Financial page — total income, monthly chart, by-unit and by-source breakdowns, occupancy %, ADR, date-range filter
- [ ] T56: Bookings/Users page — upcoming + past tabs, guest info, add/edit manual bookings, auto-shown iCal blocks, invoice button per booking
- [ ] T57: Invoice generation — printable/downloadable invoice per booking (bilingual AR/EN, VAT-ready, sequential numbering)
- [ ] T58: Artsy properties page — slide-in from all directions on scroll, reactive banners (mouse/scroll-reactive), staggered reveals; keep mobile + reduced-motion fallbacks
- [ ] T59: Verify locally (admin flows, financial calcs, invoice print, artsy animations AR/EN), deploy both Vercel projects, verify live
- [ ] T60: Write Cursor prompt document for Apple iOS app (SwiftUI, same Supabase backend, feature parity map, API/RPC reference, design tokens)

## Landlord role (user request Jul 30, follow-up)
- [x] T61: DB done (migration v2 applied; reused existing bookings uuid table, junk test rows cleaned; landlords/property_landlords/invoices created; all RPCs smoke-tested end-to-end incl. commission math 18% override) — landlords table (name, phone, email, login code/password, default commission %), property_landlords mapping (property_id, landlord_id, commission_pct override), bookings gain landlord-facing amounts; landlord_login + landlord_data RPCs (own properties only)
- [ ] T62: Admin landlords page — create/edit landlords, assign properties, set Horizon % per landlord/property, view their statement, share login credentials
- [ ] T63: Landlord portal (/landlord) — own units only: bookings, gross income, Horizon commission (percentage field shown), VAT, net payout; monthly statement view; print/export
- [ ] T64: Financial page shows Horizon commission earnings separately (admin view)

## Theme expansion + celebration game (user request Aug 1)
- [ ] T70: Design 40+ themes (Islamic holy days, Saudi national, family, Valentine, medical/nursing Nightingale, international non-religious, seasonal, exclusive) with full color palettes and dates
- [ ] T71: Add Riyadh trivia + hidden discount code mechanics for each celebration theme (correct answer = 15% code)
- [ ] T72: Update themes.ts with all new theme definitions including game data (question, options, answer, discount code)
- [ ] T73: Enhance ThemeEditor: favicon upload/change, banner image management per theme, live preview
- [ ] T74: Build CelebrationGame component (trivia popup or hidden-code hunt) that appears during active celebration themes
- [ ] T75: Integrate game into site (hero area or floating widget), add CSS for all new themes
- [ ] T76: Build, verify, deploy to production

## Final integrations readiness audit (user request Aug 15)
- [x] T77: Supabase root cause verified and fixed — Hstays project was INACTIVE; restored through Supabase management API and confirmed ACTIVE_HEALTHY
- [x] T78: Database and public site verified after restore — 25 active properties, 69 blocked-date rows, REST API HTTP 200, 25/25 live property cards, no client connection errors
- [x] T79: Airbnb/Gathern calendar setup verified — 25 Airbnb feeds + 20 Gathern feeds present; authorized live sync refreshed both sources; availability endpoint returns 200 with current blocked dates
- [ ] T80: Verify Odoo connection status and any available sync workflow — stored Odoo URL is currently blank and no API credentials/sync endpoint are configured in the site
- [ ] T81: Run final production QA, deploy only if a repair is required, and deliver final live access links

## Odoo + property settings + Airbnb-style calendar (user request Aug 16)
- [x] T83: Created the Supabase Odoo foundation: secured odoo_config and odoo_sync_runs tables, per-property Odoo product mapping, per-booking rental/invoice/payment sync metadata, indexes, admin config/status RPCs, and repaired the obsolete Odoo URL admin auth check.
- [x] T84: Built the protected /api/odoo/sync endpoint and full Admin → Integrations Odoo workspace (credentials are never returned to the browser, connection test, safe manual sync, state and recent runs). Scheduled automation remains intentionally disabled until live Odoo credentials are saved and the connection is verified.
- [x] T85: Rebuilt Admin → Properties as a complete unit workspace: the original 627-photo CDN galleries are now durable data per unit, photo count/cover/order controls and manual image URL field are live, and all property details, active status, Airbnb/Gathern/iCal, calendar status, and Odoo product mapping are grouped in one editor. Fixed Channels page to show actual 25/26 Airbnb and 20/26 Gathern connectivity.
- [x] T86: Built `/calendar`: a two-month Airbnb-style availability page with previous/next/today navigation, all-unit or single-unit filter, source-colored blocked date ranges, availability legend, and direct property links. Locally verified with 25 active units and current Supabase blocked-date data.
- [x] T87: Completed production release `ba5505c`: Vitest passed 2/2 photo-gallery tests, Vite build passed, `/calendar` loaded 25 active units with live availability, Admin → Properties loaded 26 configured units with images/settings, and Admin → Integrations shows real 25/26 Airbnb + 20/26 Gathern connectivity alongside the safe Odoo setup workspace.

## Admin login correction (user reported Aug 15)
- [x] T82: Root cause fixed — restored DB was missing pgcrypto, so admin_login failed on gen_random_bytes; session helper also read an obsolete private_config token. Replaced token generation with database-native MD5 rotation, unified _is_admin with admin_auth, added post-login reload, deployed main + vercel-live-site, and verified production dashboard loads finance/bookings successfully.

## Back-office pricing calendar and comments review (user request Aug 16)
- [x] T88: Reviewed `Comments-v1.docx`, captured every actionable issue in `qa/comments-v1-review.md`, and prioritized booking, pricing, property page, image, contact, and production-usage concerns.
- [x] T89: Added durable future pricing: per-unit weekday/weekend rules, configurable weekend days, per-date price/closed/minimum-stay/note overrides, protected admin APIs, and a public stay-price quote that resolves the final total.
- [x] T90: Built Admin → Pricing Calendar with a two-month view, unit selector, one-date/range selection, price/close/minimum-stay controls, reset-to-automatic action, and weekday/weekend rule editor.
- [x] T91: Applied immediately actionable comments: dynamic date-aware displayed totals, checkout selection when the following reservation starts on checkout, compact Show all photos control, Share and map controls, updated contact number, services section, six-unit initial display with Show all, and a legal/footer information area.
- [x] T92: Added 3 future-price precedence tests (date override → weekend/weekday rule → base price), retained the 2 gallery tests, passed all 5/5 Vitest checks, completed Vite production build, and visually verified the admin pricing range selector plus public check-in/check-out price calculation without writing test pricing data.

## Unified availability and pricing calendar (user request Aug 17)
- [x] T93: Merged the availability calendar and pricing calendar into one `/calendar` admin workspace with a selected-property editor.
- [x] T94: The selected property opens the existing full editor in the unified workspace with real CDN gallery photos, cover/order/delete controls, descriptions, amenities, channel links, iCal status, and Odoo mapping.
- [x] T95: Embedded base, weekday, weekend-day, weekend, and date-override pricing editors beside the selected unit calendar, including save/reset feedback and the existing protected admin RPCs.
- [x] T96: `/admin/pricing` now redirects to `/calendar`, the admin navigation uses `التقويم الموحد`, and local desktop verification covered public mode, authenticated mode, unit selection, editor rendering, and legacy-route navigation.
- [x] T97: Vitest passed 5/5 and Vite production build passed after the merge; QA notes are recorded in `qa/2026-08-17-unified-calendar.md`. The source workspace is ready for the user to publish.

## Admin-only calendar visibility (user request Aug 17)
- [x] T98: Removed the availability/calendar link from the public header; direct public access now redirects to the admin portal instead of rendering calendar data.
- [x] T99: Unified availability, property editor, and pricing workspace now render only after `admin_check` succeeds; unauthenticated access receives the admin login gate.
- [x] T100: Verified logout → `/calendar` redirects to `/admin`, admin navigation retains the unified calendar link, 5/5 tests pass, and the release is ready for publishing.
