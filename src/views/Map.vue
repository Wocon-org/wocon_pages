<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Sidebar from '@/components/common/Sidebar.vue'

// woconOSM - Custom Map Instance
const mapContainer = ref<HTMLDivElement>()
let map: L.Map | null = null
const showSidebar = ref(false)

onMounted(() => {
  // Initialize woconOSM map
  if (mapContainer.value) {
    map = L.map(mapContainer.value, {
      center: [39.9042, 116.4074], // Beijing coordinates
      zoom: 13,
      zoomControl: false, // Disable default zoom control for custom implementation
      attributionControl: false, // Custom attribution
    })

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    // Example: Add a marker
    L.marker([39.9042, 116.4074])
      .addTo(map)
      .bindPopup('wocon HQ 📍')
      .openPopup()
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="map-container">
    <div class="sidebar-trigger" @click="showSidebar = true"></div>
    <div class="top-logo">
      <router-link to="/">
        <img src="/woconlogo.png" alt="wocon logo" class="page-logo" />
      </router-link>
    </div>
    <div ref="mapContainer" class="map"></div>
  </div>

  <Sidebar :showSidebar="showSidebar" @update:showSidebar="showSidebar = $event" />
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.sidebar-trigger {
  position: absolute;
  bottom: 40px;
  left: 24px;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.sidebar-trigger::before {
  content: '';
  display: block;
  width: 20px;
  height: 2px;
  background: #333;
  box-shadow:
    0 -6px 0 #333,
    0 6px 0 #333;
}

.top-logo {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 1000;
}

.page-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: transform 0.2s ease;
}

.page-logo:hover {
  transform: scale(1.05);
}

.map {
  width: 100%;
  height: 100%;
}

/* Leaflet styles override for wocon branding */
:deep(.leaflet-container) {
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.leaflet-popup-content) {
  margin: 12px 16px;
  font-size: 14px;
  color: #333;
}

:deep(.leaflet-popup-tip) {
  background: white;
}

:deep(.leaflet-marker-icon) {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}
</style>
