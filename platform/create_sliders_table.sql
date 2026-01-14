-- Create SLIDERS table (Carousel)
-- This moves slider data out of 'site_settings' JSON to a dedicated table for better reliability.

create table if not exists sliders (
  id uuid default gen_random_uuid() primary key,
  title text, 
  description text, -- optional text
  image_url text not null, -- The image link
  link text, -- redirect link
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.sliders enable row level security;

-- OPEN PERMISSIONS (Fixes "Not Saving" issue)
-- Allow Anon (Frontend) to Read, Insert, Update, Delete
create policy "Allow Full Access to Sliders" on public.sliders for all using (true) with check (true);

-- SEED DATA (Optional: Add one default slice if empty)
insert into public.sliders (title, image_url, link)
select 'Welcome to Deedox', 'https://placehold.co/1920x600/101010/FFF?text=Welcome+to+Deedox', '#'
where not exists (select 1 from public.sliders);
