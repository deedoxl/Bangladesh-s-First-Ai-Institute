BEGIN;

-- V21: FIX BACKEND RPC (Bytea Compatibility)
-- The backend Chat Proxy uses 'get_decrypted_system_key'. 
-- We must update it to handle the new BYTEA column type.

CREATE OR REPLACE FUNCTION public.get_decrypted_system_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    decrypted_key text;
BEGIN
    -- Decrypt BYTEA -> TEXT
    SELECT pgp_sym_decrypt(encrypted_key, 'DEEDOX_MASTER_KEY_2026')
    INTO decrypted_key
    FROM public.ai_system_settings
    WHERE id = 1;

    RETURN decrypted_key;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_decrypted_system_key() TO service_role;

COMMIT;
