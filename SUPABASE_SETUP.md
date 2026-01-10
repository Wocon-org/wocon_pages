# wocon Supabase 后端集成指南

> 本文档说明如何将 wocon 项目与 Supabase 后端对接

---

## 📋 已完成的文件

### 1. 数据库 Schema
- **文件**: `supabase/schema.sql`
- **内容**:
  - ✅ `profiles` 表 - 用户档案
  - ✅ `trips` 表 - 行程信息
  - ✅ `trip_participants` 表 - 行程参与者
  - ✅ `map_markers` 表 - 地图标记
  - ✅ `routes` 表 - 路线规划
  - ✅ Row Level Security (RLS) 策略
  - ✅ 自动更新 `updated_at` 的触发器
  - ✅ 新用户自动创建 profile 的触发器
  - ✅ Storage Buckets (avatars, trip-covers, marker-images)
  - ✅ Storage 策略
  - ✅ 视图 `trips_with_participants`

### 2. TypeScript 类型定义
- **文件**: `src/types/index.ts`
- **内容**:
  - ✅ Profile 接口
  - ✅ Trip 接口
  - ✅ TripParticipant 接口
  - ✅ MapMarker 接口
  - ✅ Route 接口
  - ✅ 创建/更新输入类型

### 3. API 函数库
- **文件**: `src/lib/api.ts`
- **内容**:
  - ✅ 认证函数 (signUp, signIn, signOut, getCurrentUser)
  - ✅ Profile CRUD (getProfile, updateProfile, updateAvatar)
  - ✅ Trip CRUD (getTrips, getTripById, createTrip, updateTrip, deleteTrip)
  - ✅ 参与者管理 (joinTrip, acceptParticipant, leaveTrip)
  - ✅ Map 标记 CRUD (createMarker, updateMarker, deleteMarker)
  - ✅ 路线 CRUD (createRoute, updateRoute, deleteRoute)
  - ✅ Storage 上传 (uploadAvatar, uploadTripCover, uploadMarkerImage)

---

## 🚀 下一步操作

### 第一步：在 Supabase 中执行 SQL

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 创建新查询
5. 复制 `supabase/schema.sql` 的全部内容
6. 点击 **Run** 执行 SQL

这将创建所有表、策略、触发器和 Storage buckets。

### 第二步：验证数据库结构

在 Supabase Dashboard 中检查：
- **Table Editor** - 应该看到 5 个表：
  - profiles
  - trips
  - trip_participants
  - map_markers
  - routes
- **Storage** - 应该看到 3 个 buckets：
  - avatars
  - trip-covers
  - marker-images

### 第三步：更新前端代码

#### 更新 CreateTrip.vue
修复拼写错误并对接 API：

```typescript
// 修复拼写
const tripType = ref<'private' | 'recruiting'>('private')

// 添加导入
import { createTrip } from '@/lib/api'

// 更新 handleSubmit 函数
const handleSubmit = async (e: Event) => {
  e.preventDefault()

  if (!tripName.value.trim()) {
    message.value = 'Please enter a trip name'
    return
  }

  loading.value = true
  message.value = ''

  try {
    const { data: trip, error } = await createTrip({
      name: tripName.value.trim(),
      description: description.value.trim() || undefined,
      type: tripType.value,
      max_participants: maxParticipants.value,
      is_public: isPublic.value,
    })

    if (error) {
      message.value = error.message
      loading.value = false
      return
    }

    message.value = 'Trip created successfully!'

    // TODO: Redirect to trip detail page
    setTimeout(() => {
      router.push(`/trips/${trip?.id}`)
    }, 1500)
  } catch (error: any) {
    message.value = error.message || 'Failed to create trip'
    loading.value = false
  }
}
```

#### 更新 Signup.vue
确保注册后自动创建 profile（已由触发器处理，但需要保存 username）：

```typescript
const signup = async () => {
  loading.value = true
  message.value = ''

  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: { username: username.value }, // 重要：传递 username
    },
  })
  // ... 其余代码
}
```

#### 更新 Profile.vue
使用新的 API 函数：

```typescript
import { getProfile, updateProfile, uploadAvatar } from '@/lib/api'

onMounted(async () => {
  const { user, error: userError } = await getCurrentUser()

  if (user) {
    const { data, error } = await getProfile(user.id)
    if (!error && data) {
      profile.value = data
    }
  }
})

const handleAvatarUpload = async (file: File) => {
  const user = (await getCurrentUser()).user
  if (!user) return

  loading.value = true
  const { data, error } = await uploadAvatar(user.id, file)

  if (!error && data) {
    await updateProfile(user.id, { avatar_url: data.url })
    profile.value.avatar_url = data.url
  }

  loading.value = false
}
```

---

## 🔐 Row Level Security (RLS) 说明

所有表都启用了 RLS，确保数据安全：

### profiles 表
- ✅ 任何人可以查看公开的 profile 信息
- ✅ 用户只能创建自己的 profile
- ✅ 用户只能更新自己的 profile

### trips 表
- ✅ 公开行程任何人可见
- ✅ 用户只能创建自己的行程
- ✅ 用户只能更新/删除自己的行程

### trip_participants 表
- ✅ 只有行程 owner 和参与者可以查看
- ✅ 用户可以申请加入行程
- ✅ 用户只能更新/删除自己的参与记录

### map_markers & routes 表
- ✅ 只有行程 owner 和接受邀请的参与者可以查看/创建
- ✅ 创建者可以更新/删除自己的标记/路线

---

## 📊 测试 API

### 测试用户注册
```typescript
import { signUp } from '@/lib/api'

const result = await signUp('test@qq.com', 'password123', 'testuser')
```

### 测试创建行程
```typescript
import { createTrip } from '@/lib/api'

const result = await createTrip({
  name: 'My First Trip',
  type: 'recruiting',
  max_participants: 5,
  is_public: true,
})
```

### 测试获取行程列表
```typescript
import { getTrips } from '@/lib/api'

const { data: publicTrips } = await getTrips({ is_public: true })
const { data: recruitingTrips } = await getTrips({ type: 'recruiting' })
```

---

## ⚠️ 注意事项

1. **环境变量**: 确保 `.env` 文件已正确配置
2. **拼写错误**: `recruiting` 不是 `recruiting`
3. **类型一致性**: API 函数返回类型与 TypeScript 定义匹配
4. **错误处理**: 所有 API 调用都应检查 `error` 字段
5. **认证状态**: 使用 `supabase.auth.onAuthStateChange` 监听认证变化

---

## 📚 参考文档

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🐛 常见问题

### Q: 为什么看不到数据？
A: 检查 RLS 策略是否正确配置，确保用户有权限访问数据。

### Q: 如何查看 SQL 执行日志？
A: 在 Supabase Dashboard → Database → Logs 中查看。

### Q: 如何重置数据库？
A: 在 SQL Editor 中执行 `TRUNCATE` 或 `DROP` 语句，或创建新项目。

### Q: Storage 上传失败？
A: 检查 Storage 策略，确保 bucket 存在且有正确的权限。

---

**最后更新**: 2026-01-08
