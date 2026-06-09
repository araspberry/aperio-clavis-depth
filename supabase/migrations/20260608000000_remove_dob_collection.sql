-- Aperio no longer collects date of birth.
-- Drop the legacy column so new and existing profiles cannot store DOB.
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS dob;
