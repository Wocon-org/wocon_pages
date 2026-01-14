<script setup lang="ts">
import { ref, computed } from 'vue'
import Sidebar from '@/components/common/Sidebar.vue'
import WoconMap from '@/components/WoconMap.vue'

const activeSection = ref(0)
const showSidebar = ref(false)

const sliderStyle = computed(() => ({
  transform: `translateX(${activeSection.value * 100}%)`,
}))

const sections = [
  { name: '搜索', placeholder: '搜索页面' },
  { name: '人脉', placeholder: '人脉页面' },
  { name: '发现', placeholder: '发现页面' },
  { name: '家', placeholder: '家页面' }
]

const getIconSvg = (index: number) => {
  const icons = [
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="#8b949e" stroke-width="2"/>
      <path d="M16 16L21 21" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" stroke="#8b949e" stroke-width="2"/>
      <path d="M6 21V19C6 15.6863 8.68629 13 12 13C15.3137 13 18 15.6863 18 19V21" stroke="#8b949e" stroke-width="2"/>
      <path d="M18 7C18 9.20914 19.7909 11 22 11" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#8b949e" stroke-width="2"/>
      <path d="M12 2V6" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 18V22" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
      <path d="M2 12H6" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
      <path d="M18 12H22" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="3" fill="#8b949e"/>
    </svg>`,
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12L12 3L21 12" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 12V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V12" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  ]
  return icons[index]
}
</script>

<template>
  <div class="homepage-container">
    <div class="top-logo">
      <img src="/woconlogo.png" alt="wocon logo" class="page-logo" />
    </div>

    <div class="home-layout">
      <div class="home-left">
        <WoconMap mode="global" />
        <div class="sidebar-trigger" @click="showSidebar = true"></div>
      </div>

      <div class="home-right">
        <!-- Right section -->
        <div class="topbar">
          <div class="topbar-item"></div>
          <div class="topbar-item"></div>
        </div>

        <!-- Content sections -->
        <div class="content-container">
          <div class="content-slider" :style="sliderStyle">
            <div v-for="(section, index) in sections" :key="index" class="content-section">
              <div class="content-placeholder">{{ section.placeholder }}</div>
            </div>
          </div>
        </div>

        <div class="bottom-bar">
          <div class="bar-slider" :style="sliderStyle"></div>
          <div
            v-for="(section, index) in sections"
            :key="index"
            class="bar-section"
            :class="{ active: activeSection === index }"
            @click="activeSection = index"
          >
            <div class="icon-wrapper" v-html="getIconSvg(index)"></div>
          </div>
        </div>
      </div>
    </div>

    <Sidebar :showSidebar="showSidebar" @update:showSidebar="showSidebar = $event" />
  </div>
</template>

<style scoped>
.homepage-container {
  min-height: 100vh;
  background: #0d1117;
  position: relative;
}

.top-logo {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 1000;
}

.page-logo {
  width: 40px;
  height: 40px;
}

.home-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

.home-left {
  background: #161b22;
  position: relative;
  overflow: hidden;
}

.home-right {
  background: #0d1117;
  padding: 80px 60px;
  position: relative;
}

.topbar {
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 12px;
  overflow: hidden;
}

.topbar-item {
  width: 100px;
  height: 40px;
  cursor: pointer;
  border-right: 1px solid #30363d;
}

.topbar-item:last-child {
  border-right: none;
}

.content-container {
  width: 100%;
  height: calc(100% - 180px);
  overflow: hidden;
  position: relative;
}

.content-slider {
  display: flex;
  width: 400%;
  height: 100%;
  transition: transform 0.3s ease;
}

.content-section {
  width: 25%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-placeholder {
  color: #8b949e;
  font-size: 48px;
  text-align: center;
}

.bottom-bar {
  position: absolute;
  bottom: 40px;
  left: 60px;
  right: 60px;
  height: 60px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 30px;
  display: flex;
}

.bar-slider {
  position: absolute;
  width: 25%;
  height: 100%;
  background: #30363d;
  transition: transform 0.3s ease;
  border-radius: 30px;
}

.bar-section {
  flex: 1;
  height: 100%;
  cursor: pointer;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar-section:first-child {
  border-top-left-radius: 30px;
  border-bottom-left-radius: 30px;
}

.bar-section:last-child {
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
}

.bar-section.active {
  color: #ffffff;
}

.icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar-section.active svg {
  stroke: #ffffff;
}

.sidebar-trigger {
  position: absolute;
  bottom: 40px;
  left: 60px;
  width: 48px;
  height: 48px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 11;
}

.sidebar-trigger::before {
  content: '';
  display: block;
  width: 20px;
  height: 2px;
  background: #8b949e;
  box-shadow:
    0 -6px 0 #8b949e,
    0 6px 0 #8b949e;
}
</style>
