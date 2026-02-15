<template>
  <div class="wocon-map">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const emit = defineEmits<{
  'location-found': [lat: number, lng: number]
  'location-error': [error: string]
}>()

const mapContainer = ref<HTMLDivElement>()
let map: L.Map | null = null
let layers: L.Control.Layers | null = null

// 平滑飞行动画到指定位置
const flyTo = (lat: number, lng: number, zoom: number = 12) => {
  if (map) {
    map.flyTo([lat, lng], zoom, {
      duration: 2.0,
      easeLinearity: 0.2,
      noMoveStart: true,
      animate: true
    })
  }
}

// 获取用户当前位置（不显示标记）
const getUserLocation = () => {
  if (!map) return

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        flyTo(latitude, longitude, 12)
        emit('location-found', latitude, longitude)
      },
      (error) => {
        console.error('Error getting user location:', error)
        emit('location-error', error.message)
      }
    )
  } else {
    emit('location-error', 'Geolocation is not supported by your browser')
  }
}

// 切换地图图层
const switchLayer = (layer: 'standard' | 'satellite' | 'dark') => {
  if (!map || !layers) return

  // 移除当前所有图层
  map.eachLayer((layer) => {
    if (layer instanceof L.TileLayer) {
      map!.removeLayer(layer)
    }
  })

  // 添加新图层
  let newLayer: L.TileLayer

  switch (layer) {
    case 'satellite':
      newLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
        maxZoom: 19
      })
      break
    case 'dark':
      newLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
      })
      break
    default:
      newLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
      })
  }

  newLayer.addTo(map)
}

onMounted(() => {
  if (mapContainer.value) {
    map = L.map(mapContainer.value, {
      zoomControl: false,
      inertiaDeceleration: 2000,
      inertiaMaxSpeed: 2500,
      easeLinearity: 0.25,
      wheelDebounceTime: 20,
      wheelPxPerZoomLevel: 45,
      tapTolerance: 10,
      bounceAtZoomLimits: true,
      minZoom: 2,
      maxZoom: 18,
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0
    }).setView([20, 0], 2)

    const lightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    })

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
      maxZoom: 19
    })

    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    })

    lightLayer.addTo(map)

    const baseMaps = {
      'Standard': lightLayer,
      'Satellite': satelliteLayer,
      'Dark': darkLayer
    }

    layers = L.control.layers(baseMaps, undefined, {
      position: 'topright',
      collapsed: false
    }).addTo(map)

    // 添加缩放控件
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map)

    // 添加定位控件
    const container = L.DomUtil.create('div', 'location-control')
    container.style.position = 'absolute'
    container.style.bottom = '70px'
    container.style.right = '10px'
    container.style.zIndex = '1000'

    const button = L.DomUtil.create('button', 'location-control-btn', container)
    button.title = 'Find my location'
    button.innerHTML = '📍'

    L.DomEvent.on(button, 'click', getUserLocation)

    if (map && map.getContainer()) {
      map.getContainer().appendChild(container)
    }
  }
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
  if (layers) {
    layers = null
  }
})

// 暴露方法给父组件
defineExpose({
  flyTo,
  getUserLocation,
  switchLayer
})
</script>

<style>
.wocon-map {
  width: 100%;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
  z-index: 1;
  transform: translateZ(0);
  will-change: transform;
}

/* 定位控制按钮样式 */
.location-control-btn {
  width: 40px;
  height: 40px;
  background: var(--md3-surface);
  border: 2px solid var(--md3-primary);
  border-radius: var(--md3-radius-smaller);
  box-shadow: var(--md3-elevation-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all var(--md3-transition-short);
}

.location-control-btn:hover {
  background: var(--md3-primary);
  color: var(--md3-surface);
  box-shadow: var(--md3-elevation-3);
  transform: scale(1.05);
}

.location-control-btn:active {
  transform: scale(0.95);
  box-shadow: var(--md3-elevation-1);
}

.leaflet-container {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;
  background: var(--md3-background);
}

/* 自定义控件样式 */
.leaflet-control-custom {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 图层控制样式 */
.leaflet-control-layers {
  background: var(--md3-surface) !important;
  border: 2px solid var(--md3-primary) !important;
  border-radius: var(--md3-radius-small) !important;
  box-shadow: var(--md3-elevation-2) !important;
}

.leaflet-control-layers-toggle {
  background: var(--md3-surface) !important;
  border-radius: var(--md3-radius-smaller) !important;
  box-shadow: var(--md3-elevation-1) !important;
}

.leaflet-control-layers-list {
  padding: var(--md3-space-3) !important;
}

.leaflet-control-layers-base label {
  color: var(--md3-on-surface) !important;
  font-size: var(--md3-body-medium) !important;
  margin-bottom: var(--md3-space-2) !important;
  display: block !important;
  font-family: var(--md3-font-family) !important;
  font-weight: 500 !important;
}

.leaflet-control-layers-selector {
  margin-right: var(--md3-space-2) !important;
}

/* 缩放控件样式 */
.leaflet-control-zoom {
  background: var(--md3-surface) !important;
  border: 2px solid var(--md3-primary) !important;
  border-radius: var(--md3-radius-small) !important;
  box-shadow: var(--md3-elevation-2) !important;
}

.leaflet-control-zoom a {
  background: var(--md3-surface) !important;
  color: var(--md3-on-surface) !important;
  border-radius: var(--md3-radius-smaller) !important;
  transition: all var(--md3-transition-short) !important;
  font-family: var(--md3-font-family) !important;
  font-weight: 600 !important;
  font-size: 18px !important;
  line-height: 28px !important;
  width: 32px !important;
  height: 32px !important;
  text-align: center !important;
}

.leaflet-control-zoom a:hover {
  background: var(--md3-primary) !important;
  color: var(--md3-surface) !important;
  box-shadow: var(--md3-elevation-1) !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .location-control-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .leaflet-control-zoom a {
    width: 28px !important;
    height: 28px !important;
    font-size: 16px !important;
    line-height: 24px !important;
  }
}
</style>
