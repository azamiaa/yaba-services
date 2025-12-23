-- Add email column to user_roles
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS email TEXT;

-- Function to handle syncing emails from auth.users to public.user_roles
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS trigger AS $$
BEGIN
  -- Update public.user_roles when a user's email changes in auth.users
  UPDATE public.user_roles
  SET email = new.email
  WHERE user_id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync email on user update
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.sync_user_email();

-- Trigger to sync email on user creation (if role is already being handled elsewhere)
-- Alternatively, if we want to ensure every user gets a public role entry automatically:

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, email, role)
  VALUES (new.id, new.email, 'user')
  ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

-- Backfill existing emails (This requires Admin API or manual SQL execution by the user)
-- Note: As an AI agent, I cannot directly query auth.users, so the user must run this in Supabase SQL Editor.
-- UPDATE public.user_roles ur SET email = u.email FROM auth.users u WHERE ur.user_id = u.id;
