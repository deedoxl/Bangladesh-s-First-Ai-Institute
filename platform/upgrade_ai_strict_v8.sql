-- UPGRADE AI STRICT V8
-- Enforces exact OpenRouter Model IDs provided in the latest requirement.

BEGIN;

-- 1. Reset Table
TRUNCATE TABLE public.ai_models_settings;

-- 2. Insert Strict Models
INSERT INTO public.ai_models_settings 
(id, model_name, provider, group_name, enabled, is_default_main, is_default_student, supports_chat, supports_image, supports_voice, supports_code)
VALUES 
-- Text Chat / Reasoning
('openai/gpt-4o', 'GPT-4o', 'OpenAI', 'Text Chat / Reasoning', true, true, false, true, false, false, false),
('openai/gpt-4o-mini', 'GPT-4o Mini', 'OpenAI', 'Text Chat / Reasoning', true, false, true, true, false, false, false),
('meta-llama/llama-3.1-8b-instruct', 'LLaMA 3.1 (8B)', 'Meta', 'Text Chat / Reasoning', true, false, false, true, false, false, false),
('meta-llama/llama-3.1-70b-instruct', 'LLaMA 3.1 (70B)', 'Meta', 'Text Chat / Reasoning', true, false, false, true, false, false, false),
('deepseek/deepseek-r1', 'DeepSeek R1', 'DeepSeek', 'Text Chat / Reasoning', true, false, false, true, false, false, false),
('deepseek/deepseek-chat', 'DeepSeek V3', 'DeepSeek', 'Text Chat / Reasoning', true, false, false, true, false, false, false),

-- Voice (OpenRouter Support varies, keeping for UI structure)
('openai/whisper-large-v3', 'Whisper Large V3', 'OpenAI', 'Voice / Speech', true, true, true, false, false, true, false),

-- Image (Note: OpenRouter is primarily Text, these might require specific keys or proxies)
('stabilityai/stable-diffusion-xl-base-1.0', 'Stable Diffusion XL', 'StabilityAI', 'Image Generation', true, true, true, false, true, false, false),

-- Coding
('qwen/qwen-2.5-72b-instruct', 'Qwen 2.5 (72B)', 'Alibaba', 'Coding / Tech Support', true, true, true, false, false, false, true);

-- 3. Ensure RLS is Public Read (Required for Vite Client-Side calls)
ALTER TABLE public.ai_models_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.ai_models_settings;
CREATE POLICY "Enable read access for all users" ON public.ai_models_settings FOR SELECT USING (true);

-- 4. Allow Admin updates
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.ai_models_settings;
CREATE POLICY "Enable update for authenticated users only" ON public.ai_models_settings FOR UPDATE USING (auth.role() = 'authenticated');

COMMIT;
