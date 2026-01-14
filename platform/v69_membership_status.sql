-- Add membership_type to public.users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS membership_type text DEFAULT 'free' CHECK (membership_type IN ('free', 'pro'));
-- Update RLS policies to ensure admins can update this field
-- Note: Existing policies might already cover "update own profile", but "admin updating others" usually requires a specific policy or service_role access.
-- We will assume the Admin Panel uses the authenticated user who is an Admin.
-- If the current policy is "Users can update own profile", we might need to add "Admins can update everyone".
-- Policy for Admins to update any profile (if not exists)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'users'
        AND policyname = 'Admins can update all profiles'
) THEN CREATE POLICY "Admins can update all profiles" ON public.users FOR
UPDATE USING (
        (
            SELECT role
            FROM public.users
            WHERE id = auth.uid()
        ) = 'Admin'
        OR (
            SELECT role
            FROM public.users
            WHERE id = auth.uid()
        ) = 'Founder'
    );
END IF;
END $$;