-- Split the departure shuttle from 2 waves (11:00 AM / 12:00 PM) into 3 waves
-- at 10:00 AM / 11:15 AM / 12:30 PM, with 15/15/16 seats respectively (46 total,
-- unchanged from the prior 23+23). Arrival stays 2 waves.

ALTER TABLE public.shuttle_signups
  DROP CONSTRAINT IF EXISTS shuttle_signups_departure_wave_check;

ALTER TABLE public.shuttle_signups
  ADD CONSTRAINT shuttle_signups_departure_wave_check
  CHECK (departure_wave IN ('wave_1','wave_2','wave_3','none'));

DROP FUNCTION IF EXISTS public.book_shuttle(text,integer,text,text,boolean,text,text,text[],text,text,text,text[]);

CREATE OR REPLACE FUNCTION public.book_shuttle(
  _full_name text,
  _party_size integer,
  _arrival_wave text,
  _departure_wave text,
  _whatsapp_optin boolean,
  _travel_details text,
  _email text DEFAULT NULL,
  _passport_paths text[] DEFAULT '{}'::text[],
  _departure_plan text DEFAULT NULL,
  _florence_rsvp text DEFAULT NULL,
  _arrival_plan text DEFAULT NULL,
  _guest_names text[] DEFAULT '{}'::text[]
)
RETURNS public.shuttle_signups
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cap int;
  arr_used int;
  dep_used int;
  new_row public.shuttle_signups;
BEGIN
  IF _party_size < 1 THEN RAISE EXCEPTION 'Party size must be at least 1'; END IF;
  IF _arrival_wave NOT IN ('wave_1','wave_2','none') THEN RAISE EXCEPTION 'Invalid arrival wave'; END IF;
  IF _departure_wave NOT IN ('wave_1','wave_2','wave_3','none') THEN RAISE EXCEPTION 'Invalid departure wave'; END IF;

  PERFORM pg_advisory_xact_lock(hashtext('shuttle_signups_capacity'));

  IF _arrival_wave <> 'none' THEN
    cap := 24;
    SELECT COALESCE(SUM(party_size),0) INTO arr_used FROM public.shuttle_signups WHERE arrival_wave = _arrival_wave;
    IF arr_used + _party_size > cap THEN RAISE EXCEPTION 'This shuttle is full, please choose another time.'; END IF;
  END IF;

  IF _departure_wave <> 'none' THEN
    cap := CASE _departure_wave WHEN 'wave_1' THEN 15 WHEN 'wave_2' THEN 15 ELSE 16 END;
    SELECT COALESCE(SUM(party_size),0) INTO dep_used FROM public.shuttle_signups WHERE departure_wave = _departure_wave;
    IF dep_used + _party_size > cap THEN RAISE EXCEPTION 'This shuttle is full, please choose another time.'; END IF;
  END IF;

  INSERT INTO public.shuttle_signups (
    full_name, party_size, arrival_wave, departure_wave,
    whatsapp_optin, travel_details, email, passport_paths,
    departure_plan, florence_rsvp, arrival_plan, guest_names
  ) VALUES (
    _full_name, _party_size, _arrival_wave, _departure_wave,
    _whatsapp_optin, _travel_details, _email, COALESCE(_passport_paths, '{}'::text[]),
    _departure_plan, _florence_rsvp, _arrival_plan, COALESCE(_guest_names, '{}'::text[])
  ) RETURNING * INTO new_row;

  RETURN new_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.book_shuttle(text,integer,text,text,boolean,text,text,text[],text,text,text,text[]) TO anon, authenticated;

-- Reassign existing departure signups to their new wave, per the manual
-- 3-wave split (matched by full_name, case-insensitive).
UPDATE public.shuttle_signups SET departure_wave = 'wave_2' WHERE lower(full_name) = lower('Valerie Stahli');
UPDATE public.shuttle_signups SET departure_wave = 'wave_1' WHERE lower(full_name) = lower('Naima & Phoebe');
UPDATE public.shuttle_signups SET departure_wave = 'wave_1' WHERE lower(full_name) = lower('Charlene Atkinson');
UPDATE public.shuttle_signups SET departure_wave = 'wave_1' WHERE lower(full_name) = lower('Erika Rosendahl');
UPDATE public.shuttle_signups SET departure_wave = 'wave_1' WHERE lower(full_name) = lower('Kevin Joslyn');
UPDATE public.shuttle_signups SET departure_wave = 'wave_3' WHERE lower(full_name) = lower('Arthur Landmesser');
UPDATE public.shuttle_signups SET departure_wave = 'wave_3' WHERE lower(full_name) = lower('Pat landmesser');
UPDATE public.shuttle_signups SET departure_wave = 'wave_2' WHERE lower(full_name) = lower('Michał Kuczma');
UPDATE public.shuttle_signups SET departure_wave = 'wave_2' WHERE lower(full_name) = lower('Kaitlyn Istona');
UPDATE public.shuttle_signups SET departure_wave = 'wave_3' WHERE lower(full_name) = lower('Wesley Baranowski');
UPDATE public.shuttle_signups SET departure_wave = 'wave_2' WHERE lower(full_name) = lower('Alex & Ray');
UPDATE public.shuttle_signups SET departure_wave = 'wave_2' WHERE lower(full_name) = lower('Brendon Bengel');
UPDATE public.shuttle_signups SET departure_wave = 'wave_1' WHERE lower(full_name) = lower('Jane Percival');
UPDATE public.shuttle_signups SET departure_wave = 'wave_1' WHERE lower(full_name) = lower('Ben Kroll');
UPDATE public.shuttle_signups SET departure_wave = 'wave_2' WHERE lower(full_name) = lower('Raymond Neenan');
UPDATE public.shuttle_signups SET departure_wave = 'wave_1' WHERE lower(full_name) = lower('Mark Harris');

-- Keishara and Tate are no longer taking either shuttle. Matched by first-name
-- token against full_name since only first names were given; verify the
-- affected row count matches expectations (should be 1-2 rows) before relying
-- on this in production.
UPDATE public.shuttle_signups
SET arrival_wave = 'none', departure_wave = 'none'
WHERE EXISTS (
  SELECT 1 FROM unnest(string_to_array(full_name, ' ')) AS tok
  WHERE lower(tok) IN ('keishara', 'tate')
);
