-- Create the dedicated table for Workshop Popup
CREATE TABLE IF NOT EXISTS public.workshop_popup_config (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    is_enabled boolean DEFAULT false,
    title text DEFAULT 'Join Our 2-Hour Live AI Workshop',
    highlight_word text DEFAULT '2-Hour',
    subtitle text DEFAULT 'Master AI Fundamentals, AI Agents, Vibe Coding & Content Creation in just 2 hours!',
    date_text text DEFAULT 'January 15, 2026',
    time_text text DEFAULT '4:00 PM PKT',
    enrolled_count text DEFAULT '1,033+',
    seats_left_text text DEFAULT 'Only 10 seats left!',
    price_text text DEFAULT 'Starting at just PKR 1,999 • Limited Time Offer',
    primary_btn_text text DEFAULT 'Reserve My Seat Now',
    primary_btn_link text DEFAULT '#',
    secondary_btn_text text DEFAULT 'Maybe Later',
    image_url text DEFAULT '',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workshop_popup_config_pkey PRIMARY KEY (id)
);
-- Singleton Check: Ensure only one row can ever exist (optional but good for config tables)
-- For simplicity, we just seed one row and app will always use .limit(1).single()
-- Enable RLS
ALTER TABLE public.workshop_popup_config ENABLE ROW LEVEL SECURITY;
-- Policy: Everyone can read (Public)
DROP POLICY IF EXISTS "Allow Public Read Access" ON public.workshop_popup_config;
CREATE POLICY "Allow Public Read Access" ON public.workshop_popup_config FOR
SELECT USING (true);
-- Policy: Authenticated users (Admins) can update
-- Ideally strict to role='admin' if you have roles, but for now authenticated is standard in this project structure
DROP POLICY IF EXISTS "Allow Admin Update Access" ON public.workshop_popup_config;
CREATE POLICY "Allow Admin Update Access" ON public.workshop_popup_config FOR
UPDATE TO authenticated USING (true) WITH CHECK (true);
-- Policy: Allow Insert (Only needed for initial seed or if row deleted)
DROP POLICY IF EXISTS "Allow Admin Insert Access" ON public.workshop_popup_config;
CREATE POLICY "Allow Admin Insert Access" ON public.workshop_popup_config FOR
INSERT TO authenticated WITH CHECK (true);
-- Seed Initial Row if empty
INSERT INTO public.workshop_popup_config (id, is_enabled)
SELECT '00000000-0000-0000-0000-000000000001',
    false
WHERE NOT EXISTS (
        SELECT 1
        FROM public.workshop_popup_config
    );