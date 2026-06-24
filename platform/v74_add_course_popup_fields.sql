-- Migration to add custom popup and video fields to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS popup_headline text,
ADD COLUMN IF NOT EXISTS popup_subheadline text,
ADD COLUMN IF NOT EXISTS popup_badge_left text DEFAULT 'LIVE SESSION',
ADD COLUMN IF NOT EXISTS popup_badge_right text DEFAULT 'Only 10 seats left!',
ADD COLUMN IF NOT EXISTS popup_date text,
ADD COLUMN IF NOT EXISTS popup_time text,
ADD COLUMN IF NOT EXISTS popup_enrolled text,
ADD COLUMN IF NOT EXISTS popup_feature_1 text,
ADD COLUMN IF NOT EXISTS popup_feature_2 text,
ADD COLUMN IF NOT EXISTS popup_feature_3 text,
ADD COLUMN IF NOT EXISTS popup_feature_4 text,
ADD COLUMN IF NOT EXISTS popup_btn_primary_text text DEFAULT 'Reserve My Seat Now',
ADD COLUMN IF NOT EXISTS popup_btn_primary_link text,
ADD COLUMN IF NOT EXISTS popup_btn_secondary_text text DEFAULT 'Maybe Later',
ADD COLUMN IF NOT EXISTS popup_btn_secondary_link text,
ADD COLUMN IF NOT EXISTS popup_footer_text text DEFAULT 'Created by DEEDOX';

-- Reset permission grants just to be sure
GRANT ALL ON public.courses TO anon;
GRANT ALL ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
