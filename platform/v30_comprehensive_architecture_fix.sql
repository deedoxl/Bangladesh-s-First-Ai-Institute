BEGIN;
-- =================================================================
-- 1. AI MODELS & SYSTEM SETTINGS HARDENING
-- =================================================================
-- Grant PERMISSION to 'anon' (Local Admin) to UPDATE ai_models
-- REQUIRED because Local Admin needs to Enable/Disable models and change settings.
CREATE POLICY "Anon Manage Models" ON public.ai_models FOR ALL USING (
    (
        SELECT role
        FROM public.users
        WHERE id = auth.uid()
    ) = 'admin'
    OR auth.role() = 'anon'
) WITH CHECK (
    (
        SELECT role
        FROM public.users
        WHERE id = auth.uid()
    ) = 'admin'
    OR auth.role() = 'anon'
);
-- Ensure 'anon' can Execute the Toggle Functions
GRANT EXECUTE ON FUNCTION toggle_model_enabled(text, boolean) TO anon;
GRANT EXECUTE ON FUNCTION update_model_boolean(text, text, boolean) TO anon;
GRANT EXECUTE ON FUNCTION set_model_default(text, text) TO anon;
-- =================================================================
-- 2. STUDENT DASHBOARD & COMMUNITY (POSTS / PROFILES)
-- =================================================================
-- Ensure Tables Exist (Idempotent)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name text,
    avatar_url text,
    role text DEFAULT 'student',
    bio text,
    skills text [],
    social_links jsonb,
    is_public boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- Link to profiles, not auth.users directly to support mock? Actually standard is auth.users.
    content text NOT NULL,
    image_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now() -- NOTE: For Local Admin to post, we might need a dummy profile matching the Mock ID.
);
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);
CREATE TABLE IF NOT EXISTS public.post_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
-- -------------------------------------------------------
-- RLS POLICIES FOR 'ANON' (Local Admin System)
-- -------------------------------------------------------
-- PUBLIC READ for everything (Student Dashboard is public view mostly)
CREATE POLICY "Public Read Profiles" ON public.profiles FOR
SELECT USING (true);
CREATE POLICY "Public Read Posts" ON public.posts FOR
SELECT USING (true);
CREATE POLICY "Public Read Likes" ON public.post_likes FOR
SELECT USING (true);
CREATE POLICY "Public Read Comments" ON public.post_comments FOR
SELECT USING (true);
-- ANON (Local Admin) MANAGE ALL (Delete offensive posts, etc)
CREATE POLICY "Anon Manage Posts" ON public.posts FOR ALL USING (
    auth.role() = 'anon'
    OR auth.uid() IS NOT NULL
) WITH CHECK (
    auth.role() = 'anon'
    OR auth.uid() IS NOT NULL
);
CREATE POLICY "Anon Manage Comments" ON public.post_comments FOR ALL USING (
    auth.role() = 'anon'
    OR auth.uid() IS NOT NULL
) WITH CHECK (
    auth.role() = 'anon'
    OR auth.uid() IS NOT NULL
);
-- Allow Anon to update profiles (e.g. if we build a "Edit Specific Profile" tool later)
CREATE POLICY "Anon Manage Profiles" ON public.profiles FOR ALL USING (
    auth.role() = 'anon'
    OR auth.uid() = id
) WITH CHECK (
    auth.role() = 'anon'
    OR auth.uid() = id
);
COMMIT;