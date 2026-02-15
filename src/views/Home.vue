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

type TabType = 'home' | 'connections' | 'search' | 'discover' | 'plugins'

const router = useRouter()

// 状态管理
const activeTab = ref<TabType>('home')
const selectedTrip = ref<any>(null)
const showMoreMenu = ref(false)

// 面板显示状态
const showConnectionsPanel = ref(true)
const showPluginPanel = ref(true)
const showSearchBar = ref(true)
const showDiscoverPanel = ref(true)

// WorldMap 引用
const worldMapRef = ref<any>()

// 处理 tab 切换
const handleTabChange = async (tab: TabType) => {
  // Search 特殊处理：切换显示/隐藏
  if (tab === 'search') {
    if (activeTab.value === 'search') {
      // 当前已经是search，则关闭
      activeTab.value = 'home'
      showSearchBar.value = true
    } else {
      // 切换到search
      activeTab.value = 'search'
    }
  } else if (tab === 'discover') {
    // 切换到discover时自动触发发现功能
    activeTab.value = tab

    // 模拟发现功能
    try {
      // 从数据库获取热门城市
      const { data: cities, error } = await supabase
        .from('cities')
        .select('geonameid, name, asciiname, country_code, latitude, longitude, population')
        .gte('population', 500000)
        .order('population', { ascending: false, nullsFirst: false })
        .limit(50)

      if (!error && cities && cities.length > 0) {
        // 随机选择一个城市
        const randomIndex = Math.floor(Math.random() * cities.length)
        const randomCity = cities[randomIndex]

        if (randomCity && worldMapRef.value) {
          // 飞转到随机城市（类似Google Earth效果，使用更高的缩放级别）
          worldMapRef.value.flyTo(randomCity.latitude, randomCity.longitude, 12)
          console.log('Discovered city:', randomCity.name, randomCity.country_code)
        }
      }
    } catch (error) {
      console.error('Discover error:', error)
    }
  } else {
    activeTab.value = tab
  }
}

// 处理更多菜单
const handleMoreClick = () => {
  showMoreMenu.value = !showMoreMenu.value
}

// 点击 Logo 返回首页
const handleLogoClick = () => {
  activeTab.value = 'home'
  selectedTrip.value = null
}

// 处理地图标记点击
const handleMarkerClick = async (tripId: string) => {
  const { data } = await getTripById(tripId)
  if (data) {
    selectedTrip.value = data
  }
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
      mode="global"
      @marker-click="handleMarkerClick"
      @location-found="(lat, lng) => console.log('Location found:', lat, lng)"
      @location-error="(error) => console.error('Location error:', error)"
    />

    <!-- 左侧 Sidebar -->
    <Sidebar
      :activeTab="activeTab"
      @tabChange="handleTabChange"
      @moreClick="handleMoreClick"
    />

    <!-- 面板容器 -->
    <div class="panels-container">
      <!-- 浮动面板：ConnectionsPanel -->
      <Transition name="panel-fade">
        <Draggable
          v-if="activeTab === 'connections' && showConnectionsPanel"
          :initialPosition="{ x: 100, y: 100 }"
          class="panel-draggable"
        >
          <Panel
            title="Connections"
            :show="showConnectionsPanel"
            @close="handleConnectionsClose"
            class="panel-connections"
          >
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
        >
          <Panel
            title="Search"
            :show="showSearchBar"
            @close="handleSearchClose"
            class="panel-search"
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
        >
          <Panel
            title="Plugins"
            :show="showPluginPanel"
            @close="handlePluginClose"
            class="panel-plugins"
          >
            <PluginPanel />
          </Panel>
        </Draggable>
      </Transition>

      <!-- DiscoverPanel（全屏显示） -->
      <Transition name="panel-full">
        <DiscoverPanel
          v-if="activeTab === 'discover'"
          class="panel-discover"
          @discover-place="(place) => {
            console.log('Discovered place:', place);
            if (worldMapRef.value && place.coordinates) {
              worldMapRef.value.flyTo(place.coordinates.lat, place.coordinates.lng, 10);
            }
          }"
        />
      </Transition>
    </div>

    <!-- 右上角 Trip 信息卡（升级视觉） -->
    <Transition name="card-slide">
      <div v-if="selectedTrip" class="trip-info-card">
        <div class="trip-info-header">
          <div class="trip-title">
            <span class="trip-name">{{ selectedTrip.name }}</span>
            <span class="trip-type" :class="selectedTrip.type === 'recruiting' ? 'type-recruiting' : 'type-private'">
              {{ selectedTrip.type === 'recruiting' ? 'Recruiting' : 'Private' }}
            </span>
          </div>
          <button class="trip-info-close" @click="selectedTrip = null" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="trip-info-body">
          <div class="info-row">
            <div class="info-dot owner" />
            <div class="info-label">Owner</div>
            <div class="info-value">{{ selectedTrip.owner_username || selectedTrip.owner?.username || 'Unknown' }}</div>
          </div>
          <div class="info-row">
            <div class="info-dot public" />
            <div class="info-label">Visibility</div>
            <div class="info-value">{{ selectedTrip.is_public ? 'Public' : 'Only me' }}</div>
          </div>
        </div>
        <div class="trip-info-actions">
          <button class="action-btn" @click="router.push(`/trip/${selectedTrip.id}`)">View Details</button>
        </div>
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

.trip-info-card {
  position: fixed;
  top: 24px;
  right: 24px;
  width: 320px;
  background: var(--md3-surface);
  border-radius: var(--md3-radius-2xl);
  box-shadow: var(--md3-elevation-5);
  border: 1px solid var(--md3-surface-variant);
  overflow: hidden;
  z-index: 1000;
  animation: slide-in-right var(--md3-transition-long);
}

.trip-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--md3-space-4);
  background: var(--md3-surface-variant);
  border-bottom: 1px solid var(--md3-surface-variant-dark);
}

.trip-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trip-name {
  color: var(--md3-on-surface);
  font-size: var(--md3-title-large);
  font-weight: 700;
}

.trip-type {
  display: inline-flex;
  align-items: center;
  padding: var(--md3-space-1) var(--md3-space-3);
  border-radius: var(--md3-radius-full);
  font-size: var(--md3-label-small);
  font-weight: 600;
  background: var(--md3-primary-container);
  color: var(--md3-primary);
}
.type-private {
  background: var(--md3-secondary-container);
  color: var(--md3-secondary);
}

.trip-info-close {
  background: transparent;
  border: none;
  color: var(--md3-on-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--md3-transition-short);
  padding: var(--md3-space-2);
  border-radius: var(--md3-radius-full);
}
.trip-info-close:hover,
.trip-info-close:focus-visible {
  color: var(--md3-on-surface);
  background: var(--md3-surface-variant-light);
  transform: scale(1.1);
}

.trip-info-body {
  padding: var(--md3-space-4);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: var(--md3-space-2);
  border-radius: var(--md3-radius-medium);
  transition: background-color var(--md3-transition-short);
}

.info-row:hover {
  background-color: var(--md3-surface-variant-light);
}

.info-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.info-dot.owner {
  background: var(--md3-primary);
  box-shadow: 0 0 0 2px var(--md3-primary-container);
}
.info-dot.public {
  background: var(--md3-secondary);
  box-shadow: 0 0 0 2px var(--md3-secondary-container);
}

.info-label {
  flex: 1;
  color: var(--md3-on-surface-variant);
  font-size: var(--md3-body-small);
}

.info-value {
  color: var(--md3-on-surface);
  font-size: var(--md3-body-small);
  font-weight: 500;
}

.trip-info-actions {
  padding: var(--md3-space-4);
  display: flex;
}

.action-btn {
  flex: 1;
  border: none;
  border-radius: var(--md3-radius-large);
  padding: var(--md3-space-3) var(--md3-space-4);
  font-size: var(--md3-body-medium);
  font-weight: 600;
  cursor: pointer;
  background: var(--md3-primary);
  color: var(--md3-on-primary);
  transition: all var(--md3-transition-short);
  box-shadow: var(--md3-elevation-2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--md3-space-2);
}

.action-btn:hover,
.action-btn:focus-visible {
  transform: translateY(-1px);
  box-shadow: var(--md3-elevation-3);
  background: var(--md3-primary-light);
}

.action-btn:active {
  transform: translateY(0);
  box-shadow: var(--md3-elevation-1);
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

/* 卡片过渡动画 */
.card-slide-enter-active,
.card-slide-leave-active {
  transition: transform var(--md3-transition-long), opacity var(--md3-transition-long);
}

.card-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.card-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
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
    max-width: calc(100vw - 40px);
  }

  .panel-discover {
    left: 0;
  }

  .trip-info-card {
    width: calc(100vw - 48px);
    right: 24px;
  }
}
</style>
