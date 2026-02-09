-- DROP existing policies to avoid duplicates
-- profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- trips
DROP POLICY IF EXISTS "Public trips are viewable by everyone" ON public.trips;
DROP POLICY IF EXISTS "Users can create their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can update own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON public.trips;

-- trip_participants
DROP POLICY IF EXISTS "Participants are viewable by trip owner and participant" ON public.trip_participants;
DROP POLICY IF EXISTS "Users can insert their own participation" ON public.trip_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.trip_participants;
DROP POLICY IF EXISTS "Users can delete their own participation" ON public.trip_participants;

-- map_markers
DROP POLICY IF EXISTS "Markers are viewable by trip owner and participants" ON public.map_markers;
DROP POLICY IF EXISTS "Trip owner and participants can create markers" ON public.map_markers;
DROP POLICY IF EXISTS "Creator can update own markers" ON public.map_markers;
DROP POLICY IF EXISTS "Creator can delete own markers" ON public.map_markers;

-- routes
DROP POLICY IF EXISTS "Routes are viewable by trip owner and participants" ON public.routes;
DROP POLICY IF EXISTS "Trip owner and participants can create routes" ON public.routes;
DROP POLICY IF EXISTS "Creator can update own routes" ON public.routes;
DROP POLICY IF EXISTS "Creator can delete own routes" ON public.routes;

-- storage.objects (avatars / trip-covers / marker-images)
DROP POLICY IF EXISTS "Public avatars are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public trip covers are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Trip owners can upload cover images" ON storage.objects;
DROP POLICY IF EXISTS "Trip owners can update cover images" ON storage.objects;
DROP POLICY IF EXISTS "Marker images are viewable by trip owner and participants" ON storage.objects;

-- DROP possible duplicate triggers (they will be recreated)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_trips_updated_at ON public.trips;
DROP TRIGGER IF EXISTS update_map_markers_updated_at ON public.map_markers;
DROP TRIGGER IF EXISTS update_routes_updated_at ON public.routes;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
