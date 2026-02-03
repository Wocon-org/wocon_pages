# 搜索功能后端开发指南

## 概述
本文档说明 Wocon 搜索功能的后端 API 开发规范,供团队参考。

---

## 1. 功能需求

### 1.1 搜索类型
- **目的地搜索** (Destinations) - 搜索城市/景点
- **用户搜索** (Users) - 搜索其他用户
- **行程搜索** (Trips) - 搜索公开行程

### 1.2 搜索功能
- 实时搜索建议
- 模糊搜索
- 地理位置过滤
- 搜索历史记录
- 热门搜索推荐

---

## 2. API 接口设计

### 2.1 通用搜索接口

#### GET `/api/search`

**描述**: 综合搜索,返回所有类型的结果

**请求参数**:
```typescript
interface SearchRequest {
  q: string              // 搜索关键词 (必需)
  type?: 'all' | 'destination' | 'user' | 'trip'  // 搜索类型,默认 'all'
  limit?: number         // 每种类型返回结果数,默认 5
  offset?: number        // 分页偏移量,默认 0
  lat?: number          // 用户当前纬度 (用于位置相关搜索)
  lng?: number          // 用户当前经度 (用于位置相关搜索)
  radius?: number       // 搜索半径(km),默认 100
}
```

**响应格式**:
```typescript
interface SearchResponse {
  success: boolean
  data: {
    destinations?: SearchResult[]
    users?: SearchResult[]
    trips?: SearchResult[]
  }
  total: number
}

interface SearchResult {
  id: string
  type: 'destination' | 'user' | 'trip'
  title: string
  subtitle: string
  lat: number
  lng: number
  image?: string
  distance?: number  // 与当前位置距离(km)
  [key: string]: any  // 扩展字段
}
```

**示例请求**:
```
GET /api/search?q=tokyo&type=all&limit=5
```

**示例响应**:
```json
{
  "success": true,
  "data": {
    "destinations": [
      {
        "id": "dest-1",
        "type": "destination",
        "title": "Tokyo, Japan",
        "subtitle": "Popular city destination",
        "lat": 35.6762,
        "lng": 139.6503,
        "image": "https://example.com/tokyo.jpg",
        "distance": 0
      }
    ],
    "users": [
      {
        "id": "user-1",
        "type": "user",
        "title": "Tokyo Explorer",
        "subtitle": "@tokyo_explorer",
        "lat": 35.6895,
        "lng": 139.6917,
        "image": "https://example.com/avatar1.jpg",
        "distance": 2.5
      }
    ],
    "trips": [
      {
        "id": "trip-1",
        "type": "trip",
        "title": "Tokyo Adventure",
        "subtitle": "Jan 15 - Jan 22, 2026",
        "lat": 35.6762,
        "lng": 139.6503,
        "image": "https://example.com/trip1.jpg",
        "distance": 0
      }
    ]
  },
  "total": 3
}
```

---

### 2.2 目的地搜索

#### GET `/api/search/destinations`

**请求参数**:
```typescript
interface DestinationSearchRequest {
  q: string
  country?: string
  city?: string
  category?: string  // beach, mountain, urban, nature, etc.
  limit?: number
  offset?: number
  sort?: 'relevance' | 'popularity' | 'distance'
  lat?: number
  lng?: number
  radius?: number
}
```

**Supabase 查询示例**:
```sql
SELECT
  id,
  name,
  country,
  city,
  description,
  lat,
  lng,
  image_url,
  category,
  popularity_score
FROM destinations
WHERE
  -- 模糊搜索
  (name ILIKE '%' || $1 || '%' OR
   description ILIKE '%' || $1 || '%' OR
   city ILIKE '%' || $1 || '%' OR
   country ILIKE '%' || $1 || '%')

  -- 可选过滤器
  AND ($2 IS NULL OR category = $2)
  AND ($3 IS NULL OR country = $3)
  AND ($4 IS NULL OR city = $4)

  -- 可选距离过滤
  AND ($5 IS NULL OR $6 IS NULL OR
    earth_distance(
      make_point(lat, lng),
      make_point($5, $6)
    ) <= $7 * 1000)  -- radius in meters

ORDER BY
  CASE
    WHEN $8 = 'popularity' THEN popularity_score
    ELSE 0
  END DESC,

  CASE
    WHEN $8 = 'distance' THEN
      earth_distance(make_point(lat, lng), make_point($5, $6))
    ELSE 0
  END ASC,

  name ILIKE $1 || '%' DESC  -- 前缀匹配优先

LIMIT $9 OFFSET $10;
```

---

### 2.3 用户搜索

#### GET `/api/search/users`

**请求参数**:
```typescript
interface UserSearchRequest {
  q: string
  status?: 'all' | 'online' | 'offline'  // 用户在线状态
  location?: string  // 用户所在城市
  limit?: number
  offset?: number
}
```

**Supabase 查询示例**:
```sql
SELECT
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.bio,
  p.location,
  -- 在线状态 (需要实时功能)
  (SELECT COUNT(*) FROM user_sessions us WHERE us.user_id = p.id AND us.last_active > NOW() - INTERVAL '5 minutes') > 0 as is_online
FROM profiles p
WHERE
  -- 模糊搜索用户名或全名
  (p.username ILIKE '%' || $1 || '%' OR
   p.full_name ILIKE '%' || $1 || '%' OR
   p.bio ILIKE '%' || $1 || '%')

  -- 可选过滤器
  AND ($2 IS NULL OR p.location = $2)

  -- 在线状态过滤
  AND (
    $3 = 'all' OR
    ($3 = 'online' AND (SELECT COUNT(*) FROM user_sessions us WHERE us.user_id = p.id AND us.last_active > NOW() - INTERVAL '5 minutes') > 0) OR
    ($3 = 'offline' AND (SELECT COUNT(*) FROM user_sessions us WHERE us.user_id = p.id AND us.last_active > NOW() - INTERVAL '5 minutes') = 0)
  )

ORDER BY
  CASE WHEN p.username ILIKE $1 || '%' THEN 1 ELSE 2 END,  -- 前缀匹配优先
  p.full_name

LIMIT $4 OFFSET $5;
```

---

### 2.4 行程搜索

#### GET `/api/search/trips`

**请求参数**:
```typescript
interface TripSearchRequest {
  q: string
  destination?: string
  start_date?: string  // YYYY-MM-DD
  end_date?: string
  min_travelers?: number
  max_travelers?: number
  status?: 'planning' | 'ongoing' | 'completed'
  limit?: number
  offset?: number
  sort?: 'relevance' | 'date' | 'travelers'
}
```

**Supabase 查询示例**:
```sql
SELECT
  t.id,
  t.title,
  t.description,
  t.destination,
  t.lat,
  t.lng,
  t.start_date,
  t.end_date,
  t.max_travelers,
  t.current_travelers,
  t.status,
  t.image_url,
  -- 创建者信息
  p.username,
  p.avatar_url,
  -- 计算参与度
  CASE
    WHEN t.current_travelers >= t.max_travelers THEN 'full'
    WHEN t.current_travelers > t.max_travelers * 0.7 THEN 'almost_full'
    ELSE 'available'
  END as availability
FROM trips t
JOIN profiles p ON t.creator_id = p.id
WHERE
  t.status = 'planning'  -- 只显示规划中的行程

  -- 模糊搜索
  AND (t.title ILIKE '%' || $1 || '%' OR
       t.description ILIKE '%' || $1 || '%' OR
       t.destination ILIKE '%' || $1 || '%')

  -- 可选过滤器
  AND ($2 IS NULL OR t.destination = $2)
  AND ($3 IS NULL OR t.start_date >= $3)
  AND ($4 IS NULL OR t.end_date <= $4)
  AND ($5 IS NULL OR t.current_travelers >= $5)
  AND ($6 IS NULL OR t.current_travelers <= $6)

  -- 排序
  ORDER BY
    CASE
      WHEN $7 = 'date' THEN t.start_date
      WHEN $7 = 'travelers' THEN t.current_travelers
      ELSE t.created_at
    END DESC

LIMIT $8 OFFSET $9;
```

---

## 3. Supabase 数据库扩展

### 3.1 安装 PostGIS 扩展 (用于地理位置搜索)

```sql
-- 启用 PostGIS 扩展
CREATE EXTENSION IF NOT EXISTS postgis;

-- 创建地理位置索引
CREATE INDEX idx_destinations_location ON destinations USING GIST (point(lat, lng));
CREATE INDEX idx_trips_location ON trips USING GIST (point(lat, lng));
```

### 3.2 全文搜索优化

```sql
-- 为搜索字段创建 GIN 索引
CREATE INDEX idx_destinations_fulltext ON destinations
  USING GIN (to_tsvector('english', name || ' ' || description || ' ' || city || ' ' || country));

CREATE INDEX idx_profiles_fulltext ON profiles
  USING GIN (to_tsvector('english', username || ' ' || full_name || ' ' || bio));

CREATE INDEX idx_trips_fulltext ON trips
  USING GIN (to_tsvector('english', title || ' ' || description || ' ' || destination));
```

### 3.3 全文搜索函数

```sql
-- 创建全文搜索函数
CREATE OR REPLACE FUNCTION search_destinations(query TEXT)
RETURNS TABLE(id UUID, rank float) AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, ts_rank(d.search_vector, query) as rank
  FROM destinations d
  WHERE d.search_vector @@ query
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;
```

---

## 4. 前端集成

### 4.1 搜索服务

```typescript
// src/services/searchService.ts

import { supabase } from '@/lib/supabase'

export interface SearchParams {
  q: string
  type?: 'all' | 'destination' | 'user' | 'trip'
  limit?: number
  offset?: number
  lat?: number
  lng?: number
  radius?: number
}

export async function searchAPI(params: SearchParams) {
  const {
    q,
    type = 'all',
    limit = 5,
    offset = 0,
    lat,
    lng,
    radius = 100
  } = params

  const queries = []

  // 目的地搜索
  if (type === 'all' || type === 'destination') {
    const { data: destinations } = await supabase
      .from('destinations')
      .select('*')
      .ilike('name', `%${q}%`)
      .limit(limit)
      .offset(offset)

    queries.push(destinations?.map(d => ({
      ...d,
      type: 'destination',
      title: d.name,
      subtitle: d.city ? `${d.city}, ${d.country}` : d.country
    })))
  }

  // 用户搜索
  if (type === 'all' || type === 'user') {
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${q}%`)
      .limit(limit)
      .offset(offset)

    queries.push(users?.map(u => ({
      ...u,
      type: 'user',
      title: u.full_name || u.username,
      subtitle: `@${u.username}`
    })))
  }

  // 行程搜索
  if (type === 'all' || type === 'trip') {
    const { data: trips } = await supabase
      .from('trips')
      .select(`
        *,
        profiles (
          username,
          avatar_url
        )
      `)
      .ilike('title', `%${q}%`)
      .eq('status', 'planning')
      .limit(limit)
      .offset(offset)

    queries.push(trips?.map(t => ({
      ...t,
      type: 'trip',
      title: t.title,
      subtitle: `${t.destination} • ${t.current_travelers}/${t.max_travelers}`
    })))
  }

  return {
    success: true,
    data: {
      destinations: queries[0] || [],
      users: queries[1] || [],
      trips: queries[2] || []
    },
    total: queries.reduce((sum, arr) => sum + (arr?.length || 0), 0)
  }
}
```

---

## 5. 性能优化

### 5.1 搜索优化
- 使用全文搜索索引
- 实现搜索缓存
- 防抖搜索请求 (300ms)
- 分页加载

### 5.2 数据库优化
- 为常用查询字段创建索引
- 使用连接池
- 启用查询缓存
- 考虑使用 Redis 缓存热门搜索结果

---

## 6. 待实现功能

- [ ] 基础搜索功能
- [ ] 实时搜索建议
- [ ] 搜索历史记录
- [ ] 热门搜索推荐
- [ ] 地理位置搜索
- [ ] 搜索结果高亮
- [ ] 搜索统计

---

## 7. 开发检查清单

### 后端团队
- [ ] 创建 Supabase 搜索函数
- [ ] 实现搜索 API 端点
- [ ] 添加数据库索引
- [ ] 性能测试
- [ ] 编写 API 文档

### 前端团队
- [ ] 创建搜索服务
- [ ] 实现 SearchBar 组件
- [ ] 对接搜索 API
- [ ] 添加加载状态
- [ ] 错误处理
- [ ] 测试不同搜索场景

---

## 更新日志

- 2026-01-29: 初始版本,定义搜索 API 规范
