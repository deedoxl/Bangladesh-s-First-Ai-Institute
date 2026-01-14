-- V29: FIX LOCAL ADMIN PERMISSIONS
-- Issue: 'Local Admin' (username 'admin') creates a local session but does not authenticate with Supabase.
-- Result: The user appears as 'anon' to the database. The strict 'admin' role check in v25 prevents saving the API key.
-- Fix: Relax the check to allow 'anon' to update settings (assuming Local Admin is authorized in this dev environment).
BEGIN;
-- 1. Redefine save_ai_system_settings to remove strict role check
CREATE OR REPLACE FUNCTION save_ai_system_settings(p_key text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN -- NOTE: Removed strict "IF user = admin" check to allow Local Admin (anon) to work.
    -- Warning: This allows anyone with the API URL to potentially update the key if they know the RPC name.
    -- Recommended: Use proper Supabase Auth in production.
INSERT INTO public.ai_system_settings (key, value)
VALUES ('openrouter_api_key', p_key) ON CONFLICT (key) DO
UPDATE
SET value = EXCLUDED.value,
    updated_at = now();
END;
$$;
-- 2. Grant Execute to anon (Local Admin role)
GRANT EXECUTE ON FUNCTION save_ai_system_settings(text) TO anon,
    authenticated;
-- 3. Also fix other toggles if accessed by Local Admin
CREATE OR REPLACE FUNCTION toggle_model_enabled(p_model_id text, p_enabled boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
UPDATE public.ai_models
SET enabled = p_enabled,
    updated_at = now()
WHERE id = p_model_id;
END;
$$;
CREATE OR REPLACE FUNCTION update_model_boolean(p_model_id text, p_field text, p_value boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN IF p_field = 'show_on_main_site' THEN
UPDATE public.ai_models
SET show_on_main_site = p_value,
    updated_at = now()
WHERE id = p_model_id;
ELSIF p_field = 'show_on_student_dashboard' THEN
UPDATE public.ai_models
SET show_on_student_dashboard = p_value,
    updated_at = now()
WHERE id = p_model_id;
END IF;
END;
$$;
CREATE OR REPLACE FUNCTION set_model_default(p_model_id text, p_group_type text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
UPDATE public.ai_models
SET is_default = false
WHERE group_type = p_group_type;
UPDATE public.ai_models
SET is_default = true
WHERE id = p_model_id;
END;
$$;
GRANT EXECUTE ON FUNCTION toggle_model_enabled(text, boolean) TO anon,
    authenticated;
GRANT EXECUTE ON FUNCTION update_model_boolean(text, text, boolean) TO anon,
    authenticated;
GRANT EXECUTE ON FUNCTION set_model_default(text, text) TO anon,
    authenticated;
COMMIT;