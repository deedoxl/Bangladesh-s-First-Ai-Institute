-- Migration: Add Hero Slider Settings (v70)
-- Description: Adds controls for Hero Slider visibility and Blur effect
-- 1. Insert or Update the 'hero_settings' in site_settings table
INSERT INTO site_settings (key, value)
VALUES (
        'hero_settings',
        '{"sliderEnabled": true, "blurEnabled": true, "animationSpeed": "normal", "overlayOpacity": 0.4}'::jsonb
    ) ON CONFLICT (key) DO
UPDATE
SET value = site_settings.value || '{"sliderEnabled": true, "blurEnabled": true}'::jsonb;
-- 2. Verify the data
SELECT *
FROM site_settings
WHERE key = 'hero_settings';