-- ============================================
-- FRIENDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CHECK (user_id <> friend_id)
);

-- Enable RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own friends"
  ON public.friends FOR SELECT
  USING (
    user_id = auth.uid() OR friend_id = auth.uid()
  );

CREATE POLICY "Users can send friend requests"
  ON public.friends FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR friend_id = auth.uid()
  );

CREATE POLICY "Users can update their own friendships"
  ON public.friends FOR UPDATE
  USING (
    (user_id = auth.uid() OR friend_id = auth.uid())
  );

CREATE POLICY "Users can delete their own friendships"
  ON public.friends FOR DELETE
  USING (
    user_id = auth.uid() OR friend_id = auth.uid()
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_friends_user ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend ON public.friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON public.friends(status);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.friends_handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_friends_updated_at
  BEFORE UPDATE ON public.friends
  FOR EACH ROW EXECUTE FUNCTION public.friends_handle_updated_at();

-- Create view for friend list
CREATE OR REPLACE VIEW public.user_friends AS
SELECT
  f.id,
  f.status,
  f.created_at,
  CASE
    WHEN f.user_id = auth.uid() THEN f.friend_id
    ELSE f.user_id
  END AS friend_id,
  p.username,
  p.nickname,
  p.avatar_url,
  p.bio,
  CASE
    WHEN f.status = 'pending' AND f.user_id = auth.uid() THEN 'sent'
    WHEN f.status = 'pending' AND f.friend_id = auth.uid() THEN 'received'
    ELSE f.status
  END AS request_status
FROM public.friends f
JOIN public.profiles p ON (
  (f.user_id = auth.uid() AND p.id = f.friend_id)
  OR (f.friend_id = auth.uid() AND p.id = f.user_id)
);
