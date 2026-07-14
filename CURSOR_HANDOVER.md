# Cursor Handover: Horizon Stays Property Management & iCal Integration

This document provides all the necessary information and instructions for Cursor to complete the property integration and management setup for Horizon Stays.

## 1. Project Overview
The goal is to manage 26 properties through a centralized dashboard. The system is built using **Next.js**, **Supabase**, and **Vercel**. I (Manus AI) have already implemented the database schema, iCal sync engine, and an enhanced admin dashboard.

## 2. Credentials & Access

### GitHub Repository
- **URL:** `https://github.com/RakanSM/horizon-stays`
- **Access Token:** [User will provide the GitHub PAT ghp_... manually]

### Supabase
- **Project URL:** `https://bwffhalzuvvmuzjfmdyp.supabase.co`
- **Anon Key:** [User will provide manually]
- **Service Role Key:** [User will provide manually]
- **Supabase Access Token (CLI):** [User will provide the sbp_... token manually]

### Vercel
- The project is linked to the GitHub repository and should auto-deploy on every push.

## 3. Tasks for Cursor

### A. Extract Property Data (Airbnb & Gathern.co)
1. **Login:** Use the user's credentials (to be provided by the user in Cursor) to log in to:
   - [Airbnb Host Dashboard](https://www.airbnb.com/hosting)
   - [Gathern Dashboard](https://gathern.co/)
2. **Gather Property Details:** For each of the 26 properties, extract:
   - **iCal Links:** Found in the calendar settings (Export Calendar).
   - **Photos:** High-resolution image URLs.
   - **Descriptions & Features:** All details in Arabic (المزايه والتفاصيل).
   - **Pricing:** Current base prices.

### B. Insert Data into Horizon Stays
1. **Admin Dashboard:** Access the new admin interface at `/admin/properties`.
2. **Data Entry:** For each property:
   - Paste the **Airbnb iCal URL** and **Gatherin iCal URL** in the "iCal Links" tab.
   - Add the **Description** in the "Description" tab.
   - Update **Pricing** in the "Pricing" tab.
   - (Optional) Use the Supabase dashboard or API to batch-upload the images to the `images` column in the `properties` table.

### C. Verify Integration
1. **Sync Check:** Trigger the sync cron job manually by calling the endpoint: `/api/cron/sync-icals`.
2. **Calendar Verification:** Ensure that blocked dates from Airbnb/Gathern appear on the Horizon Stays calendar.
3. **UI Verification:** Check that the property details and images are correctly displayed on the public-facing site.

## 4. Technical Reference
- **iCal Sync Logic:** `app/api/cron/sync-icals/route.ts`
- **Property API:** `app/api/properties/route.ts`
- **Admin UI:** `app/admin/properties/page.tsx`
- **Database Schema:** `supabase/migrations/001_init.sql` and `002_ical_sync_and_property_management.sql`
