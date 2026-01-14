-- Enable RLS
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;
-- Create mission_content entry in site_settings if it doesn't exist
INSERT INTO public.site_settings (key, value)
VALUES (
        'mission_content',
        '{"title": "Our Mission", "description": "We are dedicated to...", "imageUrl": "", "stats": [{"label": "Students", "value": "1000+"}]}'::jsonb
    ) ON CONFLICT (key) DO NOTHING;
-- Grant permissions if needed
GRANT ALL ON public.site_settings TO authenticated;
GRANT SELECT ON public.site_settings TO anon;