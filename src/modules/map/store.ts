// ============================================// Map Store// ============================================
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MapMarker, Route } from '@/types'
import {
  getMarkersByTrip,
  createMarker,
  updateMarker,
  deleteMarker,
  getRoutesByTrip,
  createRoute,
  updateRoute,
  deleteRoute,
} from './api'

export const useMapStore = defineStore('map', () => {
  // State
  const markers = ref<MapMarker[]>([])
  const routes = ref<Route[]>([])
  const loading = ref(false)

  // Fetch markers by trip
  const fetchMarkersByTrip = async (tripId: string) => {
    loading.value = true
    try {
      const { data, error } = await getMarkersByTrip(tripId)
      if (data) {
        markers.value = data
      }
    } catch (error) {
      console.error('Failed to fetch map markers:', error)
    } finally {
      loading.value = false
    }
  }

  // Create marker
  const handleCreateMarker = async (markerData: any) => {
    loading.value = true
    try {
      const { data, error } = await createMarker(markerData)
      if (data) {
        markers.value.push(data)
        return data
      }
    } catch (error) {
      console.error('Failed to create map marker:', error)
    } finally {
      loading.value = false
    }
  }

  // Update marker
  const handleUpdateMarker = async (markerId: string, updates: Partial<MapMarker>) => {
    loading.value = true
    try {
      const { data, error } = await updateMarker(markerId, updates)
      if (data) {
        const index = markers.value.findIndex((marker) => marker.id === markerId)
        if (index !== -1) {
          markers.value[index] = data
        }
      }
    } catch (error) {
      console.error('Failed to update map marker:', error)
    } finally {
      loading.value = false
    }
  }

  // Delete marker
  const handleDeleteMarker = async (markerId: string) => {
    loading.value = true
    try {
      const { error } = await deleteMarker(markerId)
      if (!error) {
        markers.value = markers.value.filter((marker) => marker.id !== markerId)
      }
    } catch (error) {
      console.error('Failed to delete map marker:', error)
    } finally {
      loading.value = false
    }
  }

  // Fetch routes by trip
  const fetchRoutesByTrip = async (tripId: string) => {
    loading.value = true
    try {
      const { data, error } = await getRoutesByTrip(tripId)
      if (data) {
        routes.value = data
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error)
    } finally {
      loading.value = false
    }
  }

  // Create route
  const handleCreateRoute = async (routeData: any) => {
    loading.value = true
    try {
      const { data, error } = await createRoute(routeData)
      if (data) {
        routes.value.push(data)
        return data
      }
    } catch (error) {
      console.error('Failed to create route:', error)
    } finally {
      loading.value = false
    }
  }

  // Update route
  const handleUpdateRoute = async (routeId: string, updates: Partial<Route>) => {
    loading.value = true
    try {
      const { data, error } = await updateRoute(routeId, updates)
      if (data) {
        const index = routes.value.findIndex((route) => route.id === routeId)
        if (index !== -1) {
          routes.value[index] = data
        }
      }
    } catch (error) {
      console.error('Failed to update route:', error)
    } finally {
      loading.value = false
    }
  }

  // Delete route
  const handleDeleteRoute = async (routeId: string) => {
    loading.value = true
    try {
      const { error } = await deleteRoute(routeId)
      if (!error) {
        routes.value = routes.value.filter((route) => route.id !== routeId)
      }
    } catch (error) {
      console.error('Failed to delete route:', error)
    } finally {
      loading.value = false
    }
  }

  // Clear map data
  const clearMapData = () => {
    markers.value = []
    routes.value = []
  }

  return {
    // State
    markers,
    routes,
    loading,
    // Methods
    fetchMarkersByTrip,
    createMarker: handleCreateMarker,
    updateMarker: handleUpdateMarker,
    deleteMarker: handleDeleteMarker,
    fetchRoutesByTrip,
    createRoute: handleCreateRoute,
    updateRoute: handleUpdateRoute,
    deleteRoute: handleDeleteRoute,
    clearMapData,
  }
})
