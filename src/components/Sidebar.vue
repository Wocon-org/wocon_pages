<script setup lang="ts">
import { h, ref, type FunctionalComponent, onMounted, onUnmounted } from 'vue'

type TabType = 'home' | 'connections' | 'search' | 'discover' | 'plugins'

type MoreOptionType = 'settings' | 'help' | 'about' | 'logout' | 'docs'

interface Props {
  activeTab: TabType
}

interface Emits {
  (e: 'tabChange', tab: TabType): void
  (e: 'moreOptionClick', option: MoreOptionType): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isMoreMenuOpen = ref(false)

const handleTabClick = (tab: TabType) => {
  emit('tabChange', tab)
}

const toggleMoreMenu = () => {
  isMoreMenuOpen.value = !isMoreMenuOpen.value
}

const handleMoreOptionClick = (option: MoreOptionType) => {
  emit('moreOptionClick', option)
  isMoreMenuOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.sidebar-more-container')) {
    isMoreMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

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
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('line', { x1: '4', y1: '12', x2: '20', y2: '12' }),
  h('line', { x1: '4', y1: '6', x2: '20', y2: '6' }),
  h('line', { x1: '4', y1: '18', x2: '20', y2: '18' })
])

const SettingsIcon: FunctionalComponent = () => h('svg', {
  width: '20',
  height: '20',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('circle', { cx: '12', cy: '12', r: '3' }),
  h('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' })
])

const HelpIcon: FunctionalComponent = () => h('svg', {
  width: '20',
  height: '20',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('circle', { cx: '12', cy: '12', r: '10' }),
  h('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
  h('path', { d: 'M12 17h.01' })
])

const AboutIcon: FunctionalComponent = () => h('svg', {
  width: '20',
  height: '20',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('circle', { cx: '12', cy: '12', r: '10' }),
  h('path', { d: 'M12 16v-4' }),
  h('path', { d: 'M12 8h.01' })
])

const LogoutIcon: FunctionalComponent = () => h('svg', {
  width: '20',
  height: '20',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('path', { d: 'm9 21 12-12-12-12' }),
  h('path', { d: 'M21 12H9' })
])

const DocsIcon: FunctionalComponent = () => h('svg', {
  width: '20',
  height: '20',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' }),
  h('path', { d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' })
])

const sidebarItems = [
  { id: 'home' as TabType, label: 'HOME', icon: HomeIcon },
  { id: 'connections' as TabType, label: 'CONNECTIONS', icon: ConnectionsIcon },
  { id: 'search' as TabType, label: 'SEARCH', icon: SearchIcon },
  { id: 'discover' as TabType, label: 'DISCOVER', icon: DiscoverIcon },
  { id: 'plugins' as TabType, label: 'PLUGINS', icon: PluginsIcon }
]

const moreOptions = [
  { id: 'settings' as MoreOptionType, label: 'Settings', icon: SettingsIcon },
  { id: 'help' as MoreOptionType, label: 'Help', icon: HelpIcon },
  { id: 'docs' as MoreOptionType, label: 'Docs', icon: DocsIcon },
  { id: 'about' as MoreOptionType, label: 'About', icon: AboutIcon },
  { id: 'logout' as MoreOptionType, label: 'Logout', icon: LogoutIcon }
]
</script>

<template>
  <aside class="sidebar">
    <nav class="sidebar-nav" role="navigation" aria-label="Main navigation">
      <button
        v-for="item in sidebarItems"
        :key="item.id"
        class="sidebar-item"
        :class="{ active: activeTab === item.id }"
        @click="handleTabClick(item.id)"
        @keydown.enter="handleTabClick(item.id)"
        @keydown.space="handleTabClick(item.id)"
        :title="item.label"
        :aria-label="item.label"
        :aria-current="activeTab === item.id ? 'page' : 'false'"
        tabindex="0"
      >
        <component :is="item.icon" />
      </button>
    </nav>

    <div class="sidebar-more-container">
      <button
        class="sidebar-more"
        title="More"
        aria-label="More options"
        tabindex="0"
        @click="toggleMoreMenu"
        @keydown.enter="toggleMoreMenu"
        @keydown.space="toggleMoreMenu"
        :aria-expanded="isMoreMenuOpen"
      >
        <MoreIcon />
      </button>

      <div
        v-if="isMoreMenuOpen"
        class="sidebar-more-menu"
        role="menu"
        aria-label="More options"
      >
        <button
          v-for="option in moreOptions"
          :key="option.id"
          class="sidebar-more-item"
          @click="handleMoreOptionClick(option.id)"
          @keydown.enter="handleMoreOptionClick(option.id)"
          @keydown.space="handleMoreOptionClick(option.id)"
          :aria-label="option.label"
          role="menuitem"
          tabindex="0"
        >
          <component :is="option.icon" />
          <span>{{ option.label }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 60px; /* 与新的 TopBar 高度对齐 */
  bottom: 0;
  width: 80px;
  background: var(--md3-surface);
  border-right: 2px solid var(--md3-primary);
  display: flex;
  flex-direction: column;
  z-index: 2000;
  box-shadow: var(--md3-elevation-1);
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
  overflow-y: auto;
}

.sidebar-item {
  width: 56px;
  height: 56px;
  border-radius: var(--md3-radius-small);
  border: 2px solid var(--md3-primary);
  background: var(--md3-surface);
  color: var(--md3-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--md3-transition-medium);
  outline: none;
  position: relative;
  overflow: hidden;
}

.sidebar-item:hover,
.sidebar-item:focus-visible {
  background: var(--md3-primary);
  color: var(--md3-on-primary);
  transform: translateY(-3px) scale(1.05);
  box-shadow: var(--md3-elevation-3);
  border-color: var(--md3-primary-light);
}

.sidebar-item:hover svg,
.sidebar-item:focus-visible svg {
  transform: scale(1.1);
  transition: transform var(--md3-transition-medium);
}

.sidebar-item.active {
  background: var(--md3-primary);
  color: var(--md3-on-primary);
  box-shadow: var(--md3-elevation-2);
  border-color: var(--md3-primary-light);
}

.sidebar-more {
  width: 56px;
  height: 56px;
  border-radius: var(--md3-radius-small);
  border: 2px solid var(--md3-primary);
  background: var(--md3-surface);
  color: var(--md3-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 24px;
  margin-top: auto;
  margin-left: auto;
  margin-right: auto;
  transition: all var(--md3-transition-medium);
  outline: none;
  position: relative;
  overflow: hidden;
}

.sidebar-more:hover,
.sidebar-more:focus-visible {
  background: var(--md3-primary);
  color: var(--md3-on-primary);
  transform: translateY(-3px) scale(1.05);
  box-shadow: var(--md3-elevation-3);
  border-color: var(--md3-primary-light);
}

.sidebar-more:hover svg,
.sidebar-more:focus-visible svg {
  transform: scale(1.1);
  transition: transform var(--md3-transition-medium);
}

/* More Menu */
.sidebar-more-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
  margin-bottom: 24px;
}

.sidebar-more-menu {
  position: absolute;
  bottom: 72px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  box-shadow: var(--md3-elevation-3);
  padding: var(--md3-space-1);
  min-width: 160px;
  z-index: 4000;
  animation: menuFadeIn var(--md3-transition-short);
}

.sidebar-more-item {
  display: flex;
  align-items: center;
  gap: var(--md3-space-3);
  width: 100%;
  padding: var(--md3-space-2) var(--md3-space-3);
  border: none;
  background: transparent;
  color: var(--md3-primary);
  border-radius: var(--md3-radius-small);
  cursor: pointer;
  transition: all var(--md3-transition-medium);
  text-align: left;
  font-size: var(--md3-label-medium);
  font-weight: 600;
}

.sidebar-more-item:hover,
.sidebar-more-item:focus-visible {
  background: var(--md3-primary);
  color: var(--md3-on-primary);
  transform: translateX(4px);
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Tooltip */
.sidebar-item[title]:hover::after,
.sidebar-more[title]:hover::after {
  content: attr(title);
  position: absolute;
  left: 90px;
  background: var(--md3-surface);
  color: var(--md3-on-surface);
  padding: var(--md3-space-2) var(--md3-space-3);
  border-radius: var(--md3-radius-small);
  font-size: var(--md3-label-small);
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  animation: fadeIn var(--md3-transition-short);
  border: 2px solid var(--md3-primary);
  box-shadow: var(--md3-elevation-2);
  z-index: 3000;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
    border-right: 2px solid var(--md3-primary);
  }

  .sidebar-item {
    background: var(--md3-surface);
    border: 2px solid var(--md3-primary);
    color: var(--md3-primary);
  }

  .sidebar-item:hover,
  .sidebar-item:focus-visible {
    background: var(--md3-primary);
    color: var(--md3-on-primary);
    transform: translateY(-3px) scale(1.05);
    box-shadow: var(--md3-elevation-3);
    border-color: var(--md3-primary-light);
  }

  .sidebar-item:hover svg,
  .sidebar-item:focus-visible svg {
    transform: scale(1.1);
    transition: transform var(--md3-transition-medium);
  }

  .sidebar-item.active {
    background: var(--md3-primary);
    color: var(--md3-on-primary);
    border-color: var(--md3-primary-light);
  }

  .sidebar-more {
    background: var(--md3-surface);
    border: 2px solid var(--md3-primary);
    color: var(--md3-primary);
  }

  .sidebar-more:hover,
  .sidebar-more:focus-visible {
    background: var(--md3-primary);
    color: var(--md3-on-primary);
    transform: translateY(-3px) scale(1.05);
    box-shadow: var(--md3-elevation-3);
    border-color: var(--md3-primary-light);
  }

  .sidebar-more:hover svg,
  .sidebar-more:focus-visible svg {
    transform: scale(1.1);
    transition: transform var(--md3-transition-medium);
  }

  .sidebar-item[title]:hover::after,
  .sidebar-more[title]:hover::after {
    background: var(--md3-surface);
    color: var(--md3-on-surface);
    border: 2px solid var(--md3-primary);
  }
}

/* Responsive Design */
@media (max-width: 640px) {
  .sidebar {
    width: 64px;
  }
  .sidebar-nav {
    gap: 12px;
    padding: 16px 0;
  }
  .sidebar-item,
  .sidebar-more {
    width: 48px;
    height: 48px;
  }
  .sidebar-item svg,
  .sidebar-more svg {
    width: 20px;
    height: 20px;
  }
  .sidebar-item:hover,
  .sidebar-item:focus-visible {
    transform: translateY(-2px) scale(1.05);
  }
  .sidebar-item:hover svg,
  .sidebar-item:focus-visible svg {
    transform: scale(1.1);
  }
  .sidebar-more:hover,
  .sidebar-more:focus-visible {
    transform: translateY(-2px) scale(1.05);
  }
  .sidebar-more:hover svg,
  .sidebar-more:focus-visible svg {
    transform: scale(1.1);
  }
  .sidebar-more-container {
    margin-bottom: 16px;
  }
  .sidebar-more-menu {
    bottom: 64px;
    min-width: 140px;
  }
  .sidebar-more-item {
    padding: var(--md3-space-1) var(--md3-space-2);
    font-size: var(--md3-label-small);
  }
  .sidebar-more-item svg {
    width: 18px;
    height: 18px;
  }
}
</style>
