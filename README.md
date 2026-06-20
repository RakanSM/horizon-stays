# Horizon Stays 🏨

> منصة تأجير عقارات فاخرة — Luxury Property Rental Platform

Full-stack Next.js 14 application for managing luxury short-term rentals in Riyadh.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS |
| Database | Supabase (PostgreSQL + Realtime + Storage + Auth) |
| Hosting | Vercel (web) + Skywork (staging) |
| Mobile | React Native (Expo) |
| Payments | MyFatoorah (Mada, Visa, Apple Pay, STC Pay, Tabby, Tamara) |
| Messaging | WozTell (WhatsApp Business API) |
| Smart Locks | TTLock API |
| ERP | Odoo 16/17 (XML-RPC) |
| Platforms | Airbnb, Booking.com, Gatherin, Expedia |

## Environment Variables

| Variable | Where to find | Required |
|----------|--------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API | ✅ |
| `MYFATOORAH_API_KEY` | MyFatoorah Dashboard → Live Keys | ✅ |
| `MYFATOORAH_ENV` | `test` or `live` | ✅ |
| `WOZTELL_API_KEY` | WozTell Dashboard → API Keys | ✅ |
| `WOZTELL_PHONE_NUMBER_ID` | WozTell Dashboard → Channel ID | ✅ |
| `TTLOCK_CLIENT_ID` | TTLock Developer Portal | ✅ |
| `TTLOCK_CLIENT_SECRET` | TTLock Developer Portal | ✅ |
| `ODOO_URL` | Your Odoo instance URL | Optional |
| `ODOO_DB` | Odoo database name | Optional |
| `ODOO_USERNAME` | Odoo admin email | Optional |
| `ODOO_API_KEY` | Odoo Settings → Technical → API Keys | Optional |
| `AIRBNB_WEBHOOK_SECRET` | Airbnb Partner Portal → Webhooks | Optional |
| `BOOKING_CHANNEL_MANAGER_KEY` | Booking.com Channel Manager | Optional |
| `GATHERIN_API_KEY` | Gatherin Partner Dashboard | Optional |
| `EXPEDIA_API_KEY` | Expedia Connectivity Partner Portal | Optional |
| `EXPEDIA_API_SECRET` | Expedia Connectivity Partner Portal | Optional |
| `NEXT_PUBLIC_APP_URL` | Your production domain | ✅ |

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/your-org/horizon-stays
cd horizon-stays
npm install

# 2. Environment setup
cp .env.local.example .env.local
# Edit .env.local with your credentials

# 3. Database setup
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase db seed

# 4. Run locally
npm run dev
```

## Database Commands

```bash
npm run db:migrate    # Push migrations
npm run db:seed       # Seed sample data  
npm run db:types      # Regenerate TypeScript types
```

## Deployment

### Staging (Skywork)
Already published at your Skywork workspace URL.

### Production (Vercel)
1. Push to GitHub: `git push origin main`
2. GitHub Actions auto-deploys to Vercel
3. Add GitHub Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, all env vars

### Custom Domain
1. In Vercel Dashboard → Project → Domains → Add `horizonstays.com`
2. Add DNS records at your registrar:
   - `A 76.76.21.21` (Vercel IP)
   - `CNAME www cname.vercel-dns.com`

## Webhook Endpoints

| Platform | URL | Method |
|---------|-----|--------|
| Airbnb | `/api/webhooks/airbnb` | POST |
| Booking.com | `/api/webhooks/booking` | POST |
| Expedia | `/api/webhooks/expedia` | POST |
| WozTell | `/api/webhooks/woztell` | POST |
| MyFatoorah Callback | `/api/payments/callback` | GET/POST |
| iCal Feed | `/api/ical/[propertyId]` | GET |

## Mobile App (React Native)

```bash
cd mobile
# Install Expo Go or run in simulator
npx expo start
# Build for production
eas build --platform all
eas submit --platform all
```

---
Built with ❤️ by Horizon Stays Team · Riyadh, Saudi Arabia
