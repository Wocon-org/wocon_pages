<script setup lang="ts">
interface Props {
  title?: string
  show?: boolean
  width?: string
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  show: true,
  width: '320px'
})

const emit = defineEmits<Emits>()

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <Transition name="panel-fade">
    <div v-if="show" class="panel-container" :style="{ width: props.width }">
      <!-- 面板头部 -->
      <div class="panel-header">
        <h3 v-if="title" class="panel-title">{{ title }}</h3>
        <button class="panel-close" @click="handleClose" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- 面板内容 -->
      <div class="panel-body">
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.panel-container {
  background: var(--md3-surface);
  border-radius: var(--md3-radius-smaller);
  box-shadow: var(--md3-elevation-3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 120px);
  border: 2px solid var(--md3-primary);
}

.panel-header {
  padding: var(--md3-space-3);
  border-bottom: 2px solid var(--md3-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--md3-surface);
  flex-shrink: 0;
}

.panel-title {
  font-size: var(--md3-title-medium);
  font-weight: 600;
  color: var(--md3-on-surface);
  margin: 0;
  font-family: var(--md3-font-family);
}

.panel-close {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-smaller);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--md3-primary);
  transition: all var(--md3-transition-short);
  padding: 0;
}

.panel-close:hover,
.panel-close:focus-visible {
  background: var(--md3-primary);
  color: var(--md3-surface);
  transform: scale(1.05);
}

.panel-close:active {
  transform: scale(0.95);
}

.panel-body {
  padding: var(--md3-space-3);
  overflow-y: auto;
  flex: 1;
  color: var(--md3-on-surface);
  font-family: var(--md3-font-family);
}

/* 滚动条样式 */
.panel-body::-webkit-scrollbar {
  width: 6px;
}

.panel-body::-webkit-scrollbar-track {
  background: var(--md3-surface-variant);
  border-radius: var(--md3-radius-smaller);
}

/* 面板显隐过渡 */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity var(--md3-transition-short), transform var(--md3-transition-short);
}
.panel-fade-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.panel-fade-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.panel-body::-webkit-scrollbar-thumb {
  background: var(--md3-primary);
  border-radius: var(--md3-radius-smaller);
}

.panel-body::-webkit-scrollbar-thumb:hover {
  background: var(--md3-primary-light);
}
</style>
