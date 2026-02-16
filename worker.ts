/**
 * Cloudflare Worker 主入口
 * 统一处理所有 API 路由
 */

interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

// Helper functions
function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }
  return null
}

function successResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  })
}

function errorResponse(message: string, status: number = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  })
}

// Supabase client
function createSupabaseClient(env: Env) {
  const supabaseUrl = env.SUPABASE_URL
  const supabaseKey = env.SUPABASE_ANON_KEY

  return {
    async rpc<T = any>(functionName: string, params: any = {}) {
      const url = `${supabaseUrl}/rest/v1/rpc/${functionName}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error(`RPC call failed: ${response.status}`)
      }

      return response.json() as Promise<T>
    }
  }
}

// Route handlers
async function handleCitySearch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const query = url.searchParams.get('q') || ''

  if (!query || query.length < 2) {
    return errorResponse('Query must be at least 2 characters', 400)
  }

  try {
    const supabase = createSupabaseClient(env)
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

async function handleTripSearch(request: Request, _env: Env): Promise<Response> {
  const url = new URL(request.url)
  const query = url.searchParams.get('q') || ''

  if (!query) {
    return errorResponse('Query parameter "q" is required', 400)
  }

  return successResponse({
    success: true,
    query,
    count: 0,
    results: []
  })
}

// Route handler type
type RouteHandler = (request: Request, env: Env) => Promise<Response>

// Route definition
interface Route {
  path: string
  method: string
  handler: RouteHandler
}

// Route registry
const routes: Route[] = [
  // Search routes
  {
    path: '/api/search/cities',
    method: 'GET',
    handler: handleCitySearch
  },
  {
    path: '/api/search/trips',
    method: 'GET',
    handler: handleTripSearch
  },
  
  // Health check
  {
    path: '/health',
    method: 'GET',
    handler: (_, __) => successResponse({ status: 'ok', timestamp: Date.now() })
  }
]

// Router function
function router(request: Request, env: Env): RouteHandler | null {
  const url = new URL(request.url)
  const path = url.pathname
  const method = request.method

  // Find matching route
  for (const route of routes) {
    if (path.startsWith(route.path) && method === route.method) {
      return route.handler
    }
  }

  return null
}

// Main fetch handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS
    const corsResponse = handleCors(request)
    if (corsResponse) return corsResponse

    // Find and execute route handler
    const handler = router(request, env)
    if (handler) {
      try {
        return await handler(request, env)
      } catch (error) {
        console.error('Route handler error:', error)
        return errorResponse('Internal Server Error', 500)
      }
    }

    // 404
    return errorResponse('Not Found', 404)
  }
}
