<script setup lang="ts">
import { ref, computed } from 'vue'
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

const layerIcon = computed(() =>
  currentLayer.value === 'dark'
    ? 'M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a8.97 8.97 0 0 1-3.62-1.36M12 3v1m0 16v1m8.66-12.66l-.7.7M4.05 17.95l-.7.7M21 12h-1M4 12H3m12.66 5.66l-.7-.7M4.05 6.05l-.7-.7M16.36 9a8.97 8.97 0 0 0-1.36-3.62M7.64 9A8.97 8.97 0 0 1 9 7.64' // satellite
    : 'M12 2a10 10 0 0 0-9.95 9.14 10 10 0 0 0 7.08 15.56 10 10 0 0 0 11.74-3.54A10 10 0 0 0 12 2z' // dark
)

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
      <span class="logo-text">Wocon</span>
    </div>

    <nav class="top-bar-actions">
      <button
        class="action-btn"
        @click="handleSwitchLayer"
        :title="currentLayer === 'dark' ? 'Switch to Satellite' : 'Switch to Dark'"
        aria-label="Switch map layer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path :d="layerIcon" />
        </svg>
      </button>

      <a
        href="https://github.com"
        target="_blank"
        rel="noopener"
        class="action-btn"
        title="GitHub"
        aria-label="GitHub"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
          />
        </svg>
      </a>

      <a
        href="https://wocon-org.github.io/"
        target="_blank"
        rel="noopener"
        class="action-btn"
        title="Download"
        aria-label="Download"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </a>

      <button class="action-btn" @click="handleSettings" title="Settings" aria-label="Settings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
          />
        </svg>
      </button>

      <button class="action-btn" @click="handleProfile" title="Profile" aria-label="Profile">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
  height: 56px;
  background: #0d1117;
  border-bottom: 1px solid #30363d;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.top-bar-logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #8be9fd 0%, #bd93f9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
}

.top-bar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1e1e1e;
  border: 1px solid #30363d;
  color: #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.action-btn:hover,
.action-btn:focus-visible {
  background: #30363d;
  border-color: #8be9fd;
  color: #8be9fd;
  transform: translateY(-1px);
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

@media (max-width: 640px) {
  .top-bar {
    padding: 0 12px;
  }
  .logo-text {
    font-size: 1.1rem;
  }
  .action-btn {
    width: 36px;
    height: 36px;
  }
}
</style>