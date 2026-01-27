-- Drop existing function if exists (to handle return type changes)
DROP FUNCTION IF EXISTS get_profile_by_username(TEXT);

-- Create RPC function to get profile by username
CREATE OR REPLACE FUNCTION get_profile_by_username(username_param TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  nickname TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.nickname,
    p.email,
    p.avatar_url,
    p.bio,
    p.score,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.username = username_param
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_profile_by_username(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile_by_username(TEXT) TO anon;
