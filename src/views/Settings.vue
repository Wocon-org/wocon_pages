<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '@/components/common/Sidebar.vue'

const showSidebar = ref(false)
</script>

<template>
  <div class="settings-container">
    <div class="sidebar-trigger" @click="showSidebar = true"></div>

    <div class="settings-section">
      <div class="section-header">账号</div>
      <div class="section-content"></div>
    </div>

    <div class="settings-section">
      <div class="section-header">通知</div>
      <div class="section-content"></div>
    </div>

    <div class="settings-section">
      <div class="section-header">隐私</div>
      <div class="section-content"></div>
    </div>

    <div class="settings-section">
      <div class="section-header">关于</div>
      <div class="section-content"></div>
    </div>
  </div>

  <Sidebar :showSidebar="showSidebar" @update:showSidebar="showSidebar = $event" />
</template>

<style scoped>
.settings-container {
  min-height: 100vh;
  background: #000000;
  padding: 80px 60px;
  position: relative;
}

.sidebar-trigger {
  position: absolute;
  bottom: 40px;
  left: 60px;
  width: 48px;
  height: 48px;
  background: #1c1c1e;
  border: 1px solid #3a3a3c;
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
  background: #86868b;
  box-shadow:
    0 -6px 0 #86868b,
    0 6px 0 #86868b;
}

.settings-section {
  margin-bottom: 32px;
}

.section-header {
  font-size: 13px;
  color: #86868b;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.section-content {
  background: #1c1c1e;
  border-radius: 12px;
  overflow: hidden;
}
</style>
