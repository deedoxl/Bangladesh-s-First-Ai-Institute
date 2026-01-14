BEGIN;

-- FIX: API Key Update Safety (V15)
-- Prevents data loss by ensuring API keys are only updated if valid (not empty/masked).

-- Redefine save_provider_key with safety checks
CREATE OR REPLACE FUNCTION public.save_provider_key(
    p_key text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_secret text := 'deedox_secure_ai_persistence_key_2026';
BEGIN
    -- Validation Logic:
    -- 1. Must not be null
    -- 2. Must not be empty string
    -- 3. Must not be masked (contain '*')
    -- 4. Should ideally start with 'sk-' (OpenRouter standard)
    
    IF p_key IS NOT NULL AND p_key != '' AND p_key NOT LIKE '%*%' AND (p_key LIKE 'sk-%' OR p_key LIKE 'pk-%') THEN
        
        -- Safe to Update/Insert
        INSERT INTO public.ai_provider_settings (provider_name, api_key_encrypted, is_active)
        VALUES ('openrouter', pgp_sym_encrypt(p_key, v_secret), true)
        ON CONFLICT (provider_name)
        DO UPDATE SET 
            api_key_encrypted = pgp_sym_encrypt(p_key, v_secret),
            updated_at = now();
            
    ELSE
        -- INVALID INPUT DETECTED
        -- Do NOT touch the api_key column.
        -- We can update 'updated_at' to show activity, or just ignore.
        -- Let's update nothing about the key, but ensure the record exists if it doesn't? 
        -- No, if we don't have a key, we can't create a valid record.
        
        -- If record exists, we effectively do nothing but log/notify/return.
        -- If record doesn't exist and we return, nothing happens.
        
        -- OPTIONAL: Raise Notice
        RAISE NOTICE 'Skipping API Key update: Input value was empty, masked, or invalid.';
    END IF;
END;
$$;

COMMIT;
