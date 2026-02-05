<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

interface Props {
  show?: boolean
}

interface Emits {
  (e: 'close'): void
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

// 获取随机背景颜色
const getRandomGradient = () => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%)'
  ]
  return gradients[Math.floor(Math.random() * gradients.length)]
}

// 获取城市描述（基于地区）
const getDescription = (countryCode: string, name: string): string => {
  const descriptions: Record<string, string[]> = {
    'CN': ['A vibrant metropolis blending ancient traditions with modern innovation.', 'Famous for its rich history and delicious cuisine.', 'Home to iconic landmarks and bustling streets.'],
    'US': ['A city that never sleeps, known for its diverse culture.', 'Famous for its iconic landmarks and vibrant atmosphere.', 'A melting pot of cultures and experiences.'],
    'JP': ['A fascinating blend of ancient traditions and cutting-edge technology.', 'Known for its stunning temples and modern skyscrapers.', 'A city where past meets future.'],
    'FR': ['The City of Light, famous for art, culture, and romance.', 'Home to world-class museums and iconic architecture.', 'A destination that captivates every visitor.'],
    'GB': ['A historic city with royal heritage and modern charm.', 'Known for its iconic landmarks and vibrant culture.', 'A perfect blend of tradition and innovation.'],
    'DE': ['A city known for its rich history and vibrant culture.', 'Home to stunning architecture and world-class museums.', 'A hub of innovation and tradition.'],
    'AU': ['Famous for its stunning beaches and unique wildlife.', 'A vibrant city with a relaxed atmosphere and natural beauty.', 'Home to iconic landmarks and outdoor adventures.'],
    'BR': ['A city pulsing with energy, music, and stunning beaches.', 'Famous for its carnival culture and natural beauty.', 'A place where samba meets the sea.'],
    'IN': ['A colorful tapestry of cultures, flavors, and traditions.', 'Home to ancient temples and bustling markets.', 'A sensory journey through diverse experiences.']
  }

  const countryDescriptions = descriptions[countryCode]
  if (countryDescriptions) {
    return countryDescriptions[Math.floor(Math.random() * countryDescriptions.length)]
  }

  const generalDescriptions = [
    'A fascinating destination waiting to be explored.',
    'A city full of unique experiences and hidden gems.',
    'Discover the charm and character of this place.',
    'A destination that offers something for every traveler.'
  ]

  return generalDescriptions[Math.floor(Math.random() * generalDescriptions.length)]
}

// 随机选择一个城市
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
      currentPlace.value = cities[randomIndex]
      isDiscovering.value = false

      // 触发事件，让父组件移动地图
      if (currentPlace.value) {
        const event = new CustomEvent('discover-place', {
          detail: currentPlace.value
        })
        window.dispatchEvent(event)
      }
    }, 800)
  } catch (error) {
    console.error('Discover error:', error)
    isDiscovering.value = false
    isLoadingCities.value = false
  }
}

const handleExplore = () => {
  if (currentPlace.value) {
    const query = encodeURIComponent(`${currentPlace.value.name}, ${currentPlace.value.country_code}`)
    window.open(`https://www.google.com/search?q=${query}`, '_blank')
  }
}
</script>

<template>
  <div class="discover-panel">
    <!-- 主发现按钮 -->
    <div class="discover-content">
      <button
        class="discover-btn"
        :class="{ loading: isDiscovering }"
        @click="discoverPlace"
      >
        <svg
          v-if="!isDiscovering"
          class="compass-icon"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 18V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M2 12H6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M18 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>
        <svg
          v-else
          class="spinner"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 2v4" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 12 12"
              to="360 12 12"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
        <span class="discover-text">
          {{ isDiscovering ? 'Discovering...' : 'Discover' }}
        </span>
        <span class="discover-subtitle">Click to explore a random city</span>
      </button>
    </div>

    <!-- 右上角地点信息卡片 -->
    <Transition name="slide-in">
      <div v-if="currentPlace" class="place-info-card">
        <div class="place-header" :style="{ background: getRandomGradient() }">
          <h2 class="place-name">{{ currentPlace.name }}</h2>
          <div class="place-badge">{{ currentPlace.country_code }}</div>
        </div>

        <div class="place-content">
          <div class="place-details">
            <div class="detail-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4 10z"/>
              </svg>
              <span>{{ currentPlace.country_code }}</span>
            </div>

            <div v-if="currentPlace.population" class="detail-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>{{ currentPlace.population.toLocaleString() }} people</span>
            </div>

            <div class="detail-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{{ currentPlace.coordinates.lat.toFixed(4) }}°N, {{ Math.abs(currentPlace.coordinates.lng).toFixed(4) }}°{{ currentPlace.coordinates.lng >= 0 ? 'E' : 'W' }}</span>
            </div>
          </div>

          <p class="place-description">{{ getDescription(currentPlace.country_code, currentPlace.name) }}</p>

          <button class="explore-btn" @click="handleExplore">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
            </svg>
            Explore More
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.discover-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.discover-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.discover-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  max-width: 320px;
  padding: 40px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.discover-btn:hover:not(.loading) {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
}

.discover-btn:active:not(.loading) {
  transform: translateY(0);
}

.discover-btn.loading {
  cursor: wait;
  opacity: 0.8;
}

.compass-icon {
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.spinner {
  color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.discover-text {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.discover-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.place-info-card {
  position: absolute;
  top: 100px;
  right: 40px;
  width: 320px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
}

.place-header {
  padding: 24px;
  color: white;
  position: relative;
}

.place-name {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.place-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.place-content {
  padding: 24px;
}

.place-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6b7280;
  font-size: 14px;
}

.detail-item svg {
  flex-shrink: 0;
  opacity: 0.7;
}

.place-description {
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 20px;
}

.explore-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 24px;
  background: #6750A4;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.explore-btn:hover {
  background: #523e7f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(103, 80, 164, 0.4);
}

/* 滑入动画 */
.slide-in-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-in-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.slide-in-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.slide-in-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-in-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.slide-in-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
