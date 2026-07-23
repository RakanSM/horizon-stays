# Horizon Stays — Live Site (Vercel + Supabase)

This branch (`vercel-live-site`) contains the source of the production site deployed at **https://horizonstay-sa.vercel.app** (Vercel project `horizonstay-sa`, team Najid Sulotions).

## Architecture

| Layer | Technology |
|---|---|
| Frontend | Vite + React 18 + TypeScript, Arabic RTL, premium dark/gold design |
| Data | Supabase project `Hstays` (`bwffhalzuvvmuzjfmdyp`) — `properties` + `blocked_dates` tables, read via anon key with column-level grants (private columns such as `ical_token` and feed URLs are not selectable by anon) |
| Serverless API | Vercel functions under `api/` |
| Calendar sync | `api/sync.ts` — fetches Airbnb + Gathern iCal feeds for every active property and replaces `blocked_dates` rows via SECURITY DEFINER RPCs; runs on Vercel Cron every 3 hours (`vercel.json`) with a backup cron on the ops VM at :30 |
| iCal export | `api/ical/[slug].ts` — token-protected per-property `.ics` feed for importing into Airbnb/Gathern (`/api/ical/<slug>?token=<ical_token>`) |
| Geo-block fallback | If a direct Airbnb fetch returns 403, the sync retries through a whitelisted relay on a fixed-IP VM (`35.231.49.115:8791`, key-protected) |

## Development

```bash
pnpm install
pnpm dev        # local Vite dev server (frontend only)
pnpm build      # production build to dist/
```

Serverless functions run on Vercel; to test the sync locally use `vercel dev` or call the RPCs directly.

## Deployment

Deployed to the existing Vercel project `horizonstay-sa` (production). Deploying this branch as-is via Vercel (framework: Vite, output: `dist`) reproduces the live site. Environment variables are optional — safe defaults are embedded; `SYNC_SECRET`, `RELAY_KEY`, `SUPABASE_URL` can override via Vercel env settings.

## Data notes

The `properties` table holds 25 active Riyadh units with Arabic/English names, pricing, amenities, and per-property `airbnb_ical_url` / `gatherin_ical_url` import feeds plus an `ical_token` export secret. Availability shown on the site comes exclusively from `blocked_dates`, which the sync rewrites idempotently per property/source.
