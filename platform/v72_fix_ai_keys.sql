-- =================================================================
-- AI SYSTEM FIX (v72 - PLAIN TEXT DEBUG MODE)
-- Purpose: Temporarily store API Key in PLAIN TEXT to rule out
--          encryption/decryption errors causing "Unauthorized".
-- =================================================================
-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS public.ai_system_settings (
    provider_name text PRIMARY KEY,
    api_key_encrypted text NOT NULL,
    -- Storing plain text here for now
    updated_at timestamptz DEFAULT now()
);
-- 2. Secure Key Getter (Simple Pass-through)
CREATE OR REPLACE FUNCTION public.get_decrypted_system_key() RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_decrypted text;
BEGIN -- DIRECTLY RETURN THE KEY (No Decryption)
SELECT api_key_encrypted INTO v_decrypted
FROM public.ai_system_settings
WHERE provider_name = 'openrouter'
LIMIT 1;
RETURN v_decrypted;
END;
$$;
-- 3. Secure Key Saver (Simple Pass-through)
CREATE OR REPLACE FUNCTION public.save_ai_system_settings(p_key text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN -- DIRECTLY SAVE THE KEY (No Encryption) - TRIMMED
INSERT INTO public.ai_system_settings (provider_name, api_key_encrypted, updated_at)
VALUES ('openrouter', TRIM(p_key), now()) ON CONFLICT (provider_name) DO
UPDATE
SET api_key_encrypted = TRIM(p_key),
    updated_at = now();
END;
$$;
-- 4. Masked Key Getter (Used by Admin UI)
CREATE OR REPLACE FUNCTION public.get_ai_system_settings_masked() RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_has_key boolean;
BEGIN
SELECT EXISTS(
        SELECT 1
        FROM public.ai_system_settings
        WHERE provider_name = 'openrouter'
    ) INTO v_has_key;
IF v_has_key THEN RETURN 'sk-or-v1-xxxxxxxx-masked-xxxxxxxx';
ELSE RETURN NULL;
END IF;
END;
$$;
-- 5. Permissions
GRANT SELECT,
    INSERT,
    UPDATE ON public.ai_system_settings TO service_role;
GRANT EXECUTE ON FUNCTION public.get_decrypted_system_key() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_decrypted_system_key() TO anon;
GRANT EXECUTE ON FUNCTION public.get_decrypted_system_key() TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_ai_system_settings(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.save_ai_system_settings(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_system_settings_masked() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_ai_system_settings_masked() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_system_settings_masked() TO anon;
COMMIT;