BEGIN;

-- V19 (UPDATED): FORCE FIX API KEY TABLE
-- The table existed but had the wrong columns. We will reset it.

-- 1. Reset Table Structure
DROP TABLE IF EXISTS public.ai_system_settings CASCADE;

CREATE TABLE public.ai_system_settings (
    id integer PRIMARY KEY DEFAULT 1,
    encrypted_key text,
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- 2. Insert Default Row (Empty)
INSERT INTO public.ai_system_settings (id, encrypted_key)
VALUES (1, NULL);

-- 3. Re-Create Functions (To ensure they use the new columns)
CREATE OR REPLACE FUNCTION public.save_ai_system_settings(p_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.ai_system_settings (id, encrypted_key, updated_at)
    VALUES (
        1,
        pgp_sym_encrypt(p_key, 'DEEDOX_MASTER_KEY_2026'),
        now()
    )
    ON CONFLICT (id) 
    DO UPDATE SET 
        encrypted_key = EXCLUDED.encrypted_key,
        updated_at = now();
END;
$$;

-- 4. Re-Create Getter (Ensure it reads the correct column 'encrypted_key' not 'system_key')
CREATE OR REPLACE FUNCTION public.get_ai_system_settings_masked()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    decrypted_key text;
BEGIN
    -- Attempt to decrypt
    SELECT pgp_sym_decrypt(encrypted_key::bytea, 'DEEDOX_MASTER_KEY_2026')
    INTO decrypted_key
    FROM public.ai_system_settings
    WHERE id = 1;

    IF decrypted_key IS NOT NULL AND length(decrypted_key) > 5 THEN
        RETURN 'sk-or-' || substring(decrypted_key from 7 for 4) || '...' || substring(decrypted_key from length(decrypted_key)-3 for 4);
    ELSE
        RETURN NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- 5. Permissions
GRANT EXECUTE ON FUNCTION public.save_ai_system_settings(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_ai_system_settings_masked() TO authenticated, service_role, anon;

COMMIT;
      