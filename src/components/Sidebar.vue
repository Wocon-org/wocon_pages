<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

type TabType = 'home' | 'connections' | 'search' | 'discover' | 'plugins'

interface Props {
  activeTab: TabType
}

interface Emits {
  (e: 'tabChange', tab: TabType): void
  (e: 'moreClick'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()

const handleTabClick = (tab: TabType) => {
  emit('tabChange', tab)
}

const handleMoreClick = () => {
  emit('moreClick')
}

const handleLogoClick = () => {
  emit('tabChange', 'home')
}

// SVG 图标
const getHomeIcon = () => `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12L12 3L21 12" stroke="${props.activeTab === 'home' ? '#000000' : '#8b949e'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 12V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V12" stroke="${props.activeTab === 'home' ? '#000000' : '#8b949e'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`

const getConnectionsIcon = () => `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="7" r="4" stroke="${props.activeTab === 'connections' ? '#000000' : '#8b949e'}" stroke-width="2"/>
    <path d="M6 21V19C6 15.6863 8.68629 13 12 13C15.3137 13 18 15.6863 18 19V21" stroke="${props.activeTab === 'connections' ? '#000000' : '#8b949e'}" stroke-width="2"/>
    <path d="M18 7C18 9.20914 19.7909 11 22 11" stroke="${props.activeTab === 'connections' ? '#000000' : '#8b949e'}" stroke-width="2" stroke-linecap="round"/>
  </svg>
`

const getSearchIcon = () => `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="${props.activeTab === 'search' ? '#000000' : '#8b949e'}" stroke-width="2"/>
    <path d="M16 16L21 21" stroke="${props.activeTab === 'search' ? '#000000' : '#8b949e'}" stroke-width="2" stroke-linecap="round"/>
  </svg>
`

const getDiscoverIcon = () => `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="${props.activeTab === 'discover' ? '#000000' : '#8b949e'}" stroke-width="2"/>
    <path d="M12 2V6" stroke="${props.activeTab === 'discover' ? '#000000' : '#8b949e'}" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 18V22" stroke="${props.activeTab === 'discover' ? '#000000' : '#8b949e'}" stroke-width="2" stroke-linecap="round"/>
    <path d="M2 12H6" stroke="${props.activeTab === 'discover' ? '#000000' : '#8b949e'}" stroke-width="2" stroke-linecap="round"/>
    <path d="M18 12H22" stroke="${props.activeTab === 'discover' ? '#000000' : '#8b949e'}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="12" cy="12" r="3" fill="${props.activeTab === 'discover' ? '#000000' : '#8b949e'}"/>
  </svg>
`

const getPluginsIcon = () => `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z" stroke="${props.activeTab === 'plugins' ? '#000000' : '#8b949e'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`

const getMoreIcon = () => `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="5" r="2" fill="#8b949e"/>
    <circle cx="12" cy="12" r="2" fill="#8b949e"/>
    <circle cx="12" cy="19" r="2" fill="#8b949e"/>
  </svg>
`

const sidebarItems = [
  { id: 'home' as TabType, label: 'Home', icon: getHomeIcon },
  { id: 'connections' as TabType, label: 'Connections', icon: getConnectionsIcon },
  { id: 'search' as TabType, label: 'Search', icon: getSearchIcon },
  { id: 'discover' as TabType, label: 'Discover', icon: getDiscoverIcon },
  { id: 'plugins' as TabType, label: 'Plugins', icon: getPluginsIcon }
]
</script>

<template>
  <div class="sidebar">
    <!-- Navigation Items -->
    <div class="sidebar-nav">
      <div
        v-for="item in sidebarItems"
        :key="item.id"
        class="sidebar-item"
        :class="{ active: activeTab === item.id }"
        @click="handleTabClick(item.id)"
        :title="item.label"
      >
        <div class="sidebar-icon" v-html="item.icon()"></div>
      </div>
    </div>

    <!-- More Menu -->
    <div class="sidebar-more" @click="handleMoreClick" title="More">
      <div class="sidebar-icon" v-html="getMoreIcon()"></div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 50px;
  bottom: 0;
  width: 80px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  z-index: 2000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 12px;
  overflow-y: auto;
}

.sidebar-item {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 auto;
}

.sidebar-item:hover {
  background: #e0e0e0;
}

.sidebar-item.active {
  background: #000;
}

.sidebar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-icon svg {
  width: 24px;
  height: 24px;
}

.sidebar-more {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 24px;
  transition: background 0.2s ease;
}

.sidebar-more:hover {
  background: #e0e0e0;
}

/* Tooltip */
.sidebar-item[title]:hover::after,
.sidebar-more[title]:hover::after {
  content: attr(title);
  position: absolute;
  left: 72px;
  background: #333;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
