BEGIN;

-- MASTER AI SYSTEM - MODEL UPDATE (V17)
-- Enforcing strict model list from Master Prompt
-- Non-destructive update (upsert)

INSERT INTO public.ai_models (id, model_id, display_name, group_type, enabled, is_default, order_index) VALUES
-- TEXT MODELS
('deepseek/deepseek-r1', 'deepseek/deepseek-r1', 'DeepSeek R1', 'text', true, true, 1),
('deepseek/deepseek-v3', 'deepseek/deepseek-v3', 'DeepSeek V3', 'text', true, false, 2),
('meta-llama/llama-3.1-70b-instruct', 'meta-llama/llama-3.1-70b-instruct', 'Llama 3.1 70B', 'text', true, false, 3),
('gpt-oss-120b', 'gpt-oss-120b', 'GPT OSS 120B (Open)', 'text', true, false, 4),
('gpt-oss-20b', 'gpt-oss-20b', 'GPT OSS 20B (Open)', 'text', true, false, 5),
('EleutherAI/gpt-neox-20b', 'EleutherAI/gpt-neox-20b', 'GPT-NeoX 20B', 'text', true, false, 6),
('TinyLlama/TinyLlama-1.1B', 'TinyLlama/TinyLlama-1.1B', 'TinyLlama 1.1B', 'text', true, false, 7),

-- IMAGE MODELS
('stabilityai/stable-diffusion-xl-base-1.0', 'stabilityai/stable-diffusion-xl-base-1.0', 'Stable Diffusion XL', 'image', true, true, 1),
('stabilityai/stable-diffusion-3-medium', 'stabilityai/stable-diffusion-3-medium', 'Stable Diffusion 3', 'image', true, false, 2),

-- VOICE MODELS
('openai/whisper-large-v3', 'openai/whisper-large-v3', 'Whisper V3', 'voice', true, true, 1),

-- CODE MODELS
('Qwen/Qwen2.5-Coder-32B-Instruct', 'Qwen/Qwen2.5-Coder-32B-Instruct', 'Qwen 2.5 Coder 32B', 'code', true, true, 1)

ON CONFLICT (id) DO UPDATE SET
    model_id = EXCLUDED.model_id,
    display_name = EXCLUDED.display_name,
    group_type = EXCLUDED.group_type,
    updated_at = now();

COMMIT;
