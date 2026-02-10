<script setup lang="ts">
import type { FunctionalComponent } from 'vue'

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

const handleTabClick = (tab: TabType) => {
  emit('tabChange', tab)
}

const handleMoreClick = () => {
  emit('moreClick')
}

// 图标组件：统一用 currentColor，方便通过 CSS 控制
const HomeIcon: FunctionalComponent = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 12L12 3L21 12" />
    <path d="M5 12V20a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V12" />
  </svg>
)

const ConnectionsIcon: FunctionalComponent = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <path d="M18 7a2 2 0 1 1 4 0" />
  </svg>
)

const SearchIcon: FunctionalComponent = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m16 16 5 5" />
  </svg>
)

const DiscoverIcon: FunctionalComponent = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
)

const PluginsIcon: FunctionalComponent = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5A2.5 2.5 0 0 0 10.5 1 2.5 2.5 0 0 0 8 3.5V5H4a2 2 0 0 0-2 2v3.8h1.5a2.7 2.7 0 0 1 0 5.4H2V20a2 2 0 0 0 2 2h3.8v-1.5a2.7 2.7 0 0 1 5.4 0V22H17a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z" />
  </svg>
)

const MoreIcon: FunctionalComponent = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
)

const sidebarItems = [
  { id: 'home' as TabType, label: 'Home', icon: HomeIcon },
  { id: 'connections' as TabType, label: 'Connections', icon: ConnectionsIcon },
  { id: 'search' as TabType, label: 'Search', icon: SearchIcon },
  { id: 'discover' as TabType, label: 'Discover', icon: DiscoverIcon },
  { id: 'plugins' as TabType, label: 'Plugins', icon: PluginsIcon }
]
</script>

<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <button
        v-for="item in sidebarItems"
        :key="item.id"
        class="sidebar-item"
        :class="{ active: activeTab === item.id }"
        @click="handleTabClick(item.id)"
        :title="item.label"
        :aria-label="item.label"
      >
        <component :is="item.icon" />
      </button>
    </nav>

    <button class="sidebar-more" @click="handleMoreClick" title="More" aria-label="More">
      <MoreIcon />
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 56px; /* 与新的 TopBar 高度对齐 */
  bottom: 0;
  width: 72px;
  background: #0d1117;
  border-right: 1px solid #30363d;
  display: flex;
  flex-direction: column;
  z-index: 2000;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  overflow-y: auto;
}

.sidebar-item {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #8b949e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.sidebar-item:hover,
.sidebar-item:focus-visible {
  background: #161b22;
  color: #e6e6e6;
}

.sidebar-item.active {
  background: #000;
  color: #e6e6e6;
  transform: scale(0.95);
}

.sidebar-more {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #8b949e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  outline: none;
}

.sidebar-more:hover,
.sidebar-more:focus-visible {
  background: #161b22;
  color: #e6e6e6;
}

/* Tooltip */
.sidebar-item[title]:hover::after,
.sidebar-more[title]:hover::after {
  content: attr(title);
  position: absolute;
  left: 80px;
  background: #0d1117;
  color: #e6e6e6;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  animation: fadeIn 0.2s ease;
  border: 1px solid #30363d;
  z-index: 3000;
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
