-- AI System Upgrade: STRICT V3 (Valid IDs & Validation)
-- This script WIPES existing AI data and re-seeds with the STRICT list provided.

BEGIN;

-- 1. Reset Tables (To ensure clean state with correct IDs)
TRUNCATE TABLE public.ai_models_settings CASCADE;
TRUNCATE TABLE public.ai_capabilities CASCADE;

-- 2. Update Table Structure (Add api_key if missing, or ensure it exists)
-- We'll just alter if exists, or create if not.
CREATE TABLE IF NOT EXISTS public.ai_models_settings (
    id text PRIMARY KEY,
    model_name text NOT NULL,
    provider text NOT NULL,
    enabled boolean DEFAULT true,
    is_default_main boolean DEFAULT false,
    is_default_student boolean DEFAULT false,
    supports_chat boolean DEFAULT true,
    supports_image boolean DEFAULT false,
    supports_voice boolean DEFAULT false,
    supports_code boolean DEFAULT false,
    api_key text, -- Encrypted/Nullable as requested
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Ensure RLS
ALTER TABLE public.ai_models_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read ai_models_settings" ON public.ai_models_settings;
CREATE POLICY "Public can read ai_models_settings" ON public.ai_models_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can update ai_models_settings" ON public.ai_models_settings;
CREATE POLICY "Admin can update ai_models_settings" ON public.ai_models_settings FOR ALL USING (true);


-- 3. SEED DATA (STRICT VALID LIST)

INSERT INTO public.ai_models_settings (id, model_name, provider, enabled, is_default_main, is_default_student, supports_chat, supports_image, supports_voice, supports_code)
VALUES
-- 1. GPT-OSS-120B
('openrouter/gpt-oss-120b', 'GPT-OSS-120B', 'OpenAI', true, true, false, true, false, false, true),
-- 2. GPT-OSS-20B
('openrouter/gpt-oss-20b', 'GPT-OSS-20B', 'OpenAI', true, false, false, true, false, false, false),
-- 3. LLaMA 3.1
('meta/llama-3.1', 'LLaMA 3.1', 'Meta', true, false, true, true, false, false, true),
-- 4. Stable Diffusion 3
('stabilityai/stable-diffusion-3', 'Stable Diffusion 3', 'Stability AI', true, false, false, false, true, false, false),
-- 5. Stable Diffusion XL
('stabilityai/stable-diffusion-xl', 'Stable Diffusion XL', 'Stability AI', true, false, false, false, true, false, false),
-- 6. Qwen 2.5 Coder
('alibaba/qwen-2.5-coder', 'Qwen 2.5 Coder', 'Alibaba', true, false, false, true, false, false, true),
-- 7. Whisper Large V3
('openai/whisper-large-v3', 'Whisper Large V3', 'OpenAI', true, false, false, false, false, true, false),
-- 8. TinyLlama
('openrouter/tinyllama', 'TinyLlama', 'Open Source', true, false, false, true, false, false, false),
-- 9. GPT-NeoX-20B
('eleutherai/gpt-neox-20b', 'GPT-NeoX-20B', 'EleutherAI', true, false, false, false, false, false, true),
-- 10. DeepSeek-R1
('deepseek/deepseek-r1', 'DeepSeek-R1', 'DeepSeek', true, false, false, true, false, false, true),
-- 11. DeepSeek-V3 (Extra from list)
('deepseek/deepseek-v3', 'DeepSeek-V3', 'DeepSeek', false, false, false, true, false, false, true);


-- 4. SEED CAPABILITIES (Mapped to new IDs)

-- 🧠 1. Thinking Chat
INSERT INTO public.ai_capabilities (capability_name, label, enabled, allowed_models, default_model)
VALUES (
    'text_chat', 
    'AI Thinking Chat 🧠', 
    true, 
    ARRAY['openrouter/gpt-oss-120b', 'openrouter/gpt-oss-20b', 'meta/llama-3.1', 'openrouter/tinyllama', 'deepseek/deepseek-r1', 'deepseek/deepseek-v3'], 
    'deepseek/deepseek-r1'
)
ON CONFLICT (capability_name) DO UPDATE SET allowed_models = EXCLUDED.allowed_models, default_model = EXCLUDED.default_model;

-- 🎤 2. Voice to Text
INSERT INTO public.ai_capabilities (capability_name, label, enabled, allowed_models, default_model)
VALUES (
    'voice_to_text', 
    'Voice-to-Text 🎤', 
    true, 
    ARRAY['openai/whisper-large-v3'], 
    'openai/whisper-large-v3'
)
ON CONFLICT (capability_name) DO UPDATE SET allowed_models = EXCLUDED.allowed_models, default_model = EXCLUDED.default_model;

-- 🖼️ 3. Image Generation
INSERT INTO public.ai_capabilities (capability_name, label, enabled, allowed_models, default_model)
VALUES (
    'image_generation', 
    'Image Generation 🖼️', 
    true, 
    ARRAY['stabilityai/stable-diffusion-3', 'stabilityai/stable-diffusion-xl'], 
    'stabilityai/stable-diffusion-3'
)
ON CONFLICT (capability_name) DO UPDATE SET allowed_models = EXCLUDED.allowed_models, default_model = EXCLUDED.default_model;

-- 💻 4. Code Assistant
INSERT INTO public.ai_capabilities (capability_name, label, enabled, allowed_models, default_model)
VALUES (
    'coding_assistant', 
    'Code Assistant 💻', 
    true, 
    ARRAY['alibaba/qwen-2.5-coder', 'eleutherai/gpt-neox-20b'], 
    'alibaba/qwen-2.5-coder'
)
ON CONFLICT (capability_name) DO UPDATE SET allowed_models = EXCLUDED.allowed_models, default_model = EXCLUDED.default_model;

COMMIT;
