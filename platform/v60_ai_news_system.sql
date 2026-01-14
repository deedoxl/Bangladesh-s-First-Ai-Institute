-- v60_ai_news_system.sql (Updated)
-- 1. News Table Setup
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 2. Newsletter Table Setup
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 3. Enable Security (RLS)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
-- 4. READ Policy (Everyone can see News)
DROP POLICY IF EXISTS "Public can read published news" ON public.news;
CREATE POLICY "Public can read published news" ON public.news FOR
SELECT USING (true);
-- 5. WRITE Policy (For Admin to Add/Edit/Delete News)
DROP POLICY IF EXISTS "Allow Anon Insert News" ON public.news;
CREATE POLICY "Allow Anon Insert News" ON public.news FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow Anon Update News" ON public.news;
CREATE POLICY "Allow Anon Update News" ON public.news FOR
UPDATE USING (true);
DROP POLICY IF EXISTS "Allow Anon Delete News" ON public.news;
CREATE POLICY "Allow Anon Delete News" ON public.news FOR DELETE USING (true);
-- 6. WRITE Policy (For Newsletter Subscription)
DROP POLICY IF EXISTS "Public can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe" ON public.newsletter_subscribers FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow Anon Read Subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Allow Anon Read Subscribers" ON public.newsletter_subscribers FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Allow Anon Delete Subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Allow Anon Delete Subscribers" ON public.newsletter_subscribers FOR DELETE USING (true);
-- 7. Realtime Enable (Safe Mode)
DO $$ BEGIN -- Safely enable realtime for 'news'
IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
        AND tablename = 'news'
) THEN ALTER PUBLICATION supabase_realtime
ADD TABLE public.news;
END IF;
-- Safely enable realtime for 'newsletter_subscribers'
IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
        AND tablename = 'newsletter_subscribers'
) THEN ALTER PUBLICATION supabase_realtime
ADD TABLE public.newsletter_subscribers;
END IF;
END $$;