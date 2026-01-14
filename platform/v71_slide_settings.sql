-- Migration: Add Sliding Cards Settings (v71)
-- Description: Adds controls for "Sliding Cards" visibility and Blur effect
-- 1. Insert or Update the 'slide_settings' in site_settings table
INSERT INTO site_settings (key, value)
VALUES (
        'slide_settings',
        '{"sliderEnabled": true, "blurEnabled": true}'::jsonb
    ) ON CONFLICT (key) DO
UPDATE
SET value = site_settings.value || '{"sliderEnabled": true, "blurEnabled": true}'::jsonb;
-- 2. Verify the data
SELECT *
FROM site_settings
WHERE key = 'slide_settings';