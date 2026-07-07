-- Rename guest Brendon Bengel to Gillian Muñoz.

UPDATE public.guests
SET first_name = 'Gillian', last_name = 'Muñoz'
WHERE first_name = 'Brendon' AND last_name = 'Bengel';

UPDATE public.invited_guests
SET first_name = 'Gillian', last_name = 'Muñoz'
WHERE first_name = 'Brendon' AND last_name = 'Bengel';
