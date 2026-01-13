# wocon 项目结构文档

> wocon - Social Map Platform

---

## 📁 项目目录结构

```
woconapp/
├── public/                      # 静态资源
│   ├── woconlogo.png           # Logo 图片
│   └── favicon.ico
│
├── src/
│   ├── main.ts                 # 应用入口
│   ├── App.vue                 # 根组件
│   │
│   ├── assets/                 # 资源文件
│   │   ├── images/             # 图片资源
│   │   │   └── [待添加]
│   │   └── icons/              # 图标资源
│   │       └── [待添加]
│   │
│   ├── components/             # Vue 组件
│   │   ├── common/             # 通用组件
│   │   │   ├── Sidebar.vue    # 侧边栏组件
│   │   │   ├── Logo.vue       # Logo 组件
│   │   │   ├── Button.vue     # 按钮组件
│   │   │   ├── Input.vue      # 输入框组件
│   │   │   ├── Modal.vue      # 模态框组件
│   │   │   ├── Loading.vue    # 加载组件
│   │   │   └── ErrorMessage.vue # 错误提示组件
│   │   │
│   │   ├── map/               # 地图组件 (woconOSM)
│   │   │   ├── WoconMap.vue   # 主地图组件
│   │   │   ├── MapMarker.vue  # 地图标记
│   │   │   ├── MapRoute.vue   # 地图路线
│   │   │   ├── MapSearch.vue  # 地图搜索
│   │   │   ├── MapControl.vue# 地图控制面板
│   │   │   ├── MapLayerControl.vue # 图层控制
│   │   │   └── MarkerPopup.vue # 标记弹窗
│   │   │
│   │   ├── trip/              # 行程相关组件
│   │   │   ├── TripCard.vue   # 行程卡片
│   │   │   ├── TripList.vue   # 行程列表
│   │   │   ├── TripFilter.vue # 行程筛选
│   │   │   ├── ParticipantAvatar.vue # 参与者头像
│   │   │   ├── InviteForm.vue # 邀请表单
│   │   │   └── RouteEditor.vue # 路线编辑器
│   │   │
│   │   └── auth/              # 认证组件
│   │       ├── LoginForm.vue  # 登录表单
│   │       ├── SignupForm.vue # 注册表单
│   │       └── AuthGuard.vue  # 路由守卫
│   │
│   ├── composables/           # 组合式函数
│   │   ├── useAuth.ts         # 认证相关
│   │   ├── useMap.ts          # 地图相关
│   │   ├── useTrip.ts         # 行程相关
│   │   ├── useMarker.ts       # 标记相关
│   │   └── useRoute.ts        # 路线相关
│   │
│   ├── hooks/                 # React Hooks 风格（如有需要）
│   │   └── [待添加]
│   │
│   ├── utils/                 # 工具函数
│   │   ├── validation.ts      # 验证函数
│   │   ├── format.ts          # 格式化函数
│   │   ├── debounce.ts        # 防抖函数
│   │   └── storage.ts         # 本地存储
│   │
│   ├── constants/             # 常量定义
│   │   ├── emailDomains.ts    # 允许的邮箱域名
│   │   ├── mapConfig.ts       # 地图配置
│   │   └── appConfig.ts       # 应用配置
│   │
│   ├── config/                # 配置文件
│   │   └── env.ts             # 环境变量配置
│   │
│   ├── styles/                # 全局样式
│   │   ├── main.css           # 主样式文件
│   │   ├── variables.css      # CSS 变量
│   │   ├── reset.css          # 样式重置
│   │   └── common.css         # 通用样式
│   │
│   ├── stores/                # Pinia 状态管理
│   │   ├── index.ts           # Store 入口
│   │   ├── counter.ts         # 示例 store（可删除）
│   │   └── modules/           # Store 模块
│   │       ├── auth.ts        # 认证状态
│   │       ├── map.ts         # 地图状态
│   │       ├── trip.ts        # 行程状态
│   │       └── user.ts        # 用户状态
│   │
│   ├── types/                 # TypeScript 类型定义
│   │   └── index.ts           # 类型导出
│   │
│   ├── lib/                   # 第三方库封装
│   │   ├── supabase.ts        # Supabase 客户端
│   │   └── api.ts             # API 函数
│   │
│   ├── router/                # 路由配置
│   │   └── index.ts           # 路由定义
│   │
│   └── views/                 # 页面组件
│       ├── Home.vue           # 首页（左侧 Leaflet 地图，右侧四选项卡：搜索/人脉/发现/家）
│       ├── Login.vue          # 登录页
│       ├── Signup.vue         # 注册页
│       ├── Profile.vue        # 个人资料页
│       ├── Map.vue            # 地图页
│       ├── CreateTrip.vue     # 创建行程页
│       ├── Settings.vue       # 设置页
│       │
│       ├── trips/             # 行程相关页面
│       │   ├── TripDetail.vue         # 行程详情
│       │   ├── TripMap.vue            # 行程地图
│       │   ├── TripParticipants.vue   # 参与者管理
│       │   ├── TripSettings.vue       # 行程设置
│       │   └── RoutePlanning.vue      # 路线规划
│       │
│       └── public/            # 公共页面
│           ├── Explore.vue            # 探索页
│           ├── Trending.vue           # 热门目的地
│           └── TripSearch.vue         # 行程搜索
│
├── __tests__/                 # 测试文件
│   ├── unit/                  # 单元测试
│   └── e2e/                   # E2E 测试
│
├── supabase/                  # Supabase 相关
│   └── schema.sql             # 数据库 schema
│
├── .env                       # 环境变量（本地）
├── .env.example               # 环境变量示例
├── .gitignore                 # Git 忽略文件
├── .codebuddy/                # 项目元数据
├── package.json               # 项目依赖
├── tsconfig.json              # TypeScript 配置
├── tsconfig.app.json          # App TypeScript 配置
├── tsconfig.node.json         # Node TypeScript 配置
├── vite.config.ts             # Vite 配置
├── vitest.config.ts           # Vitest 配置
├── playwright.config.ts        # Playwright 配置
├── eslint.config.ts           # ESLint 配置
├── index.html                 # HTML 入口
├── README.md                  # 项目说明
├── PROJECT_STRUCTURE.md       # 项目结构文档（本文件）
└── SUPABASE_SETUP.md          # Supabase 集成文档
```

---

## 📂 目录说明

### `/src/assets/`
- 存放静态资源：图片、图标、字体等
- 避免在组件中直接使用外部链接，优先使用本地资源

### `/src/components/`
- Vue 可复用组件
- 按功能分类：通用、布局、地图、行程、认证

### `/src/composables/`
- Vue 3 Composition API 的组合式函数
- 封装可复用的逻辑：认证、地图、行程等

### `/src/utils/`
- 纯工具函数，不依赖 Vue
- 验证、格式化、防抖等

### `/src/constants/`
- 应用常量：邮箱域名白名单、地图默认配置等

### `/src/config/`
- 配置文件，基于环境变量
- 开发/生产环境切换

### `/src/styles/`
- 全局样式和 CSS 变量
- 统一设计系统：颜色、间距、字体

### `/src/stores/`
- Pinia 状态管理
- 按模块划分：auth、map、trip、user

### `/src/types/`
- TypeScript 类型定义
- 与数据库 schema 同步

### `/src/lib/`
- 第三方库封装
- Supabase 客户端和 API 函数

### `/src/router/`
- Vue Router 配置
- 路由守卫、懒加载

### `/src/views/`
- 页面级组件
- 对应路由路径

---

## 🗂️ 文件命名规范

### 组件文件
- **PascalCase**: `TripCard.vue`, `WoconMap.vue`
- 布局组件：`Header.vue`, `Footer.vue`
- 功能组件：`MapMarker.vue`, `InviteForm.vue`

### 工具函数
- **camelCase**: `validation.ts`, `format.ts`
- 组合式函数：`useAuth.ts`, `useMap.ts`

### 常量文件
- **camelCase**: `emailDomains.ts`, `mapConfig.ts`

### 样式文件
- **kebab-case**: `main.css`, `variables.css`

### 类型文件
- **PascalCase**: `index.ts` (统一导出)

---

## 🔄 组件层级关系

```
App.vue
└── PageLayout.vue
    ├── Header.vue
    │   └── Logo.vue
    ├── Main Content
    │   ├── Home.vue
    │   ├── Map.vue
    │   │   └── WoconMap.vue
    │   │       ├── MapControl.vue
    │   │       ├── MapSearch.vue
    │   │       ├── MapMarker.vue
    │   │       ├── MapRoute.vue
    │   │       └── MarkerPopup.vue
    │   ├── CreateTrip.vue
    │   │   └── InviteForm.vue
    │   └── TripDetail.vue
    │       ├── TripCard.vue
    │       ├── TripMap.vue
    │       └── ParticipantAvatar.vue
    └── Footer.vue
```

---

## 📦 模块依赖关系

```
views/
  ├── composables/
  ├── components/
  ├── stores/
  └── lib/api.ts
      ├── lib/supabase.ts
      └── types/index.ts
```

**依赖规则**：
- Views 可以使用 Components、Composables、Stores
- Components 可以使用 Composables、Stores、Utils
- Composables 可以使用 Stores、Utils、Lib
- Utils 和 Lib 不依赖任何业务模块

---

## 🎨 样式组织

### CSS 变量 (`src/styles/variables.css`)
```css
:root {
  /* Colors */
  --color-primary: #667eea;
  --color-secondary: #764ba2;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

### 全局样式 (`src/styles/main.css`)
```css
@import './variables.css';
@import './reset.css';
@import './common.css';

/* App-specific styles */
```

---

## 🚀 路由结构规划

```
/                           # 首页（需认证，左侧 Leaflet 地图，右侧四选项卡）
/login                      # 登录（游客专属）
/signup                     # 注册（游客专属）
/profile                    # 个人资料（需认证）
/map                        # 地图（需认证）
/create-trip                 # 创建行程（需认证）
/settings                   # 设置（需认证）

# 行程相关（待开发）
/trips                      # 行程列表
/trips/:id                  # 行程详情
/trips/:id/map              # 行程地图
/trips/:id/participants     # 参与者
/trips/:id/settings         # 行程设置
/trips/:id/route-planning   # 路线规划
/trips/create               # 创建行程

# 公共页面（待开发）
/explore                    # 探索
/trending                   # 热门
/trip-search                # 行程搜索
```

---

## 📊 状态管理规划

### stores/modules/auth.ts
```typescript
interface AuthState {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
}
```

### stores/modules/map.ts
```typescript
interface MapState {
  markers: MapMarker[]
  routes: Route[]
  currentTripId: string | null
  selectedMarker: string | null
}
```

### stores/modules/trip.ts
```typescript
interface TripState {
  trips: Trip[]
  currentTrip: Trip | null
  participants: TripParticipant[]
}
```

### stores/modules/user.ts
```typescript
interface UserState {
  profile: Profile | null
  userTrips: Trip[]
}
```

---

## 🧪 测试目录规划

```
__tests__/
├── unit/                    # 单元测试
│   ├── components/          # 组件测试
│   ├── composables/         # 组合式函数测试
│   ├── utils/              # 工具函数测试
│   └── stores/             # Store 测试
│
└── e2e/                     # E2E 测试
    ├── auth.spec.ts        # 认证流程测试
    ├── map.spec.ts         # 地图功能测试
    └── trip.spec.ts        # 行程功能测试
```

---

## 📝 开发规范

### 1. 组件开发
- 使用 Vue 3 Composition API (`<script setup>`)
- 使用 TypeScript
- 组件Props和Emits必须有类型定义
- 样式使用 Scoped CSS

### 2. 文件导入顺序
```typescript
// 1. Vue 相关
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

// 2. 第三方库
import L from 'leaflet'
import { supabase } from '@/lib/supabase'

// 3. 项目内部
import { Trip } from '@/types'
import { useAuth } from '@/composables/useAuth'
import Button from '@/components/common/Button.vue'

// 4. 样式
import './styles.css'
```

### 3. API 调用规范
- 使用 `src/lib/api.ts` 中的函数
- 统一错误处理
- Loading 状态管理

### 4. Git 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

---

## 🔄 更新日志

### 2026-01-12
- ✅ 修复登录页邮箱域名白名单限制，移除允许域名列表
- ✅ Home.vue 布局更新：左侧集成 Leaflet 地图，右侧内容区域
- ✅ 规划 Homepage：左侧地图（Leaflet）+ 右侧四选项卡（搜索/人脉/发现/家）

### 2026-01-10
- ✅ 创建完整目录结构
- ✅ 添加项目结构文档
- ✅ 规划模块划分和命名规范
- ✅ 创建 Sidebar 侧边栏组件（支持主页、设置、联系我们）
- ✅ 创建 Settings 设置页面（Apple 风格分区）
- ✅ 添加 Topbar 顶部栏组件（右上角两个选项空间）
- ✅ 创建 BottomBar 底部导航栏组件
- ✅ 创建四个子页面：Search（搜索）、Connections（人脉）、Discover（发现）、HomePage（家）
- ✅ 首页（Home.vue）集成四个子页面切换功能，带黑白简约 SVG 图标
- ✅ 为所有非登录/注册页面添加侧边栏触发器
- ✅ 路由配置更新，添加四个子页面路由
- ✅ 创建认证系统（Pinia store + Supabase）
- ✅ 添加路由守卫（未登录重定向到登录页）
- ✅ 添加 OAuth 登录支持（GitHub、Google、Facebook、LinkedIn）
- ✅ 优化路由结构，删除冗余的独立页面
- ✅ 首页底部四选项卡（搜索/人脉/发现/家）集成到主页面

---

**最后更新**: 2026-01-12
