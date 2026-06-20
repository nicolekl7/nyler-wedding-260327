-- Shuttle RSVP table (purely additive, independent of existing RSVP/booking tables)
CREATE TABLE public.shuttle_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  party_size integer NOT NULL CHECK (party_size > 0),
  arrival_wave text NOT NULL CHECK (arrival_wave IN ('wave_1', 'wave_2', 'none')),
  departure_wave text NOT NULL CHECK (departure_wave IN ('wave_1', 'wave_2', 'none')),
  whatsapp_optin boolean NOT NULL DEFAULT false,
  travel_details text
);

ALTER TABLE public.shuttle_signups ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a shuttle signup
CREATE POLICY "Anyone can insert shuttle signups" ON public.shuttle_signups
  FOR INSERT TO public WITH CHECK (true);

-- SELECT is gated the same way as the existing admin tables in this app:
-- the table itself is publicly readable at the RLS layer, and access is
-- actually restricted client-side by the same password-gated session used
-- on /admin/reservations (see verify-admin-password + localStorage session).
CREATE POLICY "Anyone can view shuttle signups" ON public.shuttle_signups
  FOR SELECT TO public USING (true);

-- Seats used per wave, capped at 28 capacity
CREATE OR REPLACE FUNCTION public.shuttle_wave_seats_used(p_direction text, p_wave text)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(party_size), 0)::integer
  FROM public.shuttle_signups
  WHERE p_wave <> 'none'
    AND (
      (p_direction = 'arrival' AND arrival_wave = p_wave)
      OR (p_direction = 'departure' AND departure_wave = p_wave)
    );
$$;

-- Atomically re-checks remaining capacity and inserts, preventing race conditions
-- between concurrent submissions for the same wave.
CREATE OR REPLACE FUNCTION public.create_shuttle_signup(
  p_full_name text,
  p_party_size integer,
  p_arrival_wave text,
  p_departure_wave text,
  p_whatsapp_optin boolean,
  p_travel_details text
)
RETURNS public.shuttle_signups
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_capacity integer := 28;
  v_used integer;
  v_row public.shuttle_signups;
BEGIN
  -- Lock the table for the duration of the transaction so concurrent
  -- submissions can't both pass the capacity check and overbook a wave.
  LOCK TABLE public.shuttle_signups IN SHARE ROW EXCLUSIVE MODE;

  IF p_arrival_wave <> 'none' THEN
    v_used := public.shuttle_wave_seats_used('arrival', p_arrival_wave);
    IF v_used + p_party_size > v_capacity THEN
      RAISE EXCEPTION 'This shuttle is full, please choose another time.';
    END IF;
  END IF;

  IF p_departure_wave <> 'none' THEN
    v_used := public.shuttle_wave_seats_used('departure', p_departure_wave);
    IF v_used + p_party_size > v_capacity THEN
      RAISE EXCEPTION 'This shuttle is full, please choose another time.';
    END IF;
  END IF;

  INSERT INTO public.shuttle_signups (
    full_name, party_size, arrival_wave, departure_wave, whatsapp_optin, travel_details
  ) VALUES (
    p_full_name, p_party_size, p_arrival_wave, p_departure_wave, p_whatsapp_optin, p_travel_details
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_shuttle_signup(text, integer, text, text, boolean, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.shuttle_wave_seats_used(text, text) TO anon, authenticated;
