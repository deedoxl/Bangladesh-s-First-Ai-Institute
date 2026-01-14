-- 1. Create AI Capabilities Table
-- এই টেবিলটি প্রতিটি AI বাটনের সেটিংস এবং মডেল কন্ট্রোল করবে
create table if not exists public.ai_capabilities (
  id uuid default gen_random_uuid() primary key,
  capability_name text unique not null, -- 'text_chat', 'voice_to_text', 'image_generation', 'coding_assistant'
  label text not null, -- Button Label (e.g., "AI Thinking Chat")
  enabled boolean default true, -- Button visible or not
  allowed_models text[] default '{}', -- IDs of allowed models
  default_model text, -- ID of the default selected model
  dashboard_scope text default 'both', -- 'main', 'student', 'both'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Security (RLS)
alter table public.ai_capabilities enable row level security;

-- Allow full access to everyone (so Admin and Clients can read/write)
-- For production, you might restrict write to Admins only, but for now we keep it open like other tables
drop policy if exists "Allow Full Access to AI Capabilities" on public.ai_capabilities;
create policy "Allow Full Access to AI Capabilities" on public.ai_capabilities for all using (true) with check (true);

-- 3. Seed Default Data (ডিফল্ট বাটন কনফিগারেশন)
-- যদি টেবিল খালি থাকে, তবে এই ৪টি বাটন তৈরি হবে

-- 🧠 1. Text Chat (Thinking)
insert into public.ai_capabilities (capability_name, label, enabled, allowed_models, default_model)
select 'text_chat', 'AI Thinking Chat', true, 
ARRAY['searchgpt', 'deepseek-r1', 'gpt-4-turbo', 'claude-3-opus'], 
'deepseek-r1'
where not exists (select 1 from public.ai_capabilities where capability_name = 'text_chat');

-- 🎤 2. Voice to Text
insert into public.ai_capabilities (capability_name, label, enabled, allowed_models, default_model)
select 'voice_to_text', 'Voice to Text', true, 
ARRAY['whisper-large-v3'], 
'whisper-large-v3'
where not exists (select 1 from public.ai_capabilities where capability_name = 'voice_to_text');

-- 🖼️ 3. Image Generation
insert into public.ai_capabilities (capability_name, label, enabled, allowed_models, default_model)
select 'image_generation', 'Generate Image', true, 
ARRAY['stable-diffusion-3', 'stable-diffusion-xl'], 
'stable-diffusion-3'
where not exists (select 1 from public.ai_capabilities where capability_name = 'image_generation');

-- 💻 4. Code Assistant
insert into public.ai_capabilities (capability_name, label, enabled, allowed_models, default_model)
select 'coding_assistant', 'Code Assistant', true, 
ARRAY['qwen-2.5-coder', 'gpt-4-turbo'], 
'qwen-2.5-coder'
where not exists (select 1 from public.ai_capabilities where capability_name = 'coding_assistant');
