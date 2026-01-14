-- Create Testimonials Table
create table if not exists testimonials (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    role text,
    quote text,
    video_url text,
    image_url text,
    created_at timestamptz default now()
);
-- Enable RLS
alter table testimonials enable row level security;
-- Policies
create policy "Public Read Access" on testimonials for
select using (true);
create policy "Admin Full Access" on testimonials for all using (auth.role() = 'authenticated');
-- Insert Dummy Data (Optional, ensuring at least one exists if empty)
insert into testimonials (name, role, quote, image_url)
select 'Ali Raza',
    'Founder',
    'The AI Startup Founder program changed my life.',
    'https://placehold.co/100x100/101010/70E000/png?text=Ali'
where not exists (
        select 1
        from testimonials
    );