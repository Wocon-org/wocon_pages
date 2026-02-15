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

// 面板显示状态
const showConnectionsPanel = ref(true)
const showPluginPanel = ref(true)
const showSearchBar = ref(true)
const showDiscoverPanel = ref(true)

// 缓存数据
const citiesCache = ref<any[]>([])
const isCitiesLoaded = ref(false)

// WorldMap 引用
const worldMapRef = ref<any>()

// 处理 tab 切换
const handleTabChange = async (tab: TabType) => {
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

  // Search 特殊处理：切换显示/隐藏
  if (tab === 'search') {
    if (activeTab.value === 'search') {
      // 当前已经是search，则关闭
      activeTab.value = 'home'
    } else {
      // 切换到search
      activeTab.value = 'search'
    }
  } else if (tab === 'discover') {
    // 切换到discover时自动触发发现功能
    activeTab.value = tab

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
        }
      }
    } catch (error) {
      console.error('Discover error:', error)
    }
  } else {
    activeTab.value = tab
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
          :class="{ 'panel-active': activeTab === 'search' }"
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
          :class="{ 'panel-active': activeTab === 'plugins' }"
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


}
</style>
