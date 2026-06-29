DROP POLICY IF EXISTS "Anyone can read passports" ON storage.objects;
CREATE POLICY "Anyone can read passports"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'passports');
