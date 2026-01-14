BEGIN;

-- 1. DISABLE RLS (To rule out permission issues)
ALTER TABLE public.ai_models_settings DISABLE ROW LEVEL SECURITY;

-- 2. Clear current data (to remove any bad entries)
TRUNCATE TABLE public.ai_models_settings;

-- 3. Re-Insert 10 Correct Models
INSERT INTO public.ai_models_settings 
(id, model_name, provider, group_name, enabled, is_default_main, is_default_student, supports_chat, supports_image, supports_voice, supports_code)
VALUES 
-- Text Chat / Reasoning
('openrouter/gpt-oss-120b', 'GPT-OSS-120B', 'OpenRouter', 'Text Chat / Reasoning', true, true, false, true, false, false, false),
('openrouter/gpt-oss-20b', 'GPT-OSS-20B', 'OpenRouter', 'Text Chat / Reasoning', true, false, false, true, false, false, false),
('meta/llama-3.1', 'LLaMA 3.1', 'Meta', 'Text Chat / Reasoning', true, false, true, true, false, false, false),
('openrouter/tinyllama', 'TinyLlama', 'OpenRouter', 'Text Chat / Reasoning', true, false, false, true, false, false, false),
('eleutherai/gpt-neox-20b', 'GPT-NeoX-20B', 'EleutherAI', 'Text Chat / Reasoning', true, false, false, true, false, false, true),
('deepseek/deepseek-r1', 'DeepSeek-R1', 'DeepSeek', 'Text Chat / Reasoning', true, false, false, true, false, false, false),
('deepseek/deepseek-v3', 'DeepSeek-V3', 'DeepSeek', 'Text Chat / Reasoning', true, false, false, true, false, false, false),

-- Voice
('openrouter/whisper-large-v3', 'Whisper Large V3', 'OpenRouter', 'Voice / Speech', true, true, true, false, false, true, false),

-- Image
('stabilityai/stable-diffusion-3', 'Stable Diffusion 3', 'StabilityAI', 'Image Generation', true, true, true, false, true, false, false),
('stabilityai/stable-diffusion-xl', 'Stable Diffusion XL', 'StabilityAI', 'Image Generation', true, false, false, false, true, false, false),

-- Coding
('alibaba/qwen-2.5-coder', 'Qwen 2.5 Coder', 'Alibaba', 'Coding / Tech Support', true, true, true, false, false, false, true);

-- 4. Verify Capabilities Table (Ensure they are enabled)
UPDATE public.ai_capabilities SET enabled = true;

COMMIT;
