INSERT INTO property_owners (owner_name, owner_phone, owner_email, bank_iban, bank_name, management_fee_pct)
VALUES ('محمد العتيبي', '+966501234567', 'owner@example.com', 'SA2980209018452222121018', 'بنك الرياض', 15.0);

INSERT INTO properties (internal_name, type, area_sqm, bedrooms, bathrooms, floor, base_price_night, property_type)
VALUES
  ('بنتهاوس A', 'penthouse', 250, 3, 3, 20, 1200, 'owned'),
  ('سويت B1', 'suite', 120, 2, 2, 10, 650, 'owned'),
  ('لوفت C', 'loft', 80, 1, 1, 5, 400, 'owned');
