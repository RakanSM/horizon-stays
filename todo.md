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

## Correct Production Release Target (User request Aug 20)
- [x] T174: Verify the framed map and stay.sa-inspired redesign are committed to `RakanSM/horizon-stays`; the live Vercel target is `horizon-stays` (not the earlier `horizon-stays2026` assumption) for `horizonstay-sa.com`.
- [x] T175: Prepare the latest verified commit for the existing Vercel production project without creating a replacement Vercel project, changing DNS, payment settings, or `sno-edu.com`.

## Live Map Frame & Horizon Redesign (User request Aug 20)
- [x] T176: Implement a visible, wide `Where you'll be` MapFrame on the public homepage using all available active-property coordinates.
- [x] T177: Implement the same visible MapFrame on every property detail page using that property's saved latitude and longitude, with a clear location fallback.
- [x] T178: Apply the original stay.sa-inspired Horizon visual system to the public website without copying Stay branding, text, or media assets.
- [x] T179: Build, test on desktop and mobile, commit, push to GitHub main, and verify a READY deployment from Vercel project `horizon-stays` (`prj_UsDIbMu1ku3gZ8O4rlAdHVihS4Qg`).

## Live Map Frame & Horizon Redesign (User request Aug 20)
- [x] T176: Implement a visible, wide `Where you'll be` MapFrame on the public homepage using all available active-property coordinates.
- [x] T177: Implement the same visible MapFrame on every property detail page using that property's saved latitude and longitude, with a clear location fallback.
- [x] T178: Apply the original stay.sa-inspired Horizon visual system to the public website without copying Stay branding, text, or media assets.
- [x] T179: Build, test on desktop and mobile, commit, push to GitHub main, and verify a READY deployment from Vercel project `horizon-stays` (`prj_UsDIbMu1ku3gZ8O4rlAdHVihS4Qg`).

## Property Map Pins Repair (User report Aug 20)
- [x] T180: Diagnose why property pins are not visibly rendered in the homepage map frame despite available property coordinates.
- [x] T181: Render and label one interactive pin per active property on the homepage map, and one precise pin on each property detail map.
- [x] T182: Show a clear missing-location state for properties with no latitude/longitude and retain the external map link.
- [x] T183: Verify visible pins on desktop and mobile, run tests/build, push to GitHub main, and confirm the correct Vercel production deployment is READY.

## Production Deployment Verification (User request Aug 21)
- [x] T184: Confirm the Horizon Stays production deployment built from the latest map-pin fix is READY and serving the production domain.

## Airbnb Location Reconciliation (User request Aug 21)
- [ ] T185: Inventory each property’s linked Airbnb listing and compare its public location information with the current Horizon Stays coordinates.
- [ ] T186: Update only coordinates supported by a public Airbnb location signal; record every ambiguous or privacy-protected listing for owner confirmation instead of guessing.
- [ ] T187: Verify corrected pins on the homepage and property pages, run tests/build, and publish the confirmed coordinate updates.
- [ ] T193: Use the connected Airbnb host session only to review each listing’s verified location information; do not alter listings, pricing, calendars, or account settings.
- [ ] T194: Use the connected Airbnb host session only to review and reconcile listing photos with the corresponding Horizon Stays unit; do not replace or delete any Airbnb media.
- [x] T195: Continue a non-blocking audit of existing property galleries and publicly available listing metadata while the Airbnb browser connection is restored; mark every unverified map point or image for confirmation rather than guessing. Completed: all 25 stored hero images respond successfully; 24 galleries have at least five images; the single-image `luxury-apt-blvd-70-tv` cover is identical to another unit’s cover and is documented for host-side verification instead of automatic replacement.

## Sahmk Integration Confirmation (User request Aug 21)
- [ ] T188: Inspect the existing Sahmk integration configuration and restore the previously agreed Horizon Stays scope without altering unrelated integrations.
- [ ] T189: Confirm the supported Sahmk workflow, credentials/connection state, and any required callback or synchronisation route before implementation.

## iCal Location Audit (User request Aug 21)
- [x] T190: Inspect the existing Airbnb and Gathern iCal feeds to determine whether any reliable location or listing identifiers are exposed. Completed: 45 configured feeds opened successfully; none exposed LOCATION, GEO, or an equivalent coordinate field.
- [x] T191: Use iCal only for property matching if it lacks coordinates, and add a documented alternative for assigning exact property pins without guessing. Completed: the admin property editor now accepts a verified coordinate pair with Riyadh-area validation and a map-preview link; public pins now expose a touch/click/focus tooltip with the property name and price.

## Production Link Accessibility (User report Aug 21)
- [x] T192: Diagnose the Horizon Stays production-link accessibility report, release the tested map interaction update to the correct production target, and verify the public site opens normally. Completed: commit `3fd13a3` deployed READY to the `horizon-stays` production project; the apex domain loads the same released assets and exposes the map pin name/price tooltips. Use the apex domain, not the unconfigured `www` host.

## Public Frontend Rebuild (User request Aug 22)
- [x] T196: Replace the existing public-facing Horizon Stays theme from the ground up while preserving routes, live property data, booking paths, prices, and admin functionality. Completed: rebuilt the public application shell, homepage, property discovery cards, footer, and property-details visual layer without changing Supabase data models, booking calculations, or admin routes.
- [x] T197: Establish a new responsive visual system, navigation, hero, property discovery, trust/value content, map, and footer using existing verified property media only. Completed: implemented the new Horizon editorial design system with separate desktop/mobile treatments, live property imagery, responsive navigation, collection filters, map area, and updated footer.
- [x] T198: Validate the rebuilt homepage and property journey on desktop and mobile, run tests/build, commit, push, and verify the production deployment. Completed: responsive breakpoints and reduced-motion rules are included in the public layer; 12 Vitest checks and the production build pass; commit `cce6f0f` is deployed READY as `dpl_C21qWdx7tD95yXb3Fj6XAA7kwMTR`, and the production domain responds successfully.

## Main-Domain Theme Completion (User request Aug 22)
- [x] T199: Audit what is visibly served on `horizonstay-sa.com` versus the intended public theme, then complete any missing theme sections or styling without affecting live property, booking, or admin functions. Completed: identified and repaired the public shell runtime regression without changing booking or admin routes.
- [x] T200: Test and publish the completed theme to the main domain, confirming that the apex domain serves the intended release. Completed: production deployment `dpl_6GxgKfV6NVMy3qaNrJcRW2rdsiwP` is READY from commit `2038b7f`; the apex domain renders the corrected theme.
- [x] T201: Verify the completed theme retains verified property photography, interactive map discovery, live pricing and discount presentation, responsive motion, and reduced-motion accessibility without changing booking or admin workflows. Completed: the final 1440px production inspection shows the live hero, property imagery, interactive map pins, property discovery, and public shell with no JavaScript errors; existing booking/admin paths remain unchanged by this fix.
- [x] T202: Repair the public-theme runtime regression (`theme is not defined`) so the main domain can render the new frontend shell. Completed: restored `theme` to the shared ThemeContext destructuring; the isolated production-preview check renders the public shell with 28,451 characters of page content and no JavaScript errors.

## Horizon Future-Stay Experience (User creative direction Aug 23)
- [x] T203: Recast the public design system around the agreed “أفق جديد للإقامة اليومية” future-stay art direction, balancing deep-space, ivory, silver, and horizon accents without imitating another brand or overusing gold. Completed: built the original Horizon Future-Stay layer with ivory/silver canvas, deep-space moments, electric horizon blue, and restrained sunset accents.
- [x] T204: Build a premium intelligent discovery module for destination, dates, guests, and apartment type, connected to the current property catalogue and available booking journey. Completed: added a live-catalogue search module that filters apartment type and guest capacity, validates date order, and directs guests to matching residences for date-specific availability and pricing.
- [x] T205: Add immersive but calm public sections for destinations, categories, premium services, booking journey, host partnership, and trust markers; exclude fabricated ratings, testimonials, or reviews. Completed: added destination discovery, booking journey, Horizon standard, map discovery, and owner-partnership sections without fabricated guest ratings, reviews, or testimonials.
- [x] T206: Verify the new responsive Arabic/English experience, accessible motion, loading/empty states, existing map/prices/discounts, and release it to the apex domain. Completed: 13 tests and the production build pass; desktop and mobile visual checks show the search, destination rail, map, prices, empty state, reduced-motion rules, and responsive flow; production deployment `dpl_HeKmTnFUfk8MEUEX2Aac316958d1` is READY and the apex domain returns no JavaScript errors.
- [x] T207: Reduce the initial public bundle by separating the shared theme-preview context from the lazy ThemeEditor module, preserving editor preview behaviour. Completed: extracted the editor preview context into a lightweight shared module, moving ThemeEditor back to its own lazy chunk and reducing the initial JavaScript bundle from 752.82 kB to 720.70 kB before gzip.

## Public Experience Organisation (User request Aug 23)
- [x] T208: Reorder the public homepage into a clear journey from search to curated stay selection, city context, confidence signals, map discovery, and owner partnership; reduce decorative duplication and visual dead space. Completed: reordered the page into search/metrics → curated stay selection → city context → booking journey → Horizon standard → map → owner partnership.
- [x] T209: Refine the desktop and mobile hierarchy, card rhythm, control density, and section transitions while retaining the live catalogue, pricing, map, booking paths, and accessibility settings. Completed: added an asymmetric desktop residence grid, controlled card rhythm, shorter visual transitions, and focused mobile stacking; desktop and mobile checks render without JavaScript errors.

## TTLock Access Integration (User request Aug 23)
- [x] T210: Verify the official TTLock integration method, account type, required application credentials, and access scope without placing any credentials in source control. Completed: confirmed the TTLock Open Platform password-grant requirements and documented the secure admin setup; no user credentials or lock material were committed.
- [ ] T211: Add an admin-only TTLock lock-mapping model so every Horizon Stays unit can be linked to the correct verified lock.
- [ ] T212: Implement and test booking-bound digital access creation, expiry, revocation, and audit visibility according to a confirmed access policy.

## Public Booking Calendar Restoration (User request Aug 23)
- [x] T213: Restore the public booking search to a two-click date-range interaction: one click for check-in and one click for check-out. Completed: replaced the separate native fields with one shared, accessible month picker that follows the original range-selection behaviour.
- [x] T214: Retain date validation, guest/type filters, availability flow, responsive behavior, and accessible keyboard interactions while replacing the separate native date inputs. Completed: retained existing filters, search feedback and collection flow; added focused range-selection tests, production build validation, and a local browser check showing the full two-click journey.

## TTLock Unified Locks Page (User request Aug 23)
- [x] T215: Build a dedicated admin page that lists all TTLock locks with connection state, battery, gateway capability, lock alias, passcode status, and recent access events. Completed: added the protected `/admin/locks` route, smart-lock navigation entry, live safe-lock list, passcode overview, and access-event viewer.
- [x] T216: Add an auditable Horizon-to-TTLock change queue for safe changes such as lock alias updates and explicit guest-code lifecycle actions; defer property-to-lock mapping. Completed: applied the `ttlock_sync_audit` migration and added token-checked audit procedures for alias, guest-code, unlock, and event-read actions; no property-to-lock association exists in this release.
- [x] T217: Keep remote unlock, code creation, code deletion, and any direct door action behind explicit administrator intent and never run those actions automatically. Completed: server actions reject calls without `confirmed: true`; the page requires a final administrator confirmation and masks historic passcodes and credential traces.

## Unit Editor RTL Layout Repair (User request Aug 23)
- [x] T218: Repair the Odoo linking controls in the unit editor so inputs, labels, checkboxes, and action buttons stay inside the card in Arabic RTL layouts. Completed: isolated the Odoo form into a zero-minimum-width two-column grid, constrained field widths, and made the save/sync action area RTL-aware.
- [x] T219: Verify the repaired unit editor at desktop and mobile widths without affecting Odoo mapping, calendar sync, or unit settings. Completed: added an RTL layout regression test; the full suite passed with 20 tests and the production build succeeded.

## Full Horizon Experience Rebuild (User request Aug 23)
- [x] T220: Audit the public experience, actual loading path, live content hierarchy, and Odoo integration material to establish the highest-impact UI/UX and performance changes. Completed: documented conversion, progressive-disclosure, travel-accommodation UX, Core Web Vitals, and Odoo integration findings in `docs/UX_AND_ODOO_RESEARCH_2026-08-23.md`.
- [x] T221: Build an original conversion-focused Horizon design system using a fixed visual field, deliberately ordered property media/cards, calm motion, Arabic/English RTL support, and accessible responsive behaviour. Completed: rebuilt the public experience around a fixed atmospheric field, clear decision-first hero, refined search module, deliberate twelve-column residence catalogue, verified property media, and reduced-motion/mobile behaviour.
- [x] T222: Improve perceived and measured loading performance through prioritised media, code-splitting, loading states, and responsive rendering without removing live catalogue, booking, map, pricing, or channel functionality. Completed: added responsive image sizing/async decoding, deferred map mounting, distant-section rendering containment, lazy map code, direct selected-theme resolution, and stable React/Supabase vendor chunks; build output now has no oversized-chunk warning.
- [x] T223: Use the browser to inspect and configure the user-authorised Odoo environment, then connect verified Odoo product/rental settings to Horizon without placing credentials in source control. Cancelled by user in favour of Horizon internal operations modules.
- [x] T224: Add the verified Odoo URL, database, integration username, and API key through the administrator-only Integrations form, then run a non-mutating connection test before enabling booking synchronization. Cancelled by user; no Odoo credentials were saved.

## Horizon Internal Operations Suite (User request Aug 23)
- [x] T225: Define the shared role, data, and approval model for owner finance, expenses, documents, contracts, subscriptions, rentals, CRM, POS, accounting, and invoicing; exclude Sales. Completed: added Horizon-owned operational tables with RLS, strict status fields, property/owner associations, and an audit log; no Sales table or screen was added.
- [x] T226: Add protected financial reporting for administrators and per-owner reports with revenue, Horizon commission, taxes, expenses, net payout, occupancy, date/property filters, and invoice status. Completed: added `admin_financial_report` and `landlord_financial_report`, the Operations finance workspace, and a landlord-only operating report with date/unit filters.
- [x] T227: Add expense recording, receipt/document attachment metadata, approval/payment status, allocation to property/owner, and owner-visible expense reporting. Completed: added a protected expense workflow with draft/submitted/approved/payment stages, owner-share percentage, receipt URL metadata, audit history, administration table, and owner-scoped approved-expense report.
- [x] T228: Add Horizon-native CRM, POS, subscription, rental, accounting, invoicing, documents, spreadsheets, and electronic-signature workflows, all gated by the correct role and without a Sales module. Completed: added the protected `/admin/operations` workspace and data procedures for CRM, POS, subscriptions, rental agreements, accounting entries, documents, spreadsheets, and signature requests; invoicing links to the verified booking/invoice flow.
- [x] T229: Verify calculations, access boundaries, Arabic/English UI, desktop/mobile operation, and the full test/build suite before creating a release checkpoint. Completed: invalid tokens receive `unauthorized` from all new operations procedures; 25 Vitest tests and the production build passed.
- [x] T230: Preserve the current Odoo source, migrations, API routes, and integration screens unchanged; leave live configuration and synchronization disabled until the user reopens the Odoo workstream. Completed: no Odoo source, migration, API route, or integration screen was removed or modified.

## Interactive Property Cards & Airbnb Coordination (User request Aug 23)
- [x] T231: Add accessible property-card summary overlays with real nightly pricing, verified property details, a direct booking action, and a non-destructive favourites action. Completed: property cards now use live pricing/details, a direct property booking route, and browser-local favourites without changing customer or property data.
- [x] T232: Preserve clear mobile controls, keyboard focus, screen-reader labels, and existing property/detail booking flows while adding the hover/focus treatment. Completed: reveal controls respond to hover and `:focus-within`, favourites expose pressed state and labels, and the original property/detail routes remain intact.
- [ ] T233: Review the user-authorised Airbnb session or verified listing feeds after the Horizon implementation, and record only confirmed channel/listing coordination data without browser scraping or fabricated media/location data.

## Fixed-Scene Scroll Rebuild (User request Aug 23)
- [x] T234: Remove the public “من الفكرة إلى باب الوحدة” booking-journey card section shown in the user screenshot. Completed: removed its JSX from the public page and added a regression test that rejects the old section markup.
- [x] T235: Build one fixed, accessible visual scene behind the public experience, with residence images, content blocks, and property cards moving through it in a deliberate scroll sequence. Completed: added a sticky full-viewport scene with three live residence panels that reveal in sequence, retain verified property images/details, and link to the existing booking journey.
- [x] T236: Verify smooth reduced-motion/mobile fallbacks and ensure the fixed scene does not degrade search, booking, map, page loading, or keyboard navigation. Completed: added responsive stacked-panel rules, reduced-motion static rendering, IntersectionObserver reveal, 26 passing tests, and a successful production build; preview content confirmed the replacement scene renders.

## Financial Report & Status Clarity (User request Aug 24)
- [x] T237: Review the current administrator and landlord financial reports for income, commission, tax, expenses, invoice/payment state, and payout state. Completed: confirmed the live booking states are pending/paid, expense ledgers are empty, invoices use the `invoices` table, and legacy maintenance/property-cost ledgers must remain separate from operational expenses.
- [x] T238: Add a clear financial-status model and filterable presentation for period, unit, owner, booking, payment, expense approval, and payout readiness. Completed: added protected reservation, collection, invoice, expense, and settlement summaries for administrators and owner-scoped equivalents for landlords; the expense view now follows its period/unit filter and supports recording a valid partial payment amount.
- [x] T239: Verify report calculations and owner/admin access boundaries across desktop and mobile before saving the update. Completed: applied the protected report migration; invalid administrator and landlord tokens both return `unauthorized`; 32 Vitest tests and the production build pass; desktop preview shows the expected protected admin gate, and a regression test covers the small-screen filter/status layout. No protected report contents were opened without a valid session.

## Public Scroll-Scene Copy Refinement (User request Aug 24)
- [x] T240: Replace the current public fixed-scene headline and supporting sentence with clearer Arabic copy that guides a guest toward selecting a stay, without changing the scene design or verified property content. Completed: replaced it with “اختر ما يناسبك. واحجز بثقة.” and a clear date-specific availability/pricing message; added bilingual equivalent copy and a regression test. The full test suite and production build pass.

## Public Background Palette Refinement (User request Aug 24)
- [x] T241: Replace the public scene’s blue background/glow palette with a dark violet palette while preserving readable typography, image contrast, motion, and responsive/reduced-motion behavior. Completed: replaced the electric blue and deep blue-black field with violet `#a879f7` and night-violet `#170d2b`, updated the scene media fallback and overlay tones, and added regression coverage. The full test suite and production build pass.

## Dark-Mode Green Contrast Fix (User request Aug 24)
- [x] T242: Raise contrast for green text and status elements in the dark public experience while preserving their semantic availability/success meaning. Completed: the lone public availability indicator now uses Horizon’s electric lavender instead of green, with a matching lavender halo that remains visible on the dark scene.

## Airbnb-Verified Map Accuracy (User request Aug 24)
- [x] T243: Inventory current Horizon property coordinates and map links, then verify each Airbnb listing association and location evidence in the logged-in host session without changing Airbnb data. Completed: 17 associations are confirmed from read-only host evidence; 7 stored Airbnb links do not match their Horizon unit and one matching listing remains detail-pending. No Airbnb data was changed.
- [x] T244: Apply only confirmed coordinate and direction-link corrections to Horizon, then verify public map pins and property maps without fabricating or inferring a precise address. Completed: applied 15 verified, neighbourhood-level coordinate corrections and verified four corrected live property maps. The seven mismatched channel links and one detail-pending listing were intentionally left unchanged rather than guessed.

## Brand Contrast, Commercial Registration & Trust Certificate (User request Aug 24)
- [x] T245: Replace the public green accent/status treatment with a high-contrast colour appropriate to Horizon’s violet-night palette, including dark-mode states. Completed: replaced the green availability dot with the same high-contrast electric lavender used by Horizon's dark scene.
- [x] T246: Add commercial registration number 7050485445 to the public footer in Arabic and English as non-interactive text only. Completed: the footer displays the CR number as plain text without a link or click handler.
- [x] T247: Add an accessible public «موثّق» trigger as the only interactive trust element; its responsive popup must show the certificate number and supplied certificate image. Completed: added keyboard-dismissible dialog behaviour, an overlay click-to-close path, certificate number 0000305469, and a responsive certificate image layout.
- [x] T248: Create and use an edited verification image that removes only the specified «العودة إلى الاستعلام عن متجر إلكتروني موثّق» phrase while preserving all other certificate content. Completed: generated and uploaded the edited certificate asset, which is used by the public trust popup. All 33 tests and the production build pass.

## Remaining Dark Green Removal (User request Aug 25)
- [x] T249: Identify and replace any remaining dark-green public visual treatment with a non-green Horizon-compatible accent, then verify dark-mode legibility and production rendering. Completed: replaced the public dark-green foundations, overlays, card treatments, and search shadows with deep plum and violet tones; 34 tests and the production build pass.
- [x] T250: Isolate public-route dark background and hero tokens from the global editable theme variables so the public dark mode stays plum/violet rather than inheriting any green theme palette; verify on production. Completed: public-route aliases now override the global background, card, border, typography, accent, header, and hero-overlay tokens in both modes; 34 tests and the production build pass.

## Airbnb-Style Map Discovery & Date Price Comparison (User request Aug 25)
- [x] T251: Correct public map pin anchoring so markers stay tied to the supplied neighbourhood-level coordinates through zoom and pan, without exposing a private building address. Completed: replaced the fixed overlay layer over the map iframe with coordinate-bound Leaflet markers that update with the map viewport.
- [x] T252: Remove the unit-chip list below the main map and replace it with keyboard-accessible hover/focus property cards containing a main image, scrollable photo strip, concise verified description, from-price, and Book now action. Completed: replaced the chip list with property cards in marker popups using verified photos, stored descriptions, from-prices, map links, and booking actions.
- [x] T253: Add a clear property-page price comparison that shows the base from-price alongside the selected-date nightly rate, stay total, and difference after a guest selects check-in and check-out dates. Completed: the price card now compares the base estimate with the selected-date quote, shows a real saving/surcharge only where one exists, and lists the API-returned nightly amounts for every date in the selected stay.

## Guest Benefit Copy, Footer Information Pages & Policy Agreement (User request Aug 25)
- [x] T254: Replace guest-facing public copy that reads like Horizon internal/team messaging with concise benefits that help a guest understand what they receive and what to do next. Completed: the public services section now explains what a guest sees, how date-based pricing works, and how they continue to arrange arrival.
- [x] T255: Move the owner/operating-partnership content and CTA out of the main homepage into a dedicated bilingual Services page, reachable only through the public footer. Completed: owner services are now in `/services`; the public home no longer carries the owner-partnership section.
- [x] T256: Add separate bilingual About, Services, and Policies pages and expose them through the footer without adding them to the primary navigation. Completed: the three pages are footer-linked only; the primary navigation now concentrates on properties, contact, and the booking path.
- [x] T257: Require an explicit policy-agreement checkbox before a guest can continue to a public payment path or any paid booking handoff, with a direct link to the policies page. Completed: agreement is required before the public property booking handoff becomes an active WhatsApp link; the page has no live direct payment launcher at this time, so this guards the current paid-booking handoff without representing an unimplemented processor as live.
