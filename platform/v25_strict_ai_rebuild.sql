BEGIN;

CREATE TABLE IF NOT EXISTS public.ai_system_settings (
    key text PRIMARY KEY,
    value text NOT NULL,
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_system_settings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admin Manage Settings" ON public.ai_system_settings;
    CREATE POLICY "Admin Manage Settings" ON public.ai_system_settings
    FOR ALL
    USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' )
    WITH CHECK ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' );
END $$;

CREATE TABLE IF NOT EXISTS public.ai_models (
    id text PRIMARY KEY,
    model_id text NOT NULL,
    display_name text NOT NULL,
    group_type text NOT NULL CHECK (group_type IN ('text', 'code', 'image', 'voice')),
    enabled boolean DEFAULT true,
    is_default boolean DEFAULT false,
    show_on_main_site boolean DEFAULT true,
    show_on_student_dashboard boolean DEFAULT true,
    order_index integer DEFAULT 100,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public Read Models" ON public.ai_models;
    CREATE POLICY "Public Read Models" ON public.ai_models
    FOR SELECT
    USING (true);

    DROP POLICY IF EXISTS "Admin Manage Models" ON public.ai_models;
    CREATE POLICY "Admin Manage Models" ON public.ai_models
    FOR ALL
    USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' )
    WITH CHECK ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' );
END $$;

TRUNCATE public.ai_models;

INSERT INTO public.ai_models (id, model_id, display_name, group_type, enabled, is_default, show_on_main_site, show_on_student_dashboard, order_index) VALUES
('deepseek/deepseek-r1', 'deepseek/deepseek-r1', 'DeepSeek R1', 'text', true, true, true, true, 10),
('deepseek/deepseek-chat', 'deepseek/deepseek-chat', 'DeepSeek V3', 'text', true, false, true, true, 20),
('meta-llama/llama-3.1-70b-instruct', 'meta-llama/llama-3.1-70b-instruct', 'LLaMA 3.1 70B', 'text', true, false, true, true, 30),
('mistralai/mixtral-8x22b-instruct', 'mistralai/mixtral-8x22b-instruct', 'GPT-OSS 120B (Mixtral)', 'text', true, false, true, true, 40),
('mistralai/mixtral-8x7b-instruct', 'mistralai/mixtral-8x7b-instruct', 'GPT-OSS 20B (Mixtral)', 'text', true, false, true, true, 50),
('eleutherai/gpt-neox-20b', 'eleutherai/gpt-neox-20b', 'GPT-NeoX 20B', 'text', true, false, true, true, 60),
('tinyllama/tinyllama-1.1b-chat', 'tinyllama/tinyllama-1.1b-chat', 'TinyLlama 1.1B', 'text', true, false, true, true, 70),
('qwen/qwen-2.5-coder-32b-instruct', 'qwen/qwen-2.5-coder-32b-instruct', 'Qwen 2.5 Coder', 'code', true, true, true, true, 10),
('eleutherai/gpt-neox-20b-code', 'eleutherai/gpt-neox-20b', 'GPT-NeoX 20B (Code)', 'code', true, false, true, true, 20),
('stabilityai/stable-diffusion-xl-base-1.0', 'stabilityai/stable-diffusion-xl-base-1.0', 'Stable Diffusion XL', 'image', true, true, true, true, 10),
('stabilityai/stable-diffusion-3-medium', 'stabilityai/stable-diffusion-3-medium', 'Stable Diffusion 3', 'image', true, false, true, true, 20),
('openai/whisper-large-v3', 'openai/whisper-large-v3', 'Whisper Large V3', 'voice', true, true, true, true, 10);

CREATE OR REPLACE FUNCTION toggle_model_enabled(p_model_id text, p_enabled boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' THEN
    UPDATE public.ai_models SET enabled = p_enabled, updated_at = now() WHERE id = p_model_id;
  ELSE
    RAISE EXCEPTION 'Access Denied';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION update_model_boolean(p_model_id text, p_field text, p_value boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF (SELECT role FROM public.users WHERE id = auth.uid()) != 'admin' THEN
      RAISE EXCEPTION 'Access Denied';
  END IF;

  IF p_field = 'show_on_main_site' THEN
     UPDATE public.ai_models SET show_on_main_site = p_value, updated_at = now() WHERE id = p_model_id;
  ELSIF p_field = 'show_on_student_dashboard' THEN
     UPDATE public.ai_models SET show_on_student_dashboard = p_value, updated_at = now() WHERE id = p_model_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION set_model_default(p_model_id text, p_group_type text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' THEN
    UPDATE public.ai_models SET is_default = false WHERE group_type = p_group_type;
    UPDATE public.ai_models SET is_default = true WHERE id = p_model_id;
  ELSE
    RAISE EXCEPTION 'Access Denied';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION save_ai_system_settings(p_key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' THEN
    INSERT INTO public.ai_system_settings (key, value) VALUES ('openrouter_api_key', p_key)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  ELSE
    RAISE EXCEPTION 'Access Denied';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION get_ai_system_settings_masked()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_key text;
BEGIN
    SELECT value INTO v_key FROM public.ai_system_settings WHERE key = 'openrouter_api_key';
    IF v_key IS NULL OR v_key = '' THEN
        RETURN NULL;
    ELSE
        RETURN substring(v_key from 1 for 6) || '...' || substring(v_key from length(v_key)-3 for 4);
    END IF;
END;
$$;

COMMIT;

SELECT id, display_name, group_type, enabled FROM public.ai_models ORDER BY group_type;
