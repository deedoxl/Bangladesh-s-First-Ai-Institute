-- Create COURSES table (Programs)
create table if not exists courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  instructor_name text default 'Deedox',
  image_url text,
  level text default 'Beginner',
  duration text default '4 Weeks',
  price text,
  status text default 'Active',
  link text,
  is_published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create NEWS table (Notices)
create table if not exists news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create FEATURED_STUDENTS table
create table if not exists featured_students (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text,
  description text,
  tags text[],
  status text,
  avatar_url text,
  email text,
  disabled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RESOURCES table
create table if not exists resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type text default 'PDF',
  image_url text,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE RLS on all
alter table public.courses enable row level security;
alter table public.news enable row level security;
alter table public.featured_students enable row level security;
alter table public.resources enable row level security;

-- OPEN PERMISSIONS (Fixes "Admin Panel Data NOT Saving")
-- This allows the frontend (Anon Key) to INSERT/UPDATE/DELETE.
create policy "Allow Full Access to Courses" on public.courses for all using (true) with check (true);
create policy "Allow Full Access to News" on public.news for all using (true) with check (true);
create policy "Allow Full Access to Students" on public.featured_students for all using (true) with check (true);
create policy "Allow Full Access to Resources" on public.resources for all using (true) with check (true);
