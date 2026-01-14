-- V26: INJECT USER API KEY
-- This script manually inserts the API key provided by the user.
-- It uses the same table as the Admin Panel, so it can be changed later via Admin > AI Studio.

BEGIN;

-- Insert or Update the Global Key
INSERT INTO public.ai_system_settings (key, value)
VALUES ('openrouter_api_key', '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')
ON CONFLICT (key) 
DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;

-- Verify it was saved
SELECT key, value FROM public.ai_system_settings WHERE key = 'openrouter_api_key';
