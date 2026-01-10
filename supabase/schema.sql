-- ============================================
-- wocon Database Schema for Supabase
-- ============================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Create table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  score INTEGER DEFAULT 0,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add columns if they don't exist (for existing tables)
DO $$
BEGIN
  -- Add avatar_url if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create index on username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- ============================================
-- TRIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('private', 'recruiting')),
  max_participants INTEGER DEFAULT 2,
  is_public BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Create policies for trips
CREATE POLICY "Public trips are viewable by everyone"
  ON public.trips FOR SELECT
  USING (is_public = true OR owner_id = auth.uid());

CREATE POLICY "Users can create their own trips"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own trips"
  ON public.trips FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own trips"
  ON public.trips FOR DELETE
  USING (auth.uid() = owner_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trips_owner ON public.trips(owner_id);
CREATE INDEX IF NOT EXISTS idx_trips_type ON public.trips(type);
CREATE INDEX IF NOT EXISTS idx_trips_public ON public.trips(is_public);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON public.trips(created_at DESC);

-- ============================================
-- TRIP_PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(trip_id, user_id)
);

-- Enable RLS
ALTER TABLE public.trip_participants ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Participants are viewable by trip owner and participant"
  ON public.trip_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_participants.trip_id
      AND (trips.owner_id = auth.uid() OR trip_participants.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert their own participation"
  ON public.trip_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
  ON public.trip_participants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own participation"
  ON public.trip_participants FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trip_participants_trip ON public.trip_participants(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_participants_user ON public.trip_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_participants_status ON public.trip_participants(status);

-- ============================================
-- MAP_MARKERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.map_markers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  title TEXT,
  description TEXT,
  category TEXT DEFAULT 'point_of_interest' CHECK (category IN (
    'point_of_interest',
    'accommodation',
    'restaurant',
    'attraction',
    'transport',
    'other'
  )),
  order_index INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.map_markers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Markers are viewable by trip owner and participants"
  ON public.map_markers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = map_markers.trip_id
      AND (
        trips.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.trip_participants
          WHERE trip_participants.trip_id = trips.id
          AND trip_participants.user_id = auth.uid()
          AND trip_participants.status = 'accepted'
        )
      )
    )
  );

CREATE POLICY "Trip owner and participants can create markers"
  ON public.map_markers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = map_markers.trip_id
      AND (
        trips.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.trip_participants
          WHERE trip_participants.trip_id = trips.id
          AND trip_participants.user_id = auth.uid()
          AND trip_participants.status = 'accepted'
        )
      )
    )
  );

CREATE POLICY "Creator can update own markers"
  ON public.map_markers FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete own markers"
  ON public.map_markers FOR DELETE
  USING (auth.uid() = created_by);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_map_markers_trip ON public.map_markers(trip_id);
CREATE INDEX IF NOT EXISTS idx_map_markers_category ON public.map_markers(category);

-- ============================================
-- ROUTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT,
  description TEXT,
  coordinates JSONB NOT NULL,
  distance FLOAT,
  duration INTEGER, -- in minutes
  color TEXT DEFAULT '#667eea',
  order_index INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Routes are viewable by trip owner and participants"
  ON public.routes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = routes.trip_id
      AND (
        trips.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.trip_participants
          WHERE trip_participants.trip_id = trips.id
          AND trip_participants.user_id = auth.uid()
          AND trip_participants.status = 'accepted'
        )
      )
    )
  );

CREATE POLICY "Trip owner and participants can create routes"
  ON public.routes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = routes.trip_id
      AND (
        trips.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.trip_participants
          WHERE trip_participants.trip_id = trips.id
          AND trip_participants.user_id = auth.uid()
          AND trip_participants.status = 'accepted'
        )
      )
    )
  );

CREATE POLICY "Creator can update own routes"
  ON public.routes FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete own routes"
  ON public.routes FOR DELETE
  USING (auth.uid() = created_by);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_routes_trip ON public.routes(trip_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Create storage bucket for trip covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-covers', 'trip-covers', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Create storage bucket for marker images
INSERT INTO storage.buckets (id, name, public)
VALUES ('marker-images', 'marker-images', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Avatar policies
CREATE POLICY "Public avatars are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trip cover policies
CREATE POLICY "Public trip covers are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trip-covers');

CREATE POLICY "Trip owners can upload cover images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'trip-covers'
    AND EXISTS (
      SELECT 1 FROM public.trips
      WHERE id::text = (storage.foldername(name))[1]
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Trip owners can update cover images"
  ON storage.objects FOR UPDATE
  WITH CHECK (
    bucket_id = 'trip-covers'
    AND EXISTS (
      SELECT 1 FROM public.trips
      WHERE id::text = (storage.foldername(name))[1]
      AND owner_id = auth.uid()
    )
  );

-- Marker image policies
CREATE POLICY "Marker images are viewable by trip owner and participants"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'marker-images'
    AND EXISTS (
      SELECT 1 FROM public.map_markers
      WHERE id::text = (storage.foldername(name))[1]
      AND trip_id IN (
        SELECT id FROM public.trips
        WHERE owner_id = auth.uid()
        OR id IN (
          SELECT trip_id FROM public.trip_participants
          WHERE user_id = auth.uid() AND status = 'accepted'
        )
      )
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
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

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VIEWS
-- ============================================

-- View: Get trip with participant count
CREATE OR REPLACE VIEW public.trips_with_participants AS
SELECT
  t.*,
  COUNT(tp.id) FILTER (WHERE tp.status = 'accepted') AS participant_count,
  json_agg(
    json_build_object(
      'id', p.id,
      'username', p.username,
      'avatar_url', p.avatar_url
    )
  ) FILTER (WHERE tp.status = 'accepted') AS participants
FROM public.trips t
LEFT JOIN public.trip_participants tp ON t.id = tp.trip_id
LEFT JOIN public.profiles p ON tp.user_id = p.id
GROUP BY t.id
ORDER BY t.created_at DESC;
