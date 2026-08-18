# Feature visibility QA — 2026-08-18

The local Vite build was checked at `/admin/features`.

- Logged-out state shows the existing admin password screen.
- After admin login, the new sidebar link `Feature visibility` is visible.
- Arabic view shows four groups: navigation/pages, booking/payment, property details, and site experience.
- English toggle changes the full page and sidebar labels to English.
- The page exposes 16 switches, currently `16/16 on`.
- Controls include properties/about/contact/calendar/landlord/cleaner pages; WhatsApp/Airbnb/Gathern/MyFatoorah booking controls; gallery/amenities/map/social sharing; seasonal decor and scrollytelling.
- Build and tests passed before visual inspection.
- End-to-end save test passed: WhatsApp was toggled off and the UI displayed `Visibility settings saved ✓` after the Supabase RPC call.
- The test setting was restored successfully; the final UI and database state is `16/16 on` with WhatsApp shown.
