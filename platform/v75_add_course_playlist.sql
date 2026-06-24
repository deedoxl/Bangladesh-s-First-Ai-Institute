-- v75 Add Course Playlist Column
-- This column will store the playlist array (part 1, part 2...) for each course in public.courses.

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS playlist jsonb DEFAULT '[]'::jsonb;
