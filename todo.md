# Horizon Vercel Site TODO

## Completed (previous phases)
- [x] Supabase Hstays populated: 25 active properties with airbnb_ical_url, gatherin_ical_url (20), ical_token
- [x] blocked_dates table + sync RPCs (secrets table, upsert_blocked_dates, get_export_data)
- [x] New site built (Vite React, Arabic RTL, gold/dark premium design) with Supabase live data
- [x] iCal export endpoint /api/ical/[slug]?token= and /api/sync (cron every 3h + cloud PC safety cron)
- [x] Deployed to Vercel horizonstay-sa (production, verified live)
- [x] Code pushed to GitHub RakanSM/horizon-stays branch manus-vercel-site
- [x] Gathern import: all 20 units have "Horizon Stays" synced calendar (Success)
- [ ] Airbnb import: 26 listings need Horizon calendar links added (waiting for user Airbnb login)

## New: Theme system + admin panel
- [ ] themes/site_settings schema in Supabase (active theme, theme customizations JSON)
- [ ] Admin auth (password-based, hashed secret in Supabase secrets table, session token)
- [ ] 10 theme presets (distinct palettes/fonts/styles incl. current gold/dark as default)
- [ ] Theme runtime: CSS variables applied from active theme + customizations
- [ ] Admin panel /admin: login, theme gallery with previews, one-click activate
- [ ] Shopify-style theme editor /admin/editor: live preview iframe, edit colors/fonts/radius/hero content, save/publish/reset
- [ ] Futuristic motion: scroll-reveal animations, parallax hero, smooth transitions, respects prefers-reduced-motion
- [ ] Local build + visual verification of all 10 themes
- [ ] Deploy to Vercel, verify live, push to GitHub
