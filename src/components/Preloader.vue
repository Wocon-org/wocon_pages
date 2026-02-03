<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isVisible = ref(true)

onMounted(() => {
  // 页面加载完成后延迟隐藏
  setTimeout(() => {
    isVisible.value = false
  }, 800)
})
</script>

<template>
  <div class="preloader" :class="{ hidden: !isVisible }">
    <div class="preloader-content">
      <div class="preloader-logo">Wocon</div>
      <div class="preloader-spinner"></div>
    </div>
  </div>
</template>

<style scoped>
.preloader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}

.preloader.hidden {
  opacity: 0;
  visibility: hidden;
}

.preloader-content {
  text-align: center;
  animation: scaleIn 0.6s ease;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.preloader-logo {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e3a8a 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.preloader-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
