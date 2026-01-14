BEGIN;

-- V22: FIX RPC SCOPE & SEARCH PATH
-- Most likely cause of failure: RPC cannot find 'pgp_sym_encrypt' because it's in 'public'
-- and SECURITY DEFINER functions have restricted search_path.

-- 1. Ensure Extension is in PUBLIC
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA public;

-- 2. Redefine SAVE RPC with explicit schema + search_path
CREATE OR REPLACE FUNCTION public.save_ai_system_settings(p_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions -- Force path to include public
AS $$
BEGIN
    INSERT INTO public.ai_system_settings (id, encrypted_key, updated_at)
    VALUES (
        1,
        public.pgp_sym_encrypt(p_key, 'DEEDOX_MASTER_KEY_2026'), -- Explicit public.
        now()
    )
    ON CONFLICT (id) 
    DO UPDATE SET 
        encrypted_key = EXCLUDED.encrypted_key,
        updated_at = now();
END;
$$;

-- 3. Redefine FRONTEND GETTER RPC with explicit schema + search_path
CREATE OR REPLACE FUNCTION public.get_ai_system_settings_masked()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    decrypted_key text;
BEGIN
    -- Decrypt using explicit schema
    SELECT public.pgp_sym_decrypt(encrypted_key, 'DEEDOX_MASTER_KEY_2026')
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

-- 4. Redefine BACKEND GETTER RPC with explicit schema + search_path
CREATE OR REPLACE FUNCTION public.get_decrypted_system_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    decrypted_key text;
BEGIN
    SELECT public.pgp_sym_decrypt(encrypted_key, 'DEEDOX_MASTER_KEY_2026')
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
