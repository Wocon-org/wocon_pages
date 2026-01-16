<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/common/Sidebar.vue'
import WoconMap from '@/components/WoconMap.vue'

const router = useRouter()
const activeSection = ref(0)
const showSidebar = ref(false)
const showCreateMenu = ref(false)
const searchQuery = ref('')

const toggleCreateMenu = () => {
  showCreateMenu.value = !showCreateMenu.value
}

const handleCreateTrip = () => {
  showCreateMenu.value = false
  router.push('/create-trip')
}

const handleMenuClickOutside = () => {
  showCreateMenu.value = false
}

const sliderStyle = computed(() => ({
  transform: `translateX(${activeSection.value * 100}%)`,
}))

const sections = [
  { name: 'Search', placeholder: 'Search destinations or trip ID', activity: 'No activities currently' },
  { name: 'Connections', placeholder: 'View friends', activity: null },
  { name: 'Discover', placeholder: 'Discover page' },
  { name: 'Home', placeholder: 'Home page' }
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
  <div class="homepage-container" @click="handleMenuClickOutside">
    <div class="top-logo">
      <img src="/woconlogo.png" alt="wocon logo" class="page-logo" />
    </div>

    <div class="home-layout" @click.stop>
      <div class="home-left">
        <WoconMap mode="global" />
        <div class="sidebar-trigger" @click="showSidebar = true"></div>
      </div>

      <div class="home-right">
        <!-- Top bar with circular buttons -->
        <div class="top-bar">
          <div class="top-bar-left">
            <div class="circular-button settings-button" @click="router.push('/settings')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
              </svg>
            </div>
          </div>
          <div class="top-bar-right">
            <div class="circular-button profile-button" @click="router.push('/profile')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="create-menu-wrapper">
          <div class="create-button" @click="toggleCreateMenu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <!-- Content sections -->
        <div class="content-container">
          <div class="content-slider" :style="sliderStyle">
            <div v-for="(section, index) in sections" :key="index" class="content-section">
              <div v-if="index === 0" class="search-section">
                <div class="search-input-wrapper">
                  <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="7" stroke="#8b949e" stroke-width="2"/>
                    <path d="M16 16L21 21" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <input v-model="searchQuery" type="text" class="search-input" :placeholder="section.placeholder" />
                </div>
                <div v-if="searchQuery === ''" class="activity-placeholder">{{ section.activity }}</div>
              </div>
              <div v-else class="content-placeholder">{{ section.placeholder }}</div>
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

    <Teleport to="body">
      <div v-if="showCreateMenu" class="create-menu-overlay" @click="handleMenuClickOutside">
        <div class="create-menu" @click.stop>
          <div class="menu-item" @click="handleCreateTrip">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Create Trip</span>
          </div>
          <div class="menu-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#8b949e" stroke-width="2"/>
              <path d="M12 6V12L16 14" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Create Event</span>
          </div>
          <div class="menu-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17 8L12 3L7 8" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 3V15" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Upload Content</span>
          </div>
        </div>
      </div>
    </Teleport>
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

.top-bar {
  position: absolute;
  top: 24px;
  left: 24px;
  right: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.top-bar-left {
  display: flex;
  gap: 16px;
}

.top-bar-right {
  display: flex;
  gap: 16px;
}

.circular-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(22, 27, 34, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(48, 54, 61, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b949e;
  transition: all 0.2s ease;
}

.circular-button:hover {
  background: rgba(33, 38, 45, 0.9);
  color: #c9d1d9;
  transform: scale(1.05);
}

.circular-button:active {
  transform: scale(0.95);
}

.circular-button svg {
  flex-shrink: 0;
}

.create-button {
  width: 40px;
  height: 40px;
  background: #238636;
  border: 1px solid #2ea043;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.create-button:hover {
  background: #2ea043;
}

.create-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  animation: fadeIn 0.15s ease;
}

.create-menu {
  position: absolute;
  top: 64px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(33, 38, 45, 0.98);
  backdrop-filter: blur(8px);
  border: 1px solid #30363d;
  border-radius: 8px;
  min-width: 180px;
  overflow: hidden;
  animation: fadeIn 0.15s ease;
  z-index: 102;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
  color: #c9d1d9;
  font-size: 14px;
}

.menu-item:hover {
  background: #21262d;
}

.menu-item span {
  flex: 1;
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

.create-menu-wrapper {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 101;
}
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

.search-section {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 60px;
  gap: 20px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 400px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 12px 16px;
  transition: border-color 0.2s ease;
}

.search-input-wrapper:focus-within {
  border-color: #5865F2;
}

.search-icon {
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #c9d1d9;
  font-size: 16px;
}

.search-input::placeholder {
  color: #8b949e;
}

.activity-placeholder {
  color: #8b949e;
  font-size: 24px;
  text-align: center;
  margin-top: 20px;
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
