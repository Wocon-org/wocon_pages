-- Add nickname column to profiles table
-- This script adds the nickname field for user display names

-- Add nickname column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nickname'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN nickname TEXT;
  END IF;
END $$;

-- Update existing profiles to use username as nickname if nickname is null
UPDATE public.profiles
SET nickname = username
WHERE nickname IS NULL;

-- Update the trigger to handle nickname
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, nickname, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'nickname', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the view to include nickname
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

-- Verify the changes
SELECT
  id,
  username,
  nickname,
  email
FROM public.profiles
LIMIT 5;
