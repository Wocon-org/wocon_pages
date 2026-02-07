/**
 * API Client for Cloudflare Workers and Supabase
 * 当前优先使用Supabase直接调用（Worker部署完成后可切换）
 */

import { supabase } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const USE_WORKER = false // 暂时禁用Worker，部署成功后改为 true

interface CitySearchResult {
  id: string
  type: 'destination'
  title: string
  subtitle: string
  lat: number
  lng: number
  population?: number
}

interface SearchResponse {
  success: boolean
  query: string
  count: number
  results: CitySearchResult[]
}

/**
 * 搜索城市
 * @param query 搜索关键词
 * @returns 搜索结果
 */
export async function searchCities(query: string): Promise<CitySearchResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  // 如果启用了Worker，尝试使用Worker API
  if (USE_WORKER) {
    try {
      const response = await fetch(`${API_BASE_URL}/search/cities?q=${encodeURIComponent(query)}`)

      if (response.ok) {
        const data: SearchResponse = await response.json()

        if (data.success) {
          return data.results
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

    return (data as any[]).map((city: any) => ({
      id: `city-${city.geonameid}`,
      type: 'destination' as const,
      title: city.name,
      subtitle: `${city.country_code} • Population: ${city.population?.toLocaleString() || 'N/A'}`,
      lat: city.latitude,
      lng: city.longitude,
      population: city.population
    }))
  } catch (error) {
    console.error('Search failed:', error)
    return []
  }
}

/**
 * 搜索行程
 * @param query 搜索关键词
 * @returns 搜索结果
 */
export async function searchTrips(query: string): Promise<any[]> {
  if (!query) {
    return []
  }

  try {
    const response = await fetch(`${API_BASE_URL}/search/trips?q=${encodeURIComponent(query)}`)

    if (response.ok) {
      const data: SearchResponse = await response.json()

      if (data.success) {
        return data.results
      }
    }
  } catch (error) {
    console.error('Trip search error:', error)
  }

  return []
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
