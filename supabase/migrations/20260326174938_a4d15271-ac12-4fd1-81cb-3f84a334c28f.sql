
ALTER TABLE public.invited_guests 
ADD COLUMN submitted_at timestamptz DEFAULT NULL;

CREATE POLICY "Anyone can insert invited guests"
ON public.invited_guests
FOR INSERT
TO public
WITH CHECK (true);
