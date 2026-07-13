-- 002_ical_sync_and_property_management.sql

-- Add iCal URLs to properties table
ALTER TABLE properties
ADD COLUMN airbnb_ical_url TEXT,
ADD COLUMN gatherin_ical_url TEXT,
ADD COLUMN description TEXT;

-- Update bookings table to include source and confirmation_code
ALTER TABLE bookings
ADD COLUMN source TEXT,
ADD COLUMN confirmation_code TEXT UNIQUE;

-- Create a new table for dynamic pricing, if needed in the future
-- For now, we will use base_price_night and extend this later if more complex pricing is required.

-- The `blocked_days` table in 001_init.sql uses `start_date` and `end_date` for date ranges.
-- The `sync-icals` cron job currently attempts to insert individual dates into `blocked_days`.
-- This migration assumes `blocked_days` will continue to store date ranges.
-- The `sync-icals` logic will need to be updated to reflect this.

-- Add RLS policies for the new columns if necessary (assuming admin full access covers new columns by default)
-- If specific RLS policies are needed for these new columns, they should be added here.
