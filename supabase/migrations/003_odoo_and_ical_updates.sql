
-- Update bookings table for Odoo integration
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS odoo_rental_order_id INTEGER,
ADD COLUMN IF NOT EXISTS odoo_payment_id INTEGER,
ADD COLUMN IF NOT EXISTS odoo_sync_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS odoo_sync_date TIMESTAMPTZ;

-- Ensure odoo_invoice_id exists (it was in 001_init.sql but good to be sure)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='odoo_invoice_id') THEN
        ALTER TABLE bookings ADD COLUMN odoo_invoice_id INTEGER;
    END IF;
END $$;

-- Update properties table for better iCal management
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS last_ical_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ical_sync_status VARCHAR(50) DEFAULT 'idle';

-- Create table for ESG data if needed locally (Odoo will be the source of truth, but we might want to cache or track metrics)
CREATE TABLE IF NOT EXISTS esg_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  metric_type TEXT NOT NULL, -- e.g., 'carbon_footprint', 'energy_usage', 'water_usage'
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  odoo_reference_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for Equity tracking (if needed locally)
CREATE TABLE IF NOT EXISTS equity_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shareholder_name TEXT NOT NULL,
  share_count NUMERIC NOT NULL,
  equity_type TEXT NOT NULL, -- e.g., 'common', 'preferred'
  odoo_reference_id INTEGER,
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for new tables
ALTER TABLE esg_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE equity_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access" ON esg_metrics FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON equity_records FOR ALL USING (auth.role() = 'authenticated');
