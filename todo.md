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

## Speed, edit-price action, and English calendar (user request Aug 17)
- [x] T101: Reduced initial calendar load cost by using lightweight property summaries and availability data; full property/gallery data loads only after a unit is selected, and the duplicate admin session check is skipped after the calendar auth check.
- [x] T102: Added a clear `Edit price` action beside `View property`; it scrolls directly to the selected property's pricing editor without losing unit or calendar context.
- [x] T103: Added English mode for the admin shell, unified calendar, property names, months/weekdays, pricing controls, weekend rules, date overrides, and key embedded property-editor labels/actions.
- [x] T104: Vitest passed 5/5, Vite production build passed, the admin-only shell was verified, English mode was verified, and `Edit price` was verified beside `View property` and inside the pricing editor.

## Production calendar visibility and special pricing correction (user request Aug 17)
- [x] T105: Verified production `/calendar`: it is still serving the public old bundle with header/footer, zero units while loading, and View property-only UI. GitHub production branches still point to `eb62637`, while the repaired local admin-only release is `aa1c37e`; the issue is that the repaired commit has not been promoted to production.
- [ ] T106: Ensure unauthenticated production `/calendar` redirects to `/admin` and authenticated production managers receive the English admin shell.
- [ ] T107: Ensure the selected-property admin header shows `View property` and `Edit price` side by side, with date-specific, range-specific, weekday, weekend, closed-date, and minimum-stay controls visible after Edit price.
- [ ] T108: Test the visitor/manager split and document the exact production URL and login flow before preparing the release.

## Production promotion blocker (user request Aug 17)
- [x] T109: Promote the corrected admin-only English calendar release from local commit `aa1c37e`/documentation `6e963c4` to the Vercel-connected production branch without touching `sno-edu.com`.
- [x] T110: Verify that Vercel builds the corrected commit, promote it to production, and confirm `/calendar` shows admin login, English admin shell, View property + Edit price, and special date pricing controls.

## Admin Feature & Button Visibility Control (User Request Aug 18)
- [x] T111: Define visibility toggles schema for booking methods (MyFatoorah-ready, Airbnb, WhatsApp), channel buttons, pages (About Us, Contact, Calendar, Landlord), and custom feature flags.
- [x] T112: Implement protected Supabase `admin_set_feature_flags` RPC and JSONB storage on `site_settings.feature_flags`; public reads use the existing site settings loader.
- [x] T113: Add Admin → Feature visibility workspace at `/admin/features` with Arabic/English groups, switches, enable/hide all, discard, and save controls.
- [x] T114: Wire Home, PropertyDetail, Navbar/footer, public route gates, seasonal decor, gallery, amenities, map, sharing, WhatsApp, Airbnb, and Gathern controls to respect saved flags.
- [x] T115: Vite build passed, 7/7 Vitest tests passed, Arabic/English UI verified, and a Supabase round-trip test toggled WhatsApp off then restored it to `16/16 on`.

## Vercel Token Deployment (User request Aug 18)
- [x] T116: Configure Vercel token securely for Horizon Stays deployment automation.
- [x] T117: Push local commit `50835f0` to GitHub `RakanSM/horizon-stays` main branch and trigger Vercel deployment.
- [x] T118: Verify live deployment build on Vercel and confirm `/admin/features` and calendar price edits are live on `horizonstay-sa.com`.

## Landlord portal login issue (User request Aug 18)
- [x] T119: Diagnosed landlord code rejection: the record in Supabase had an older access code while the link carried `LL-2A74F5B2`.
- [x] T120: Updated the landlord access code in Supabase to `LL-2A74F5B2` without altering admin auth or `sno-edu.com`.
- [x] T121: Verified successful landlord login and access to assigned units and financial summaries.

## Landlord Property Classification & Separate Income Stats & Filters (User request Aug 18)
- [x] T122: Added `relation_type` (owned vs managed) to `property_landlords` table and updated `landlord_data` RPC.
- [x] T123: Updated Landlord portal (`/landlord`) to show distinct statistics for owned units (100% revenue) vs managed units (commission-based).
- [x] T124: Verified local build (Vite + Vitest 7/7) and successful separation of owned revenue and management commissions.
- [x] T125: Separated bookings and nights counts clearly for owned vs managed units in KPI cards and booking tables as requested.
- [x] T126: Added period filters (All, Today, Last 7 Days, This Month, Custom Special Dates) and property selector (All properties vs specific unit) with real-time KPI and table re-calculation.


- [x] T128: Verify build and test report filtering.

## Landlord Portal & Filters Deployment (User request Aug 18)
- [x] T129: Commit landlord filter and property classification changes locally.
- [x] T130: Push changes to GitHub main branch for Vercel production deployment; Vercel created production deployment `dpl_AYYNgQqwfyaabY7YEfqJo65hX42A` from commit `a3f105b`.
- [x] T131: Verify live admin routes return HTTP 200 and the production bundle contains Feature visibility and landlord period/property filter code.
- [x] T132: Verified production readiness; live assets on `horizonstay-sa.com` successfully serve the updated landlord bundle containing period and property filters.

## Maintenance Requests & Invoices System (User request Aug 18)
- [x] T133: Created `maintenance_requests` table with fields for property, title, description, cost, invoice number, payment status (unpaid, partial, paid, cancelled), paid amount, and dates.
- [x] T134: Implemented admin management UI (`AdminMaintenance.tsx`) for maintenance requests and invoice status updates.
- [x] T135: Updated Landlord portal (`/landlord`) to display maintenance requests, invoices, and payment statuses for assigned units.
- [x] T136: Verified local build (Vite + Vitest 7/7) and successful integration of maintenance management and payment statuses.

## Property Daily/Monthly Costs & Invoices (User request Aug 18)
- [x] T137: Extended database schema (`property_costs`) to support periodic daily/monthly expenses per property with invoice numbers and payment statuses.
- [x] T138: Updated Admin maintenance & cost management interface (`AdminMaintenance.tsx`) to add daily/monthly recurring or fixed property costs.
- [x] T139: Updated Landlord portal (`/landlord`) and RPC to factor in property costs (daily/monthly) alongside maintenance and bookings, reflecting net totals and print statements.
- [x] T140: Verified local build (Vite + Vitest 7/7) and successful integration of property daily/monthly expenses.

## Occupancy Rate Dashboard & Reports (User request Aug 18)
- [x] T141: Defined occupancy calculation formula (booked nights / total available nights * 100) based on active property counts and year.
- [x] T142: Updated Admin Dashboard (`AdminDashboard.tsx`) and Finance page (`AdminFinance.tsx`) to display overall occupancy rate, progress bars, and per-property occupancy breakdowns.
- [x] T143: Verified local build (Vite + Vitest 7/7) and successful occupancy integration.

## Occupancy Deployment (User request Aug 18)
- [x] T145: Commit occupancy additions (`AdminDashboard.tsx`, `AdminFinance.tsx`) locally.
- [x] T146: Push changes to GitHub `main` branch connected to Vercel production for Horizon Stays (`horizonstay-sa.com`).
- [x] T147: Verify production deployment readiness and live admin routes.

## Theme Market & Editable Banners/Pics (User request Aug 18)
- [x] T148: Designed Theme Market data structure supporting 20+ celebration & luxury themes, editable hero banners, custom logos, favicons, colors, and asset replacement.
- [x] T149: Implemented Admin Theme Market workspace (`AdminThemes.tsx`) with preview, activate, duplicate, edit, and image replacement controls.
- [x] T150: Wired public theme application so active theme banners and assets render instantly across the site.
- [x] T151: Verified local build (Vite + Vitest 7/7) and successful theme market asset replacement.

## Complete Theme Market (User request Aug 18)
- [x] T152: Ensured all defined themes in `src/lib/themes.ts` are listed in Theme Market (`AdminThemes.tsx`).
- [x] T153: Verified full rendering, preview, and activation of all preset and custom themes.
- [x] T154: Verified local build (Vite + Vitest 7/7) and successful complete theme market update.

## Shopify & WordPress Themes in Theme Market (User request Aug 18)
- [x] T155: Added Shopify-inspired store themes (`shopify-dawn`, `shopify-boutique`) and WordPress-inspired editorial/magazine themes (`wordpress-editorial`, `wordpress-minimal`) to `src/lib/themes.ts`.
- [x] T156: Updated Theme Market UI (`AdminThemes.tsx`) with category tabs (All, Shopify Storefronts, WordPress Editorial, Luxury, Celebrations).
- [x] T157: Verified local build (Vite + Vitest 7/7) and successful Shopify and WordPress theme previews and activations.

## 2,500+ Theme Market Expansion (User request Aug 18)
- [x] T158: Implemented dynamic theme generator in `src/lib/themes.ts` providing 2,500+ searchable, editable themes categorized across Shopify stores, WordPress editorials, luxury, and celebrations.
- [x] T159: Added instant search and pagination in Theme Market (`AdminThemes.tsx`) to maintain lightning-fast browsing across 2,500+ themes.
- [x] T160: Verified local build (Vite + Vitest 7/7) and successful 2,500+ theme selection and preview.

## Comprehensive Performance, Security, and Theme Questionnaire (User request Aug 18)
- [ ] T161: Establish git checkpoint and baseline performance audit.
- [ ] T162: Expand Theme Editor (`ThemeEditor.tsx`) so every element (colors, typography, spacing, hero content, badges, logo URL, favicon URL, banner images, and CSS overrides) is fully editable and previewable in real-time.
- [ ] T163: Create a Theme Questionnaire wizard (`ThemeQuestionnaire.tsx` / modal) that asks users preference questions (vibe, storefront vs editorial, dark vs light, accent tone) and generates, saves, and applies a tailored editable theme instantly.
- [ ] T164: Implement production performance optimizations (asset compression hints, font-display, lazy loading, image formats) and balanced bot/rate-limiting rules (robots.txt, secure headers, rate limits without blocking legitimate users or crawlers).
- [ ] T165: Run comprehensive build, unit tests (`pnpm test`), type check, and security verification.
- [ ] T166: Prepare deployment summary, risk analysis, rollback instructions, and file diff report.

## Dynamic Pricing & Airbnb-style Strikethrough Discount System (User request Mar 2026)
- [x] T170: Extend property pricing structure to support base price, custom date-specific pricing overrides, and weekly/monthly discount percentages.
- [x] T171: Update Admin calendar and pricing management (`AvailabilityCalendar.tsx` & `AdminProperties.tsx`) to let admins set custom date pricing and weekly/monthly discount rules per property.
- [x] T172: Update property detail booking widget (`PropertyDetail.tsx`) to calculate total nights dynamically, show weekly/monthly discount badge (e.g. "This host is offering a weekly discount"), and display strikethrough original total alongside the final discounted total price matching the Airbnb reference.
- [x] T173: Run build and verification tests.
