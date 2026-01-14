BEGIN;

-- V23: FIX PGCRYPTO EXECUTION (Schema & Type Mismatch)
-- The error "public.pgp_sym_encrypt does not exist" means the extension is NOT in public.
-- We must remove the "public." prefix and rely on search_path.
-- We also implicitly cast the key to TEXT to avoid 'unknown' type errors.

-- 1. Ensure Extension exists (we don't care where, just that it exists)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Fix SAVE RPC (Remove schema prefix, fix casting)
CREATE OR REPLACE FUNCTION public.save_ai_system_settings(p_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
-- BROADEN SEARCH PATH to include common extension schemas
SET search_path = public, extensions, vault
AS $$
BEGIN
    INSERT INTO public.ai_system_settings (id, encrypted_key, updated_at)
    VALUES (
        1,
        -- REMOVED 'public.' prefix to find function anywhere
        -- Added ::text cast to fix 'unknown' type error
        pgp_sym_encrypt(p_key, 'DEEDOX_MASTER_KEY_2026'::text), 
        now()
    )
    ON CONFLICT (id) 
    DO UPDATE SET 
        encrypted_key = EXCLUDED.encrypted_key,
        updated_at = now();
END;
$$;

-- 3. Fix FRONTEND GETTER RPC
CREATE OR REPLACE FUNCTION public.get_ai_system_settings_masked()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault
AS $$
DECLARE
    decrypted_key text;
BEGIN
    -- REMOVED 'public.' prefix
    SELECT pgp_sym_decrypt(encrypted_key, 'DEEDOX_MASTER_KEY_2026'::text)
    INTO decrypted_key
    FROM public.ai_system_settings
    WHERE id = 1;

    IF decrypted_key IS NOT NULL AND length(decrypted_key) > 5 THEN
        RETURN 'sk-or-' || substring(decrypted_key from 7 for 4) || '...' || substring(decrypted_key from length(decrypted_key)-3 for 4);
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

-- 4. Fix BACKEND GETTER RPC
CREATE OR REPLACE FUNCTION public.get_decrypted_system_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault
AS $$
DECLARE
    decrypted_key text;
BEGIN
    -- REMOVED 'public.' prefix
    SELECT pgp_sym_decrypt(encrypted_key, 'DEEDOX_MASTER_KEY_2026'::text)
    INTO decrypted_key
    FROM public.ai_system_settings
    WHERE id = 1;

    RETURN decrypted_key;
END;
$$;

-- 5. Permissions
GRANT EXECUTE ON FUNCTION public.save_ai_system_settings(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_ai_system_settings_masked() TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.get_decrypted_system_key() TO service_role;

COMMIT;
