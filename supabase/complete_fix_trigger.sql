-- Complete fix for trigger error
-- This updates the handle_updated_at function and recreates all triggers

-- Step 1: Drop the old function
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Step 2: Recreate the function with proper INSERT/UPDATE handling
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set updated_at for UPDATE operations
  -- For INSERT, the DEFAULT value will be used
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Recreate all triggers with UPDATE only
-- Profiles trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trips trigger
DROP TRIGGER IF EXISTS update_trips_updated_at ON public.trips;
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Map markers trigger
DROP TRIGGER IF EXISTS update_map_markers_updated_at ON public.map_markers;
CREATE TRIGGER update_map_markers_updated_at
  BEFORE UPDATE ON public.map_markers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Routes trigger
DROP TRIGGER IF EXISTS update_routes_updated_at ON public.routes;
CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 4: Update the handle_new_user function
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

-- Verification
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%_updated_at'
ORDER BY event_object_table;

-- Test the fix
DO $$
DECLARE
  test_id UUID;
BEGIN
  -- Test INSERT (should work without error)
  test_id := gen_random_uuid();
  INSERT INTO public.profiles (id, username, nickname, email)
  VALUES (test_id, 'test_user', 'Test User', 'test@example.com');

  -- Test UPDATE (should update updated_at)
  UPDATE public.profiles
  SET nickname = 'Updated Test User'
  WHERE id = test_id;

  -- Clean up
  DELETE FROM public.profiles WHERE id = test_id;

  RAISE NOTICE 'Trigger fix successful!';
END $$;
