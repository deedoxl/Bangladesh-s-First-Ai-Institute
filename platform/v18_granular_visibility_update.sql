BEGIN;

-- V18 GRANULAR VISIBILITY UPDATE
-- Adds ability to toggle models for Main Site vs Student Dashboard independently.

-- 1. Add Columns to ai_models
-- Safe column addition (IF NOT EXISTS)
ALTER TABLE public.ai_models 
ADD COLUMN IF NOT EXISTS show_on_main_site boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_on_student_dashboard boolean DEFAULT true;

-- 2. Create Generic Update RPC
-- Allows Admin to update any boolean field (enabled, show_on_main, show_on_student)
CREATE OR REPLACE FUNCTION public.update_model_boolean(
    p_model_id text,
    p_field text,
    p_value boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Whitelist allowed fields to prevent SQL injection or unsafe updates
    IF p_field = 'enabled' THEN
        UPDATE public.ai_models SET enabled = p_value, updated_at = now() WHERE id = p_model_id;
    ELSIF p_field = 'show_on_main_site' THEN
        UPDATE public.ai_models SET show_on_main_site = p_value, updated_at = now() WHERE id = p_model_id;
    ELSIF p_field = 'show_on_student_dashboard' THEN
        UPDATE public.ai_models SET show_on_student_dashboard = p_value, updated_at = now() WHERE id = p_model_id;
    ELSE
        RAISE EXCEPTION 'Invalid field name: %', p_field;
    END IF;
END;
$$;

-- 3. Permissions
GRANT EXECUTE ON FUNCTION public.update_model_boolean(text, text, boolean) TO anon, authenticated, service_role;

-- 4. Refresh Policies (Just in Case)
-- Ensure 'Public Read' covers new columns (It selects * so it should be fine, but good to be sure)
DROP POLICY IF EXISTS "Public Read Models" ON public.ai_models;
CREATE POLICY "Public Read Models" ON public.ai_models FOR SELECT USING (true);

COMMIT;
