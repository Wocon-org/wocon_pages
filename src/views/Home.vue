<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/TopBar.vue'
import Sidebar from '@/components/Sidebar.vue'
import WorldMap from '@/components/WorldMap.vue'
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
const worldMapRef = ref<InstanceType<typeof WorldMap>>()

// 监听Discover事件
const handleDiscoverPlace = (event: any) => {
  const place = event.detail
  console.log('Discovered place:', place)
  if (worldMapRef.value && place.coordinates) {
    worldMapRef.value.flyTo(place.coordinates.lat, place.coordinates.lng, 10)
  }
}

onMounted(() => {
  window.addEventListener('discover-place', handleDiscoverPlace)
})

onUnmounted(() => {
  window.removeEventListener('discover-place', handleDiscoverPlace)
})

// 行程数据（示例）
const trips = ref<any[]>([
  { id: '1', destination: 'Tenerife Sea', lat: 28.2916, lng: -16.6291 },
  { id: '2', destination: 'Tokyo', lat: 35.6762, lng: 139.6503 }
])

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
    <WorldMap ref="worldMapRef" :trips="trips" @markerClick="handleMarkerClick" />

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

    <!-- 右上角 Trip 信息卡（MD3风格） -->
    <div v-if="selectedTrip" class="trip-info-card">
      <div class="trip-info-header">
        <div class="trip-title">
          <span class="trip-name">{{ selectedTrip.name }}</span>
          <span class="trip-type" :class="selectedTrip.type === 'recruiting' ? 'type-recruiting' : 'type-private'">
            {{ selectedTrip.type === 'recruiting' ? 'Recruiting' : 'Private' }}
          </span>
        </div>
        <button class="trip-info-close" @click="selectedTrip = null" aria-label="Close">
          ✕
        </button>
      </div>
      <div class="trip-info-body">
        <div class="trip-row">
          <span class="label">Owner</span>
          <span class="value">{{ selectedTrip.owner_username || selectedTrip.owner?.username || 'Unknown' }}</span>
        </div>
        <div class="trip-row">
          <span class="label">Public</span>
          <span class="value">{{ selectedTrip.is_public ? 'Yes' : 'No' }}</span>
        </div>
      </div>
      <div class="trip-info-actions">
        <button class="md3-btn md3-primary" @click="router.push(`/trip/${selectedTrip.id}`)">View Details</button>
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
  background: #0d1117;
}

.trip-info-card {
  position: fixed;
  top: 24px;
  right: 24px;
  width: 320px;
  background: #121212;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.35);
  border: 1px solid #30363d;
  overflow: hidden;
  z-index: 1000;
}

.trip-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #1e1e1e;
  border-bottom: 1px solid #30363d;
}

.trip-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trip-name {
  color: #e6e6e6;
  font-size: 16px;
  font-weight: 600;
}

.trip-type {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.type-recruiting {
  background: rgba(103, 80, 164, 0.2);
  color: #cbb8ff;
  border: 1px solid rgba(103, 80, 164, 0.4);
}
.type-private {
  background: rgba(255, 255, 255, 0.08);
  color: #e6e6e6;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.trip-info-close {
  background: transparent;
  border: none;
  color: #9aa0a6;
  font-size: 16px;
  cursor: pointer;
}
.trip-info-close:hover {
  color: #e6e6e6;
}

.trip-info-body {
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
}
.trip-row {
  display: contents;
}
.label {
  color: #9aa0a6;
  font-size: 12px;
}
.value {
  color: #e6e6e6;
  font-size: 12px;
  justify-self: end;
}

.trip-info-actions {
  padding: 16px;
  display: flex;
  justify-content: flex-end;
}
.md3-btn {
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.md3-primary {
  background: #6750A4;
  color: white;
}
.md3-primary:hover {
  background: #7f67be;
}
</style>
