# 史诗大更新 - Google Earth 风格 UI 重构

## 📋 更新目标

将现有 UI 架构完全重构为 Google Earth 风格的模块化、可拖动组件系统。

### 核心变化

**旧架构：**

- 左右分屏布局
- Bottom-bar 导航
- 固定的 tabs（Search, Connections, Discover, Home）

**新架构：**

- 左侧固定 Sidebar（80px）
- 浮动、可拖动组件面板
- WorldMap 地图背景
- 点击图标显示/隐藏对应面板
- MD3（Material Design 3）视觉风格

---

## 🗂️ 文件结构

### 新增组件

```
src/
├── components/
│   ├── panels/              # 浮动面板目录
│   │   ├── ConnectionPanel.vue
│   │   ├── PluginPanel.vue
│   │   ├── DiscoverPanel.vue
│   │   ├── TripInfoModal.vue
│   │   └── SearchBar.vue
│   ├── Sidebar.vue          # 左侧 80px 侧边栏（重构）
│   ├── WorldMap.vue         # 世界地图背景
│   ├── MoreMenu.vue        # 更多菜单
│   └── common/
│       └── Draggable.vue   # 可拖动 HOC
├── views/
│   ├── Home.vue            # 完全重写
│   └── ...
└── ...
```

---

## 📐 页面布局设计

```
┌─────────────────────────────────────────┐
│ [Wocon Logo]  ← 点击返回首页        │
├────────┬────────────────────────────────┤
│ Sidebar│  [WorldMap 背景]              │
│ 80px   │                              │
│        │  [ConnectionPanel] 可拖动     │
│ 🏠     │  位置: left: 100px, top: 100px│
│        │                              │
│ 👥     │  [PluginPanel] 可拖动        │
│        │  位置: left: 100px, top: 300px│
│ 🔍     │                              │
│        │  [SearchBar] 顶部搜索栏        │
│ 🌍     │  位置: top: 80px, width: 100%│
│        │                              │
│ 🔌     │  [TripInfoModal] 可拖动      │
│        │  位置: right: 40px, top: 80px│
│        │                              │
│ ⋮      │                              │
│ 更多菜单│                              │
└────────┴────────────────────────────────┘
```

---

## 🎨 设计规范

### Sidebar（80px 宽）

- 从上到下：Home, Connections, Search, Discover, Plugins
- 图标激活状态：填充黑色
- 图标未激活：灰色轮廓
- 左下角 "⋮" 更多菜单

### 面板样式（MD3 风格）

- 圆角：16-24px
- 卡片阴影：多层 elevation
- 悬停效果：阴影增强
- 色彩：深色主题适配

---

## 🚀 实现步骤

### 阶段 1：基础组件

#### 1.1 创建 Draggable 组件

**文件：** `src/components/common/Draggable.vue`

**功能：**

- 实现鼠标拖动功能
- 支持触摸拖动
- 限制拖动边界（可选）
- 保存位置到 localStorage（可选）

**Props：**

- `initialPosition`: `{ x, y }` 初始位置
- `enabled`: 是否启用拖动

**Events：**

- `@dragStart`: 开始拖动
- `@dragEnd`: 结束拖动
- `@positionChange`: 位置变化

---

#### 1.2 重构 Sidebar 组件

**文件：** `src/components/Sidebar.vue`

**功能：**

- 左侧固定 80px 宽
- 垂直排列图标
- 激活状态切换
- 左下角更多菜单

**图标列表：**

1. Home - 首页
2. Connections - 人脉
3. Search - 搜索
4. Discover - 发现
5. Plugins - 插件
6. ⋮ - 更多菜单

**状态管理：**

- `activeTab`: 当前激活的 tab

---

#### 1.3 创建 WorldMap 组件

**文件：** `src/components/WorldMap.vue`

**功能：**

- 世界地图背景
- 显示行程标记（可点击）
- 支持缩放、平移

**Props：**

- `trips`: 行程数据

**Events：**

- `@markerClick`: 点击地图标记

---

### 阶段 2：浮动面板组件

#### 2.1 创建 PluginPanel（优先）

**文件：** `src/components/panels/PluginPanel.vue`

**功能：**

- MD3 风格插件卡片
- 插件列表（带开关）
- 添加插件按钮
- 可拖动（使用 Draggable 包裹）

**插件数据结构：**

```typescript
interface Plugin {
  id: number
  name: string
  description: string
  enabled: boolean
  icon: string
}
```

**样式：**

- 卡片宽度：320px
- MD3 紫色按钮
- MD3 开关样式

---

#### 2.2 创建 ConnectionPanel

**文件：** `src/components/panels/ConnectionPanel.vue`

**功能：**

- 好友列表
- 好友请求（接受/拒绝）
- 搜索用户
- 添加好友
- 可拖动

**面板内容：**

- 搜索框
- 好友请求区域
- 好友列表区域

---

#### 2.3 创建 DiscoverPanel

**文件：** `src/components/panels/DiscoverPanel.vue`

**功能：**

- 推荐内容
- 热门目的地
- 待实现（显示 "Coming Soon"）

---

#### 2.4 创建 TripInfoModal

**文件：** `src/components/panels/TripInfoModal.vue`

**功能：**

- 显示行程详细信息
- Join 按钮
- 关闭按钮
- 可拖动

**显示内容：**

- 行程名称
- Trip ID
- 目的地
- 旅行时间
- 参与用户
- Join 按钮

---

#### 2.5 创建 SearchBar

**文件：** `src/components/panels/SearchBar.vue`

**功能：**

- 顶部搜索框
- 搜索建议
- Enter 键确认

**特殊说明：**

- 不是独立面板，是顶部固定搜索栏
- 点击 Sidebar 的 Search 图标切换显示/隐藏

---

### 阶段 3：更多菜单

#### 3.1 创建 MoreMenu

**文件：** `src/components/MoreMenu.vue`

**功能：**

- 浮动菜单
- 三个选项：
  1. Create New Trip → `/create-trip`
  2. View Trips → `/trips`
  3. Contact Us → `/contact`

---

### 阶段 4：重构 Home.vue

#### 4.1 完全重写 Home.vue

**文件：** `src/views/Home.vue`

**布局结构：**

```vue
<template>
  <div class="google-earth-home">
    <!-- 左上角 Logo -->
    <div class="wocon-logo" @click="goHome">Wocon</div>

    <!-- 左侧 Sidebar -->
    <Sidebar :activeTab="activeTab" @tabChange="handleTabChange" @moreClick="showMoreMenu = true" />

    <!-- 世界地图背景 -->
    <WorldMap :trips="trips" @markerClick="handleMarkerClick" />

    <!-- 搜索栏 -->
    <SearchBar v-if="isSearchVisible" @close="isSearchVisible = false" />

    <!-- 浮动面板 -->
    <Draggable :initialPosition="{ x: 100, y: 100 }">
      <ConnectionPanel v-if="activeTab === 'connections'" />
    </Draggable>

    <Draggable :initialPosition="{ x: 100, y: 300 }">
      <PluginPanel v-if="activeTab === 'plugins'" />
    </Draggable>

    <Draggable :initialPosition="{ x: 100, y: 200 }">
      <DiscoverPanel v-if="activeTab === 'discover'" />
    </Draggable>

    <Draggable :initialPosition="{ x: 500, y: 80 }">
      <TripInfoModal v-if="selectedTrip" :trip="selectedTrip" @close="selectedTrip = null" />
    </Draggable>

    <!-- 更多菜单 -->
    <MoreMenu v-if="showMoreMenu" @close="showMoreMenu = false" />
  </div>
</template>
```

**状态管理：**

```typescript
const activeTab = ref<'home' | 'connections' | 'search' | 'discover' | 'plugins'>('home')
const isSearchVisible = ref(false)
const selectedTrip = ref<any>(null)
const showMoreMenu = ref(false)
const trips = ref<any[]>([])
```

---

## 📊 数据迁移

### 从旧 Home.vue 迁移的数据

#### Connections 数据

- `friends`: 好友列表
- `friendRequests`: 好友请求
- `searchResults`: 搜索结果
- `sentRequests`: 已发送的请求

**迁移到：** `ConnectionPanel.vue`

#### 插件数据

- `plugins`: 插件列表

**迁移到：** `PluginPanel.vue`

---

## 🎯 MD3 风格设计规范

### 色彩变量

```css
--md-sys-color-primary: #6750a4 --md-sys-color-on-primary: #ffffff --md-sys-color-surface: #21262d
  --md-sys-color-on-surface: #c9d1d9 --md-sys-color-outline: #8b949e;
```

### 圆角规范

- 小元素：8px
- 按钮：12px
- 卡片：16-24px

### 阴影规范

```css
.elevation-1 {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.elevation-2 {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}
.elevation-3 {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
```

---

## ✅ 验收标准

### 功能验收

- [x] Sidebar 显示所有图标
- [x] 点击图标显示对应面板
- [x] 所有面板可拖动
- [x] 插件面板 MD3 风格
- [x] 搜索栏显示/隐藏切换
- [x] 更多菜单跳转正确
- [x] 点击 Logo 返回首页
- [x] 地图标记点击显示行程详情

### 视觉验收

- [x] 符合 Google Earth 风格
- [x] 深色主题一致
- [x] MD3 设计规范
- [x] 响应式适配
- [x] 过渡动画流畅

---
