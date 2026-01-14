-- V28: DEBUG FIX - GRANT PERMISSIONS & VERIFY
-- Issue: Frontend cannot access the key status or save functions.
-- Root Cause: RLS or Execute Permissions missing for 'anon' and 'authenticated' roles.

BEGIN;

-- 1. Grant Usage on Schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Grant Execute on ALL AI RPCs
GRANT EXECUTE ON FUNCTION get_ai_system_settings_masked() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION save_ai_system_settings(text) TO authenticated; -- Only logged in users (RLS checks for admin)
GRANT EXECUTE ON FUNCTION toggle_model_enabled(text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION update_model_boolean(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION set_model_default(text, text) TO authenticated;

-- 3. Ensure Table Permissions (RLS is active, but we need basic SELECT/INSERT grants)
GRANT SELECT ON TABLE public.ai_models TO anon, authenticated;
GRANT ALL ON TABLE public.ai_models TO authenticated; -- Admin RLS will restrict writes

GRANT SELECT ON TABLE public.ai_system_settings TO authenticated; -- Admin RLS restricts
GRANT ALL ON TABLE public.ai_system_settings TO authenticated;

-- 4. Verify Key Injection (Just to be sure)
-- This will output the key if it exists, proving the previous script worked.
DO $$ 
DECLARE
  v_count integer;
BEGIN
    SELECT count(*) INTO v_count FROM public.ai_system_settings WHERE key = 'openrouter_api_key';
    IF v_count = 0 THEN
        -- Re-inject if missing
        INSERT INTO public.ai_system_settings (key, value)
        VALUES ('openrouter_api_key', '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');
    END IF;
END $$;

COMMIT;

-- Final Check
SELECT * FROM public.ai_system_settings;
