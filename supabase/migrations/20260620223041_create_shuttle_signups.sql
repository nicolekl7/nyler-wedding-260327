CREATE TABLE public.shuttle_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  email text NOT NULL,
  party_size int NOT NULL CHECK (party_size >= 1),
  arrival_wave text NOT NULL CHECK (arrival_wave IN ('wave_1','wave_2','none')),
  departure_wave text NOT NULL CHECK (departure_wave IN ('wave_1','wave_2','none')),
  whatsapp_optin boolean NOT NULL DEFAULT false,
  travel_details text
);

GRANT SELECT, INSERT ON public.shuttle_signups TO anon, authenticated;
GRANT ALL ON public.shuttle_signups TO service_role;

ALTER TABLE public.shuttle_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert shuttle signups"
  ON public.shuttle_signups FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view shuttle signups"
  ON public.shuttle_signups FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.book_shuttle(
  _full_name text, _party_size int, _arrival_wave text,
  _departure_wave text, _whatsapp_optin boolean, _travel_details text,
  _email text
)
RETURNS public.shuttle_signups
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  cap constant int := 28;
  arr_used int; dep_used int;
  new_row public.shuttle_signups;
BEGIN
  IF _party_size < 1 THEN RAISE EXCEPTION 'Party size must be at least 1'; END IF;
  IF _arrival_wave NOT IN ('wave_1','wave_2','none') THEN RAISE EXCEPTION 'Invalid arrival wave'; END IF;
  IF _departure_wave NOT IN ('wave_1','wave_2','none') THEN RAISE EXCEPTION 'Invalid departure wave'; END IF;

  PERFORM pg_advisory_xact_lock(hashtext('shuttle_signups_capacity'));

  IF _arrival_wave <> 'none' THEN
    SELECT COALESCE(SUM(party_size),0) INTO arr_used
    FROM public.shuttle_signups WHERE arrival_wave = _arrival_wave;
    IF arr_used + _party_size > cap THEN RAISE EXCEPTION 'This shuttle is full, please choose another time.'; END IF;
  END IF;

  IF _departure_wave <> 'none' THEN
    SELECT COALESCE(SUM(party_size),0) INTO dep_used
    FROM public.shuttle_signups WHERE departure_wave = _departure_wave;
    IF dep_used + _party_size > cap THEN RAISE EXCEPTION 'This shuttle is full, please choose another time.'; END IF;
  END IF;

  INSERT INTO public.shuttle_signups (full_name, party_size, arrival_wave, departure_wave, whatsapp_optin, travel_details, email)
  VALUES (_full_name, _party_size, _arrival_wave, _departure_wave, _whatsapp_optin, _travel_details, _email)
  RETURNING * INTO new_row;
  RETURN new_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.book_shuttle(text,int,text,text,boolean,text,text) TO anon, authenticated;
