-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. property_owners (NEW — ERP requirement)
CREATE TABLE property_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name TEXT NOT NULL,
  owner_phone TEXT,
  owner_email TEXT,
  bank_iban TEXT,
  bank_name TEXT,
  management_fee_pct NUMERIC DEFAULT 15.0,
  balance_due NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_name TEXT NOT NULL,
  type TEXT CHECK (type IN ('penthouse','suite','loft','studio')),
  area_sqm NUMERIC,
  bedrooms INT,
  bathrooms INT,
  floor INT,
  status TEXT CHECK (status IN ('available','occupied','maintenance','blocked')) DEFAULT 'available',
  base_price_night NUMERIC NOT NULL DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  platform_names JSONB DEFAULT '{}',
  lock_id TEXT,
  lock_status TEXT DEFAULT 'unknown',
  owner_id UUID REFERENCES property_owners(id),
  property_type TEXT CHECK (property_type IN ('owned','third_party_managed')) DEFAULT 'owned',
  cost_center_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. users (admin)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  role TEXT CHECK (role IN ('admin','operations','cleaning')) NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  guest_email TEXT,
  platform TEXT CHECK (platform IN ('airbnb','booking','gatherin','expedia','direct','manual')) DEFAULT 'direct',
  platform_booking_id TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INT NOT NULL,
  guests_count INT DEFAULT 1,
  amount_sar NUMERIC NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('pending','confirmed','checked_in','checked_out','cancelled','transferred')) DEFAULT 'pending',
  payment_method TEXT CHECK (payment_method IN ('myfatoorah','bank_transfer','card')),
  payment_status TEXT CHECK (payment_status IN ('pending','pending_review','paid','failed','refunded')) DEFAULT 'pending',
  door_code TEXT,
  door_code_expires TIMESTAMPTZ,
  odoo_invoice_id INT,
  zatca_invoice_id TEXT,
  zatca_qr TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. booking_transfers (NEW — ERP: DO NOT modify original booking)
CREATE TABLE booking_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_booking_id UUID NOT NULL REFERENCES bookings(id),
  new_booking_id UUID NOT NULL REFERENCES bookings(id),
  from_property_id UUID REFERENCES properties(id),
  to_property_id UUID REFERENCES properties(id),
  transfer_reason TEXT NOT NULL,
  transferred_by UUID REFERENCES users(id),
  revenue_impact NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. claims (damage claims)
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  property_id UUID REFERENCES properties(id),
  description TEXT NOT NULL,
  amount_sar NUMERIC NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('pending','paid','forgiven','extension_requested','approved_extension')) DEFAULT 'pending',
  due_date DATE,
  extended_due_date DATE,
  evidence_urls TEXT[] DEFAULT '{}',
  maintenance_log_id UUID,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  tab TEXT CHECK (tab IN ('purchases','services','salaries')) NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_sar NUMERIC NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL,
  receipt_url TEXT,
  note TEXT,
  odoo_journal_entry_id INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. blocked_days
CREATE TABLE blocked_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  requested_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. maintenance_logs
CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  issue TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low','medium','high','critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('open','in_progress','resolved')) DEFAULT 'open',
  notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. cleaning_tasks
CREATE TABLE cleaning_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  booking_id UUID REFERENCES bookings(id),
  assigned_to UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('pending','in_progress','done')) DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. messages (WhatsApp inbox)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  direction TEXT CHECK (direction IN ('inbound','outbound')) NOT NULL,
  channel TEXT DEFAULT 'whatsapp',
  content TEXT NOT NULL,
  woztell_id TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  method TEXT CHECK (method IN ('myfatoorah','bank_transfer','card')) NOT NULL,
  amount_sar NUMERIC NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('pending','pending_review','paid','failed','refunded')) DEFAULT 'pending',
  gateway_ref TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. guest_reviews
CREATE TABLE guest_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  booking_id UUID REFERENCES bookings(id),
  guest_name TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. contacts (from landing page contact form)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. settings (key-value pairs for admin settings)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. bank_transactions (NEW — bank reconciliation)
CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  reference TEXT,
  reconciled BOOLEAN DEFAULT false,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. odoo_sync_errors
CREATE TABLE odoo_sync_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  error_message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from claims to maintenance_logs (after both created)
ALTER TABLE claims ADD CONSTRAINT claims_maintenance_log_fk
  FOREIGN KEY (maintenance_log_id) REFERENCES maintenance_logs(id);

-- RLS: Enable on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: admin full access
CREATE POLICY "Admin full access" ON properties FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON claims FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON blocked_days FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON maintenance_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON cleaning_tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON property_owners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON booking_transfers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON bank_transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- RLS: Guest can read own booking by email
CREATE POLICY "Guest read own booking" ON bookings FOR SELECT USING (true);
CREATE POLICY "Guest read own claim" ON claims FOR SELECT USING (true);
CREATE POLICY "Public can read properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Public can read reviews" ON guest_reviews FOR SELECT USING (true);
CREATE POLICY "Public can insert contacts" ON contacts FOR INSERT WITH CHECK (true);
