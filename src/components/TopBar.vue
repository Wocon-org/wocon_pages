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
    ? 'M21 19.998a10 10 0 0 1-19.95 1.32 10 10 0 0 1 17.2-14.14 10 10 0 0 1 2.75 12.82zM12 3v2M12 19v2M19 12h2M3 12h2M16.17 7.83l1.41 1.41M6.41 17.59l1.41 1.41M16.17 16.17l-1.41 1.41M6.41 6.41l-1.41 1.41' // satellite
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
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </a>

      <button class="action-btn" @click="handleSettings" title="Settings" aria-label="Settings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <button class="action-btn" @click="handleProfile" title="Profile" aria-label="Profile">
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
  height: 56px;
  background: var(--md3-surface);
  border-bottom: 1px solid var(--md3-surface-variant);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  transition: all var(--md3-transition-medium);
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
  text-shadow: 0 2px 4px rgba(139, 233, 253, 0.3);
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
  background: var(--md3-surface-variant);
  border: 1px solid var(--md3-surface-variant-dark);
  color: var(--md3-on-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--md3-transition-short);
  outline: none;
}

.action-btn:hover,
.action-btn:focus-visible {
  background: var(--md3-primary-container);
  border-color: var(--md3-primary);
  color: var(--md3-primary);
  transform: translateY(-1px);
  box-shadow: var(--md3-elevation-2);
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

/* Dark Theme */
@media (prefers-color-scheme: dark) {
  .top-bar {
    background: var(--md3-surface);
    border-bottom: 1px solid var(--md3-surface-variant);
  }

  .logo-text {
    background: linear-gradient(135deg, var(--md3-primary-light) 0%, var(--md3-primary) 100%);
  }

  .action-btn {
    background: var(--md3-surface-variant);
    border: 1px solid var(--md3-surface-variant-dark);
    color: var(--md3-on-surface);
  }

  .action-btn:hover,
  .action-btn:focus-visible {
    background: var(--md3-primary-container);
    border-color: var(--md3-primary);
    color: var(--md3-primary);
  }
}
</style>
