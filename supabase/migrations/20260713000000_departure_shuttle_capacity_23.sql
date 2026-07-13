-- Add one extra seat to both departure shuttle waves (22 -> 23 seats per wave; arrival stays at 24).

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
  IF _departure_wave NOT IN ('wave_1','wave_2','none') THEN RAISE EXCEPTION 'Invalid departure wave'; END IF;

  PERFORM pg_advisory_xact_lock(hashtext('shuttle_signups_capacity'));

  IF _arrival_wave <> 'none' THEN
    cap := 24;
    SELECT COALESCE(SUM(party_size),0) INTO arr_used FROM public.shuttle_signups WHERE arrival_wave = _arrival_wave;
    IF arr_used + _party_size > cap THEN RAISE EXCEPTION 'This shuttle is full, please choose another time.'; END IF;
  END IF;

  IF _departure_wave <> 'none' THEN
    cap := 23;
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
