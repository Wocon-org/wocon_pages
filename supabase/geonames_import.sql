-- ============================================
-- GeoNames Places 数据导入脚本
-- ============================================

-- 1. 创建 geonames_places 表
CREATE TABLE IF NOT EXISTS public.geonames_places (
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
  admin1_code TEXT,
  admin2_code TEXT,
  admin3_code TEXT,
  admin4_code TEXT,
  population INTEGER,
  elevation INTEGER,
  dem INTEGER,
  timezone TEXT,
  modification_date DATE
);

-- 2. 创建索引（提升查询性能）
CREATE INDEX IF NOT EXISTS idx_geonames_name ON public.geonames_places(name);
CREATE INDEX IF NOT EXISTS idx_geonames_latlng ON public.geonames_places(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_geonames_country ON public.geonames_places(country_code);

-- 3. 启用 RLS（可选，如果需要公开访问则设置 public）
ALTER TABLE public.geonames_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view places"
  ON public.geonames_places FOR SELECT
  USING (true);

-- ============================================
-- 导入说明
-- ============================================
-- 方法 1: 使用 psql 命令行导入（推荐）
-- psql -h [host] -U [user] -d [database] -c "\copy public.geonames_places FROM 'E:/ceaserzhao/cities500.txt' DELIMITER E'\t' CSV HEADER NULL ''"

-- 方法 2: 通过 Supabase SQL Editor 执行
-- 1. 将文件上传到 Supabase Storage
-- 2. 使用 SELECT pg_read_file() 读取并导入
