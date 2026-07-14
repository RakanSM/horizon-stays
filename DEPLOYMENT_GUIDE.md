# Horizon Stays - Deployment & Setup Guide

This guide walks you through deploying the Horizon Stays property management system to Vercel and configuring all integrations.

## Prerequisites

- GitHub account with access to `https://github.com/RakanSM/horizon-stays`
- Vercel account
- Supabase account (already set up at `https://bwffhalzuvvmuzjfmdyp.supabase.co`)
- MyFatoorah merchant account (for payments)
- Airbnb and Gathern.co host accounts (for iCal links)

## Step 1: Prepare Environment Variables

Copy the `.env.example` file to `.env.local` and fill in all the required values:

```bash
cp .env.example .env.local
```

### Required Variables:

| Variable | Value | Source |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://bwffhalzuvvmuzjfmdyp.supabase.co` | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Supabase Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Supabase Settings > API |
| `MYFATOORAH_API_KEY` | Your API key | MyFatoorah Dashboard |
| `MYFATOORAH_ENV` | `test` or `live` | Your choice |
| `NEXT_PUBLIC_APP_URL` | Your domain (e.g., `https://horizonstays.com`) | Your domain |
| `CRON_SECRET` | Random secret string | Generate one |

## Step 2: Deploy to Vercel

1.  Go to [Vercel](https://vercel.com/new)
2.  Click **"Import Project"** and select your GitHub repository: `https://github.com/RakanSM/horizon-stays`
3.  In the **"Environment Variables"** section, add all variables from your `.env.local` file
4.  Click **"Deploy"**

Vercel will automatically build and deploy your site. The deployment typically takes 2-5 minutes.

## Step 3: Verify Supabase Setup

1.  Go to [Supabase Dashboard](https://app.supabase.com/)
2.  Select your project: `bwffhalzuvvmuzjfmdyp`
3.  Check that all tables exist under **"SQL Editor"**:
   - `properties`
   - `bookings`
   - `blocked_days`
   - `payments`
   - `property_owners`
   - (and others as defined in migrations)

4.  Verify the migrations were applied by checking **"Migrations"** under **"SQL"**

## Step 4: Configure MyFatoorah

1.  Log in to your [MyFatoorah Dashboard](https://myfatoorah.com/)
2.  Go to **Settings > API Keys** and copy your API key
3.  Add it to Vercel environment variables as `MYFATOORAH_API_KEY`
4.  Set `MYFATOORAH_ENV` to `test` for testing, `live` for production
5.  Configure the callback URL in MyFatoorah: `https://your-domain.com/api/payments/callback`

## Step 5: Add Property iCal Links

1.  Access your admin dashboard: `https://your-domain.com/admin/properties`
2.  For each property, click to open the management modal
3.  Go to the **"iCal Links"** tab
4.  Paste the Airbnb iCal URL (from Airbnb calendar settings)
5.  Paste the Gatherin iCal URL (from Gatherin dashboard)
6.  Click **"Save Calendar Links"**

## Step 6: Verify iCal Sync

1.  The sync cron job runs every 10 minutes automatically
2.  To manually trigger: `https://your-domain.com/api/cron/sync-icals?authorization=Bearer{CRON_SECRET}`
3.  Check Supabase `blocked_days` table to verify bookings are synced

## Step 7: Test a Booking

1.  Go to your public site: `https://your-domain.com`
2.  Select a property and complete a booking
3.  Verify the payment flow works with MyFatoorah
4.  Check that the booking appears in the admin dashboard

## Troubleshooting

### Bookings not syncing from Airbnb/Gathern?
- Verify iCal URLs are correct in the properties table
- Check that the cron job is running (check Vercel logs)
- Ensure Supabase credentials are correct

### Payment gateway not working?
- Verify `MYFATOORAH_API_KEY` is correct
- Check that `MYFATOORAH_ENV` matches your account type
- Ensure callback URL is configured in MyFatoorah

### Admin dashboard not loading?
- Verify you're logged in with admin credentials
- Check that Supabase connection is working
- Clear browser cache and try again

## Support

For issues, check the GitHub repository issues or contact support at your domain.
