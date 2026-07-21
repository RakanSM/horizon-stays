-- Migration: Integrate all 26 Airbnb and Gathern properties with full details
-- This migration seeds the database with all properties and sets up iCal sync

-- Create or update properties table with additional fields for platform integration
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS airbnb_id TEXT UNIQUE;
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS gathern_id TEXT UNIQUE;
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS ical_url_airbnb TEXT;
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS ical_url_gathern TEXT;
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS platform_sync_status JSONB DEFAULT '{"airbnb": "pending", "gathern": "pending"}';
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP;

-- Insert all 26 properties with their details
INSERT INTO properties (
  name, 
  description, 
  location, 
  bedrooms, 
  bathrooms, 
  guests, 
  price_per_night, 
  image_url, 
  status,
  airbnb_id,
  platform_sync_status
) VALUES
-- 1. Luxury APT| 3 Bd | gaming area| outdoor| Jacuzzi
('Luxury APT | 3 Bd | gaming area | outdoor | Jacuzzi', 
 'Make some memories at this unique and family-friendly place. 3 bedrooms, gaming area, outdoor space, and jacuzzi.',
 'Riyadh, Saudi Arabia',
 3, 3, 7, 1762,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1716271283883149359/original/7e4494c6-88bb-433f-a53e-61ed373125b6.jpeg?im_w=720',
 'active',
 '1716271283883149359',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 2. Penthouse | KAFD view | 3Bd | Cinema | Outdoor Area
('Penthouse | KAFD view | 3Bd | Cinema | Outdoor Area',
 'Luxury penthouse with stunning KAFD view, 3 bedrooms, cinema room, and outdoor area.',
 'Riyadh, Saudi Arabia',
 3, 2, 6, 2100,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1668023094526866622/original/7b1b0a0d-6685-4da6-a042-e0169703ff4f.jpeg?im_w=720',
 'active',
 '1668023094526866622',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 3. Luxury Apartment | Al Yasmin
('Luxury Apartment | Al Yasmin',
 'Elegant luxury apartment in Al Yasmin neighborhood with modern amenities.',
 'Riyadh, Saudi Arabia',
 2, 2, 4, 1500,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1342989570553789618/original/b21a87e5-2c01-4981-bcce-8cdd68d18a37.jpeg?im_w=720',
 'active',
 '1342989570553789618',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 4. Outdoor area | Cozy Studio
('Outdoor area | Cozy Studio',
 'Cozy studio apartment with outdoor area in Al Malqa.',
 'Riyadh, Saudi Arabia',
 1, 1, 2, 800,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1631965176076750408/original/d96d5f6b-d978-4c78-baf1-f7dfc16f9154.jpeg?im_w=720',
 'active',
 '1631965176076750408',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 5. La Ribiera Apartment
('La Ribiera Apartment',
 'Beautiful apartment in Al Yasmin with modern design.',
 'Riyadh, Saudi Arabia',
 2, 2, 4, 1200,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1346338137510955056/original/6d076241-4efb-46fb-8950-ff823cdaf88e.jpeg?im_w=720',
 'active',
 '1346338137510955056',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 6. Near to Blvd | Luxury Apt
('Near to Blvd | Luxury Apt | 70" Smart TV',
 'Luxury apartment near Boulevard with 70 inch smart TV and self check-in.',
 'Riyadh, Saudi Arabia',
 2, 2, 4, 1400,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIwOTMyMDY2MTk5NDUwMTk4Mg==/original/291b0a2f-3e2e-459a-84ab-6990b0157b49.jpeg?im_w=720',
 'inactive',
 'U3RheVN1cHBseUxpc3Rpbmc6MTIwOTMyMDY2MTk5NDUwMTk4Mg==',
 '{"airbnb": "inactive", "gathern": "pending"}'),

-- 7. شقة انيقه بعوازل صوت
('Elegant Apartment with Sound Insulation',
 'Elegant apartment with sound insulation and self check-in, 10 minutes from KAFD.',
 'Riyadh, Saudi Arabia',
 2, 2, 4, 1100,
 'https://a0.muscache.com/im/pictures/a96b776d-25f0-4826-b04a-aefafa1388d6.jpg?im_w=720',
 'active',
 '1213854045018637530',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 8. Designer 1Bd appt
('Designer 1Bd Apartment | Private Rooftop | 75" TV',
 'Designer apartment with private rooftop, 75 inch TV, and self check-in.',
 'Riyadh, Saudi Arabia',
 1, 1, 2, 900,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1331444879967558349/original/bdba99c1-772f-4102-b284-1a394e604e00.jpeg?im_w=720',
 'active',
 '1331444879967558349',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 9. Massive 3BR APT with 2 Floors
('Massive 3BR APT with 2 Floors',
 'Spacious 3-bedroom apartment spread across 2 floors.',
 'Riyadh, Saudi Arabia',
 3, 3, 6, 1800,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1726711164398391865/original/f4164dea-a321-421c-81b9-4faf76719e33.jpeg?im_w=720',
 'active',
 '1726711164398391865',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 10. 3BR APT | Outdoor Area
('3BR APT | Outdoor Area',
 '3-bedroom apartment with spacious outdoor area.',
 'Riyadh, Saudi Arabia',
 3, 2, 6, 1600,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1716676018844666450/original/0a6dd805-897e-49f9-8f04-db0e51679850.jpeg?im_w=720',
 'active',
 '1716676018844666450',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 11. Spacious APT With Luxury Banio
('Spacious APT With Luxury Bathroom | 75" TV',
 'Spacious apartment with luxury bathroom and 75 inch TV.',
 'Riyadh, Saudi Arabia',
 2, 2, 4, 1300,
 'https://a0.muscache.com/im/pictures/33d98384-c3b1-49c6-b3fe-409b0e9263b0.jpg?im_w=720',
 'inactive',
 '1352189022189123122',
 '{"airbnb": "inactive", "gathern": "pending"}'),

-- 12. Studio Outdoor Shower & Bathtub
('Studio Outdoor Shower & Bathtub',
 'Cozy studio with outdoor shower and bathtub.',
 'Riyadh, Saudi Arabia',
 1, 1, 2, 700,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1352189022189123122/original/54501509-fc47-44e7-95be-c21e363a4444.jpeg?im_w=720',
 'active',
 '1352189022189123122',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 13. Spacious 2Bd APT | Cinema Room
('Spacious 2Bd APT | Cinema Room',
 'Spacious 2-bedroom apartment with cinema room.',
 'Riyadh, Saudi Arabia',
 2, 2, 4, 1250,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1716647462756805887/original/32eaa8f8-f41c-4d96-8b3a-3fcfdde517b5.jpeg?im_w=720',
 'active',
 '1716647462756805887',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 14. Self Check-in Apt | 75" TV
('Self Check-in Apt | 75" TV | Near Boulevard',
 'Apartment with 75 inch TV and self check-in near Boulevard.',
 'Riyadh, Saudi Arabia',
 1, 1, 2, 850,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1292150845456792743/original/8845b50e-6e85-40d8-a3e9-217eb20bbde9.jpeg?im_w=720',
 'active',
 '1292150845456792743',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 15. Luxury 2BD jacuzzi
('Luxury 2BD jacuzzi | towers view | 3 outdoors | cinema',
 'Luxury 2-bedroom apartment with jacuzzi, tower views, 3 outdoor areas, and cinema.',
 'Riyadh, Saudi Arabia',
 2, 2, 4, 1900,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1568442055483176322/original/b5f23f7f-aac7-4566-85a9-125e82e4f240.jpeg?im_w=720',
 'active',
 '1568442055483176322',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 16. Cozy 1Bd Apartment in the Heart of Riyadh
('Cozy 1Bd Apartment in the Heart of Riyadh',
 'Cozy 1-bedroom apartment in central Riyadh location.',
 'Riyadh, Saudi Arabia',
 1, 1, 2, 750,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1558149105964576357/original/398856d0-5843-4e1b-8833-14c0a9d65ad0.jpeg?im_w=720',
 'active',
 '1558149105964576357',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 17. Tranquil Stay | Luxury Bathtub
('Tranquil Stay | Luxury Bathtub',
 'Peaceful apartment with luxury bathtub for ultimate relaxation.',
 'Riyadh, Saudi Arabia',
 1, 1, 2, 800,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1334586506437048823/original/6edf5dc7-e545-41d0-a92b-bf7dc12952a3.jpeg?im_w=720',
 'active',
 '1334586506437048823',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 18. 1Bd Luxe immense Apt
('1Bd Luxe immense Apt | 75" TV | 10 min KAFD',
 'Luxurious 1-bedroom apartment with 75 inch TV, 10 minutes from KAFD.',
 'Riyadh, Saudi Arabia',
 1, 1, 2, 950,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1213854045018637530/original/47694b48-e7bf-4c43-acd1-948db74dcfd7.jpeg?im_w=720',
 'active',
 '1213854045018637530',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 19. Designer 1BD | Outdoor garden | HotTub
('Designer 1BD | Outdoor garden | HotTub | Private Entrance',
 'Designer apartment with outdoor garden, hot tub, and private entrance.',
 'Riyadh, Saudi Arabia',
 1, 1, 2, 1050,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1450111457637723152/original/74cf2be3-dca5-449e-aed7-98d295e44692.jpeg?im_w=720',
 'active',
 '1450111457637723152',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 20. Unique Roof top studio with HotTub
('Unique Roof top studio with HotTub | 70" SmTv',
 'Unique rooftop studio with hot tub and 70 inch smart TV.',
 'Riyadh, Saudi Arabia',
 1, 1, 2, 1100,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1263758589827457897/original/fc5e25de-13f8-4557-805b-de83ee2d8e13.jpeg?im_w=720',
 'active',
 '1263758589827457897',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 21. 2BR | Outdoor area | Cinema Room | Jacuzzi
('2BR | Outdoor area | Cinema Room | Jacuzzi',
 '2-bedroom apartment with outdoor area, cinema room, and jacuzzi.',
 'Riyadh, Saudi Arabia',
 2, 2, 4, 1650,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1587098921462373694/original/878116fc-f0ba-4a64-90d7-3a19c93828dc.jpeg?im_w=720',
 'active',
 '1587098921462373694',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 22. 60Floor Luxury appt | Hot tub | HockeyTable KAFD view
('60Floor Luxury appt | Hot tub | HockeyTable | KAFD view',
 'Luxury apartment on 60th floor with hot tub, hockey table, and KAFD views.',
 'Riyadh, Saudi Arabia',
 2, 2, 4, 2200,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1573226591653922266/original/85c27b28-f7d9-48a4-b211-f09058c8f4ef.jpeg?im_w=720',
 'active',
 '1573226591653922266',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 23. Al-Yasmeen Apt | Self Check-in | 75" TV | Fiber | Quiet
('Al-Yasmeen Apt | Self Check-in | 75" TV | Fiber | Quiet',
 'Quiet apartment in Al-Yasmeen with 75 inch TV, fiber internet, and self check-in.',
 'Riyadh, Saudi Arabia',
 1, 1, 2, 900,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1461765704296968606/original/d264e78f-eb9a-4eac-9452-d2ff01ef3e78.jpeg?im_w=720',
 'active',
 '1461765704296968606',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 24. 3BR | 3 outdoor areas | Jacuzzi
('3BR | 3 outdoor areas | Jacuzzi',
 '3-bedroom apartment with 3 outdoor areas and jacuzzi.',
 'Riyadh, Saudi Arabia',
 3, 2, 6, 1750,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1567848055296679030/original/cb701300-d961-439f-b0e9-eb75590f06c7.jpeg?im_w=720',
 'inactive',
 '1567848055296679030',
 '{"airbnb": "inactive", "gathern": "pending"}'),

-- 25. Luxurious 1Bd Apartment | 70"SmTv | Self Check In
('Luxurious 1Bd Apartment | 70"SmTv | Self Check In',
 'Luxurious 1-bedroom apartment with 70 inch smart TV and self check-in.',
 'Riyadh, Saudi Arabia',
 1, 1, 2, 1000,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1449040616328256936/original/efe13e6c-9ca8-49b7-a010-5c85a890a4bc.jpeg?im_w=720',
 'active',
 '1449040616328256936',
 '{"airbnb": "active", "gathern": "pending"}'),

-- 26. Luxurious Studio with Bathtub & Private Outdoor
('Luxurious Studio with Bathtub & Private Outdoor',
 'Luxurious studio apartment with bathtub and private outdoor space.',
 'Riyadh, Saudi Arabia',
 1, 1, 2, 850,
 'https://a0.muscache.com/im/pictures/hosting/Hosting-1359243274058494868/original/c1f50bb0-86ed-4b3a-a2a1-d985d8e6859c.jpeg?im_w=720',
 'active',
 '1359243274058494868',
 '{"airbnb": "active", "gathern": "pending"}')
ON CONFLICT (airbnb_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  location = EXCLUDED.location,
  bedrooms = EXCLUDED.bedrooms,
  bathrooms = EXCLUDED.bathrooms,
  guests = EXCLUDED.guests,
  price_per_night = EXCLUDED.price_per_night,
  image_url = EXCLUDED.image_url,
  status = EXCLUDED.status,
  platform_sync_status = EXCLUDED.platform_sync_status,
  updated_at = NOW();

-- Create integration_logs table for tracking syncs
CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  platform TEXT NOT NULL, -- 'airbnb', 'gathern', 'odoo'
  action TEXT NOT NULL, -- 'sync', 'create', 'update', 'delete'
  status TEXT NOT NULL, -- 'success', 'pending', 'failed'
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_integration_logs_property_id ON integration_logs(property_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_platform ON integration_logs(platform);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs(created_at DESC);

-- Log the migration completion
INSERT INTO integration_logs (platform, action, status, details) VALUES
('system', 'migration', 'success', '{"message": "Migrated 26 properties from Airbnb", "count": 26, "timestamp": "' || NOW() || '"}');
