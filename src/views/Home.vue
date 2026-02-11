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
  background: #0d1117;
}

.trip-info-card {
  position: fixed;
  top: 24px;
  right: 24px;
  width: 320px;
  background: #161b22;
  border-radius: 20px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid #30363d;
  overflow: hidden;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.trip-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #0d1117;
  border-bottom: 1px solid #30363d;
}

.trip-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trip-name {
  color: #e6e6e6;
  font-size: 18px;
  font-weight: 700;
}

.trip-type {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #8be9fd 0%, #bd93f9 100%);
  color: #0d1117;
}
.type-private {
  background: #30363d;
  color: #c9d1d9;
}

.trip-info-close {
  background: transparent;
  border: none;
  color: #8b949e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s ease;
}
.trip-info-close:hover,
.trip-info-close:focus-visible {
  color: #e6e6e6;
}

.trip-info-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.info-dot.owner {
  background: #8be9fd;
}
.info-dot.public {
  background: #bd93f9;
}

.info-label {
  flex: 1;
  color: #8b949e;
  font-size: 13px;
}

.info-value {
  color: #e6e6e6;
  font-size: 13px;
  font-weight: 500;
}

.trip-info-actions {
  padding: 16px;
  display: flex;
}

.action-btn {
  flex: 1;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, #8be9fd 0%, #bd93f9 100%);
  color: #0d1117;
  transition: all 0.2s ease;
}

.action-btn:hover,
.action-btn:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 233, 253, 0.25);
}
</style>
