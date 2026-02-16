<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogoClick = () => {
  router.push('/')
}

const emit = defineEmits<{
  switchLayer: [layer: 'dark' | 'satellite']
}>()

const currentLayer = ref<'dark' | 'satellite'>('dark')
const showMoreMenu = ref(false)

const handleSwitchLayer = () => {
  const newLayer: 'dark' | 'satellite' = currentLayer.value === 'dark' ? 'satellite' : 'dark'
  currentLayer.value = newLayer
  emit('switchLayer', newLayer)
  showMoreMenu.value = false
}

const handleSettings = () => {
  router.push('/settings')
  showMoreMenu.value = false
}

const handleProfile = () => {
  router.push('/profile')
  showMoreMenu.value = false
}

const handleCreateTrip = () => {
  router.push('/create-trip')
  showMoreMenu.value = false
}

const handleDocumentation = () => {
  router.push('/documentation')
  showMoreMenu.value = false
}

const toggleMoreMenu = () => {
  showMoreMenu.value = !showMoreMenu.value
}

const closeMoreMenu = () => {
  showMoreMenu.value = false
}
</script>

<template>
  <header class="top-bar">
    <div class="top-bar-logo" @click="handleLogoClick">
      <span class="logo-text">WOCON</span>
    </div>

    <!-- 桌面端完整按钮 -->
    <nav class="top-bar-actions desktop-actions" role="navigation" aria-label="Top bar actions">
      <!-- 地图图层切换按钮 -->
      <button
        class="action-btn"
        :class="{ active: currentLayer === 'satellite' }"
        @click="handleSwitchLayer"
        :title="currentLayer === 'dark' ? 'Switch to Satellite Map' : 'Switch to Dark Map'"
        aria-label="Switch map layer"
        @keydown.enter="handleSwitchLayer"
        @keydown.space="handleSwitchLayer"
        tabindex="0"
      >
        <!-- 深色地图图标 -->
        <svg v-if="currentLayer === 'dark'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <!-- 卫星地图图标 -->
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </button>

      <!-- GitHub 链接 -->
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener"
        class="action-btn"
        title="GitHub Repository"
        aria-label="Visit GitHub repository"
        tabindex="0"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      </a>

      <!-- 下载按钮 -->
      <a
        href="https://wocon-org.github.io/"
        target="_blank"
        rel="noopener"
        class="action-btn"
        title="Download App"
        aria-label="Download WOCON app"
        tabindex="0"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </a>

      <!-- 设置按钮 -->
      <button
        class="action-btn"
        @click="handleSettings"
        title="Settings"
        aria-label="Open settings"
        @keydown.enter="handleSettings"
        @keydown.space="handleSettings"
        tabindex="0"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>

      <!-- 创建行程按钮 -->
      <button
        class="action-btn"
        @click="handleCreateTrip"
        title="Create Trip"
        aria-label="Create a new trip"
        @keydown.enter="handleCreateTrip"
        @keydown.space="handleCreateTrip"
        tabindex="0"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <!-- 个人资料按钮 -->
      <button
        class="action-btn"
        @click="handleProfile"
        title="Profile"
        aria-label="Open profile"
        @keydown.enter="handleProfile"
        @keydown.space="handleProfile"
        tabindex="0"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>
    </nav>

    <!-- 移动端更多菜单按钮 -->
    <nav class="top-bar-actions mobile-actions" role="navigation" aria-label="Top bar actions">
      <!-- 创建行程按钮 -->
      <button
        class="action-btn"
        @click="handleCreateTrip"
        title="Create Trip"
        aria-label="Create a new trip"
        @keydown.enter="handleCreateTrip"
        @keydown.space="handleCreateTrip"
        tabindex="0"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <!-- 更多选项按钮 -->
      <div class="more-menu-container">
        <button
          class="action-btn"
          @click="toggleMoreMenu"
          :title="showMoreMenu ? 'Close Menu' : 'More Options'"
          :aria-label="showMoreMenu ? 'Close menu' : 'More options'"
          @keydown.enter="toggleMoreMenu"
          @keydown.space="toggleMoreMenu"
          tabindex="0"
          :class="{ active: showMoreMenu }"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        <!-- 更多选项菜单 -->
        <div v-if="showMoreMenu" class="more-menu show" @click.stop>
          <div class="more-menu-content">
            <!-- 地图图层切换 -->
            <button
              class="more-menu-item"
              :class="{ active: currentLayer === 'satellite' }"
              @click="handleSwitchLayer"
              @keydown.enter="handleSwitchLayer"
              @keydown.space="handleSwitchLayer"
              tabindex="0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{{ currentLayer === 'dark' ? 'Switch to Satellite Map' : 'Switch to Dark Map' }}</span>
            </button>

            <!-- GitHub 链接 -->
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener"
              class="more-menu-item"
              @click="closeMoreMenu"
              tabindex="0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              <span>GitHub Repository</span>
            </a>

            <!-- 下载按钮 -->
            <a
              href="https://wocon-org.github.io/"
              target="_blank"
              rel="noopener"
              class="more-menu-item"
              @click="closeMoreMenu"
              tabindex="0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download App</span>
            </a>

            <!-- 设置按钮 -->
            <button
              class="more-menu-item"
              @click="handleSettings"
              @keydown.enter="handleSettings"
              @keydown.space="handleSettings"
              tabindex="0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span>Settings</span>
            </button>

            <!-- 个人资料按钮 -->
            <button
              class="more-menu-item"
              @click="handleProfile"
              @keydown.enter="handleProfile"
              @keydown.space="handleProfile"
              tabindex="0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Profile</span>
            </button>

            <!-- 查看文档按钮 -->
            <button
              class="more-menu-item"
              @click="handleDocumentation"
              @keydown.enter="handleDocumentation"
              @keydown.space="handleDocumentation"
              tabindex="0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>View Documentation</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--md3-surface);
  border-bottom: 2px solid var(--md3-primary);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  transition: all var(--md3-transition-medium);
  box-shadow: var(--md3-elevation-1);
}

.top-bar-logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--md3-primary);
  letter-spacing: 2px;
  text-transform: uppercase;
  font-family: var(--md3-font-family);
}

.top-bar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--md3-radius-small);
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  color: var(--md3-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--md3-transition-short);
  outline: none;
}

.action-btn:hover,
.action-btn:focus-visible {
  background: var(--md3-primary);
  color: var(--md3-on-primary);
  transform: translateY(-2px);
  box-shadow: var(--md3-elevation-2);
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

/* Swiss Design: Active state for buttons */
.action-btn.active {
  background: var(--md3-primary);
  color: var(--md3-on-primary);
}

/* More Menu Styles */
.more-menu-container {
  position: relative;
}

.more-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-small);
  box-shadow: var(--md3-elevation-3);
  min-width: 240px;
  z-index: 2100;
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
  transition: all var(--md3-transition-medium);
  pointer-events: none;
}

.more-menu.show {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.more-menu-content {
  display: flex;
  flex-direction: column;
}

.more-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--md3-on-surface);
  font-size: var(--md3-body-medium);
  font-family: var(--md3-font-family);
  cursor: pointer;
  transition: all var(--md3-transition-short);
  text-align: left;
  outline: none;
  text-decoration: none;
}

.more-menu-item:hover,
.more-menu-item:focus-visible {
  background: var(--md3-primary-container);
  color: var(--md3-primary);
  transform: translateX(4px);
}

.more-menu-item.active {
  background: var(--md3-primary-container);
  color: var(--md3-primary);
}

.more-menu-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Responsive Design */
.mobile-actions {
  display: none;
}

@media (max-width: 768px) {
  .desktop-actions {
    display: none;
  }

  .mobile-actions {
    display: flex;
  }

  .top-bar {
    padding: 0 16px;
    height: 56px;
  }

  .logo-text {
    font-size: 1.25rem;
    letter-spacing: 1px;
  }

  .top-bar-actions {
    gap: 12px;
  }

  .action-btn {
    width: 36px;
    height: 36px;
  }

  .action-btn svg {
    width: 16px;
    height: 16px;
  }

  .more-menu {
    min-width: 200px;
    margin-top: 6px;
  }

  .more-menu-item {
    padding: 10px 14px;
    font-size: var(--md3-body-small);
  }
}

/* Dark Theme */
@media (prefers-color-scheme: dark) {
  .top-bar {
    background: var(--md3-surface);
    border-bottom: 2px solid var(--md3-primary);
  }

  .logo-text {
    color: var(--md3-primary-light);
  }

  .action-btn {
    background: var(--md3-surface);
    border: 2px solid var(--md3-primary);
    color: var(--md3-primary);
  }

  .action-btn:hover,
  .action-btn:focus-visible {
    background: var(--md3-primary);
    color: var(--md3-on-primary);
  }

  .more-menu {
    background: var(--md3-surface);
    border: 2px solid var(--md3-primary);
  }

  .more-menu-item {
    color: var(--md3-on-surface);
  }

  .more-menu-item:hover,
  .more-menu-item:focus-visible {
    background: rgba(0, 180, 171, 0.1);
    color: var(--md3-primary);
  }

  .more-menu-item.active {
    background: rgba(0, 180, 171, 0.1);
    color: var(--md3-primary);
  }
}

/* Show more menu when active */
/* Removed global override to allow conditional display */
</style>
