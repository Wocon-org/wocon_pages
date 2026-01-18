// ============================================// Trip Store// ============================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Trip, CreateTripInput } from '@/types'
import type { TripParticipantWithProfile } from './api'
import {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  joinTrip,
  getTripParticipants,
} from './api'

export const useTripStore = defineStore('trip', () => {
  // State
  const trips = ref<Trip[]>([])
  const currentTrip = ref<Trip | null>(null)
  const loading = ref(false)
  const participants = ref<TripParticipantWithProfile[]>([])

  // Computed properties
  const privateTrips = computed(() => trips.value.filter((trip) => trip.type === 'private'))
  const recruitingTrips = computed(() => trips.value.filter((trip) => trip.type === 'recruiting'))
  const publicTrips = computed(() => trips.value.filter((trip) => trip.is_public))

  // Fetch all trips
  const fetchTrips = async (filters?: {
    type?: 'private' | 'recruiting'
    is_public?: boolean
    limit?: number
  }) => {
    loading.value = true
    try {
      const { data, error } = await getTrips(filters)
      if (data) {
        trips.value = data
      }
    } catch (error) {
      console.error('Failed to fetch trip list:', error)
    } finally {
      loading.value = false
    }
  }

  // Fetch single trip details
  const fetchTripById = async (tripId: string) => {
    loading.value = true
    try {
      const { data, error } = await getTripById(tripId)
      if (data) {
        currentTrip.value = data
        // Fetch trip participants
        await fetchTripParticipants(tripId)
      }
    } catch (error) {
      console.error('Failed to fetch trip details:', error)
    } finally {
      loading.value = false
    }
  }

  // Create trip
  const handleCreateTrip = async (tripData: CreateTripInput) => {
    loading.value = true
    try {
      const { data, error } = await createTrip(tripData)
      if (data) {
        trips.value.unshift(data)
        return data
      }
    } catch (error) {
      console.error('Failed to create trip:', error)
    } finally {
      loading.value = false
    }
  }

  // Update trip
  const handleUpdateTrip = async (tripId: string, updates: Partial<Trip>) => {
    loading.value = true
    try {
      const { data, error } = await updateTrip(tripId, updates)
      if (data) {
        // Update current trip
        if (currentTrip.value && currentTrip.value.id === tripId) {
          currentTrip.value = data
        }
        // Update corresponding trip in list
        const index = trips.value.findIndex((trip) => trip.id === tripId)
        if (index !== -1) {
          trips.value[index] = data
        }
      }
    } catch (error) {
      console.error('Failed to update trip:', error)
    } finally {
      loading.value = false
    }
  }

  // Delete trip
  const handleDeleteTrip = async (tripId: string) => {
    loading.value = true
    try {
      const { error } = await deleteTrip(tripId)
      if (!error) {
        // Remove current trip
        if (currentTrip.value && currentTrip.value.id === tripId) {
          currentTrip.value = null
        }
        // Remove from trip list
        trips.value = trips.value.filter((trip) => trip.id !== tripId)
      }
    } catch (error) {
      console.error('Failed to delete trip:', error)
    } finally {
      loading.value = false
    }
  }

  // Join trip
  const handleJoinTrip = async (tripId: string) => {
    loading.value = true
    try {
      const { data, error } = await joinTrip(tripId)
      if (data) {
        // Refresh trip participants
        await fetchTripParticipants(tripId)
      }
    } catch (error) {
      console.error('Failed to join trip:', error)
    } finally {
      loading.value = false
    }
  }

  // Fetch trip participants
  const fetchTripParticipants = async (tripId: string) => {
    try {
      const { data, error } = await getTripParticipants(tripId)
      if (data) {
        participants.value = data
      }
    } catch (error) {
      console.error('Failed to fetch trip participants:', error)
    }
  }

  // Reset current trip
  const resetCurrentTrip = () => {
    currentTrip.value = null
    participants.value = []
  }

  return {
    // State
    trips,
    currentTrip,
    loading,
    participants,
    // Computed properties
    privateTrips,
    recruitingTrips,
    publicTrips,
    // Methods
    fetchTrips,
    fetchTripById,
    createTrip: handleCreateTrip,
    updateTrip: handleUpdateTrip,
    deleteTrip: handleDeleteTrip,
    joinTrip: handleJoinTrip,
    fetchTripParticipants,
    resetCurrentTrip,
  }
})
