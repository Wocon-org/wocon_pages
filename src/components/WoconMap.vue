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
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'global',
  tripId: '',
  readonly: false
})

const emit = defineEmits<{
  'marker-click': [markerId: string]
  'marker-add': [lat: number, lng: number]
}>()

const mapContainer = ref<HTMLDivElement>()
let map: L.Map | null = null
let layers: L.Control.Layers | null = null
let markersLayer: L.LayerGroup | null = null

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

            const leafletMarker = L.marker([marker.lat, marker.lng], { icon: markerIcon })

            const popup = L.popup({
              className: 'trip-popup'
            }).setContent(`
              <div class="trip-popup-content">
                <h3>${trip.name}</h3>
                <p>Owner: ${trip.owner?.username || 'Unknown'}</p>
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

            markersLayer.addLayer(leafletMarker)
          })
        }
      })
    }
  } catch (error) {
    console.error('Error loading public trips:', error)
  }
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

    lightLayer.addTo(map)

    const baseMaps = {
      'Standard': lightLayer,
      'Satellite': satelliteLayer
    }

    layers = L.control.layers(baseMaps, undefined, {
      position: 'topright'
    }).addTo(map)

    L.control.zoom({
      position: 'bottomright'
    }).addTo(map)

    markersLayer = L.layerGroup().addTo(map)

    // Load public trips if in global mode
    if (props.mode === 'global') {
      loadPublicTrips()
    }

    // Listen for custom trip-click event
    window.addEventListener('trip-click', (e: any) => {
      if (e.detail) {
        emit('marker-click', e.detail)
      }
    })
  }
})

watch(() => props.mode, (newMode) => {
  if (newMode === 'global' && map) {
    loadPublicTrips()
  }
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
  if (markersLayer) {
    markersLayer = null
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
  background: rgba(35, 134, 54, 0.9);
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.trip-marker:hover .trip-marker-content {
  transform: scale(1.1);
}

.trip-marker-icon {
  font-size: 16px;
}

.trip-popup-content {
  padding: 12px;
  min-width: 180px;
}

.trip-popup-content h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #c9d1d9;
}

.trip-popup-content p {
  margin: 4px 0;
  font-size: 12px;
  color: #8b949e;
}

.trip-popup-btn {
  margin-top: 8px;
  padding: 6px 12px;
  background: #238636;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: background 0.15s ease;
}

.trip-popup-btn:hover {
  background: #2ea043;
}

.leaflet-container {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;
}
</style>
