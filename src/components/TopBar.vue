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

const handleSwitchLayer = () => {
  const newLayer: 'dark' | 'satellite' = currentLayer.value === 'dark' ? 'satellite' : 'dark'
  currentLayer.value = newLayer
  emit('switchLayer', newLayer)
}

const handleSettings = () => {
  router.push('/settings')
}

const handleProfile = () => {
  router.push('/profile')
}
</script>

<template>
  <header class="top-bar">
    <div class="top-bar-logo" @click="handleLogoClick">
      <span class="logo-text">WOCON</span>
    </div>

    <nav class="top-bar-actions" role="navigation" aria-label="Top bar actions">
      <!-- 图层切换按钮 -->
      <button
        class="action-btn"
        :class="{ active: currentLayer === 'satellite' }"
        @click="handleSwitchLayer"
        :title="currentLayer === 'dark' ? 'Switch to Satellite View' : 'Switch to Dark View'"
        aria-label="Switch map layer"
        @keydown.enter="handleSwitchLayer"
        @keydown.space="handleSwitchLayer"
        tabindex="0"
      >
        <!-- 深色模式图标 -->
        <svg v-if="currentLayer === 'dark'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <!-- 卫星模式图标 -->
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
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
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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

@media (max-width: 640px) {
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
}
</style>
