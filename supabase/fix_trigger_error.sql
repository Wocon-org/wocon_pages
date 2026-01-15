-- Fix trigger error for handle_updated_at function
-- This fixes the issue where the trigger fails when NEW record doesn't have updated_at field

-- Update the handle_updated_at function to check if updated_at exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- For INSERT operations, set the initial value
    IF NEW.updated_at IS NULL THEN
      NEW.updated_at = TIMEZONE('utc'::text, NOW());
    END IF;
  ELSE
    -- For UPDATE operations, update the timestamp
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the handle_new_user function to include updated_at
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, nickname, email, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'nickname', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    TIMEZONE('utc'::text, NOW())
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the fix by creating a test profile
-- (This is just for verification, you can remove it)
-- INSERT INTO public.profiles (id, username, nickname, email)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'test_user',
--   'Test User',
--   'test@example.com'
-- );
