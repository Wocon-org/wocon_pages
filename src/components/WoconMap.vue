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
  }
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
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

.leaflet-container {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;
}
</style>
