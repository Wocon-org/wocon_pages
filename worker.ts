/**
 * Cloudflare Worker 主入口
 * 统一处理所有 API 路由
 */

interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  // KV namespace for caching
  CACHE?: KVNamespace
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

// Cache helper functions
function generateCacheKey(prefix: string, ...args: string[]): string {
  return `${prefix}:${args.join(':')}`
}

async function getFromCache(env: Env, key: string): Promise<any> {
  if (!env.CACHE) return null

  try {
    const cached = await env.CACHE.get(key)
    return cached ? JSON.parse(cached) : null
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

async function setToCache(env: Env, key: string, value: any, ttl: number = 3600): Promise<void> {
  if (!env.CACHE) return

  try {
    await env.CACHE.put(key, JSON.stringify(value), { expirationTtl: ttl })
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

// Supabase client
function createSupabaseClient(env: Env) {
  const supabaseUrl = env.SUPABASE_URL
  const supabaseKey = env.SUPABASE_ANON_KEY

  // Generic fetch with auth headers
  async function supabaseFetch(url: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Supabase request failed: ${response.status} - ${errorText}`)
    }

    return response
  }

  return {
    // RPC calls
    async rpc<T = any>(functionName: string, params: any = {}) {
      const url = `${supabaseUrl}/rest/v1/rpc/${functionName}`
      const response = await supabaseFetch(url, {
        method: 'POST',
        body: JSON.stringify(params)
      })
      return response.json() as Promise<T>
    },

    // Table operations
    from(table: string) {
      return {
        // Select data
        async select<T = any>(columns: string = '*', filters: Record<string, any> = {}) {
          let url = `${supabaseUrl}/rest/v1/${table}?select=${columns}`

          // Add filters
          Object.entries(filters).forEach(([key, value], index) => {
            const prefix = index === 0 ? '&' : '&'
            url += `${prefix}${key}=${encodeURIComponent(value)}`
          })

          const response = await supabaseFetch(url)
          return response.json() as Promise<T[]>
        },

        // Insert data
        async insert<T = any>(data: any | any[]) {
          const url = `${supabaseUrl}/rest/v1/${table}`
          const response = await supabaseFetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
          })
          return response.json() as Promise<T[]>
        },

        // Update data
        async update<T = any>(data: any, filters: Record<string, any> = {}) {
          let url = `${supabaseUrl}/rest/v1/${table}`

          // Add filters
          Object.entries(filters).forEach(([key, value], index) => {
            const prefix = index === 0 ? '?' : '&'
            url += `${prefix}${key}=${encodeURIComponent(value)}`
          })

          const response = await supabaseFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data)
          })
          return response.json() as Promise<T[]>
        },

        // Delete data
        async delete<T = any>(filters: Record<string, any> = {}) {
          let url = `${supabaseUrl}/rest/v1/${table}`

          // Add filters
          Object.entries(filters).forEach(([key, value], index) => {
            const prefix = index === 0 ? '?' : '&'
            url += `${prefix}${key}=${encodeURIComponent(value)}`
          })

          const response = await supabaseFetch(url, {
            method: 'DELETE'
          })
          return response.json() as Promise<T[]>
        }
      }
    },

    // Auth operations
    auth: {
      async signInWithPassword(email: string, password: string) {
        const url = `${supabaseUrl}/auth/v1/token?grant_type=password`
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey
          },
          body: JSON.stringify({ email, password })
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Sign in failed: ${response.status} - ${errorText}`)
        }

        return response.json()
      },

      async signUp(email: string, password: string, data: any = {}) {
        const url = `${supabaseUrl}/auth/v1/signup`
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey
          },
          body: JSON.stringify({ email, password, data })
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Sign up failed: ${response.status} - ${errorText}`)
        }

        return response.json()
      }
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

  // Generate cache key
  const cacheKey = generateCacheKey('city-search', query.toLowerCase())

  // Try to get from cache first
  const cachedResult = await getFromCache(env, cacheKey)
  if (cachedResult) {
    return successResponse({
      ...cachedResult,
      cached: true
    })
  }

  try {
    const supabase = createSupabaseClient(env)
    const results = await supabase.rpc<any[]>('search_cities', { query })

    const responseData = {
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
    }

    // Cache the result (1 hour TTL)
    await setToCache(env, cacheKey, responseData, 3600)

    return successResponse(responseData)
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

// Auth handlers
async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return errorResponse('Email and password are required', 400)
    }

    const supabase = createSupabaseClient(env)
    const result = await supabase.auth.signInWithPassword(email, password)

    return successResponse({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('Login failed', 401)
  }
}

async function handleSignup(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return errorResponse('Email, password and name are required', 400)
    }

    const supabase = createSupabaseClient(env)
    const result = await supabase.auth.signUp(email, password, { name })

    return successResponse({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Signup error:', error)
    return errorResponse('Signup failed', 400)
  }
}

async function handleGetUser(request: Request, env: Env): Promise<Response> {
  try {
    // 从请求头获取认证令牌
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Authorization header required', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createSupabaseClient(env)

    // TODO: 实现获取当前用户信息的逻辑
    // 这里需要验证token并获取用户信息

    return successResponse({
      success: true,
      data: {
        // 模拟用户数据
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User'
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return errorResponse('Failed to get user info', 401)
  }
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

  // Auth routes
  {
    path: '/api/auth/login',
    method: 'POST',
    handler: handleLogin
  },
  {
    path: '/api/auth/signup',
    method: 'POST',
    handler: handleSignup
  },
  {
    path: '/api/auth/user',
    method: 'GET',
    handler: handleGetUser
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
