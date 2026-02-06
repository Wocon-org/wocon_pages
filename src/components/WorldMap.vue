<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Trip {
  id: string
  destination: string
  lat?: number
  lng?: number
  [key: string]: any
}

interface Props {
  trips?: Trip[]
}

interface Emits {
  (e: 'markerClick', tripId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  trips: () => []
})

const emit = defineEmits<Emits>()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markers: L.Marker[] = []
let darkLayer: L.TileLayer | null = null
let satelliteLayer: L.TileLayer | null = null
const currentLayer = ref<'dark' | 'satellite'>('dark')

// 默认标记位置（示例数据）
const defaultMarkers = [
  { id: '1', destination: 'Tenerife Sea', lat: 28.2916, lng: -16.6291 },
  { id: '2', destination: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { id: '3', destination: 'New York', lat: 40.7128, lng: -74.0060 },
  { id: '4', destination: 'London', lat: 51.5074, lng: -0.1278 }
]

const initializeMap = () => {
  if (!mapContainer.value) return

  // 创建地图实例 - 启用滚轮缩放
  map = L.map(mapContainer.value, {
    center: [20, 0],
    zoom: 2,
    zoomControl: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    attributionControl: false
  })

  // 创建深色地图瓦片图层
  darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    maxZoom: 19
  })

  // 创建卫星地图瓦片图层
  satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
  })

  // 默认添加深色图层
  darkLayer!.addTo(map!)

  L.control.zoom({ position: 'bottomright' }).addTo(map!)

  // 添加标记
  addMarkers()
}

// 切换地图图层
const switchLayer = (layerType: 'dark' | 'satellite') => {
  if (!map || !darkLayer || !satelliteLayer) return

  currentLayer.value = layerType

  if (layerType === 'dark') {
    if (map.hasLayer(satelliteLayer)) {
      map.removeLayer(satelliteLayer)
    }
    if (!map.hasLayer(darkLayer)) {
      darkLayer.addTo(map)
    }
  } else {
    if (map.hasLayer(darkLayer)) {
      map.removeLayer(darkLayer)
    }
    if (!map.hasLayer(satelliteLayer)) {
      satelliteLayer.addTo(map)
    }
  }
}

// 飞向指定位置
const flyTo = (lat: number, lng: number, zoom: number = 10) => {
  if (!map) return
  map.flyTo([lat, lng], zoom, {
    duration: 1.5
  })
}

// 暴露方法给父组件调用
defineExpose({
  switchLayer,
  flyTo
})

const addMarkers = () => {
  if (!map) return

  // 清除现有标记
  markers.forEach(marker => map?.removeLayer(marker))
  markers = []

  // 合并传入的 trips 和默认标记
  const allTrips = props.trips.length > 0 ? props.trips : defaultMarkers

  allTrips.forEach((trip) => {
    if (trip.lat !== undefined && trip.lng !== undefined) {
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-dot"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })

      const marker = L.marker([trip.lat, trip.lng], {
        icon: customIcon
      }).addTo(map!)

      marker.on('click', () => {
        emit('markerClick', trip.id)
      })

      markers.push(marker)
    }
  })
}

const fitMapToMarkers = () => {
  if (!map || markers.length === 0) return

  const group = L.featureGroup(markers)
  map!.fitBounds(group.getBounds().pad(0.1))
}

onMounted(() => {
  // 确保 DOM 渲染后再初始化地图
  setTimeout(() => {
    initializeMap()
  }, 100)
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

// 监听 trips 变化
import { watch } from 'vue'
watch(() => props.trips, () => {
  addMarkers()
}, { deep: true })
</script>

<template>
  <div class="world-map">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
.world-map {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.map-container {
  width: 100%;
  height: 100%;
}

/* 自定义标记样式 */
:deep(.custom-marker) {
  background: transparent;
  border: none;
}

:deep(.marker-dot) {
  width: 16px;
  height: 16px;
  background: #6750A4;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(103, 80, 164, 0.5);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.custom-marker:hover .marker-dot) {
  transform: scale(1.3);
  box-shadow: 0 4px 12px rgba(103, 80, 164, 0.7);
}

/* 地图容器优化 */
:deep(.leaflet-container) {
  background: #0d1117;
}

:deep(.leaflet-layer) {
  filter: saturate(0.8) brightness(0.9);
}
</style>
