<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

interface Props {
  showSidebar: boolean
}

interface Emits {
  (e: 'update:showSidebar', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const goToRandomPage = () => {
  router.push('/')
}

const goToSettings = () => {
  router.push('/settings')
}
</script>

<template>
  <div class="sidebar-overlay" :class="{ show: props.showSidebar }" @click="emit('update:showSidebar', false)"></div>
  <div class="sidebar" :class="{ show: props.showSidebar }">
    <div class="sidebar-content">
        <div class="sidebar-items">
        <div class="sidebar-item" @click="goToRandomPage">Homepage</div>
        <div class="sidebar-item" @click="goToSettings">Settings</div>
        <div class="sidebar-item">Contact Us</div>
      </div>
    </div>
    <div class="sidebar-cancel" @click="emit('update:showSidebar', false)">Cancel</div>
  </div>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  background: #161b22;
  border-right: 1px solid #30363d;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 100;
  overflow: hidden;
}

.sidebar.show {
  transform: translateX(0);
}

.sidebar-content {
  display: flex;
  flex-direction: column;
}

.sidebar-items {
  flex: 1;
}

.sidebar-item {
  padding: 16px 20px;
  border-bottom: 1px solid #30363d;
  color: #c9d1d9;
  cursor: pointer;
  transition: background 0.2s ease;
}

.sidebar-item:hover {
  background: #21262d;
}

.sidebar-cancel {
  position: absolute;
  bottom: 40px;
  left: 60px;
  width: 280px;
  padding: 16px 20px;
  color: #f85149;
  cursor: pointer;
  transition: background 0.2s ease;
  font-weight: 500;
  background: #161b22;
}

.sidebar-cancel:hover {
  background: #21262d;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 99;
}

.sidebar-overlay.show {
  opacity: 1;
  pointer-events: auto;
}
</style>
