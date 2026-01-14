-- Secure Admin Authentication System
-- Creates a dedicated table for admin credentials and RPCs for secure login/update.
-- 1. Create Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    -- We will store SHA-256 hash here
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Enable RLS (Security)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
-- Policy: Only allow access via RPCs (No direct SELECT/INSERT for anon/authenticated)
-- We will NOT add any permissive policies. The RPCs will use SECURITY DEFINER.
-- 2. Seed Initial Admin User (if not exists)
-- Default: admin / admin (Hashed: 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918)
INSERT INTO public.admin_users (username, password_hash)
VALUES (
        'admin',
        '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'
    ) ON CONFLICT (username) DO NOTHING;
-- 3. RPC to Verify Credentials
CREATE OR REPLACE FUNCTION verify_admin_credentials(p_username TEXT, p_hash TEXT) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER -- Runs with privileges of the creator (postgres)
SET search_path = public -- Secure search path
    AS $$
DECLARE v_exists BOOLEAN;
BEGIN
SELECT EXISTS (
        SELECT 1
        FROM admin_users
        WHERE username = p_username
            AND password_hash = p_hash
    ) INTO v_exists;
RETURN v_exists;
END;
$$;
-- 4. RPC to Update Credentials
CREATE OR REPLACE FUNCTION update_admin_credentials(
        p_old_username TEXT,
        p_old_hash TEXT,
        p_new_username TEXT,
        p_new_hash TEXT
    ) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_updated BOOLEAN;
BEGIN -- Verify old credentials first
IF NOT EXISTS (
    SELECT 1
    FROM admin_users
    WHERE username = p_old_username
        AND password_hash = p_old_hash
) THEN RETURN FALSE;
END IF;
-- Update to new credentials
UPDATE admin_users
SET username = p_new_username,
    password_hash = p_new_hash
WHERE username = p_old_username;
RETURN TRUE;
END;
$$;
-- Grant Access to RPCs
GRANT EXECUTE ON FUNCTION verify_admin_credentials(TEXT, TEXT) TO anon,
    authenticated,
    service_role;
GRANT EXECUTE ON FUNCTION update_admin_credentials(TEXT, TEXT, TEXT, TEXT) TO anon,
    authenticated,
    service_role;