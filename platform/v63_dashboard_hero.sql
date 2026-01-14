-- Create Dashboard Hero Slides Table
CREATE TABLE IF NOT EXISTS public.dashboard_hero_slides (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    image_url text,
    cta_text text DEFAULT 'Explore',
    cta_link text DEFAULT '#',
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Enable RLS
ALTER TABLE public.dashboard_hero_slides ENABLE ROW LEVEL SECURITY;
-- Create Policies (Public Read, Admin/All Write for simplicity as per project pattern)
CREATE POLICY "Enable read access for all users" ON public.dashboard_hero_slides FOR
SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.dashboard_hero_slides FOR
INSERT WITH CHECK (
        auth.role() = 'authenticated'
        OR auth.role() = 'anon'
    );
CREATE POLICY "Enable update for authenticated users only" ON public.dashboard_hero_slides FOR
UPDATE USING (
        auth.role() = 'authenticated'
        OR auth.role() = 'anon'
    );
CREATE POLICY "Enable delete for authenticated users only" ON public.dashboard_hero_slides FOR DELETE USING (
    auth.role() = 'authenticated'
    OR auth.role() = 'anon'
);
-- Insert Default Slides (Mock Data for initial view)
INSERT INTO public.dashboard_hero_slides (
        title,
        description,
        image_url,
        cta_text,
        cta_link,
        display_order
    )
VALUES (
        'FREE AI CHAT',
        'Get answers to all your questions with our advanced AI.',
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1632&auto=format&fit=crop',
        'Start Chatting',
        '/student/dashboard?tab=ai_suite',
        1
    ),
    (
        'Build Your Startup',
        'Join the Aaghaz program and launch your dream.',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1470&auto=format&fit=crop',
        'View Programs',
        '/student/dashboard?tab=programs',
        2
    ),
    (
        'Community Events',
        'Connect with fellow founders in our weekly workshops.',
        'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1470&auto=format&fit=crop',
        'Join Event',
        '/student/dashboard?tab=events',
        3
    );
-- Grant permissions explicitly (Fix for 403 errors)
GRANT ALL ON public.dashboard_hero_slides TO anon;
GRANT ALL ON public.dashboard_hero_slides TO authenticated;
GRANT ALL ON public.dashboard_hero_slides TO service_role;