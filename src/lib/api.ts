/**
 * API Client for Cloudflare Workers and Supabase
 * 当前优先使用Supabase直接调用（Worker部署完成后可切换）
 */

import { supabase } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const USE_WORKER = false // 暂时禁用Worker，部署成功后改为 true

// 搜索缓存
const searchCache = new Map<string, {
  results: any[]
  timestamp: number
}>

// 缓存过期时间（10分钟）
const CACHE_EXPIRY = 10 * 60 * 1000

interface CitySearchResult {
  id: string
  type: 'destination'
  title: string
  subtitle: string
  lat: number
  lng: number
  population?: number
  score?: number // 匹配分数
  country?: string
}

interface TripSearchResult {
  id: string
  type: 'trip'
  title: string
  subtitle: string
  start_date: string
  end_date: string
  author: string
  lat: number
  lng: number
  is_public: boolean
  score?: number
}

interface SearchResponse {
  success: boolean
  query: string
  count: number
  results: (CitySearchResult | TripSearchResult)[]
}

interface SearchOptions {
  limit?: number
  types?: ('city' | 'trip')[]
  minPopulation?: number
  sortBy?: 'relevance' | 'population' | 'name'
}

/**
 * 计算字符串相似度（Levenshtein距离的简化版）
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()
  
  // 完全匹配
  if (s1 === s2) return 1.0
  
  // 前缀匹配
  if (s1.startsWith(s2) || s2.startsWith(s1)) return 0.9
  
  // 包含关系
  if (s1.includes(s2) || s2.includes(s1)) return 0.8
  
  // 计算字符匹配率
  let matchCount = 0
  for (const char of s1) {
    if (s2.includes(char)) matchCount++
  }
  
  return matchCount / Math.max(s1.length, s2.length)
}

/**
 * 搜索缓存管理
 */
function getCachedSearch(query: string): any[] | null {
  const cached = searchCache.get(query)
  if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRY) {
    return cached.results
  }
  searchCache.delete(query)
  return null
}

function setCachedSearch(query: string, results: any[]): void {
  searchCache.set(query, {
    results,
    timestamp: Date.now()
  })
  
  // 限制缓存大小
  if (searchCache.size > 50) {
    const oldestKey = searchCache.keys().next().value
    if (oldestKey) {
      searchCache.delete(oldestKey)
    }
  }
}

/**
 * 搜索城市
 * @param query 搜索关键词
 * @param options 搜索选项
 * @returns 搜索结果
 */
export async function searchCities(query: string, options: SearchOptions = {}): Promise<CitySearchResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  // 检查缓存
  const cacheKey = `${query}_${JSON.stringify(options)}`
  const cachedResults = getCachedSearch(cacheKey)
  if (cachedResults) {
    return cachedResults
  }

  // 如果启用了Worker，尝试使用Worker API
  if (USE_WORKER) {
    try {
      const response = await fetch(`${API_BASE_URL}/search/cities?q=${encodeURIComponent(query)}&${new URLSearchParams(options as any)}`)

      if (response.ok) {
        const data: SearchResponse = await response.json()

        if (data.success) {
          setCachedSearch(cacheKey, data.results)
          return data.results as CitySearchResult[]
        }
      }
    } catch (error) {
      console.warn('Worker search failed, falling back to Supabase:', error)
    }
  }

  // 直接调用Supabase
  try {
    const { data, error: rpcError } = await supabase.rpc('search_cities', { query })

    if (rpcError) {
      console.error('Supabase RPC error:', rpcError)
      return []
    }

    let results = (data as any[]).map((city: any) => ({
      id: `city-${city.geonameid}`,
      type: 'destination' as const,
      title: city.name,
      subtitle: `${city.country_code} • Population: ${city.population?.toLocaleString() || 'N/A'}`,
      lat: city.latitude,
      lng: city.longitude,
      population: city.population,
      country: city.country_code,
      score: calculateSimilarity(query, city.name)
    }))

    // 应用过滤和排序
    if (options.minPopulation) {
      results = results.filter(city => city.population && city.population >= options.minPopulation!)
    }

    switch (options.sortBy) {
      case 'population':
        results.sort((a, b) => (b.population || 0) - (a.population || 0))
        break
      case 'name':
        results.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'relevance':
      default:
        results.sort((a, b) => (b.score || 0) - (a.score || 0))
        break
    }

    // 应用限制
    if (options.limit) {
      results = results.slice(0, options.limit)
    }

    setCachedSearch(cacheKey, results)
    return results
  } catch (error) {
    console.error('Search failed:', error)
    return []
  }
}

/**
 * 搜索行程
 * @param query 搜索关键词
 * @param options 搜索选项
 * @returns 搜索结果
 */
export async function searchTrips(query: string, options: SearchOptions = {}): Promise<TripSearchResult[]> {
  if (!query) {
    return []
  }

  // 检查缓存
  const cacheKey = `trip_${query}_${JSON.stringify(options)}`
  const cachedResults = getCachedSearch(cacheKey)
  if (cachedResults) {
    return cachedResults
  }

  // 直接调用Supabase（添加fallback）
  try {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        id,
        title,
        description,
        start_date,
        end_date,
        author,
        location_lat,
        location_lng,
        is_public,
        profiles(name)
      `)
      .ilike('title', `%${query}%`)
      .or(`ilike(description, %${query}%)`)
      .eq('is_public', true)
      .limit(options.limit || 10)

    if (error) {
      console.error('Supabase trip search error:', error)
      return []
    }

    const results = (data || []).map((trip: any) => ({
      id: trip.id,
      type: 'trip' as const,
      title: trip.title,
      subtitle: trip.description || 'No description',
      start_date: trip.start_date,
      end_date: trip.end_date,
      author: trip.profiles?.name || 'Unknown',
      lat: trip.location_lat,
      lng: trip.location_lng,
      is_public: trip.is_public
    }))

    setCachedSearch(cacheKey, results)
    return results
  } catch (error) {
    console.error('Trip search error:', error)
    return []
  }
}

/**
 * 综合搜索（城市和行程）
 * @param query 搜索关键词
 * @param options 搜索选项
 * @returns 综合搜索结果
 */
export async function searchEverything(query: string, options: SearchOptions = {}): Promise<(CitySearchResult | TripSearchResult)[]> {
  if (!query || query.length < 2) {
    return []
  }

  // 并行搜索
  const [cities, trips] = await Promise.all([
    searchCities(query, options),
    searchTrips(query, options)
  ])

  // 合并结果并按相关性排序
  const allResults = [...cities, ...trips]
  
  // 计算综合相关性分数
  allResults.forEach(result => {
    if (result.type === 'destination') {
      // 城市已经有分数
    } else {
      // 为行程计算分数
      const trip = result as TripSearchResult
      trip['score'] = calculateSimilarity(query, trip.title) * 0.7 + 
                      (trip.subtitle ? calculateSimilarity(query, trip.subtitle) * 0.3 : 0)
    }
  })

  // 按分数排序
  allResults.sort((a, b) => (b['score'] || 0) - (a['score'] || 0))

  // 应用限制
  if (options.limit) {
    return allResults.slice(0, options.limit)
  }

  return allResults
}

/**
 * 获取搜索建议（自动完成）
 * @param query 搜索关键词
 * @returns 搜索建议
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 1) {
    return []
  }

  try {
    const { data } = await supabase
      .rpc('search_city_suggestions', { query })
      .limit(5)

    return (data || []).map((item: any) => item.name)
  } catch (error) {
    console.error('Suggestions failed:', error)
    return []
  }
}

/**
 * 获取用户资料
 */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

/**
 * 更新用户资料
 */
export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

/**
 * 上传头像
 */
export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (error) {
    return { data: null, error }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return { data: { url: publicUrl }, error: null }
}
