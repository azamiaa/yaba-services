-- Update the first Hero Service to use the static image provided by the user
-- This is for the 'Global Access' / Passport service

UPDATE public.hero_services
SET image_folder_url = 'https://images.pexels.com/photos/34444484/pexels-photo-34444484.jpeg'
WHERE sort_order = 1;

-- Update others to use valid placeholders or remove them
UPDATE public.hero_services
SET active = false
WHERE sort_order > 1;
