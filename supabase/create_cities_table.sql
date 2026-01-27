-- Create cities table for geonames data
CREATE TABLE IF NOT EXISTS public.cities (
  geonameid INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  asciiname TEXT,
  alternatenames TEXT,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  feature_class TEXT,
  feature_code TEXT,
  country_code TEXT,
  cc2 TEXT,
  admin1 TEXT,
  admin2 TEXT,
  admin3 TEXT,
  admin4 TEXT,
  population INTEGER,
  elevation INTEGER,
  dem INTEGER,
  timezone TEXT,
  modification_date TEXT
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_cities_asciiname ON public.cities(asciiname);
CREATE INDEX IF NOT EXISTS idx_cities_name ON public.cities(name);
CREATE INDEX IF NOT EXISTS idx_cities_country ON public.cities(country_code);
CREATE INDEX IF NOT EXISTS idx_cities_coords ON public.cities(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_cities_population ON public.cities(population DESC);

-- Create search function
CREATE OR REPLACE FUNCTION search_cities(query TEXT)
RETURNS TABLE (
  geonameid INTEGER,
  name TEXT,
  asciiname TEXT,
  latitude FLOAT,
  longitude FLOAT,
  country_code TEXT,
  population INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    geonameid, 
    name, 
    asciiname,
    latitude, 
    longitude, 
    country_code,
    population
  FROM public.cities
  WHERE 
    asciiname ILIKE query || '%'
    OR name ILIKE query || '%'
  ORDER BY population DESC NULLS LAST
  LIMIT 20;
END;
$$;

-- Grant permissions
GRANT SELECT ON public.cities TO authenticated;
GRANT SELECT ON public.cities TO anon;
GRANT EXECUTE ON FUNCTION search_cities(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_cities(TEXT) TO anon;
