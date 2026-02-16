<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

interface Props {
  show?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'discover-place', place: PlaceInfo): void
}

const props = withDefaults(defineProps<Props>(), {
  show: true
})

const emit = defineEmits<Emits>()

interface PlaceInfo {
  geonameid: number
  name: string
  asciiname: string
  country_code: string
  coordinates: {
    lat: number
    lng: number
  }
  population: number | null
}

const currentPlace = ref<PlaceInfo | null>(null)
const isDiscovering = ref(false)
const isLoadingCities = ref(false)

// 从Supabase获取热门城市
const fetchPopularCities = async (): Promise<PlaceInfo[]> => {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('geonameid, name, asciiname, country_code, latitude, longitude, population')
      .gte('population', 500000)
      .order('population', { ascending: false, nullsFirst: false })
      .limit(50)

    if (error) throw error

    return (data as any[]).map((city: any) => ({
      geonameid: city.geonameid,
      name: city.name,
      asciiname: city.asciiname,
      country_code: city.country_code,
      coordinates: { lat: city.latitude, lng: city.longitude },
      population: city.population
    }))
  } catch (error) {
    console.error('Failed to fetch cities:', error)
    return []
  }
}

// 随机选择一个城市并跳转到该地点
const discoverPlace = async () => {
  if (isLoadingCities.value) return

  isDiscovering.value = true

  try {
    // 从数据库获取热门城市
    isLoadingCities.value = true
    const cities = await fetchPopularCities()
    isLoadingCities.value = false

    if (cities.length === 0) {
      isDiscovering.value = false
      return
    }

    // 模拟加载动画
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * cities.length)
      currentPlace.value = cities[randomIndex]!
      isDiscovering.value = false

      // 触发事件，让父组件移动地图
      if (currentPlace.value) {


        // 触发父组件事件
        emit('discover-place', currentPlace.value)

        // 同时触发全局事件，确保地图能够接收到
        const event = new CustomEvent('discover-place', {
          detail: currentPlace.value
        })
        window.dispatchEvent(event)
      }
    }, 1000)
  } catch (error) {
    console.error('Discover error:', error)
    isDiscovering.value = false
    isLoadingCities.value = false
  }
}
</script>

<template>
  <div class="discover-panel">
    <!-- 发现功能已集成到 Sidebar 点击事件 -->
    <div class="discover-content">
      <div class="discover-info">
        <h2 class="discover-title">Discover Mode</h2>
        <p class="discover-description">Clicking the Discover icon in the sidebar will take you to a random destination.</p>
        <div v-if="currentPlace" class="discover-result">
          <h3>Current Destination</h3>
          <p>{{ currentPlace.name }}, {{ currentPlace.country_code }}</p>
        </div>
      </div>
    </div>


  </div>
</template>

<style scoped>
.discover-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  position: relative;
}

.discover-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.discover-info {
  text-align: center;
  max-width: 600px;
  padding: 20px;
  background: var(--md3-surface);
  border-radius: var(--md3-radius-xl);
  box-shadow: var(--md3-elevation-2);
}

.discover-title {
  font-size: var(--md3-headline-small);
  font-weight: 700;
  color: var(--md3-on-surface);
  margin-bottom: var(--md3-space-3);
}

.discover-description {
  font-size: var(--md3-body-medium);
  color: var(--md3-on-surface-variant);
  margin-bottom: var(--md3-space-4);
}

.discover-result {
  margin-top: var(--md3-space-4);
  padding-top: var(--md3-space-4);
  border-top: 1px solid var(--md3-surface-variant);
}

.discover-result h3 {
  font-size: var(--md3-title-medium);
  font-weight: 600;
  color: var(--md3-on-surface);
  margin-bottom: var(--md3-space-2);
}

.discover-result p {
  font-size: var(--md3-body-medium);
  color: var(--md3-primary);
  font-weight: 500;
}


</style>
