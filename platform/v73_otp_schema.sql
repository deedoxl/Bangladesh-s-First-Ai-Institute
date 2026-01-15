-- Requirement: Add OTP columns to users table
-- Note: In Supabase, standard auth is handled in auth.users. 
-- This schema extends the public profile table to support custom OTP handling if needed.
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_used BOOLEAN DEFAULT FALSE
);
-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_otp_email ON public.otp_codes(user_email);
-- RLS Policies
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
-- Only server-side functions can read/write this table usually
-- But for now we allow authenticated inserts for demo, in production this should be strictly server-side
CREATE POLICY "Allow service role full access" ON public.otp_codes FOR ALL USING (auth.role() = 'service_role');