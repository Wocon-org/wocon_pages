/**
 * Cloudflare Worker: 搜索功能
 * 路径: /api/search
 */

import { createSupabaseClient, handleCors, successResponse, errorResponse } from '../shared/supabase.ts'

export interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    const corsResponse = handleCors(request)
    if (corsResponse) return corsResponse

    const url = new URL(request.url)
    const path = url.pathname

    // Route: /api/search/cities
    if (path.startsWith('/api/search/cities') && request.method === 'GET') {
      return handleCitySearch(request, env)
    }

    // Route: /api/search/trips
    if (path.startsWith('/api/search/trips') && request.method === 'GET') {
      return handleTripSearch(request, env)
    }

    // 404 for unknown routes
    return errorResponse('Not Found', 404)
  }
}

/**
 * 城市搜索
 * 查询参数: q (搜索关键词)
 */
async function handleCitySearch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const query = url.searchParams.get('q') || ''

  if (!query || query.length < 2) {
    return errorResponse('Query must be at least 2 characters', 400)
  }

  try {
    const supabase = createSupabaseClient(env)

    // 调用Supabase的search_cities函数
    const results = await supabase.rpc<any[]>('search_cities', { query })

    return successResponse({
      success: true,
      query,
      count: results.length,
      results: results.map((city: any) => ({
        id: `city-${city.geonameid}`,
        type: 'destination',
        title: city.name,
        subtitle: `${city.country_code} • Population: ${city.population?.toLocaleString() || 'N/A'}`,
        lat: city.latitude,
        lng: city.longitude,
        population: city.population
      }))
    })
  } catch (error) {
    console.error('City search error:', error)
    return errorResponse('Search failed', 500)
  }
}

/**
 * 行程搜索
 * 查询参数: q (搜索关键词)
 */
async function handleTripSearch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const query = url.searchParams.get('q') || ''

  if (!query) {
    return errorResponse('Query parameter "q" is required', 400)
  }

  try {
    createSupabaseClient(env)

    // TODO: 实现行程搜索
    // const results = await supabase.from('trips').select('*').ilike('name', `%${query}%`)

    return successResponse({
      success: true,
      query,
      count: 0,
      results: []
    })
  } catch (error) {
    console.error('Trip search error:', error)
    return errorResponse('Search failed', 500)
  }
}
