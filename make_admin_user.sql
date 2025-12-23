-- SQL Script to promoting a user to Admin (Superadmin equivalent)
-- 1. First, make sure you have signed up the user in the application or Supabase Auth.
-- 2. Run this script in the Supabase SQL Editor.

DO $$
DECLARE
  v_email text := 'admin@example.com'; -- CHANGE THIS to your email
  v_user_id uuid;
BEGIN
  -- Get the User ID from auth.users (requires privileged access, e.g. SQL Editor)
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: %. Please sign up first.', v_email;
  END IF;

  -- Upsert the role to 'admin'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'admin';

  -- Auto-confirm email if likely needed
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE id = v_user_id;

  RAISE NOTICE 'Successfully made % an admin.', v_email;
END $$;
