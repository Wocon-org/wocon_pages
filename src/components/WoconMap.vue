<template>
  <div class="wocon-map">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  readonly?: boolean
  mode?: string
  markers?: Array<{ lat: number; lng: number }>
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  mode: 'default',
  markers: () => []
})

const emit = defineEmits<{
  'location-found': [lat: number, lng: number]
  'location-error': [error: string]
  'marker-add': [lat: number, lng: number]
}>()

const mapMarkers = ref<L.Marker[]>([])

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
  if (!map) return

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

    // 移除默认图层控制，使用TopBar中的切换功能
    // const baseMaps = {
    //   'Standard': lightLayer,
    //   'Satellite': satelliteLayer,
    //   'Dark': darkLayer
    // }

    // layers = L.control.layers(baseMaps, undefined, {
    //   position: 'topright',
    //   collapsed: false
    // }).addTo(map)

    // 添加缩放控件
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map)


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

// 添加标记点
const addMarker = (lat: number, lng: number) => {
  if (!map) return

  // 创建自定义标记点图标
  const markerIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container">
        <div class="marker-dot"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })

  // 创建标记点
  const marker = L.marker([lat, lng], {
    icon: markerIcon,
    draggable: !props.readonly
  })

  marker.addTo(map)
  mapMarkers.value.push(marker)

  // 触发marker-add事件
  emit('marker-add', lat, lng)
}

// 清除所有标记点
const clearMarkers = () => {
  mapMarkers.value.forEach(marker => {
    if (map) map.removeLayer(marker)
  })
  mapMarkers.value = []
}

// 监听markers prop变化
watch(() => props.markers, (newMarkers) => {
  if (!map) return

  // 清除现有标记点
  clearMarkers()

  // 添加新标记点
  newMarkers?.forEach(marker => {
    addMarker(marker.lat, marker.lng)
  })
}, { deep: true })

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

    // 移除默认图层控制，使用TopBar中的切换功能
    // const baseMaps = {
    //   'Standard': lightLayer,
    //   'Satellite': satelliteLayer,
    //   'Dark': darkLayer
    // }

    // layers = L.control.layers(baseMaps, undefined, {
    //   position: 'topright',
    //   collapsed: false
    // }).addTo(map)

    // 添加缩放控件
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map)

    // 添加地图点击事件来添加标记点
    if (!props.readonly && props.mode === 'trip') {
      map.on('click', (e) => {
        addMarker(e.latlng.lat, e.latlng.lng)
      })
    }

    // 初始添加markers
    props.markers?.forEach(marker => {
      addMarker(marker.lat, marker.lng)
    })
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
  mapMarkers.value = []
})

// 暴露方法给父组件
defineExpose({
  flyTo,
  getUserLocation,
  switchLayer,
  addMarker,
  clearMarkers
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



.leaflet-container {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;
  background: var(--md3-background);
}

/* 自定义标记点样式 */
.custom-marker {
  pointer-events: none;
}

.marker-container {
  position: relative;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.marker-dot {
  width: 12px;
  height: 12px;
  background: var(--md3-primary);
  border: 3px solid var(--md3-surface);
  border-radius: 50%;
  box-shadow: var(--md3-elevation-2);
  transition: all var(--md3-transition-medium);
}

.marker-dot:hover {
  transform: scale(1.2);
  box-shadow: var(--md3-elevation-3);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .marker-dot {
    width: 10px;
    height: 10px;
    border-width: 2px;
  }
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
  .leaflet-control-zoom a {
    width: 28px !important;
    height: 28px !important;
    font-size: 16px !important;
    line-height: 24px !important;
  }
}
</style>
