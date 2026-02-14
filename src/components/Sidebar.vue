<script setup lang="ts">
import { h, type FunctionalComponent } from 'vue'

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
const HomeIcon: FunctionalComponent = () => h('svg', {
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M3 12L12 3L21 12' }),
  h('path', { d: 'M5 12V20a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V12' })
])

const ConnectionsIcon: FunctionalComponent = () => h('svg', {
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('circle', { cx: '12', cy: '7', r: '4' }),
  h('path', { d: 'M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2' }),
  h('path', { d: 'M18 7a2 2 0 1 1 4 0' })
])

const SearchIcon: FunctionalComponent = () => h('svg', {
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('circle', { cx: '11', cy: '11', r: '7' }),
  h('path', { d: 'm16 16 5 5' })
])

const DiscoverIcon: FunctionalComponent = () => h('svg', {
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('circle', { cx: '12', cy: '12', r: '10' }),
  h('path', { d: 'M12 2v4' }),
  h('path', { d: 'M12 18v4' }),
  h('path', { d: 'M2 12h4' }),
  h('path', { d: 'M18 12h4' }),
  h('circle', { cx: '12', cy: '12', r: '3', fill: 'currentColor' })
])

const PluginsIcon: FunctionalComponent = () => h('svg', {
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5A2.5 2.5 0 0 0 10.5 1 2.5 2.5 0 0 0 8 3.5V5H4a2 2 0 0 0-2 2v3.8h1.5a2.7 2.7 0 0 1 0 5.4H2V20a2 2 0 0 0 2 2h3.8v-1.5a2.7 2.7 0 0 1 5.4 0V22H17a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z' })
])

const MoreIcon: FunctionalComponent = () => h('svg', {
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'currentColor'
}, [
  h('circle', { cx: '12', cy: '5', r: '2' }),
  h('circle', { cx: '12', cy: '12', r: '2' }),
  h('circle', { cx: '12', cy: '19', r: '2' })
])

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
  background: var(--md3-surface);
  border-right: 1px solid var(--md3-surface-variant);
  display: flex;
  flex-direction: column;
  z-index: 2000;
  box-shadow: var(--md3-elevation-2);
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
  border-radius: var(--md3-radius-large);
  border: 1px solid transparent;
  background: var(--md3-surface-variant);
  color: var(--md3-on-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--md3-transition-short);
  outline: none;
  position: relative;
}

.sidebar-item:hover,
.sidebar-item:focus-visible {
  background: var(--md3-primary-container);
  color: var(--md3-primary);
  border-color: var(--md3-primary);
  transform: translateY(-1px);
  box-shadow: var(--md3-elevation-2);
}

.sidebar-item.active {
  background: var(--md3-primary);
  color: var(--md3-on-primary);
  border-color: var(--md3-primary-light);
  transform: scale(0.95);
  box-shadow: var(--md3-elevation-3);
}

.sidebar-more {
  width: 48px;
  height: 48px;
  border-radius: var(--md3-radius-large);
  border: 1px solid transparent;
  background: var(--md3-surface-variant);
  color: var(--md3-on-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all var(--md3-transition-short);
  outline: none;
  position: relative;
}

.sidebar-more:hover,
.sidebar-more:focus-visible {
  background: var(--md3-primary-container);
  color: var(--md3-primary);
  border-color: var(--md3-primary);
  transform: translateY(-1px);
  box-shadow: var(--md3-elevation-2);
}

/* Tooltip */
.sidebar-item[title]:hover::after,
.sidebar-more[title]:hover::after {
  content: attr(title);
  position: absolute;
  left: 80px;
  background: var(--md3-surface);
  color: var(--md3-on-surface);
  padding: var(--md3-space-2) var(--md3-space-3);
  border-radius: var(--md3-radius-medium);
  font-size: var(--md3-label-small);
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  animation: fadeIn var(--md3-transition-short);
  border: 1px solid var(--md3-surface-variant);
  box-shadow: var(--md3-elevation-3);
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

/* Dark Theme */
@media (prefers-color-scheme: dark) {
  .sidebar {
    background: var(--md3-surface);
    border-right: 1px solid var(--md3-surface-variant);
  }
  
  .sidebar-item {
    background: var(--md3-surface-variant);
    color: var(--md3-on-surface-variant);
  }
  
  .sidebar-item:hover,
  .sidebar-item:focus-visible {
    background: var(--md3-primary-container);
    color: var(--md3-primary);
  }
  
  .sidebar-item.active {
    background: var(--md3-primary);
    color: var(--md3-on-primary);
  }
  
  .sidebar-more {
    background: var(--md3-surface-variant);
    color: var(--md3-on-surface-variant);
  }
  
  .sidebar-more:hover,
  .sidebar-more:focus-visible {
    background: var(--md3-primary-container);
    color: var(--md3-primary);
  }
  
  .sidebar-item[title]:hover::after,
  .sidebar-more[title]:hover::after {
    background: var(--md3-surface);
    color: var(--md3-on-surface);
    border: 1px solid var(--md3-surface-variant);
  }
}
</style>
