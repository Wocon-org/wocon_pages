-- Disable and recreate the update_profiles_updated_at trigger
-- This fixes the issue where the trigger fails during INSERT operations

-- First, drop the existing trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Now recreate the trigger with a safer version
-- This version only fires on UPDATE, not on INSERT
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Verify the trigger is working correctly
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'update_profiles_updated_at';

-- Test by creating a dummy profile (optional, for verification)
-- DO $$
-- BEGIN
--   INSERT INTO public.profiles (id, username, nickname, email)
--   VALUES (
--     gen_random_uuid(),
--     'test_user_' || floor(random() * 1000),
--     'Test User',
--     'test@example.com'
--   );
--
--   -- This should work now without error
--   UPDATE public.profiles
--   SET nickname = 'Updated Nickname'
--   WHERE username LIKE 'test_user_%';
--
--   -- Clean up test data
--   DELETE FROM public.profiles
--   WHERE username LIKE 'test_user_%';
-- END $$;
