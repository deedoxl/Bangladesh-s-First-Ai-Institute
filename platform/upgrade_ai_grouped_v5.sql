-- AI System Upgrade: GROUPED V5 (Groups & Granular Defaults)
-- Adds grouping and separate default flags for Main vs Student dashboards.

BEGIN;

-- 1. Add 'group_name' column if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models_settings' AND column_name = 'group_name') THEN
        ALTER TABLE public.ai_models_settings ADD COLUMN group_name text;
    END IF;
END $$;

-- 2. Update Group Names & Defaults
-- We reset defaults first to ensure clean slate for new logic
UPDATE public.ai_models_settings SET is_default_main = false, is_default_student = false;

-- GROUP 1: Text Chat / Reasoning
UPDATE public.ai_models_settings 
SET group_name = 'Text Chat / Reasoning', 
    is_default_main = (id = 'deepseek/deepseek-r1'), 
    is_default_student = (id = 'meta/llama-3.1') -- Example: Admin can change this later
WHERE id IN ('openrouter/gpt-oss-120b', 'openrouter/gpt-oss-20b', 'meta/llama-3.1', 'openrouter/tinyllama', 'deepseek/deepseek-r1', 'deepseek/deepseek-v3');

-- GROUP 2: Voice / Speech
UPDATE public.ai_models_settings 
SET group_name = 'Voice / Speech', 
    is_default_main = true, 
    is_default_student = true
WHERE id = 'openrouter/whisper-large-v3';

-- GROUP 3: Image Generation
UPDATE public.ai_models_settings 
SET group_name = 'Image Generation', 
    is_default_main = (id = 'stabilityai/stable-diffusion-3'),
    is_default_student = (id = 'stabilityai/stable-diffusion-3')
WHERE id IN ('stabilityai/stable-diffusion-3', 'stabilityai/stable-diffusion-xl');

-- GROUP 4: Coding / Tech Support
UPDATE public.ai_models_settings 
SET group_name = 'Coding / Tech Support', 
    is_default_main = (id = 'alibaba/qwen-2.5-coder'),
    is_default_student = (id = 'eleutherai/gpt-neox-20b')
WHERE id IN ('alibaba/qwen-2.5-coder', 'eleutherai/gpt-neox-20b');

-- 3. Validation: Ensure every model has a group (Fallbacks)
UPDATE public.ai_models_settings SET group_name = 'Text Chat / Reasoning' WHERE group_name IS NULL;

COMMIT;
