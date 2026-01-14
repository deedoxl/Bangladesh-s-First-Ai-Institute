-- 1. Remove duplicate entries using PostgreSQL internal row ID (ctid)
-- We keep the row with the largest ctid (usually the most recently inserted one)
DELETE FROM public.site_settings a USING public.site_settings b
WHERE a.ctid < b.ctid
    AND a.key = b.key;
-- 2. Enforce Uniqueness so duplicates never happen again
ALTER TABLE public.site_settings
ADD CONSTRAINT site_settings_key_key UNIQUE (key);