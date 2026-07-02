CREATE TABLE public.passport_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  received boolean NOT NULL DEFAULT true
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.passport_tracker TO anon, authenticated;
GRANT ALL ON public.passport_tracker TO service_role;

ALTER TABLE public.passport_tracker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view passport tracker entries"
  ON public.passport_tracker FOR SELECT USING (true);
CREATE POLICY "Anyone can insert passport tracker entries"
  ON public.passport_tracker FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update passport tracker entries"
  ON public.passport_tracker FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete passport tracker entries"
  ON public.passport_tracker FOR DELETE USING (true);
