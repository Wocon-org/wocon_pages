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
  background: #161b22;
  border-radius: 20px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 120px);
  border: 1px solid #30363d;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #161b22;
  flex-shrink: 0;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #e6e6e6;
  margin: 0;
}

.panel-close {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #8b949e;
  transition: all 0.2s ease;
  padding: 0;
}

.panel-close:hover,
.panel-close:focus-visible {
  background: #30363d;
  color: #e6e6e6;
}

.panel-close:active {
  background: #21262d;
}

.panel-body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  color: #c9d1d9;
}

/* 滚动条样式 */
.panel-body::-webkit-scrollbar {
  width: 6px;
}

.panel-body::-webkit-scrollbar-track {
  background: #0d1117;
  border-radius: 3px;
}

/* 面板显隐过渡 */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
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
  background: #30363d;
  border-radius: 3px;
}

.panel-body::-webkit-scrollbar-thumb:hover {
  background: #8b949e;
}
</style>
