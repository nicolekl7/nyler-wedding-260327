
-- Invited guests table
CREATE TABLE public.invited_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  group_id uuid NOT NULL DEFAULT gen_random_uuid(),
  has_responded boolean NOT NULL DEFAULT false,
  dietary_restrictions text,
  welcome_party_rsvp text CHECK (welcome_party_rsvp IN ('accept', 'decline')),
  wedding_day_rsvp text CHECK (wedding_day_rsvp IN ('accept', 'decline')),
  pool_day_rsvp text CHECK (pool_day_rsvp IN ('accept', 'decline')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invited_guests ENABLE ROW LEVEL SECURITY;

-- Anyone can search guests by name (read)
CREATE POLICY "Anyone can view invited guests" ON public.invited_guests
  FOR SELECT TO public USING (true);

-- Anyone can update their RSVP
CREATE POLICY "Anyone can update guest RSVP" ON public.invited_guests
  FOR UPDATE TO public USING (true) WITH CHECK (true);
