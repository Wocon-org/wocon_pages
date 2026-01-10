<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '@/components/common/Sidebar.vue'
import BottomBar from '@/components/layout/BottomBar.vue'

const showSidebar = ref(false)
</script>

<template>
  <div class="discover-page">
    <div class="top-logo">
      <img src="/woconlogo.png" alt="wocon logo" class="page-logo" />
    </div>

    <div class="page-content">
      <div class="sidebar-trigger" @click="showSidebar = true"></div>
      <div class="discover-container">
        <div class="discover-placeholder">发现页面</div>
      </div>
    </div>

    <Sidebar :showSidebar="showSidebar" @update:showSidebar="showSidebar = $event" />
    <BottomBar />
  </div>
</template>

<style scoped>
.discover-page {
  min-height: 100vh;
  background: #0d1117;
  position: relative;
}

.top-logo {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;
}

.page-logo {
  width: 40px;
  height: 40px;
}

.page-content {
  min-height: 100vh;
  padding: 100px 60px 120px;
  position: relative;
}

.discover-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 0;
}

.discover-placeholder {
  color: #8b949e;
  font-size: 48px;
  text-align: center;
}

.sidebar-trigger {
  position: fixed;
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
