-- =========================================================================
-- EventMaster Pro — Complete Master Schema Initialization
-- Run this entire script in Supabase SQL Editor (Dashboard → SQL Editor)
-- WARNING: This will drop existing tables if they exist to provide a fresh start
-- =========================================================================

-- Clean up existing tables (execute in reverse order of dependencies)
DROP TABLE IF EXISTS rsvp_sub_event_choices CASCADE;
DROP TABLE IF EXISTS rsvp_responses CASCADE;
DROP TABLE IF EXISTS sub_events CASCADE;
DROP TABLE IF EXISTS attendees CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS vendors_cache CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ==========================================
-- 1. PROFILES
-- ==========================================
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role text DEFAULT 'planner' CHECK (role IN ('planner', 'vendor', 'admin')),
  full_name text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- 2. EVENTS
-- ==========================================
CREATE TABLE events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text DEFAULT 'Wedding',
  date date NOT NULL,
  location text NOT NULL,
  total_budget numeric DEFAULT 0,
  guest_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read events." ON events FOR SELECT USING (true);
CREATE POLICY "Organizers can insert events." ON events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update events." ON events FOR UPDATE USING (auth.uid() = organizer_id);

-- ==========================================
-- 3. VENDORS CACHE
-- ==========================================
CREATE TABLE vendors_cache (
  id text PRIMARY KEY,
  category text NOT NULL,
  name text NOT NULL,
  rating numeric DEFAULT 5.0,
  price numeric DEFAULT 0,
  type text,
  address text,
  price_range text,
  image_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE vendors_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read vendors." ON vendors_cache FOR SELECT USING (true);
CREATE POLICY "Authenticated users can cache vendors." ON vendors_cache FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- 4. RESERVATIONS (Vendor Bookings)
-- ==========================================
CREATE TABLE reservations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  vendor_id text REFERENCES vendors_cache(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  qr_hash text UNIQUE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, vendor_id)
);
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organizers can read reservations." ON reservations FOR SELECT USING (true);
CREATE POLICY "Organizers can insert reservations." ON reservations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Organizers can update reservations." ON reservations FOR UPDATE USING (auth.role() = 'authenticated');

-- ==========================================
-- 5. RSVP RESPONSES & ATTENDEES (Guests)
-- ==========================================
CREATE TABLE rsvp_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  guest_name text NOT NULL,
  mobile_number text NOT NULL,
  whatsapp_number text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert rsvp_responses" ON rsvp_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read rsvp_responses" ON rsvp_responses FOR SELECT USING (true);

CREATE TABLE attendees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  qr_hash text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'checked_in', 'declined')),
  whatsapp_number text,
  rsvp_id uuid REFERENCES rsvp_responses(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read attendees." ON attendees FOR SELECT USING (true);
CREATE POLICY "Anyone can insert attendees." ON attendees FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update attendees." ON attendees FOR UPDATE USING (true);

-- ==========================================
-- 6. SUB-EVENTS (Functions)
-- ==========================================
CREATE TABLE sub_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE sub_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read sub_events" ON sub_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert sub_events" ON sub_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can replace sub_events" ON sub_events FOR DELETE USING (auth.role() = 'authenticated');

-- ==========================================
-- 7. RSVP SUB-EVENT CHOICES (Per-Function Gate Passes)
-- ==========================================
CREATE TABLE rsvp_sub_event_choices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rsvp_id uuid REFERENCES rsvp_responses(id) ON DELETE CASCADE NOT NULL,
  sub_event_id uuid REFERENCES sub_events(id) ON DELETE CASCADE NOT NULL,
  person_count int DEFAULT 1,
  veg_count int DEFAULT 0,
  nonveg_count int DEFAULT 0,
  driver_count int DEFAULT 0,
  driver_meal_pref text DEFAULT 'veg' CHECK (driver_meal_pref IN ('veg', 'nonveg')),
  qr_hash text UNIQUE NOT NULL,
  scanned_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE rsvp_sub_event_choices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert rsvp_sub_event_choices" ON rsvp_sub_event_choices FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read rsvp_sub_event_choices" ON rsvp_sub_event_choices FOR SELECT USING (true);
CREATE POLICY "Anyone can update rsvp_sub_event_choices" ON rsvp_sub_event_choices FOR UPDATE USING (true);

-- ==========================================
-- 8. PERFORMANCE INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_events_org ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_event ON reservations(event_id);
CREATE INDEX IF NOT EXISTS idx_attendees_event ON attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_attendees_qr ON attendees(qr_hash);
CREATE INDEX IF NOT EXISTS idx_sub_events_event ON sub_events(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_responses_event ON rsvp_responses(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_choices_sub_event ON rsvp_sub_event_choices(sub_event_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_choices_qr ON rsvp_sub_event_choices(qr_hash);

-- Mock Data Creation Complete!
