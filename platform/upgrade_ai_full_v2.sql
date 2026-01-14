BEGIN;

-- 1. AI MODELS SETTINGS (Table for specific Models)
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
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Security
ALTER TABLE public.ai_models_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can read ai_models_settings" ON public.ai_models_settings;
CREATE POLICY "Public can read ai_models_settings" ON public.ai_models_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can update ai_models_settings" ON public.ai_models_settings;
CREATE POLICY "Admin can update ai_models_settings" ON public.ai_models_settings FOR ALL USING (true);


-- 2. AI CAPABILITIES (Table for Dedicated Buttons)
CREATE TABLE IF NOT EXISTS public.ai_capabilities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  capability_name text UNIQUE NOT NULL,
  label text NOT NULL,
  enabled boolean DEFAULT true,
  allowed_models text[] DEFAULT '{}',
  default_model text,
  dashboard_scope text DEFAULT 'both',
  created_at timestamptz DEFAULT now()
);

-- Enable Security
ALTER TABLE public.ai_capabilities ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can read ai_capabilities" ON public.ai_capabilities;
CREATE POLICY "Public can read ai_capabilities" ON public.ai_capabilities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can update ai_capabilities" ON public.ai_capabilities;
CREATE POLICY "Admin can update ai_capabilities" ON public.ai_capabilities FOR ALL USING (true);


-- 3. SEED DATA

-- A. Seed Models
INSERT INTO public.ai_models_settings (id, model_name, provider, enabled, is_default_main, is_default_student, supports_chat, supports_image, supports_voice, supports_code)
VALUES
('gpt-oss-120b', 'GPT-OSS-120B', 'OpenAI', true, true, false, true, false, false, true),
('gpt-oss-20b', 'GPT-OSS-20B', 'OpenAI', true, false, false, true, false, false, false),
('meta-llama/llama-3.1-405b', 'LLaMA 3.1', 'Meta', true, false, true, true, false, false, true),
('stabilityai/stable-diffusion-3-medium', 'Stable Diffusion 3', 'Stability AI', true, false, false, false, true, false, false),
('stabilityai/stable-diffusion-xl-base-1.0', 'Stable Diffusion XL', 'Stability AI', true, false, false, false, true, false, false),
('qwen/qwen-2.5-coder-32b-instruct', 'Qwen 2.5 Coder', 'Qwen', true, false, false, true, false, false, true),
('openai/whisper-large-v3', 'Whisper Large V3', 'OpenAI', true, false, false, false, false, true, false),
('tinyllama/tinyllama-1.1b-chat', 'TinyLlama', 'Open Source', true, false, false, true, false, false, false),
('eleutherai/gpt-neox-20b', 'GPT-NeoX-20B', 'EleutherAI', true, false, false, false, false, false, true),
('deepseek/deepseek-coder', 'DeepSeek-R1', 'DeepSeek', true, false, false, true, false, false, true)
ON CONFLICT (id) DO UPDATE SET
    model_name = EXCLUDED.model_name,
    provider = EXCLUDED.provider,
    supports_chat = EXCLUDED.supports_chat,
    supports_image = EXCLUDED.supports_image,
    supports_voice = EXCLUDED.supports_voice,
    supports_code = EXCLUDED.supports_code;


-- B. Seed Capabilities (The 4 Buttons)

-- 1. Thinking Chat
INSERT INTO public.ai_capabilities (capability_name, label, enabled, allowed_models, default_model)
VALUES (
    'text_chat', 
    'AI Thinking Chat 🧠', 
    true, 
    ARRAY['gpt-oss-120b', 'gpt-oss-20b', 'meta-llama/llama-3.1-405b', 'tinyllama/tinyllama-1.1b-chat', 'deepseek/deepseek-coder'], 
    'deepseek/deepseek-coder'
)
ON CONFLICT (capability_name) DO UPDATE SET
    label = EXCLUDED.label,
    allowed_models = EXCLUDED.allowed_models,
    default_model = EXCLUDED.default_model;

-- 2. Voice to Text
INSERT INTO public.ai_capabilities (capability_name, label, enabled, allowed_models, default_model)
VALUES (
    'voice_to_text', 
    'Voice-to-Text 🎤', 
    true, 
    ARRAY['openai/whisper-large-v3'], 
    'openai/whisper-large-v3'
)
ON CONFLICT (capability_name) DO UPDATE SET
    label = EXCLUDED.label,
    allowed_models = EXCLUDED.allowed_models,
    default_model = EXCLUDED.default_model;

-- 3. Image Generation
INSERT INTO public.ai_capabilities (capability_name, label, enabled, allowed_models, default_model)
VALUES (
    'image_generation', 
    'Image Generation 🖼️', 
    true, 
    ARRAY['stabilityai/stable-diffusion-3-medium', 'stabilityai/stable-diffusion-xl-base-1.0'], 
    'stabilityai/stable-diffusion-3-medium'
)
ON CONFLICT (capability_name) DO UPDATE SET
    label = EXCLUDED.label,
    allowed_models = EXCLUDED.allowed_models,
    default_model = EXCLUDED.default_model;

-- 4. Code Assistant
INSERT INTO public.ai_capabilities (capability_name, label, enabled, allowed_models, default_model)
VALUES (
    'coding_assistant', 
    'Code Assistant 💻', 
    true, 
    ARRAY['qwen/qwen-2.5-coder-32b-instruct', 'eleutherai/gpt-neox-20b'], 
    'qwen/qwen-2.5-coder-32b-instruct'
)
ON CONFLICT (capability_name) DO UPDATE SET
    label = EXCLUDED.label,
    allowed_models = EXCLUDED.allowed_models,
    default_model = EXCLUDED.default_model;

COMMIT;
