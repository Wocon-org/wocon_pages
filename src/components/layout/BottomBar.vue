<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

interface TabItem {
  name: string
  path: string
  icon: string
}

const tabs: TabItem[] = [
  { name: '搜索', path: '/search', icon: 'search' },
  { name: '人脉', path: '/connections', icon: 'connections' },
  { name: '发现', path: '/discover', icon: 'discover' },
  { name: '家', path: '/home', icon: 'home' }
]

const activeIndex = computed(() => {
  return tabs.findIndex(tab => tab.path === route.path)
})

const goToTab = (index: number) => {
  router.push(tabs[index].path)
}

const getIconSvg = (icon: string) => {
  const icons: Record<string, string> = {
    search: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
      <path d="M16 16L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    connections: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
      <path d="M6 21V19C6 15.6863 8.68629 13 12 13C15.3137 13 18 15.6863 18 19V21" stroke="currentColor" stroke-width="2"/>
      <path d="M18 7C18 9.20914 19.7909 11 22 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    discover: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
      <path d="M12 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 18V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M2 12H6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M18 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>`,
    home: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12L12 3L21 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 12V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  }
  return icons[icon] || icons.search
}
</script>

<template>
  <div class="bottom-bar">
    <div class="bar-slider" :style="{ transform: `translateX(${activeIndex * 100}%)` }"></div>
    <div
      v-for="(tab, index) in tabs"
      :key="tab.name"
      class="bar-item"
      :class="{ active: activeIndex === index }"
      @click="goToTab(index)"
    >
      <div class="icon-wrapper" v-html="getIconSvg(tab.icon)"></div>
      <span class="tab-label">{{ tab.name }}</span>
    </div>
  </div>
</template>

<style scoped>
.bottom-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 120px);
  max-width: 500px;
  height: 60px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 30px;
  display: flex;
  overflow: hidden;
  z-index: 100;
}

.bar-slider {
  position: absolute;
  width: 25%;
  height: 100%;
  background: #30363d;
  transition: transform 0.3s ease;
  border-radius: 30px;
}

.bar-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #8b949e;
  transition: color 0.3s ease;
  z-index: 1;
}

.bar-item.active {
  color: #ffffff;
}

.icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-label {
  font-size: 11px;
  margin-top: 4px;
  font-weight: 500;
}
</style>
