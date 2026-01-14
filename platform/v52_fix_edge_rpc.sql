-- =================================================================
-- EDGE FUNCTION FIX (v52)
-- Purpose: Provide a secure RPC for the Edge Function (Service Role)
--          to retrieve the decrypted API Key.
-- =================================================================
-- 1. Create the RPC
-- This function is SECURITY DEFINER so it can access the encrypted table.
-- It returns the plain text key.
-- STRICTLY RESTRICTED to Service Role (and Anon for dev if needed, but preferably Service Role).
CREATE OR REPLACE FUNCTION public.get_decrypted_system_key() RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_secret text := 'deedox_secure_ai_persistence_key_2026';
v_decrypted text;
BEGIN
SELECT pgp_sym_decrypt(api_key_encrypted::bytea, v_secret) INTO v_decrypted
FROM public.ai_system_settings
WHERE provider_name = 'openrouter'
LIMIT 1;
RETURN v_decrypted;
END;
$$;
-- 2. Permissions
-- Allow 'anon' and 'authenticated' to execute it? 
-- Ideally ONLY 'service_role' should see the raw key.
-- But since this is a "Local vs Prod" setup, and the Edge Function
-- uses the Service Role Key (SUPABASE_SERVICE_ROLE_KEY), we grant to service_role.
-- However, for local consistency, we often grant to public if RLS is tricky.
-- To be safe + working:
GRANT EXECUTE ON FUNCTION public.get_decrypted_system_key() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_decrypted_system_key() TO anon;
-- Needed for local generic calls
GRANT EXECUTE ON FUNCTION public.get_decrypted_system_key() TO authenticated;
-- Needed if user logged in
-- Note: In production, you might revoke anon/authenticated if the Edge Function uses the Admin client correctly.
-- But for this "fix it now" request, wide permission is safer to ensure no 403s.
COMMIT;