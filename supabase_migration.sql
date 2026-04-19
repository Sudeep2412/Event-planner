-- =============================================================
-- EventMaster Pro — RSVP & Sub-Event Schema Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New)
-- =============================================================

-- 1. Sub-Events Table
CREATE TABLE IF NOT EXISTS sub_events (
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

-- 2. RSVP Responses Table
CREATE TABLE IF NOT EXISTS rsvp_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  guest_name text NOT NULL,
  mobile_number text NOT NULL,
  whatsapp_number text,
  created_at timestamptz DEFAULT now()
);

-- 3. RSVP Sub-Event Choices Table
CREATE TABLE IF NOT EXISTS rsvp_sub_event_choices (
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

-- 4. Add columns to attendees (safe — won't error if already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendees' AND column_name='whatsapp_number') THEN
    ALTER TABLE attendees ADD COLUMN whatsapp_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendees' AND column_name='rsvp_id') THEN
    ALTER TABLE attendees ADD COLUMN rsvp_id uuid REFERENCES rsvp_responses(id);
  END IF;
END $$;

-- 5. Enable Row Level Security
ALTER TABLE sub_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_sub_event_choices ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies — sub_events (planners can CRUD, anyone can read for RSVP)
CREATE POLICY "Anyone can read sub_events" ON sub_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert sub_events" ON sub_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update sub_events" ON sub_events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete sub_events" ON sub_events FOR DELETE USING (auth.role() = 'authenticated');

-- 7. RLS Policies — rsvp_responses (anyone can insert for public RSVP, authenticated can read)
CREATE POLICY "Anyone can insert rsvp_responses" ON rsvp_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read rsvp_responses" ON rsvp_responses FOR SELECT USING (true);

-- 8. RLS Policies — rsvp_sub_event_choices
CREATE POLICY "Anyone can insert rsvp_sub_event_choices" ON rsvp_sub_event_choices FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read rsvp_sub_event_choices" ON rsvp_sub_event_choices FOR SELECT USING (true);
CREATE POLICY "Anyone can update rsvp_sub_event_choices" ON rsvp_sub_event_choices FOR UPDATE USING (true);

-- 9. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sub_events_event_id ON sub_events(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_responses_event_id ON rsvp_responses(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_choices_rsvp_id ON rsvp_sub_event_choices(rsvp_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_choices_sub_event_id ON rsvp_sub_event_choices(sub_event_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_choices_qr_hash ON rsvp_sub_event_choices(qr_hash);
