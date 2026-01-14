-- Add description column to news table if it doesn't exist
ALTER TABLE public.news
ADD COLUMN IF NOT EXISTS description text;
-- Force schema cache reload just in case
NOTIFY pgrst,
'reload config';