BEGIN;

-- V20: FIX DATA TYPE INTERACTION (Text vs Bytea)
-- We stored binary encryption data in a text field, which can cause corruption.
-- We will switch to BYTEA for robust binary storage.

-- 1. Correct Table Schema
DROP TABLE IF EXISTS public.ai_system_settings CASCADE;

CREATE TABLE public.ai_system_settings (
    id integer PRIMARY KEY DEFAULT 1,
    encrypted_key bytea, -- CHANGED FROM TEXT TO BYTEA
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- 2. Enable Encryption Extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Default Row
INSERT INTO public.ai_system_settings (id, encrypted_key)
VALUES (1, NULL);

-- 4. Robust Save RPC (Handles Bytea directly)
CREATE OR REPLACE FUNCTION public.save_ai_system_settings(p_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.ai_system_settings (id, encrypted_key, updated_at)
    VALUES (
        1,
        pgp_sym_encrypt(p_key, 'DEEDOX_MASTER_KEY_2026'), -- Returns bytea, stores in bytea. Safe.
        now()
    )
    ON CONFLICT (id) 
    DO UPDATE SET 
        encrypted_key = EXCLUDED.encrypted_key,
        updated_at = now();
END;
$$;

-- 5. Robust Read RPC (Decrypts Bytea directly)
CREATE OR REPLACE FUNCTION public.get_ai_system_settings_masked()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    decrypted_key text;
BEGIN
    -- Decrypt Bytea -> Text
    SELECT pgp_sym_decrypt(encrypted_key, 'DEEDOX_MASTER_KEY_2026')
    INTO decrypted_key
    FROM public.ai_system_settings
    WHERE id = 1;

    -- Return Masked Version
    IF decrypted_key IS NOT NULL AND length(decrypted_key) > 4 THEN
        RETURN 'sk-or-' || substring(decrypted_key from 7 for 4) || '...' || substring(decrypted_key from length(decrypted_key)-3 for 4);
    ELSE
        RETURN NULL; 
    END IF;
    
    -- Removed Exception Swallow to allow debugging if it crashes
END;
$$;

-- 6. Permissions
GRANT EXECUTE ON FUNCTION public.save_ai_system_settings(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_ai_system_settings_masked() TO authenticated, service_role, anon;

COMMIT;
