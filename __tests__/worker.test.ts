import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'

const mockSupabaseResponse = {
  success: true,
  query: 'lima',
  count: 2,
  results: [
    {
      id: 'city-3936456',
      type: 'destination',
      title: 'Lima',
      subtitle: 'PE • Population: 9,751,717',
      lat: -12.046373,
      lng: -77.042755,
      population: 9751717
    },
    {
      id: 'city-4184429',
      type: 'destination',
      title: 'Lima',
      subtitle: 'US • Population: 38,731',
      lat: 39.94121,
      lng: -84.107273,
      population: 38731
    }
  ]
}

describe('Worker API Tests', () => {
  let worker: UnstableDevWorker

  beforeAll(async () => {
    worker = await unstable_dev('worker.ts', {
      experimental: {
        disableExperimentalWarning: true
      }
    })
  })

  afterAll(async () => {
    await worker.stop()
  })

  describe('Health Check', () => {
    it('should return 200 OK', async () => {
      const response = await worker.fetch('/health')
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.status).toBe('ok')
      expect(typeof data.timestamp).toBe('number')
    })
  })

  describe('City Search', () => {
    it('should return 400 for short queries', async () => {
      const response = await worker.fetch('/api/search/cities?q=l')
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Query must be at least 2 characters')
    })

    it('should return 200 for valid queries', async () => {
      // Mock the Supabase response
      const response = await worker.fetch('/api/search/cities?q=lima')
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.query).toBe('lima')
      expect(Array.isArray(data.results)).toBe(true)
    })
  })

  describe('Auth Endpoints', () => {
    it('should return 400 for login without credentials', async () => {
      const response = await worker.fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Email and password are required')
    })

    it('should return 400 for signup without credentials', async () => {
      const response = await worker.fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Email, password and name are required')
    })
  })

  describe('404 Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await worker.fetch('/api/unknown')
      expect(response.status).toBe(404)
      
      const data = await response.json()
      expect(data.error).toBe('Not Found')
    })
  })

  describe('CORS Headers', () => {
    it('should include CORS headers in responses', async () => {
      const response = await worker.fetch('/health')
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS')
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization')
    })

    it('should handle OPTIONS requests', async () => {
      const response = await worker.fetch('/api/search/cities', {
        method: 'OPTIONS'
      })
      expect(response.status).toBe(204)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })
  })
})
