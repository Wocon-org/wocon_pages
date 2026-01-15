-- Add latitude and longitude fields to trips table
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS latitude FLOAT,
ADD COLUMN IF NOT EXISTS longitude FLOAT;

-- Add index for location-based queries
CREATE INDEX IF NOT EXISTS idx_trips_location ON public.trips(latitude, longitude);
