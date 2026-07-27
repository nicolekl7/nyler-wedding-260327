ALTER TABLE public.invited_guests
  ADD COLUMN friday_activity text CHECK (friday_activity IN ('pool_party', 'wine_tour'));
