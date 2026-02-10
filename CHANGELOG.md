# woconapp 更新日志

## 2026-02-10 - Supabase 迁移修复 & OAuth 集成

### 🛠 数据库 / Supabase
- 新增 `00000000000000_cleanup_conflicts.sql` 迁移，在 `init_schema.sql` 之前清理重复的 RLS 策略和触发器，修复 `policy ... already exists` 报错
- 更新 `20260209122025_fix_triggers.sql`，将 `handle_updated_at()` 改为 `CREATE OR REPLACE FUNCTION`，避免因依赖关系导致 `cannot drop function` 错误，并保持 `feedbacks` 等表的触发器可用
- 使用 `supabase db push` 将本地 schema 同步到远程项目（`kpauppfsdtaoqolhmsbp`）

### 🔐 认证 / OAuth
- 为 GitHub OAuth 登录添加 `/login/callback` 路由，并在 `Login.vue` 中统一使用 `window.location.origin + '/login/callback'` 作为 `redirectTo`
- 补充并验证 `docs/oauth.md` 中的回调地址和使用方式，确保开发环境与生产环境的配置一致

### 🧰 开发体验
- 验证 Supabase CLI 链接配置（通过 `supabase/.temp/project-ref`），记录 `db diff` / `db pull` 对 Docker 的依赖，并推荐优先使用 `db push` 同步 schema

## 2026-02-01 - 史诗级大更新 v2.0

### 🎨 全新UI设计 (仿Google Earth)
- 左侧固定侧边栏 (80px宽度)
- 组件化设计：每个功能都是独立面板
- 可拖拽浮动面板 (Draggable组件)
- 当前激活项图标填充黑色，其余灰色轮廓

### 🚀 核心功能

#### 1. 搜索系统
- 集成 Cloudflare Workers API
- 导入 GeoNames 城市数据库 (200K+ 城市)
- 实时城市搜索 (防抖300ms)
- 搜索结果地图跳转 (flyTo动画)
- 支持 Supabase 和 Worker 双重架构

#### 2. 组件系统
- **Sidebar**: 导航侧栏 (Home/Connections/Search/Discover/More)
- **SearchBar**: 可拖拽搜索面板
- **ConnectionsPanel**: 联系人管理 (空状态，待接入数据)
- **PluginPanel**: 插件管理
- **Panel**: 通用面板容器
- **Draggable**: 可拖拽组件包装器
- **WorldMap**: 世界地图组件 (暗色/卫星图层切换)

#### 3. TopBar 工具栏
- 图层切换 (深色/卫星地图)
- GitHub 链接
- Download 按钮
- Settings 页面导航
- Profile 页面导航

#### 4. Preloader 加载动画
- 渐变文字 "Wocon"
- 旋转加载图标
- 页面加载/登录时显示

### 🏗️ 技术架构

#### Cloudflare Workers
- `functions/search/`: 搜索API
- `functions/shared/supabase.ts`: Supabase客户端封装
- CORS支持
- 错误处理和响应助手

#### 数据库
- `cities` 表: GeoNames城市数据
- `search_cities` 函数: 城市搜索RPC
- 5个索引优化查询性能
- RLS权限配置

#### 前端API客户端
- `src/lib/api.ts`: 统一API调用
- Worker优先，Supabase fallback机制
- TypeScript类型支持

### 📦 新增文件
```
functions/
├── README.md
├── search/index.ts
└── shared/supabase.ts

src/components/
├── Preloader.vue
├── Sidebar.vue
├── TopBar.vue
├── WorldMap.vue
├── common/
│   ├── Draggable.vue
│   └── Panel.vue
└── panels/
    ├── ConnectionsPanel.vue
    ├── PluginPanel.vue
    └── SearchBar.vue

src/lib/
└── api.ts

文档/
├── GEONAMES_IMPORT_PLAN.md
├── SEARCH_API_GUIDE.md
├── SUPABASE_DATA_SCHEMA.md
├── UPDATE_PLAN.md
└── CLOUDFLARE_DEPLOYMENT.md
```

### 🔧 配置更新
- `wrangler.toml`: Cloudflare Workers配置
- 环境变量配置 (Supabase URL/Key)

---

## 2025-01-24

### ✅ 已完成功能

#### 认证系统
- 修复用户注册登录问题
- 添加 `get_profile_by_username` RPC 函数
- 优化触发器错误处理
- 禁用邮件验证(开发模式)

#### Connections (人脉) 功能
- 实现好友列表显示
- 实现好友请求管理(接受/拒绝)
- 实现用户搜索功能
- 添加 Connections 页面搜索框
- 实现发送好友请求功能
- 追踪已发送的好友请求状态

#### 数据库
- 修复 `on_auth_user_created` 触发器
- 添加 `friends_handle_updated_at` 触发器
- 创建 `user_friends` 视图

#### UI/UX
- 修复首页设置按钮 SVG 图标
- 优化 Connections 页面布局
- 添加搜索结果实时显示

---

## 待实现功能

### 1. 官方说明文档
- 编写项目说明文档
- 添加使用指南

### 2. 完整的创建旅程功能
- 完善 CreateTrip.vue 功能
- 优化 UI 设计
- 添加地图标记集成

### 3. 搜索功能(地理位置)
- 上传 geonames 数据库到 Supabase
- 与地图集成坐标数据
- 实现地点搜索

### 4. 首页其他选项卡
- **Discover (发现)** - 推荐公开行程
- **Home (家)** - 显示我的行程

---

## 技术栈

- **前端框架**: Vue 3 + TypeScript + Vite
- **UI 组件**: 自定义组件
- **地图**: Leaflet
- **后端**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Supabase Storage

---

## 开发环境

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm run test:unit
npm run test:e2e

# 代码检查
npm run lint
```
