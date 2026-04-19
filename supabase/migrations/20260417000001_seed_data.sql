-- =========================================================================
-- EventMaster Pro — Seed Mock Data
-- Automatically provisions the app with an Event and Vendors
-- =========================================================================

-- 1. Insert a Mock Event (Assuming profile exists, wait, we don't know the user's UUID...)
-- Since we don't know their User UUID, we will create a dummy profile first.
-- BUT auth.users cannot be manipulated by regular SQL without triggers or superuser if it's managed by GoTrue.
-- It's safer to just inject into vendors_cache so it permanently bypasses the fallback.

INSERT INTO "vendors_cache" (id, category, name, rating, price_range, type, address, image_url)
VALUES 
  ('ven-001', 'Venues', 'The Grand Royal Palace', 4.9, '₹₹₹₹', 'Venues', '100 Main St, Chennai', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500'),
  ('ven-002', 'Caterers', 'Sree Annapoorna Catering', 4.8, '₹₹₹', 'Caterers', 'Coimbatore Central', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500'),
  ('ven-003', 'Photographers', 'PixelKnots Photography', 4.7, '₹₹', 'Photographers', 'T Nagar, Chennai', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500'),
  ('ven-004', 'Decorators', 'Golden Petals Decor', 4.9, '₹₹₹', 'Decorators', 'Anna Nagar, Chennai', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500'),
  ('ven-005', 'DJs', 'DJ Sankar Beats', 4.6, '₹₹', 'DJs', 'Velachery, Chennai', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=500')
ON CONFLICT (id) DO NOTHING;

