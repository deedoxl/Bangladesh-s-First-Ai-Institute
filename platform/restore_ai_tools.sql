-- 1. Fix Schema: Change ID from UUID to TEXT
-- (Run this block first)
BEGIN;
    ALTER TABLE public.ai_tools ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE public.ai_tools ALTER COLUMN id TYPE text;
COMMIT;

-- 2. Clean Slate (Optional, but ensures no UUID conflicts)
TRUNCATE TABLE public.ai_tools;

-- 3. Restore Models
INSERT INTO public.ai_tools (id, name, description, route, show_in_main, is_default_main, sort_order) VALUES
('google/gemini-pro', 'Gemini Pro', 'Google''s Pro Model', '#', true, true, 1),
('openai/gpt-4-turbo', 'GPT-4 Turbo', 'OpenAI Top Model', '#', true, false, 2),
('meta-llama/llama-3-70b-instruct', 'Llama 3 (70B)', 'Meta Open Source', '#', true, false, 3),
('mistralai/mistral-large', 'Mistral Large', 'Mistral AI', '#', true, false, 4),
('anthropic/claude-3-opus', 'Claude 3 Opus', 'Anthropic Most Powerful', '#', true, false, 5);