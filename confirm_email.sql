-- Run this in your Supabase SQL Editor to manually confirm your user's email
-- Replace 'your_email@example.com' with the actual email you signed up with

UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'admin@example.com'; -- Change this to your email

-- Alternatively, confirm ALL users (useful for dev)
-- UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;
