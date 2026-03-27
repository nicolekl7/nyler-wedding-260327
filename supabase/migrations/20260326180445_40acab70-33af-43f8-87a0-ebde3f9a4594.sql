ALTER TABLE public.invited_guests
ADD COLUMN IF NOT EXISTS room_preference text,
ADD COLUMN IF NOT EXISTS notes text;