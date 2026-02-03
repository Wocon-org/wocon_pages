# Supabase 数据库设计

## 概述
本文档说明 Wocon 应用需要添加到 Supabase 的数据表和功能。

---

## 1. 用户相关表

### 1.1 `profiles` 表
扩展 `auth.users` 表的用户资料信息。

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  location VARCHAR(100),
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_location ON profiles(location);
```

---

## 2. 连接/好友相关表

### 2.1 `connections` 表
存储用户之间的好友关系。

```sql
CREATE TABLE connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  connected_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- 创建索引
CREATE INDEX idx_connections_user_id ON connections(user_id);
CREATE INDEX idx_connections_status ON connections(status);
```

### 2.2 `messages` 表
存储用户之间的聊天消息。

```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_messages_connection_id ON messages(connection_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

---

## 3. 行程相关表

### 3.1 `trips` 表
存储旅行行程信息。

```sql
CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  destination VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_travelers INTEGER DEFAULT 10,
  current_travelers INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'planning', -- planning, ongoing, completed, cancelled
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_trips_creator_id ON trips(creator_id);
CREATE INDEX idx_trips_destination ON trips(destination);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX idx_trips_status ON trips(status);
```

### 3.2 `trip_participants` 表
存储行程参与者。

```sql
CREATE TABLE trip_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- 创建索引
CREATE INDEX idx_trip_participants_trip_id ON trip_participants(trip_id);
CREATE INDEX idx_trip_participants_user_id ON trip_participants(user_id);
```

### 3.3 `trip_reviews` 表
存储行程评价。

```sql
CREATE TABLE trip_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- 创建索引
CREATE INDEX idx_trip_reviews_trip_id ON trip_reviews(trip_id);
```

---

## 4. 发现/推荐相关表

### 4.1 `destinations` 表
存储推荐目的地信息。

```sql
CREATE TABLE destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(50) NOT NULL,
  city VARCHAR(50),
  description TEXT,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  image_url TEXT,
  category VARCHAR(50), -- beach, mountain, urban, nature, etc.
  popularity_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_destinations_category ON destinations(category);
CREATE INDEX idx_destinations_popularity ON destinations(popularity_score DESC);
```

### 4.2 `activities` 表
存储活动/事件信息。

```sql
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  event_date DATE NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_activities_event_date ON activities(event_date);
CREATE INDEX idx_activities_destination_id ON activities(destination_id);
```

---

## 5. 插件相关表

### 5.1 `plugins` 表
存储可用插件信息。

```sql
CREATE TABLE plugins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  version VARCHAR(20),
  author VARCHAR(100),
  icon_url TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 `user_plugins` 表
存储用户启用的插件。

```sql
CREATE TABLE user_plugins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  settings JSONB,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plugin_id)
);

-- 创建索引
CREATE INDEX idx_user_plugins_user_id ON user_plugins(user_id);
```

---

## 6. 用户设置相关表

### 6.1 `user_settings` 表
存储用户个人设置。

```sql
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  theme VARCHAR(20) DEFAULT 'light', -- light, dark
  language VARCHAR(10) DEFAULT 'en',
  notification_enabled BOOLEAN DEFAULT TRUE,
  notification_email BOOLEAN DEFAULT TRUE,
  privacy_profile_visibility VARCHAR(20) DEFAULT 'public', -- public, friends, private
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. 存储桶 (Storage Buckets)

### 7.1 头像存储
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
```

### 7.2 行程图片存储
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('trip-images', 'trip-images', true);
```

### 7.3 目的地图片存储
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('destination-images', 'destination-images', true);
```

---

## 8. Row Level Security (RLS) 策略

### 8.1 Profiles
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看公开资料
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- 用户只能更新自己的资料
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

### 8.2 Connections
```sql
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的连接
CREATE POLICY "Users can view own connections"
ON connections FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- 用户可以创建连接
CREATE POLICY "Users can create connections"
ON connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的连接状态
CREATE POLICY "Users can update own connections"
ON connections FOR UPDATE
USING (auth.uid() = user_id);
```

### 8.3 Messages
```sql
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己相关的消息
CREATE POLICY "Users can view own messages"
ON messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- 用户可以发送消息
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- 接收者可以标记已读
CREATE POLICY "Recipients can update read status"
ON messages FOR UPDATE
USING (auth.uid() = recipient_id);
```

### 8.4 Trips
```sql
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看公开行程
CREATE POLICY "Trips are viewable by everyone"
ON trips FOR SELECT
USING (true);

-- 用户可以创建行程
CREATE POLICY "Users can create trips"
ON trips FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- 创建者可以更新自己的行程
CREATE POLICY "Users can update own trips"
ON trips FOR UPDATE
USING (auth.uid() = creator_id);
```

---

## 9. 实时功能 (Realtime)

启用以下表的实时订阅:
- `messages` - 实时聊天
- `connections` - 连接状态更新
- `trips` - 行程更新
- `trip_participants` - 参与者变化

```sql
-- 启用实时
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE connections;
ALTER PUBLICATION supabase_realtime ADD TABLE trips;
ALTER PUBLICATION supabase_realtime ADD TABLE trip_participants;
```

---

## 10. 函数和触发器

### 10.1 自动更新 updated_at
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 11. 初始数据

### 11.1 示例插件
```sql
INSERT INTO plugins (name, description, version, author, is_active) VALUES
('Weather', 'Get weather information for destinations', '1.0.0', 'Wocon Team', true),
('Currency Converter', 'Convert currencies for travel planning', '1.0.0', 'Wocon Team', true),
('Translator', 'Translate messages and descriptions', '1.0.0', 'Wocon Team', true);
```

---

## 12. 待实现功能

### 12.1 前端集成
- [ ] 用户认证 (登录/注册/登出)
- [ ] 资料管理
- [ ] 好友系统 (添加/接受/拒绝/删除)
- [ ] 实时聊天
- [ ] 行程创建/编辑/删除
- [ ] 行程参与者管理
- [ ] 目的地浏览
- [ ] 活动发布/参与
- [ ] 插件系统
- [ ] 搜索功能
- [ ] 通知系统

### 12.2 后端功能
- [ ] 图片上传
- [ ] 地理位置搜索
- [ ] 推荐算法
- [ ] 消息推送
- [ ] 数据统计

---

## 更新日志

- 2026-01-29: 初始版本,创建基础数据表结构
