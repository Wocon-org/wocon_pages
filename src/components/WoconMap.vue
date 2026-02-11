<template>
  <div class="wocon-map">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '@/lib/supabase'

interface TripMarker {
  id: string
  name: string
  lat: number
  lng: number
  owner_name: string
  participant_count: number
  type: string
}

interface Props {
  mode?: 'global' | 'trip'
  tripId?: string
  readonly?: boolean
  markers?: Array<{ lat: number; lng: number }>
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'global',
  tripId: '',
  readonly: false,
  markers: () => []
})

const emit = defineEmits<{
  'marker-click': [markerId: string]
  'marker-add': [lat: number, lng: number]
  'location-found': [lat: number, lng: number]
  'location-error': [error: string]
}>()

const mapContainer = ref<HTMLDivElement>()
let map: L.Map | null = null
let layers: L.Control.Layers | null = null
let markersLayer: L.LayerGroup | null = null
let tempLayer: L.LayerGroup | null = null
let userLocationMarker: L.Marker | null = null

// 平滑飞行动画到指定位置
const flyTo = (lat: number, lng: number, zoom: number = 10) => {
  if (map) {
    map.flyTo([lat, lng], zoom, {
      duration: 1.5,
      easeLinearity: 0.25,
      noMoveStart: true
    })
  }
}

// 获取用户当前位置
const getUserLocation = () => {
  if (!map) return

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        flyTo(latitude, longitude, 12)
        
        // 添加用户位置标记
        if (userLocationMarker) {
          map!.removeLayer(userLocationMarker)
        }
        
        const locationIcon = L.divIcon({
          className: 'location-marker',
          html: `
            <div class="location-marker-content">
              <div class="location-marker-icon">📍</div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        })
        
        userLocationMarker = L.marker([latitude, longitude], { 
          icon: locationIcon,
          animation: true
        })
        userLocationMarker.addTo(map)
        
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

// 加载公开行程
const loadPublicTrips = async () => {
  if (!map || !markersLayer) return

  markersLayer.clearLayers()

  try {
    // Get public trips with their markers
    const { data: trips, error } = await supabase
      .from('trips')
      .select(`
        id,
        name,
        type,
        owner:profiles!trips_owner_id_fkey(username),
        map_markers!left(id, lat, lng)
      `)
      .eq('is_public', true)

    if (error) throw error

    if (trips && trips.length > 0) {
      trips.forEach(trip => {
        if (trip.map_markers && trip.map_markers.length > 0) {
          trip.map_markers.forEach(marker => {
            const ownerData: any = trip.owner as any
            const ownerUsername = Array.isArray(ownerData) ? ownerData[0]?.username : ownerData?.username
            const markerIcon = L.divIcon({
              className: 'trip-marker',
              html: `
                <div class="trip-marker-content">
                  <div class="trip-marker-icon">${trip.type === 'recruiting' ? '👥' : '🔒'}</div>
                </div>
              `,
              iconSize: [36, 36],
              iconAnchor: [18, 18]
            })

            const leafletMarker = L.marker([marker.lat, marker.lng], { 
              icon: markerIcon,
              riseOnHover: true,
              title: trip.name
            })

            const popup = L.popup({
              className: 'trip-popup',
              maxWidth: 250,
              closeButton: true,
              autoClose: false,
              closeOnClick: false
            }).setContent(`
              <div class="trip-popup-content">
                <h3>${trip.name}</h3>
                <p>Owner: ${ownerUsername || 'Unknown'}</p>
                <p>Type: ${trip.type === 'recruiting' ? 'Recruiting' : 'Private'}</p>
                <button class="trip-popup-btn" onclick="window.dispatchEvent(new CustomEvent('trip-click', { detail: '${trip.id}' }))">
                  View Trip
                </button>
              </div>
            `)

            leafletMarker.bindPopup(popup)

            leafletMarker.on('click', () => {
              emit('marker-click', trip.id)
            })

            // 添加悬停动画效果
            leafletMarker.on('mouseover', () => {
              const element = leafletMarker.getElement()
              if (element) {
                element.style.transform = 'scale(1.1)'
                element.style.transition = 'transform 0.2s ease'
              }
            })

            leafletMarker.on('mouseout', () => {
              const element = leafletMarker.getElement()
              if (element) {
                element.style.transform = 'scale(1)'
              }
            })

            markersLayer!.addLayer(leafletMarker)
          })
        }
      })
    }
  } catch (error) {
    console.error('Error loading public trips:', error)
  }
}

// 渲染行程标记
const renderTripMarkers = () => {
  if (!map || !markersLayer) return
  markersLayer.clearLayers()
  if (props.mode !== 'trip') return

  props.markers?.forEach((m, index) => {
    const markerIcon = L.divIcon({
      className: 'trip-marker',
      html: `
        <div class="trip-marker-content">
          <div class="trip-marker-icon">📍</div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    })
    
    const leafletMarker = L.marker([m.lat, m.lng], { 
      icon: markerIcon,
      riseOnHover: true
    })
    
    // 添加延迟动画，使标记依次出现
    setTimeout(() => {
      markersLayer!.addLayer(leafletMarker)
    }, index * 100)
  })
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
    L.control.custom({
      position: 'bottomright',
      content: `<button class="location-control-btn" title="Find my location">📍</button>`,
      classes: 'location-control',
      style: {
        marginBottom: '10px',
        marginRight: '10px'
      },
      onAdd: (map) => {
        const controlEl = L.DomUtil.get('.location-control-btn')!
        L.DomEvent.on(controlEl, 'click', getUserLocation)
        return controlEl
      }
    }).addTo(map)

    markersLayer = L.layerGroup().addTo(map)
    tempLayer = L.layerGroup().addTo(map)

    // Load public trips if in global mode
    if (props.mode === 'global') {
      loadPublicTrips()
    }
    if (props.mode === 'trip') {
      renderTripMarkers()
    }

    // Listen for custom trip-click event
    window.addEventListener('trip-click', (e: any) => {
      if (e.detail) {
        emit('marker-click', e.detail)
      }
    })

    if (!props.readonly) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        emit('marker-add', e.latlng.lat, e.latlng.lng)
        const markerIcon = L.divIcon({
          className: 'trip-marker',
          html: `
            <div class="trip-marker-content">
              <div class="trip-marker-icon">➕</div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        })
        
        // 添加标记动画
        const leafletMarker = L.marker([e.latlng.lat, e.latlng.lng], { 
          icon: markerIcon,
          animation: true
        })
        
        leafletMarker.addTo(tempLayer!)
        
        // 添加入场动画
        const element = leafletMarker.getElement()
        if (element) {
          element.style.transform = 'scale(0)'
          element.style.transition = 'transform 0.3s ease'
          setTimeout(() => {
            element.style.transform = 'scale(1)'
          }, 10)
        }
      })
    }
  }
})

watch(() => props.mode, (newMode) => {
  if (newMode === 'global' && map) {
    loadPublicTrips()
  }
  if (newMode === 'trip' && map) {
    renderTripMarkers()
  }
})

watch(() => props.markers, () => {
  if (props.mode === 'trip') {
    // Clear temporary layer before re-render
    tempLayer?.clearLayers()
    renderTripMarkers()
  }
}, { deep: true })

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
  if (markersLayer) {
    markersLayer = null
  }
  if (tempLayer) {
    tempLayer = null
  }
  if (userLocationMarker) {
    userLocationMarker = null
  }
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

.trip-marker {
  display: flex;
  align-items: center;
  justify-content: center;
}

.trip-marker-content {
  width: 36px;
  height: 36px;
  background: var(--md3-primary);
  border-radius: 50%;
  border: 2px solid var(--md3-surface);
  box-shadow: var(--md3-elevation-2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--md3-transition-short);
}

.trip-marker:hover .trip-marker-content {
  transform: scale(1.1);
  box-shadow: var(--md3-elevation-3);
}

.trip-marker-icon {
  font-size: 16px;
  color: var(--md3-on-primary);
}

/* 定位标记样式 */
.location-marker {
  display: flex;
  align-items: center;
  justify-content: center;
}

.location-marker-content {
  width: 40px;
  height: 40px;
  background: var(--md3-secondary);
  border-radius: 50%;
  border: 3px solid var(--md3-surface);
  box-shadow: var(--md3-elevation-3);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
  transition: transform var(--md3-transition-short);
}

.location-marker:hover .location-marker-content {
  transform: scale(1.1);
  box-shadow: var(--md3-elevation-4);
}

.location-marker-icon {
  font-size: 18px;
  color: var(--md3-on-secondary);
}

/* 定位控制按钮样式 */
.location-control-btn {
  width: 40px;
  height: 40px;
  background: var(--md3-surface);
  border: 1px solid var(--md3-surface-variant);
  border-radius: var(--md3-radius-full);
  box-shadow: var(--md3-elevation-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all var(--md3-transition-short);
}

.location-control-btn:hover {
  background: var(--md3-surface-variant-light);
  box-shadow: var(--md3-elevation-3);
  transform: scale(1.05);
}

.location-control-btn:active {
  transform: scale(0.95);
  box-shadow: var(--md3-elevation-1);
}

/* 弹出窗口样式 */
.trip-popup-content {
  padding: var(--md3-space-3);
  min-width: 180px;
  background: var(--md3-surface);
  border-radius: var(--md3-radius-large);
  box-shadow: var(--md3-elevation-3);
}

.trip-popup-content h3 {
  margin: 0 0 8px 0;
  font-size: var(--md3-body-medium);
  font-weight: 600;
  color: var(--md3-on-surface);
}

.trip-popup-content p {
  margin: 4px 0;
  font-size: var(--md3-body-small);
  color: var(--md3-on-surface-variant);
}

.trip-popup-btn {
  margin-top: 8px;
  padding: var(--md3-space-2) var(--md3-space-3);
  background: var(--md3-primary);
  border: none;
  border-radius: var(--md3-radius-medium);
  color: var(--md3-on-primary);
  font-size: var(--md3-body-small);
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: all var(--md3-transition-short);
  box-shadow: var(--md3-elevation-1);
}

.trip-popup-btn:hover {
  background: var(--md3-primary-light);
  box-shadow: var(--md3-elevation-2);
  transform: translateY(-1px);
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
  border: 1px solid var(--md3-surface-variant) !important;
  border-radius: var(--md3-radius-large) !important;
  box-shadow: var(--md3-elevation-2) !important;
}

.leaflet-control-layers-toggle {
  background: var(--md3-surface) !important;
  border-radius: var(--md3-radius-large) !important;
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
}

.leaflet-control-layers-selector {
  margin-right: var(--md3-space-2) !important;
}

/* 缩放控件样式 */
.leaflet-control-zoom {
  background: var(--md3-surface) !important;
  border: 1px solid var(--md3-surface-variant) !important;
  border-radius: var(--md3-radius-large) !important;
  box-shadow: var(--md3-elevation-2) !important;
}

.leaflet-control-zoom a {
  background: var(--md3-surface) !important;
  color: var(--md3-on-surface) !important;
  border-radius: var(--md3-radius-large) !important;
  transition: all var(--md3-transition-short) !important;
}

.leaflet-control-zoom a:hover {
  background: var(--md3-surface-variant-light) !important;
  box-shadow: var(--md3-elevation-1) !important;
}

/* 动画效果 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(98, 91, 113, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(98, 91, 113, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(98, 91, 113, 0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .trip-popup-content {
    min-width: 160px;
    max-width: 200px;
  }
  
  .location-control-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .trip-marker-content {
    width: 32px;
    height: 32px;
  }
  
  .location-marker-content {
    width: 36px;
    height: 36px;
  }
}
</style>
