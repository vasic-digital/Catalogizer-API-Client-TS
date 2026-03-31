import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { HttpClient } from '../http'
import {
  CatalogizerError,
  AuthenticationError,
  NetworkError,
  ValidationError,
} from '../types'

// ---------------------------------------------------------------------------
// Mock axios
// ---------------------------------------------------------------------------

vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      isAxiosError: vi.fn(() => false),
    },
  }
})

function getAxiosInstance() {
  return (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value
}

function getRequestInterceptor() {
  const instance = getAxiosInstance()
  return instance.interceptors.request.use.mock.calls[0]
}

function getResponseInterceptor() {
  const instance = getAxiosInstance()
  return instance.interceptors.response.use.mock.calls[0]
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HttpClient', () => {
  let client: HttpClient

  beforeEach(() => {
    vi.clearAllMocks()
    client = new HttpClient({ baseURL: 'http://localhost:8080' })
  })

  describe('constructor', () => {
    it('creates an axios instance with provided base URL', () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:8080',
          timeout: 30000,
        })
      )
    })

    it('uses custom timeout when provided', () => {
      vi.clearAllMocks()
      new HttpClient({ baseURL: 'http://localhost:8080', timeout: 60000 })
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({ timeout: 60000 })
      )
    })

    it('includes custom headers', () => {
      vi.clearAllMocks()
      new HttpClient({
        baseURL: 'http://localhost:8080',
        headers: { 'X-Custom': 'value' },
      })
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Custom': 'value',
          }),
        })
      )
    })

    it('sets up request and response interceptors', () => {
      const instance = getAxiosInstance()
      expect(instance.interceptors.request.use).toHaveBeenCalled()
      expect(instance.interceptors.response.use).toHaveBeenCalled()
    })
  })

  describe('auth token management', () => {
    it('setAuthToken stores the token', () => {
      client.setAuthToken('my-token')
      expect(client.getAuthToken()).toBe('my-token')
    })

    it('clearAuthToken removes the token', () => {
      client.setAuthToken('my-token')
      client.clearAuthToken()
      expect(client.getAuthToken()).toBeUndefined()
    })

    it('getAuthToken returns undefined when no token set', () => {
      expect(client.getAuthToken()).toBeUndefined()
    })
  })

  describe('request interceptor', () => {
    it('adds Authorization header when token is set', () => {
      const [onFulfilled] = getRequestInterceptor()
      client.setAuthToken('test-token')
      const config = { headers: {} as Record<string, string> }
      const result = onFulfilled(config)
      expect(result.headers.Authorization).toBe('Bearer test-token')
    })

    it('does not add Authorization header when no token', () => {
      const [onFulfilled] = getRequestInterceptor()
      const config = { headers: {} as Record<string, string> }
      const result = onFulfilled(config)
      expect(result.headers.Authorization).toBeUndefined()
    })
  })

  describe('HTTP methods', () => {
    it('get calls axios.get and extracts data', async () => {
      const instance = getAxiosInstance()
      instance.get.mockResolvedValue({
        data: { success: true, status: 200, data: { id: 1 } },
      })

      const result = await client.get('/api/v1/test')
      expect(instance.get).toHaveBeenCalledWith('/api/v1/test', undefined)
      expect(result).toEqual({ id: 1 })
    })

    it('post calls axios.post and extracts data', async () => {
      const instance = getAxiosInstance()
      instance.post.mockResolvedValue({
        data: { success: true, status: 200, data: { created: true } },
      })

      const result = await client.post('/api/v1/test', { name: 'test' })
      expect(instance.post).toHaveBeenCalledWith('/api/v1/test', { name: 'test' }, undefined)
      expect(result).toEqual({ created: true })
    })

    it('put calls axios.put and extracts data', async () => {
      const instance = getAxiosInstance()
      instance.put.mockResolvedValue({
        data: { success: true, status: 200, data: { updated: true } },
      })

      const result = await client.put('/api/v1/test/1', { name: 'updated' })
      expect(instance.put).toHaveBeenCalledWith('/api/v1/test/1', { name: 'updated' }, undefined)
      expect(result).toEqual({ updated: true })
    })

    it('patch calls axios.patch and extracts data', async () => {
      const instance = getAxiosInstance()
      instance.patch.mockResolvedValue({
        data: { success: true, status: 200, data: { patched: true } },
      })

      const result = await client.patch('/api/v1/test/1', { field: 'value' })
      expect(instance.patch).toHaveBeenCalledWith('/api/v1/test/1', { field: 'value' }, undefined)
      expect(result).toEqual({ patched: true })
    })

    it('delete calls axios.delete and extracts data', async () => {
      const instance = getAxiosInstance()
      instance.delete.mockResolvedValue({
        data: { success: true, status: 200 },
      })

      const result = await client.delete('/api/v1/test/1')
      expect(instance.delete).toHaveBeenCalledWith('/api/v1/test/1', undefined)
      // When data is undefined, extractData returns the body itself
      expect(result).toBeDefined()
    })
  })

  describe('extractData', () => {
    it('returns data field when success is true', async () => {
      const instance = getAxiosInstance()
      instance.get.mockResolvedValue({
        data: { success: true, status: 200, data: [1, 2, 3] },
      })

      const result = await client.get<number[]>('/api/v1/items')
      expect(result).toEqual([1, 2, 3])
    })

    it('throws CatalogizerError when success is false', async () => {
      const instance = getAxiosInstance()
      instance.get.mockResolvedValue({
        data: { success: false, status: 400, error: 'Bad request' },
      })

      await expect(client.get('/api/v1/fail')).rejects.toThrow(CatalogizerError)
    })

    it('returns body as T when data is undefined', async () => {
      const instance = getAxiosInstance()
      instance.get.mockResolvedValue({
        data: { success: true, status: 200, message: 'OK' },
      })

      const result = await client.get<{ success: boolean; status: number; message: string }>('/api/v1/raw')
      expect(result).toHaveProperty('message', 'OK')
    })
  })

  describe('withRetry', () => {
    it('returns result on first successful attempt', async () => {
      const result = await client.withRetry(() => Promise.resolve('ok'))
      expect(result).toBe('ok')
    })

    it('retries on failure and returns successful result', async () => {
      let attempt = 0
      const operation = () => {
        attempt++
        if (attempt < 3) return Promise.reject(new Error('retry'))
        return Promise.resolve('success')
      }

      const result = await client.withRetry(operation, 3, 0)
      expect(result).toBe('success')
      expect(attempt).toBe(3)
    })

    it('throws after max attempts are exhausted', async () => {
      const operation = () => Promise.reject(new Error('permanent failure'))
      await expect(client.withRetry(operation, 2, 0)).rejects.toThrow('permanent failure')
    })

    it('does not retry AuthenticationError', async () => {
      let attempt = 0
      const operation = () => {
        attempt++
        return Promise.reject(new AuthenticationError('unauthorized'))
      }

      await expect(client.withRetry(operation, 3, 0)).rejects.toThrow(AuthenticationError)
      expect(attempt).toBe(1)
    })

    it('does not retry ValidationError', async () => {
      let attempt = 0
      const operation = () => {
        attempt++
        return Promise.reject(new ValidationError('invalid input'))
      }

      await expect(client.withRetry(operation, 3, 0)).rejects.toThrow(ValidationError)
      expect(attempt).toBe(1)
    })
  })

  describe('error classes', () => {
    it('CatalogizerError has status and code', () => {
      const err = new CatalogizerError('test error', 500, 'SERVER_ERROR')
      expect(err.message).toBe('test error')
      expect(err.status).toBe(500)
      expect(err.code).toBe('SERVER_ERROR')
      expect(err.name).toBe('CatalogizerError')
    })

    it('AuthenticationError defaults to 401', () => {
      const err = new AuthenticationError()
      expect(err.status).toBe(401)
      expect(err.code).toBe('AUTH_ERROR')
      expect(err.name).toBe('AuthenticationError')
    })

    it('NetworkError defaults to status 0', () => {
      const err = new NetworkError()
      expect(err.status).toBe(0)
      expect(err.code).toBe('NETWORK_ERROR')
      expect(err.name).toBe('NetworkError')
    })

    it('ValidationError defaults to 400', () => {
      const err = new ValidationError()
      expect(err.status).toBe(400)
      expect(err.code).toBe('VALIDATION_ERROR')
      expect(err.name).toBe('ValidationError')
    })

    it('all error classes extend CatalogizerError', () => {
      expect(new AuthenticationError()).toBeInstanceOf(CatalogizerError)
      expect(new NetworkError()).toBeInstanceOf(CatalogizerError)
      expect(new ValidationError()).toBeInstanceOf(CatalogizerError)
    })

    it('all error classes extend Error', () => {
      expect(new CatalogizerError('test')).toBeInstanceOf(Error)
      expect(new AuthenticationError()).toBeInstanceOf(Error)
      expect(new NetworkError()).toBeInstanceOf(Error)
      expect(new ValidationError()).toBeInstanceOf(Error)
    })
  })
})
