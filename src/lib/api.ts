/**
 * API Client for Cloudflare Workers
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

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

  try {
    // 优先使用Cloudflare Worker API
    const response = await fetch(`${API_BASE_URL}/search/cities?q=${encodeURIComponent(query)}`)

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    const data: SearchResponse = await response.json()

    if (data.success) {
      return data.results
    }

    return []
  } catch (error) {
    console.error('Worker search error:', error)

    // Fallback: 直接调用Supabase
    console.log('Falling back to Supabase direct call')
    const { supabase } = await import('./supabase')
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

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    const data: SearchResponse = await response.json()

    if (data.success) {
      return data.results
    }

    return []
  } catch (error) {
    console.error('Trip search error:', error)
    return []
  }
}
