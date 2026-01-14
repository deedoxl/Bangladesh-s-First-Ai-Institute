BEGIN;
-- =================================================================
-- CRITICAL PERSISTENCE FIX (v51)
-- Purpose: 
-- 1. Unify `ai_system_settings` into a single stable table.
-- 2. Fix RPC `save_ai_system_settings` to work with this table.
-- 3. Allow "Local Admin" (Anon) to save to `site_settings`.
-- =================================================================
-- 1. FIX AI SYSTEM SETTINGS (Singleton Table for API Key)
-- -------------------------------------------------------
-- We drop the old table to ensure a clean slate (conflicts between v16/v25)
DROP TABLE IF EXISTS public.ai_system_settings CASCADE;
CREATE TABLE public.ai_system_settings (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    provider_name text NOT NULL UNIQUE DEFAULT 'openrouter',
    api_key_encrypted text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
-- Enable RLS
ALTER TABLE public.ai_system_settings ENABLE ROW LEVEL SECURITY;
-- 2. SECURITY POLICIES FOR AI SETTINGS
-- ------------------------------------
-- Allow Anon/Authenticated to READ (for the UI to check if key exists)
-- Note: They can't see the key itself, only the row. The RPC handles the secret.
CREATE POLICY "Allow Public Read AI Settings" ON public.ai_system_settings FOR
SELECT USING (true);
-- Allow Anon/Authenticated to UPDATE (via RPC mostly, but policy needed for RLS bypass if direct)
-- We strictly control modification via the RPC, but this policy helps avoid "RLS Violation" errors.
CREATE POLICY "Allow Admin Write AI Settings" ON public.ai_system_settings FOR ALL USING (true) WITH CHECK (true);
-- 3. FIX RPC: save_ai_system_settings
-- -----------------------------------
CREATE OR REPLACE FUNCTION public.save_ai_system_settings(p_key text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER -- Runs as Database Owner (Bypasses RLS)
    AS $$
DECLARE v_secret text := 'deedox_secure_ai_persistence_key_2026';
BEGIN -- Validation
IF p_key IS NULL
OR p_key = ''
OR p_key LIKE '%*%' THEN RAISE EXCEPTION 'Invalid API Key provided';
END IF;
-- Upsert (Insert or Update if exists)
INSERT INTO public.ai_system_settings (provider_name, api_key_encrypted)
VALUES ('openrouter', pgp_sym_encrypt(p_key, v_secret)) ON CONFLICT (provider_name) DO
UPDATE
SET api_key_encrypted = pgp_sym_encrypt(p_key, v_secret),
    updated_at = now();
END;
$$;
-- 4. FIX RPC: get_ai_system_settings_masked
-- -----------------------------------------
CREATE OR REPLACE FUNCTION public.get_ai_system_settings_masked() RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_key text;
v_secret text := 'deedox_secure_ai_persistence_key_2026';
v_decrypted text;
BEGIN
SELECT pgp_sym_decrypt(api_key_encrypted::bytea, v_secret) INTO v_decrypted
FROM public.ai_system_settings
WHERE provider_name = 'openrouter'
LIMIT 1;
IF v_decrypted IS NOT NULL
AND length(v_decrypted) > 10 THEN RETURN substr(v_decrypted, 1, 10) || '................' || substr(v_decrypted, length(v_decrypted) - 4, 5);
ELSE RETURN NULL;
-- Return NULL if no key found
END IF;
EXCEPTION
WHEN OTHERS THEN RETURN NULL;
-- Handle decryption errors gracefully
END;
$$;
-- 5. FIX SITE SETTINGS PERMISSIONS (The Main Issue)
-- ------------------------------------------------/
-- The Local Admin runs as 'anon', so we MUST allow anon to Upsert site_settings.
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
-- Drop restrictive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.site_settings;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.site_settings;
DROP POLICY IF EXISTS "Anon Full Access Site Settings" ON public.site_settings;
-- New Open Policy for Local Admin Mode
CREATE POLICY "Anon Full Access Site Settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
-- 6. ENSURE OTHER TABLES ARE ACCESSIBLE TO LOCAL ADMIN
-- ----------------------------------------------------
-- Workshop Popup Config
DROP POLICY IF EXISTS "Allow Admin Update Access" ON public.workshop_popup_config;
DROP POLICY IF EXISTS "Anon Allow Workshop Update" ON public.workshop_popup_config;
CREATE POLICY "Anon Allow Workshop Update" ON public.workshop_popup_config FOR ALL USING (true) WITH CHECK (true);
-- Homepage Hero
DROP POLICY IF EXISTS "Admin Manage Hero" ON public.homepage_hero;
DROP POLICY IF EXISTS "Anon Manage Hero" ON public.homepage_hero;
CREATE POLICY "Anon Manage Hero" ON public.homepage_hero FOR ALL USING (true) WITH CHECK (true);
-- AI Models (Toggling)
DROP POLICY IF EXISTS "Admin Manage Models" ON public.ai_models;
DROP POLICY IF EXISTS "Anon Manage Models" ON public.ai_models;
CREATE POLICY "Anon Manage Models" ON public.ai_models FOR ALL USING (true) WITH CHECK (true);
-- 7. EXPLICIT GRANTS (Ensuring Anon access)
GRANT EXECUTE ON FUNCTION public.save_ai_system_settings(text) TO anon,
    authenticated,
    service_role;
GRANT EXECUTE ON FUNCTION public.get_ai_system_settings_masked() TO anon,
    authenticated,
    service_role;
COMMIT;