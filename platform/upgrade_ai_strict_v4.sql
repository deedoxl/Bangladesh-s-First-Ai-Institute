-- AI System Upgrade: STRICT V4 (Final ID Corrections)
-- Fixes discrepancies in Model IDs to match User's Strict List EXACTLY.

BEGIN;

-- 1. Update Whisper Model ID
-- We delete the old mismatch and insert the correct one.

DELETE FROM public.ai_models_settings WHERE id = 'openai/whisper-large-v3';
-- Remove old ID from capabilities if present
UPDATE public.ai_capabilities SET allowed_models = array_remove(allowed_models, 'openai/whisper-large-v3') WHERE capability_name = 'voice_to_text';
UPDATE public.ai_capabilities SET default_model = NULL WHERE default_model = 'openai/whisper-large-v3';


-- 2. Insert Correct Whisper ID
INSERT INTO public.ai_models_settings (id, model_name, provider, enabled, is_default_main, is_default_student, supports_chat, supports_image, supports_voice, supports_code)
VALUES
('openrouter/whisper-large-v3', 'Whisper Large V3', 'OpenAI (via OpenRouter)', true, false, false, false, false, true, false)
ON CONFLICT (id) DO NOTHING;

-- 3. Update Capabilities to use new ID
UPDATE public.ai_capabilities 
SET allowed_models = array_append(allowed_models, 'openrouter/whisper-large-v3'),
    default_model = 'openrouter/whisper-large-v3'
WHERE capability_name = 'voice_to_text';

-- 4. Verify/Re-enforce DeepSeek-V3
INSERT INTO public.ai_models_settings (id, model_name, provider, enabled, is_default_main, is_default_student, supports_chat, supports_image, supports_voice, supports_code)
VALUES
('deepseek/deepseek-v3', 'DeepSeek-V3', 'DeepSeek', true, false, false, true, false, false, true)
ON CONFLICT (id) DO NOTHING;

-- Ensure DeepSeek-V3 is allowed in Thinking Chat
UPDATE public.ai_capabilities
SET allowed_models = array_append(allowed_models, 'deepseek/deepseek-v3')
WHERE capability_name = 'text_chat' AND NOT ('deepseek/deepseek-v3' = ANY(allowed_models));

COMMIT;
