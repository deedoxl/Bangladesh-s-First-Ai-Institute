-- FIX MISSING PROFILES
-- Run this if you have existing users who cannot see the Student Dashboard.

INSERT INTO public.users (id, email, name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', email),
    'Student'
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE public.users.id = auth.users.id);
