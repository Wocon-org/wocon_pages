// ============================================// Map Store// ============================================import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { MapMarker, Route } from '@/types';
import {
  getMarkersByTrip,
  createMarker,
  updateMarker,
  deleteMarker,
  getRoutesByTrip,
  createRoute,
  updateRoute,
  deleteRoute
} from './api';

export const useMapStore = defineStore('map', () => {
  // 状态
  const markers = ref<MapMarker[]>([]);
  const routes = ref<Route[]>([]);
  const loading = ref(false);

  // 获取旅行标记
  const fetchMarkersByTrip = async (tripId: string) => {
    loading.value = true;
    try {
      const { data, error } = await getMarkersByTrip(tripId);
      if (data) {
        markers.value = data;
      }
    } catch (error) {
      console.error('获取地图标记失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 创建标记
  const handleCreateMarker = async (markerData: any) => {
    loading.value = true;
    try {
      const { data, error } = await createMarker(markerData);
      if (data) {
        markers.value.push(data);
        return data;
      }
    } catch (error) {
      console.error('创建地图标记失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 更新标记
  const handleUpdateMarker = async (markerId: string, updates: Partial<MapMarker>) => {
    loading.value = true;
    try {
      const { data, error } = await updateMarker(markerId, updates);
      if (data) {
        const index = markers.value.findIndex(marker => marker.id === markerId);
        if (index !== -1) {
          markers.value[index] = data;
        }
      }
    } catch (error) {
      console.error('更新地图标记失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 删除标记
  const handleDeleteMarker = async (markerId: string) => {
    loading.value = true;
    try {
      const { error } = await deleteMarker(markerId);
      if (!error) {
        markers.value = markers.value.filter(marker => marker.id !== markerId);
      }
    } catch (error) {
      console.error('删除地图标记失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 获取旅行路线
  const fetchRoutesByTrip = async (tripId: string) => {
    loading.value = true;
    try {
      const { data, error } = await getRoutesByTrip(tripId);
      if (data) {
        routes.value = data;
      }
    } catch (error) {
      console.error('获取路线失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 创建路线
  const handleCreateRoute = async (routeData: any) => {
    loading.value = true;
    try {
      const { data, error } = await createRoute(routeData);
      if (data) {
        routes.value.push(data);
        return data;
      }
    } catch (error) {
      console.error('创建路线失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 更新路线
  const handleUpdateRoute = async (routeId: string, updates: Partial<Route>) => {
    loading.value = true;
    try {
      const { data, error } = await updateRoute(routeId, updates);
      if (data) {
        const index = routes.value.findIndex(route => route.id === routeId);
        if (index !== -1) {
          routes.value[index] = data;
        }
      }
    } catch (error) {
      console.error('更新路线失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 删除路线
  const handleDeleteRoute = async (routeId: string) => {
    loading.value = true;
    try {
      const { error } = await deleteRoute(routeId);
      if (!error) {
        routes.value = routes.value.filter(route => route.id !== routeId);
      }
    } catch (error) {
      console.error('删除路线失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 清空地图数据
  const clearMapData = () => {
    markers.value = [];
    routes.value = [];
  };

  return {
    // 状态
    markers,
    routes,
    loading,
    // 方法
    fetchMarkersByTrip,
    createMarker: handleCreateMarker,
    updateMarker: handleUpdateMarker,
    deleteMarker: handleDeleteMarker,
    fetchRoutesByTrip,
    createRoute: handleCreateRoute,
    updateRoute: handleUpdateRoute,
    deleteRoute: handleDeleteRoute,
    clearMapData
  };
});