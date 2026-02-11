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
const worldMapRef = ref<InstanceType<typeof WoconMap>>()

// 处理 tab 切换
const handleTabChange = (tab: TabType) => {
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
  // worldMapRef.value?.switchLayer(layer)
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
    // worldMapRef.value?.flyTo(result.lat, result.lng, 10)
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
    <WoconMap ref="worldMapRef" mode="global" @marker-click="handleMarkerClick" />

    <!-- 左侧 Sidebar -->
    <Sidebar
      :activeTab="activeTab"
      @tabChange="handleTabChange"
      @moreClick="handleMoreClick"
    />

    <!-- 浮动面板：ConnectionsPanel -->
    <Draggable
      v-if="activeTab === 'connections' && showConnectionsPanel"
      :initialPosition="{ x: 100, y: 100 }"
    >
      <Panel title="Connections" :show="showConnectionsPanel" @close="handleConnectionsClose">
        <ConnectionsPanel :show="showConnectionsPanel" @close="handleConnectionsClose" />
      </Panel>
    </Draggable>

    <!-- 浮动面板：SearchBar -->
    <Draggable
      v-if="activeTab === 'search' && showSearchBar"
      :initialPosition="{ x: 140, y: 140 }"
    >
      <Panel title="Search" :show="showSearchBar" @close="handleSearchClose">
        <SearchBar :show="showSearchBar" @close="handleSearchClose" @selectResult="handleSearchResult" />
      </Panel>
    </Draggable>

    <!-- 浮动面板：PluginPanel -->
    <Draggable
      v-if="activeTab === 'plugins' && showPluginPanel"
      :initialPosition="{ x: 120, y: 120 }"
    >
      <Panel title="Plugins" :show="showPluginPanel" @close="handlePluginClose">
        <PluginPanel />
      </Panel>
    </Draggable>

    <!-- DiscoverPanel（无需Panel包装，因为它是全屏显示的） -->
    <DiscoverPanel v-if="activeTab === 'discover'" />

    <!-- 右上角 Trip 信息卡（升级视觉） -->
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
</style>