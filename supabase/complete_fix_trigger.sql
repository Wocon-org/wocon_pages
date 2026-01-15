-- ============================================
-- Apply Nickname and Trigger Fix - 修正版
-- ============================================

-- Step 1: Drop all dependent triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_trips_updated_at ON public.trips;
DROP TRIGGER IF EXISTS update_map_markers_updated_at ON public.map_markers;
DROP TRIGGER IF EXISTS update_routes_updated_at ON public.routes;

-- Step 2: Drop the general function
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Step 3: 为每个表创建独立的函数
-- profiles 表的 updated_at 处理器
CREATE OR REPLACE FUNCTION public.handle_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trips 表的 updated_at 处理器
CREATE OR REPLACE FUNCTION public.handle_trips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- map_markers 表的 updated_at 处理器
CREATE OR REPLACE FUNCTION public.handle_map_markers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- routes 表的 updated_at 处理器
CREATE OR REPLACE FUNCTION public.handle_routes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: 先检查表是否有 updated_at 列，然后再创建触发器
DO $$
BEGIN
  -- 检查并创建 profiles 表的触发器
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.handle_profiles_updated_at();
  END IF;

  -- 检查并创建 trips 表的触发器
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'trips' 
    AND column_name = 'updated_at'
  ) THEN
    CREATE TRIGGER update_trips_updated_at
      BEFORE UPDATE ON public.trips
      FOR EACH ROW EXECUTE FUNCTION public.handle_trips_updated_at();
  END IF;

  -- 检查并创建 map_markers 表的触发器
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'map_markers' 
    AND column_name = 'updated_at'
  ) THEN
    CREATE TRIGGER update_map_markers_updated_at
      BEFORE UPDATE ON public.map_markers
      FOR EACH ROW EXECUTE FUNCTION public.handle_map_markers_updated_at();
  END IF;

  -- 检查并创建 routes 表的触发器
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'routes' 
    AND column_name = 'updated_at'
  ) THEN
    CREATE TRIGGER update_routes_updated_at
      BEFORE UPDATE ON public.routes
      FOR EACH ROW EXECUTE FUNCTION public.handle_routes_updated_at();
  END IF;
END $$;

-- Step 5: 为没有 updated_at 列的表添加该列
DO $$
BEGIN
  -- profiles 表
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
  END IF;

  -- trips 表
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'trips' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.trips ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
  END IF;

  -- map_markers 表
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'map_markers' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.map_markers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
  END IF;

  -- routes 表
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'routes' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.routes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
  END IF;
END $$;

-- Step 6: 重新创建触发器（现在所有表都有 updated_at 列了）
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_trips_updated_at ON public.trips;
DROP TRIGGER IF EXISTS update_map_markers_updated_at ON public.map_markers;
DROP TRIGGER IF EXISTS update_routes_updated_at ON public.routes;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profiles_updated_at();

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_trips_updated_at();

CREATE TRIGGER update_map_markers_updated_at
  BEFORE UPDATE ON public.map_markers
  FOR EACH ROW EXECUTE FUNCTION public.handle_map_markers_updated_at();

CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.handle_routes_updated_at();

-- Step 7: 继续执行原脚本的 nickname 相关部分
-- Add nickname column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nickname'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN nickname TEXT;
  END IF;
END $$;

-- Step 8: Update existing profiles to use username as nickname
UPDATE public.profiles
SET nickname = username
WHERE nickname IS NULL;

-- Step 9: Update the auth trigger to handle nickname
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

-- Step 10: Update the view to include nickname
DROP VIEW IF EXISTS public.trips_with_participants;

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