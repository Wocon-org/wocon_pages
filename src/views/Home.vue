<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/TopBar.vue'
import Sidebar from '@/components/Sidebar.vue'
import WoconMap from '@/components/WoconMap.vue'
import PluginPanel from '@/components/panels/PluginPanel.vue'
import ConnectionsPanel from '@/components/panels/ConnectionsPanel.vue'
import SearchBar from '@/components/panels/SearchBar.vue'
import DiscoverPanel from '@/components/panels/DiscoverPanel.vue'
import Draggable from '@/components/common/Draggable.vue'
import Panel from '@/components/common/Panel.vue'
import Preloader from '@/components/Preloader.vue'
import { supabase } from '@/lib/supabase'
import { getTripById } from '@/modules/trip/api'
import { useSeo } from '@/composables/useSeo'
import { useStructuredData } from '@/composables/useStructuredData'

// Set SEO options
useSeo({
  title: 'Wocon - Interactive World Map and Travel Discovery',
  description: 'Explore the world with Wocon\'s interactive map, discover new destinations, and plan your next adventure.',
  keywords: ['interactive map', 'world discovery', 'travel destinations', 'trip planning', 'explore the world'],
  canonical: 'https://www.woconapp.com/'
})

// Set structured data
useStructuredData({
  webpage: {
    name: 'Wocon - Interactive World Map and Travel Discovery',
    url: 'https://www.woconapp.com/',
    description: 'Explore the world with Wocon\'s interactive map, discover new destinations, and plan your next adventure.',
    breadcrumb: {
      type: 'BreadcrumbList',
      itemListElement: [
        {
          type: 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.woconapp.com/'
        }
      ]
    }
  }
})

type TabType = 'home' | 'connections' | 'search' | 'discover' | 'plugins'

const router = useRouter()

// 状态管理
const activeTab = ref<TabType>('home')

// 面板显示状态
const showConnectionsPanel = ref(true)
const showPluginPanel = ref(true)
const showSearchBar = ref(true)
const showDiscoverPanel = ref(true)

// 缓存数据
const citiesCache = ref<any[]>([])
const isCitiesLoaded = ref(false)

// 发现提示消息状态
const showDiscoverMessage = ref(false)
const discoverMessage = ref('')

// WorldMap 引用
const worldMapRef = ref<any>()

// 处理 tab 切换
const handleTabChange = async (tab: TabType) => {
  // 检查是否需要切换关闭（当前已经是选中状态）
  const isTogglingOff = activeTab.value === tab

  // 重置对应面板的显示状态
  if (tab === 'connections') {
    showConnectionsPanel.value = true
  } else if (tab === 'search') {
    showSearchBar.value = true
  } else if (tab === 'plugins') {
    showPluginPanel.value = true
  } else if (tab === 'discover') {
    showDiscoverPanel.value = true
  }

  // 处理切换逻辑
  if (isTogglingOff) {
    // 当前已经是选中状态，切换关闭
    activeTab.value = 'home'
  } else {
    // 切换到新标签
    activeTab.value = tab

    // 切换到discover时自动触发发现功能
    if (tab === 'discover') {
      // 模拟发现功能
      try {
        let cities: any[] = []

        // 检查缓存是否存在
        if (isCitiesLoaded.value && citiesCache.value.length > 0) {
          cities = citiesCache.value
          console.log('Using cached cities data')
        } else {
          // 从数据库获取热门城市
          const { data, error } = await supabase
            .from('cities')
            .select('geonameid, name, asciiname, country_code, latitude, longitude, population')
            .gte('population', 500000)
            .order('population', { ascending: false, nullsFirst: false })
            .limit(50)

          if (!error && data && data.length > 0) {
            cities = data
            // 存储到缓存
            citiesCache.value = data
            isCitiesLoaded.value = true
            console.log('Loaded cities data from database')
          }
        }

        if (cities.length > 0) {
          // 随机选择一个城市
          const randomIndex = Math.floor(Math.random() * cities.length)
          const randomCity = cities[randomIndex]

          if (randomCity && worldMapRef.value) {
            // 飞转到随机城市（类似Google Earth效果，使用更高的缩放级别）
            worldMapRef.value.flyTo(randomCity.latitude, randomCity.longitude, 12)
            console.log('Discovered city:', randomCity.name, randomCity.country_code)

            // 显示发现提示消息
            discoverMessage.value = `Discovering ${randomCity.name}, ${randomCity.country_code}...`
            showDiscoverMessage.value = true

            // 1.5秒后隐藏消息
            setTimeout(() => {
              showDiscoverMessage.value = false
            }, 1500)
          }
        }
      } catch (error) {
        console.error('Discover error:', error)
      }
    }
  }
}

// 点击 Logo 返回首页
const handleLogoClick = () => {
  activeTab.value = 'home'
}

// 处理图层切换
const handleSwitchLayer = (layer: 'dark' | 'satellite') => {
  worldMapRef.value?.switchLayer(layer)
}

// 面板关闭处理
const handleConnectionsClose = () => {
  showConnectionsPanel.value = false
  activeTab.value = 'home'
}

const handlePluginClose = () => {
  showPluginPanel.value = false
  activeTab.value = 'home'
}

const handleSearchClose = () => {
  showSearchBar.value = false
  activeTab.value = 'home'
}

const handleDiscoverClose = () => {
  showDiscoverPanel.value = false
  activeTab.value = 'home'
}

// 搜索结果选中处理
const handleSearchResult = (result: any) => {
  console.log('Search result selected:', result)
  // 移动地图到结果位置
  if (result.lat && result.lng) {
    worldMapRef.value?.flyTo(result.lat, result.lng, 10)
  }
}

// 处理侧边栏菜单选项点击
const handleMoreOptionClick = (option: string) => {
  console.log('More option clicked:', option)

  switch (option) {
    case 'docs':
      // 导航到新的文档页面
      router.push('/docs')
      break
    case 'settings':
      // 处理设置选项
      console.log('Opening settings')
      break
    case 'help':
      // 处理帮助选项
      console.log('Opening help')
      break
    case 'about':
      // 处理关于选项
      console.log('Opening about')
      break
    case 'logout':
      // 处理登出选项
      console.log('Logging out')
      break
    default:
      break
  }
}
</script>

<template>
  <div class="google-earth-home">
    <!-- Preloader -->
    <Preloader />

    <!-- TopBar -->
    <TopBar @switchLayer="handleSwitchLayer" />

    <!-- 世界地图背景 -->
    <WoconMap
      ref="worldMapRef"
      @location-found="(lat, lng) => console.log('Location found:', lat, lng)"
      @location-error="(error) => console.error('Location error:', error)"
    />

    <!-- 左侧 Sidebar -->
    <Sidebar
      :activeTab="activeTab"
      @tabChange="handleTabChange"
      @moreOptionClick="handleMoreOptionClick"
    />

    <!-- 面板容器 -->
    <div class="panels-container">
      <!-- 浮动面板：ConnectionsPanel -->
      <Transition name="panel-fade">
        <Draggable
          v-if="activeTab === 'connections' && showConnectionsPanel"
          :initialPosition="{ x: 100, y: 100 }"
          class="panel-draggable"
          :class="{ 'panel-active': activeTab === 'connections' }"
          tabindex="0"
          role="dialog"
          aria-labelledby="connections-panel-title"
          aria-describedby="connections-panel-description"
        >
          <Panel
            title="Connections"
            :show="showConnectionsPanel"
            @close="handleConnectionsClose"
            class="panel-connections"
            id="connections-panel-title"
          >
            <div id="connections-panel-description" class="sr-only">Connections panel showing your connections</div>
            <ConnectionsPanel :show="showConnectionsPanel" @close="handleConnectionsClose" />
          </Panel>
        </Draggable>
      </Transition>

      <!-- 浮动面板：SearchBar -->
      <Transition name="panel-slide">
        <Draggable
          v-if="activeTab === 'search' && showSearchBar"
          :initialPosition="{ x: 140, y: 140 }"
          class="panel-draggable"
          :class="{ 'panel-active': activeTab === 'search' }"
          tabindex="0"
          role="search"
          aria-labelledby="search-panel-title"
        >
          <Panel
            title="Search"
            :show="showSearchBar"
            @close="handleSearchClose"
            class="panel-search"
            id="search-panel-title"
          >
            <SearchBar :show="showSearchBar" @close="handleSearchClose" @selectResult="handleSearchResult" />
          </Panel>
        </Draggable>
      </Transition>

      <!-- 浮动面板：PluginPanel -->
      <Transition name="panel-scale">
        <Draggable
          v-if="activeTab === 'plugins' && showPluginPanel"
          :initialPosition="{ x: 120, y: 120 }"
          class="panel-draggable"
          :class="{ 'panel-active': activeTab === 'plugins' }"
          tabindex="0"
          role="dialog"
          aria-labelledby="plugins-panel-title"
          aria-describedby="plugins-panel-description"
        >
          <Panel
            title="Plugins"
            :show="showPluginPanel"
            @close="handlePluginClose"
            class="panel-plugins"
            id="plugins-panel-title"
          >
            <div id="plugins-panel-description" class="sr-only">Plugins panel showing available plugins</div>
            <PluginPanel />
          </Panel>
        </Draggable>
      </Transition>

      <!-- DiscoverPanel（全屏显示） -->
      <div class="sr-only">
        <div id="discover-panel-title">Discover Panel</div>
        <div id="discover-panel-description">Discover panel showing recommended places</div>
      </div>
      <Transition name="panel-full">
        <DiscoverPanel
          v-if="activeTab === 'discover'"
          class="panel-discover"
          role="dialog"
          aria-labelledby="discover-panel-title"
          aria-describedby="discover-panel-description"
          @discover-place="(place) => {
            console.log('Discovered place:', place);
            if (worldMapRef.value && place.coordinates) {
              worldMapRef.value.flyTo(place.coordinates.lat, place.coordinates.lng, 10);
            }
          }"
        />
      </Transition>
    </div>

    <!-- 发现消息提示 - Swiss Style -->
    <Transition name="discover-message">
      <div v-if="showDiscoverMessage" class="discover-message">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
        <span>{{ discoverMessage }}</span>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.google-earth-home {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: var(--md3-background);
}

/* 屏幕阅读器专用类 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}



/* 面板容器 */
.panels-container {
  position: fixed;
  top: 56px;
  left: 72px;
  right: 0;
  bottom: 0;
  z-index: 500;
  pointer-events: none;
}

.panel-draggable {
  pointer-events: auto;
  z-index: 1000;
}

.panel-draggable.panel-active {
  z-index: 1500;
}

/* 面板过渡动画 */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity var(--md3-transition-long), transform var(--md3-transition-long);
}

.panel-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.panel-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: opacity var(--md3-transition-long), transform var(--md3-transition-long);
}

.panel-slide-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}

.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.panel-scale-enter-active,
.panel-scale-leave-active {
  transition: opacity var(--md3-transition-long), transform var(--md3-transition-long);
}

.panel-scale-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.panel-scale-leave-to {
  opacity: 0;
  transform: scale(1.2);
}

.panel-full-enter-active,
.panel-full-leave-active {
  transition: opacity var(--md3-transition-long);
}

.panel-full-enter-from {
  opacity: 0;
}

.panel-full-leave-to {
  opacity: 0;
}

/* 发现消息提示 - Swiss Style */
.discover-message {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--md3-surface);
  color: var(--md3-on-surface);
  padding: 12px 24px;
  border-radius: 0;
  box-shadow: 4px 4px 0 var(--md3-primary);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2000;
  border: 2px solid var(--md3-primary);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.discover-message svg {
  color: var(--md3-primary);
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.discover-message span {
  font-size: 14px;
  font-weight: 600;
  color: var(--md3-on-surface);
  line-height: 1.4;
}

/* 消息动画 - 平滑过渡 */
.discover-message-enter-active,
.discover-message-leave-active {
  transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.discover-message-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
  box-shadow: 0 0 0 var(--md3-primary);
}

.discover-message-enter-to {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  box-shadow: 4px 4px 0 var(--md3-primary);
}

.discover-message-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  box-shadow: 4px 4px 0 var(--md3-primary);
}

.discover-message-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
  box-shadow: 0 0 0 var(--md3-primary);
}

/* 面板特定样式 */
.panel-connections {
  min-width: 320px;
  max-width: 400px;
  min-height: 400px;
}

.panel-search {
  min-width: 360px;
  max-width: 500px;
}

.panel-plugins {
  min-width: 300px;
  max-width: 400px;
  min-height: 350px;
}

.panel-discover {
  position: fixed;
  top: 56px;
  left: 72px;
  right: 0;
  bottom: 0;
  z-index: 1500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .panels-container {
    left: 0;
  }

  .panel-connections,
  .panel-search,
  .panel-plugins {
    min-width: 280px;
    max-width: calc(100vw - 20px);
  }

  .panel-discover {
    left: 0;
  }
}
</style>
