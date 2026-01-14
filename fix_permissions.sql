-- FIX SCRIPT: Allow Admin Updates without Login
-- This script modifies the database to allow the website to save settings directly.

-- 1. Drop existing strict policies
drop policy if exists "Enable full access for authenticated users" on public.site_settings;
drop policy if exists "Enable read access for all users" on public.site_settings;

-- 2. Create new OPEN policies (Allows Anon Key to Write)
-- WARNING: This relies on your Admin Panel being hidden/password protected by the React App.
create policy "Allow Full Access to Everyone"
on public.site_settings
for all
using (true)
with check (true);

-- 3. Ensure RLS is enabled (but the policy allows all)
alter table public.site_settings enable row level security;

-- 4. Verify/Re-seed keys just in case
insert into site_settings (key, value)
values
  ('hero_content', '{"titlePrefix": "Asia’s First", "titleHighlight": "AI Startup Institute", "subtitle": "Learn how to use AI in real life and start a company people actually want."}'::jsonb),
  ('socials', '{"whatsapp": "923001234567", "contactEmail": "hello@deedox.ai"}'::jsonb)
on conflict (key) do nothing;
