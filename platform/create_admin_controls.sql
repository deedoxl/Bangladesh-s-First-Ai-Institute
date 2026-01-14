-- Features: AI Control, Hero Layers, Image Effects

-- 1. AI TOOLS TABLE
create table if not exists ai_tools (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  route text, -- Internal internal route or external link
  icon_url text, -- URL to icon/image
  image_url text, -- Large preview image
  show_in_main boolean default true,
  show_in_student boolean default true,
  is_default_main boolean default false,
  is_default_student boolean default false,
  is_new boolean default false,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ai_tools enable row level security;
drop policy if exists "Allow Full Access to AI Tools" on public.ai_tools;
create policy "Allow Full Access to AI Tools" on public.ai_tools for all using (true) with check (true);

-- Seed Data for AI Tools (prevent empty state)
insert into public.ai_tools (name, description, route, show_in_main, is_default_main)
select 'Chat Genius', 'Advanced AI Chatbot', '/ai-chat', true, true
where not exists (select 1 from public.ai_tools);


-- 2. HERO LAYERS TABLE (For the 3rd layer request)
create table if not exists hero_layers (
  id uuid default gen_random_uuid() primary key,
  layer_order integer, -- 1, 2, 3
  image_url text,
  is_active boolean default true,
  opacity integer default 100, -- 0-100
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.hero_layers enable row level security;
drop policy if exists "Allow Full Access to Hero Layers" on public.hero_layers;
create policy "Allow Full Access to Hero Layers" on public.hero_layers for all using (true) with check (true);

-- Seed Data for Layers
insert into public.hero_layers (layer_order, image_url, opacity)
select 1, 'https://placehold.co/1920x1080/101010/FFF?text=Layer+1', 30
where not exists (select 1 from public.hero_layers)
union all
select 2, 'https://placehold.co/1920x1080/000000/FFF?text=Layer+2', 50
where not exists (select 1 from public.hero_layers)
union all
select 3, 'https://placehold.co/1920x1080/202020/FFF?text=Layer+3', 80
where not exists (select 1 from public.hero_layers);


-- 3. IMAGE EFFECTS TABLE (Blur Toggle)
create table if not exists image_effects (
  id uuid default gen_random_uuid() primary key,
  section_name text unique, -- e.g., 'carousel_blur', 'hero_blur'
  is_enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.image_effects enable row level security;
drop policy if exists "Allow Full Access to Image Effects" on public.image_effects;
create policy "Allow Full Access to Image Effects" on public.image_effects for all using (true) with check (true);

-- Seed Data
insert into public.image_effects (section_name, is_enabled)
select 'carousel_blur', true
where not exists (select 1 from public.image_effects where section_name = 'carousel_blur');


-- 4. HERO SETTINGS (Opacity) - We can use valid 'site_settings' or a new table. 
-- Let's use a specific table for cleaner structured data as requested.
create table if not exists hero_config (
  id uuid default gen_random_uuid() primary key,
  background_opacity integer default 50,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.hero_config enable row level security;
drop policy if exists "Allow Full Access to Hero Config" on public.hero_config;
create policy "Allow Full Access to Hero Config" on public.hero_config for all using (true) with check (true);

-- Seed
insert into public.hero_config (background_opacity)
select 50
where not exists (select 1 from public.hero_config);
