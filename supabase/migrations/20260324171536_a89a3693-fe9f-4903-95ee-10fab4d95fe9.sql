
-- Create room_categories table for inventory-based booking
CREATE TABLE public.room_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  capacity integer NOT NULL DEFAULT 2,
  price integer NOT NULL,
  inventory_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create room_bookings table to track reservations
CREATE TABLE public.room_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_category_id uuid REFERENCES public.room_categories(id) ON DELETE CASCADE NOT NULL,
  guest_names text NOT NULL,
  email text NOT NULL,
  has_children boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.room_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for room_categories
CREATE POLICY "Anyone can view room categories" ON public.room_categories FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can update room inventory" ON public.room_categories FOR UPDATE TO public USING (true) WITH CHECK (true);

-- RLS policies for room_bookings
CREATE POLICY "Anyone can view bookings" ON public.room_bookings FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert bookings" ON public.room_bookings FOR INSERT TO public WITH CHECK (true);

-- Seed the 8 room categories
INSERT INTO public.room_categories (name, description, capacity, price, inventory_count) VALUES
  ('Classic Estate Room', NULL, 2, 1000, 12),
  ('Superior Room', NULL, 2, 1150, 7),
  ('Superior Triple Room', 'Includes an extra single bed', 3, 1250, 1),
  ('Garden Suite', NULL, 2, 1250, 3),
  ('Garden Triple Suite', 'Includes an extra single bed', 3, 1250, 1),
  ('Luxury Group Suite', 'Includes a sofa bed', 4, 1250, 2),
  ('Junior Suite', NULL, 2, 1500, 1),
  ('Junior Group Suite', 'Includes a sofa bed or extra single beds', 4, 1500, 4);
