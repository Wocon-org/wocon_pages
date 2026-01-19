-- Create a function to allow username lookup without authentication
CREATE OR REPLACE FUNCTION public.get_profile_by_username(username_param TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  username TEXT,
  nickname TEXT,
  avatar_url TEXT,
  bio TEXT,
  score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.email, p.username, p.nickname, p.avatar_url, p.bio, p.score
  FROM public.profiles p
  WHERE p.username = username_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_profile_by_username(TEXT) TO authenticated;
