<script setup lang="ts">
import { ref } from 'vue'
import { searchEverything, getSearchSuggestions } from '@/lib/api'

interface Props {
  show?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'search', query: string): void
  (e: 'selectResult', result: SearchResult): void
}

interface SearchResult {
  id: string
  type: 'destination' | 'trip'
  title: string
  subtitle: string
  lat: number
  lng: number
  image?: string
  population?: number
  score?: number
  start_date?: string
  end_date?: string
  author?: string
  is_public?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: true
})

const emit = defineEmits<Emits>()

const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const searchSuggestions = ref<string[]>([])
const showResults = ref(false)
const showSuggestions = ref(false)
const isSearching = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null
let suggestionTimeout: ReturnType<typeof setTimeout> | null = null

// 从API搜索所有内容
const performSearch = async (query: string): Promise<SearchResult[]> => {
  try {
    // 使用综合搜索API
    const results = await searchEverything(query, {
      limit: 10,
      sortBy: 'relevance'
    })
    return results as SearchResult[]
  } catch (error) {
    console.error('Search failed:', error)
    return []
  }
}

// 获取搜索建议
const fetchSuggestions = async (query: string): Promise<string[]> => {
  try {
    const suggestions = await getSearchSuggestions(query)
    return suggestions
  } catch (error) {
    console.error('Suggestions failed:', error)
    return []
  }
}

// 根据搜索类型获取图标
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'destination':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6750A4" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>`
    case 'trip':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>`
    default:
      return ''
  }
}

// 搜索处理 (带防抖)
const handleSearch = async () => {
  const query = searchQuery.value.trim()

  if (!query) {
    searchResults.value = []
    searchSuggestions.value = []
    showResults.value = false
    showSuggestions.value = false
    return
  }

  // 清除之前的定时器
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  isSearching.value = true

  // 防抖 300ms
  searchTimeout = setTimeout(async () => {
    const results = await performSearch(query)
    searchResults.value = results
    isSearching.value = false
    showResults.value = true
    showSuggestions.value = false
    emit('search', query)
  }, 300)
}

// 建议处理 (带防抖)
const handleSuggestions = async () => {
  const query = searchQuery.value.trim()

  if (!query || query.length < 1) {
    searchSuggestions.value = []
    showSuggestions.value = false
    return
  }

  // 清除之前的定时器
  if (suggestionTimeout) {
    clearTimeout(suggestionTimeout)
  }

  // 防抖 200ms
  suggestionTimeout = setTimeout(async () => {
    const suggestions = await fetchSuggestions(query)
    searchSuggestions.value = suggestions
    showSuggestions.value = true
    showResults.value = false
  }, 200)
}

// 选择搜索结果
const handleSelectResult = (result: SearchResult) => {
  console.log('Selected result:', result)
  emit('selectResult', result)
  showResults.value = false
  showSuggestions.value = false
  // 不立即清空,让用户看到选择的内容
}

// 选择搜索建议
const handleSelectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
  handleSearch()
}

// 清空搜索
const handleClear = () => {
  searchQuery.value = ''
  searchResults.value = []
  searchSuggestions.value = []
  showResults.value = false
  showSuggestions.value = false
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  if (suggestionTimeout) {
    clearTimeout(suggestionTimeout)
  }
}

// 点击输入框聚焦时如果有搜索结果,显示结果
const handleFocus = () => {
  if (searchQuery.value.trim()) {
    if (searchSuggestions.value.length > 0) {
      showSuggestions.value = true
    } else if (searchResults.value.length > 0) {
      showResults.value = true
    } else {
      handleSuggestions()
    }
  }
}

// 点击外部关闭结果
const handleClickOutside = () => {
  showResults.value = false
  showSuggestions.value = false
}

// 获取类型标签
const getTypeLabel = (type: string) => {
  const labels = {
    destination: 'Destination',
    trip: 'Trip'
  }
  return labels[type as keyof typeof labels] || type
}

// 获取类型颜色
const getTypeColor = (type: string) => {
  const colors = {
    destination: 'var(--md3-primary)',
    trip: 'var(--md3-secondary)'
  }
  return colors[type as keyof typeof colors] || 'var(--md3-on-surface-variant)'
}

// 获取类型背景色
const getTypeBackground = (type: string) => {
  const backgrounds = {
    destination: 'var(--md3-primary-container)',
    trip: 'var(--md3-secondary-container)'
  }
  return backgrounds[type as keyof typeof backgrounds] || 'var(--md3-surface-variant)'
}
</script>

<template>
  <div class="searchbar-container" @click.stop>
    <!-- 搜索输入框 -->
    <div class="search-input-wrapper">
      <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
        <circle cx="11" cy="11" r="7"></circle>
        <path d="M16 16L21 21"></path>
      </svg>
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Search destinations, trips..."
        @input="handleSuggestions"
        @focus="handleFocus"
        @keyup.enter="handleSearch"
      />
      <button
        v-if="searchQuery"
        class="clear-btn"
        @click="handleClear"
        aria-label="Clear"
        title="Clear search"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- 搜索结果和建议 -->
    <Transition name="results">
      <!-- 加载中 -->
      <div v-if="isSearching" class="search-results">
        <div class="search-loading">
          <div class="spinner"></div>
          <span>Searching...</span>
        </div>
      </div>

      <!-- 搜索建议 -->
      <div v-else-if="showSuggestions && searchSuggestions.length > 0" class="search-results">
        <div class="suggestions-list">
          <div
            v-for="(suggestion, index) in searchSuggestions"
            :key="index"
            class="suggestion-item"
            @click="handleSelectSuggestion(suggestion)"
          >
            <svg class="suggestion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <div class="suggestion-text">{{ suggestion }}</div>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-else-if="showResults" class="search-results">
        <!-- 结果列表 -->
        <div v-if="searchResults.length > 0" class="results-list">
          <div
            v-for="result in searchResults"
            :key="result.id"
            class="result-item"
            @click="handleSelectResult(result)"
          >
            <!-- 类型图标 -->
            <div class="result-icon" v-html="getTypeIcon(result.type)"></div>

            <!-- 结果信息 -->
            <div class="result-info">
              <div class="result-title">{{ result.title }}</div>
              <div class="result-subtitle">{{ result.subtitle }}</div>
              <div v-if="result.type === 'trip' && result.start_date" class="result-meta">
                <span class="result-date">{{ new Date(result.start_date).toLocaleDateString() }}</span>
                <span v-if="result.end_date" class="result-date-separator">-</span>
                <span v-if="result.end_date" class="result-date">{{ new Date(result.end_date).toLocaleDateString() }}</span>
                <span class="result-author">by {{ result.author }}</span>
              </div>
            </div>

            <!-- 类型标签 -->
            <div
              class="result-type"
              :style="{
                backgroundColor: getTypeBackground(result.type),
                color: getTypeColor(result.type)
              }"
            >
              {{ getTypeLabel(result.type) }}
            </div>
          </div>
        </div>

        <!-- 无结果 -->
        <div v-else class="no-results">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <p>No results found</p>
          <p class="no-results-hint">Try different keywords</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.searchbar-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--md3-surface);
  border-radius: var(--md3-radius-large);
  border: 2px solid var(--md3-surface-variant);
  transition: all var(--md3-transition-short);
  box-shadow: var(--md3-elevation-1);
}

.search-input-wrapper:focus-within {
  border-color: var(--md3-primary);
  background: var(--md3-surface);
  box-shadow: 0 0 0 3px rgba(103, 80, 164, 0.1), var(--md3-elevation-2);
}

.search-icon {
  position: absolute;
  left: 14px;
  flex-shrink: 0;
  color: var(--md3-on-surface-variant);
}

.search-input {
  width: 100%;
  padding: var(--md3-space-3) 40px var(--md3-space-3) 42px;
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--md3-body-medium);
  color: var(--md3-on-surface);
}

.search-input::placeholder {
  color: var(--md3-on-surface-variant);
}

.clear-btn {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  background: var(--md3-surface-variant);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--md3-transition-short);
  padding: 0;
  color: var(--md3-on-surface-variant);
}

.clear-btn:hover {
  background: var(--md3-surface-variant-light);
  color: var(--md3-on-surface);
}

.search-results {
  background: var(--md3-surface);
  border-radius: var(--md3-radius-large);
  border: 1px solid var(--md3-surface-variant);
  max-height: 400px;
  overflow-y: auto;
  box-shadow: var(--md3-elevation-3);
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  color: var(--md3-on-surface-variant);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--md3-surface-variant);
  border-top: 2px solid var(--md3-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 搜索建议样式 */
.suggestions-list {
  display: flex;
  flex-direction: column;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--md3-space-3);
  cursor: pointer;
  transition: all var(--md3-transition-short);
  border-bottom: 1px solid var(--md3-surface-variant);
  border-radius: var(--md3-radius-medium);
  margin: 0 var(--md3-space-2);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: var(--md3-surface-variant-light);
  transform: translateX(2px);
}

.suggestion-icon {
  flex-shrink: 0;
  color: var(--md3-on-surface-variant);
}

.suggestion-text {
  font-size: var(--md3-body-medium);
  color: var(--md3-on-surface);
  flex: 1;
}

/* 结果列表样式 */
.results-list {
  display: flex;
  flex-direction: column;
}

.result-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: var(--md3-space-3);
  cursor: pointer;
  transition: all var(--md3-transition-short);
  border-bottom: 1px solid var(--md3-surface-variant);
  border-radius: var(--md3-radius-medium);
  margin: 0 var(--md3-space-2);
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: var(--md3-surface-variant-light);
  transform: translateX(2px);
}

.result-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: var(--md3-body-medium);
  font-weight: 600;
  color: var(--md3-on-surface);
  margin-bottom: 2px;
}

.result-subtitle {
  font-size: var(--md3-body-small);
  color: var(--md3-on-surface-variant);
  margin-bottom: 4px;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--md3-label-small);
  color: var(--md3-on-surface-variant);
  flex-wrap: wrap;
}

.result-date {
  color: var(--md3-on-surface-variant);
}

.result-date-separator {
  color: var(--md3-on-surface-variant);
}

.result-author {
  color: var(--md3-on-surface-variant);
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--md3-surface-variant);
}

.result-type {
  font-size: var(--md3-label-small);
  padding: var(--md3-space-1) var(--md3-space-2);
  border-radius: var(--md3-radius-full);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--md3-on-surface-variant);
}

.no-results p {
  margin: 12px 0 4px;
  font-size: var(--md3-body-medium);
  font-weight: 500;
  color: var(--md3-on-surface);
}

.no-results-hint {
  font-size: var(--md3-body-small) !important;
  color: var(--md3-on-surface-variant) !important;
}

/* 滚动条样式 */
.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: var(--md3-surface-variant);
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb {
  background: var(--md3-surface-variant-dark);
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: var(--md3-on-surface-variant);
}

/* 结果区域过渡动画 */
.results-enter-active,
.results-leave-active {
  transition: all var(--md3-transition-medium);
}

.results-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.results-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .result-type {
    align-self: flex-start;
    margin-top: 0;
  }

  .result-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .result-author {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
  }
}
</style>
