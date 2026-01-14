
-- 1. Update Hero Config Table
-- Add background_clarity if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'hero_config' and column_name = 'background_clarity') then
        alter table public.hero_config add column background_clarity integer default 100;
    end if;
end $$;

-- 2. Update Image Effects Table
-- Add clarity if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'image_effects' and column_name = 'clarity') then
        alter table public.image_effects add column clarity integer default 100;
    end if;
end $$;

-- Seed default values if null (sanity check)
update public.hero_config set background_clarity = 100 where background_clarity is null;
update public.image_effects set clarity = 100 where clarity is null;
