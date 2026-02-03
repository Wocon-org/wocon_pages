/**
 * Cloudflare Worker中的Supabase客户端配置
 */

interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

// 创建Supabase客户端
export function createSupabaseClient(env: Env) {
  const supabaseUrl = env.SUPABASE_URL
  const supabaseKey = env.SUPABASE_ANON_KEY

  return {
    // RPC调用
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
        const error = await response.text()
        throw new Error(`RPC call failed: ${error}`)
      }

      return response.json() as Promise<T>
    },

    // 通用查询
    async from(table: string) {
      return {
        select: async (columns: string = '*') => {
          const url = `${supabaseUrl}/rest/v1/${table}?select=${columns}`
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          })

          if (!response.ok) {
            throw new Error(`Query failed: ${await response.text()}`)
          }

          return response.json()
        },

        insert: async (data: any) => {
          const url = `${supabaseUrl}/rest/v1/${table}`
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify(data)
          })

          if (!response.ok) {
            throw new Error(`Insert failed: ${await response.text()}`)
          }

          return response.json()
        }
      }
    }
  }
}

// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

// Handle CORS preflight requests
export function handleCors(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }
  return null
}

// Success response helper
export function successResponse<T>(data: T, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  })
}

// Error response helper
export function errorResponse(message: string, status: number = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  })
}
