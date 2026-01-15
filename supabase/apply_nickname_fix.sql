-- ============================================
-- Apply Nickname and Trigger Fix
-- ============================================
-- This script fixes the trigger error and adds nickname support
-- Execute this entire script at once
-- ============================================

-- Step 1: Drop all dependent triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_trips_updated_at ON public.trips;
DROP TRIGGER IF EXISTS update_map_markers_updated_at ON public.map_markers;
DROP TRIGGER IF EXISTS update_routes_updated_at ON public.routes;

-- Step 2: Drop the function
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Step 3: Recreate the function with UPDATE-only logic
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set updated_at for UPDATE operations
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Recreate all triggers (UPDATE only)
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_map_markers_updated_at
  BEFORE UPDATE ON public.map_markers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 5: Add nickname column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nickname'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN nickname TEXT;
  END IF;
END $$;

-- Step 6: Update existing profiles to use username as nickname
UPDATE public.profiles
SET nickname = username
WHERE nickname IS NULL;

-- Step 7: Update the auth trigger to handle nickname
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

-- Step 8: Update the view to include nickname
CREATE OR REPLACE VIEW public.trips_with_participants AS
SELECT
  t.*,
  COUNT(tp.id) FILTER (WHERE tp.status = 'accepted') AS participant_count,
  json_agg(
    json_build_object(
      'id', p.id,
      'username', p.username,
      'nickname', p.nickname,
      'avatar_url', p.avatar_url
    )
  ) FILTER (WHERE tp.status = 'accepted') AS participants
FROM public.trips t
LEFT JOIN public.trip_participants tp ON t.id = tp.trip_id
LEFT JOIN public.profiles p ON tp.user_id = p.id
GROUP BY t.id
ORDER BY t.created_at DESC;

-- ============================================
-- Verification
-- ============================================
-- Check triggers
SELECT
  'Triggers' as info,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%_updated_at%'
UNION ALL
-- Check nickname column
SELECT
  'Nickname Column' as info,
  column_name,
  data_type,
  'profiles' as event_object_table
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'nickname'
UNION ALL
-- Sample profiles
SELECT
  'Sample Profiles' as info,
  username,
  COALESCE(nickname, 'NULL') as data_type,
  email as event_object_table
FROM public.profiles
LIMIT 5;

-- ============================================
-- Success!
-- ============================================
-- If you see the verification results above, everything is working correctly!
