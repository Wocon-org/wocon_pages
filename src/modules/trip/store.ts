// ============================================// Trip Store// ============================================import { defineStore } from 'pinia';
import { ref, computed } from 'vue'
import type { Trip, CreateTripInput } from '@/types'
import { TripParticipantWithProfile } from './api'
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
  // 状态
  const trips = ref<Trip[]>([])
  const currentTrip = ref<Trip | null>(null)
  const loading = ref(false)
  const participants = ref<TripParticipantWithProfile[]>([])

  // 计算属性
  const privateTrips = computed(() => trips.value.filter((trip) => trip.type === 'private'))
  const recruitingTrips = computed(() => trips.value.filter((trip) => trip.type === 'recruiting'))
  const publicTrips = computed(() => trips.value.filter((trip) => trip.is_public))

  // 获取所有旅行
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
      console.error('获取旅行列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取单个旅行详情
  const fetchTripById = async (tripId: string) => {
    loading.value = true
    try {
      const { data, error } = await getTripById(tripId)
      if (data) {
        currentTrip.value = data
        // 获取旅行参与者
        await fetchTripParticipants(tripId)
      }
    } catch (error) {
      console.error('获取旅行详情失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 创建旅行
  const handleCreateTrip = async (tripData: CreateTripInput) => {
    loading.value = true
    try {
      const { data, error } = await createTrip(tripData)
      if (data) {
        trips.value.unshift(data)
        return data
      }
    } catch (error) {
      console.error('创建旅行失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 更新旅行
  const handleUpdateTrip = async (tripId: string, updates: Partial<Trip>) => {
    loading.value = true
    try {
      const { data, error } = await updateTrip(tripId, updates)
      if (data) {
        // 更新当前旅行
        if (currentTrip.value && currentTrip.value.id === tripId) {
          currentTrip.value = data
        }
        // 更新旅行列表中的对应项
        const index = trips.value.findIndex((trip) => trip.id === tripId)
        if (index !== -1) {
          trips.value[index] = data
        }
      }
    } catch (error) {
      console.error('更新旅行失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 删除旅行
  const handleDeleteTrip = async (tripId: string) => {
    loading.value = true
    try {
      const { error } = await deleteTrip(tripId)
      if (!error) {
        // 移除当前旅行
        if (currentTrip.value && currentTrip.value.id === tripId) {
          currentTrip.value = null
        }
        // 从旅行列表中移除
        trips.value = trips.value.filter((trip) => trip.id !== tripId)
      }
    } catch (error) {
      console.error('删除旅行失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 加入旅行
  const handleJoinTrip = async (tripId: string) => {
    loading.value = true
    try {
      const { data, error } = await joinTrip(tripId)
      if (data) {
        // 刷新旅行参与者
        await fetchTripParticipants(tripId)
      }
    } catch (error) {
      console.error('加入旅行失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取旅行参与者
  const fetchTripParticipants = async (tripId: string) => {
    try {
      const { data, error } = await getTripParticipants(tripId)
      if (data) {
        participants.value = data
      }
    } catch (error) {
      console.error('获取旅行参与者失败:', error)
    }
  }

  // 重置当前旅行
  const resetCurrentTrip = () => {
    currentTrip.value = null
    participants.value = []
  }

  return {
    // 状态
    trips,
    currentTrip,
    loading,
    participants,
    // 计算属性
    privateTrips,
    recruitingTrips,
    publicTrips,
    // 方法
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
