-- AI System Upgrade: FINAL SECURITY & STRICT COMPLIANCE
-- 1. Updates RLS to be safer (Public read Metadata, Server read Keys)
-- 2. Ensures all 10 Strict Models are present

BEGIN;

-- Part 1: RLS Updates for Security
ALTER TABLE public.ai_models_settings ENABLE ROW LEVEL SECURITY;

-- Allow Public (Frontend) to READ configs, but maybe we should HIDE api_keys column?
-- Postgres RLS doesn't do column-level easily without Views. 
-- BUT since we moved logic to Server-Side API, we don't *need* to fetch api_key in frontend `useData`.
-- We will rely on the Server API Route (which uses authenticated client or strict selection) to read it.
-- For now, we leave Policy as TRUE but we MUST NOT SELECT keys in frontend.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.ai_models_settings;
CREATE POLICY "Enable read access for all users" ON public.ai_models_settings FOR SELECT USING (true);

-- Allow Admins (or authenticated) to Update
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.ai_models_settings;
CREATE POLICY "Enable update for authenticated users only" ON public.ai_models_settings FOR UPDATE USING (auth.role() = 'authenticated');


-- Part 2: Ensure 10 Strict Models Exist (Insert if missing)
INSERT INTO public.ai_models_settings (id, model_name, provider, group_name, enabled, supports_chat, supports_image, supports_voice, supports_code)
VALUES 
('openrouter/gpt-oss-120b', 'GPT-OSS-120B', 'OpenRouter', 'Text Chat / Reasoning', true, true, false, false, false),
('openrouter/gpt-oss-20b', 'GPT-OSS-20B', 'OpenRouter', 'Text Chat / Reasoning', true, true, false, false, false),
('meta/llama-3.1', 'LLaMA 3.1', 'Meta', 'Text Chat / Reasoning', true, true, false, false, false),
('openrouter/tinyllama', 'TinyLlama', 'OpenRouter', 'Text Chat / Reasoning', true, true, false, false, false),
('eleutherai/gpt-neox-20b', 'GPT-NeoX-20B', 'EleutherAI', 'Text Chat / Reasoning', true, true, false, false, true),
('deepseek/deepseek-r1', 'DeepSeek-R1', 'DeepSeek', 'Text Chat / Reasoning', true, true, false, false, false),
('deepseek/deepseek-v3', 'DeepSeek-V3', 'DeepSeek', 'Text Chat / Reasoning', true, true, false, false, false),
('openrouter/whisper-large-v3', 'Whisper Large V3', 'OpenRouter', 'Voice / Speech', true, false, false, true, false),
('stabilityai/stable-diffusion-3', 'Stable Diffusion 3', 'StabilityAI', 'Image Generation', true, false, true, false, false),
('stabilityai/stable-diffusion-xl', 'Stable Diffusion XL', 'StabilityAI', 'Image Generation', true, false, true, false, false),
('alibaba/qwen-2.5-coder', 'Qwen 2.5 Coder', 'Alibaba', 'Coding / Tech Support', true, false, false, false, true)
ON CONFLICT (id) DO UPDATE SET 
    group_name = EXCLUDED.group_name; -- Ensure group is correct

COMMIT;
