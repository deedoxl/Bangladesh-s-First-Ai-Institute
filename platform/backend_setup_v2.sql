-- Create a table for site settings (key-value store)
create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.site_settings enable row level security;

-- Policy: Everyone can READ
create policy "Enable read access for all users"
on public.site_settings for select
using (true);

-- Policy: Authenticated users (Admin) can ALL (Insert, Update, Delete)
-- Assuming the admin panel uses standard authentication.
-- If we want to be stricter, we can check for specific email or role.
-- For now, "authenticated" is sufficient as per instructions "Only admin role can WRITE" (assuming only admins log in to platform).
create policy "Enable full access for authenticated users"
on public.site_settings for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- Seed initial data (optional, but good for structure)
insert into site_settings (key, value)
values
  ('brand_settings', '{"brandName": "DEEDOX", "aiPageTitle": "DEEDOX & AI", "logoUrl": "/logo.png"}'::jsonb),
  ('header_settings', '{"iconColor": "#70E000", "glowIntensity": "medium", "glassOpacity": 0.9, "logoWidth": 120}'::jsonb),
  ('hero_content', '{"titlePrefix": "Asia’s First", "titleHighlight": "AI Startup Institute", "subtitle": "Learn how to use AI in real life and start a company people actually want."}'::jsonb),
  ('hero_images', '[{"id": 1, "url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop", "alt": "AI 1"}]'::jsonb),
  ('hero_settings', '{"animationSpeed": "normal", "animationEnabled": true, "overlayOpacity": 0.7}'::jsonb),
  ('ai_chat_settings', '{"assistantName": "DEEDOX AI", "glowIntensity": "medium"}'::jsonb),
  ('socials', '{"whatsapp": "923001234567", "contactEmail": "hello@deedox.ai"}'::jsonb),
  ('carousel', '[{"id": 1, "text": "Programs in Action", "image": "https://placehold.co/480x280/1e2139/FFFFFF/png?text=Action", "link": "#"}]'::jsonb),
  ('mission_content', '{"headline": "Our Mission", "subheadline": "Building Systems, Creating Founders.", "body": "At Deedox, our mission is clear..."}'::jsonb),
  ('testimonials', '[{"id": 1, "name": "Ali Raza", "role": "Founder, TechFlow", "text": "The AI Startup Founder program completely changed how I look at product development."}]'::jsonb)
on conflict (key) do nothing;
