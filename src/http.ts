import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import {
  type ApiResponse,
  type ClientConfig,
  CatalogizerError,
  AuthenticationError,
  NetworkError,
  ValidationError,
} from './types'

/** HttpClient wraps axios with auth token injection, retry logic, and error mapping. */
export class HttpClient {
  private readonly client: AxiosInstance
  private authToken?: string
  private readonly config: ClientConfig

  public onTokenRefresh?: () => Promise<string | null>
  public onAuthenticationError?: () => void

  constructor(config: ClientConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    })
    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          if (this.onTokenRefresh) {
            try {
              const newToken = await this.onTokenRefresh()
              if (newToken) {
                this.setAuthToken(newToken)
                originalRequest.headers = {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${newToken}`,
                }
                return this.client(originalRequest)
              }
            } catch {
              this.onAuthenticationError?.()
            }
          }
        }

        return Promise.reject(this.mapError(error))
      }
    )
  }

  private mapError(error: unknown): CatalogizerError {
    if (!axios.isAxiosError(error) || !error.response) {
      return new NetworkError('Network connection failed')
    }
    const { status, data } = error.response
    const message: string = (data as Record<string, string>)?.message
      ?? (data as Record<string, string>)?.error
      ?? error.message
      ?? 'Request failed'
    switch (status) {
      case 400: return new ValidationError(message)
      case 401: return new AuthenticationError(message)
      case 403: return new CatalogizerError('Access forbidden', status, 'FORBIDDEN')
      case 404: return new CatalogizerError('Resource not found', status, 'NOT_FOUND')
      case 500: return new CatalogizerError('Internal server error', status, 'SERVER_ERROR')
      default:  return new CatalogizerError(message, status)
    }
  }

  private extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
    const body = response.data
    if (body.success === false) {
      throw new CatalogizerError(body.error ?? body.message ?? 'Request failed', body.status)
    }
    return body.data !== undefined ? body.data : (body as unknown as T)
  }

  public setAuthToken(token: string): void { this.authToken = token }
  public clearAuthToken(): void { this.authToken = undefined }
  public getAuthToken(): string | undefined { return this.authToken }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.extractData(await this.client.get<ApiResponse<T>>(url, config))
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.extractData(await this.client.post<ApiResponse<T>>(url, data, config))
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.extractData(await this.client.put<ApiResponse<T>>(url, data, config))
  }

  public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.extractData(await this.client.patch<ApiResponse<T>>(url, data, config))
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.extractData(await this.client.delete<ApiResponse<T>>(url, config))
  }

  public async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts = this.config.retryAttempts ?? 3,
    delay = this.config.retryDelay ?? 1000
  ): Promise<T> {
    let lastError: Error = new Error('Unknown error')
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        if (error instanceof AuthenticationError || error instanceof ValidationError) throw error
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, delay * attempt))
        }
      }
    }
    throw lastError
  }
}
