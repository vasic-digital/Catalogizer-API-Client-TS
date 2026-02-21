import { EventEmitter } from 'events'
import { HttpClient } from './http'
import { AuthService } from './services/AuthService'
import { EntityService } from './services/EntityService'
import { CollectionService } from './services/CollectionService'
import { StorageService } from './services/StorageService'
import type { ClientConfig } from './types'

export { AuthService } from './services/AuthService'
export { EntityService } from './services/EntityService'
export { CollectionService } from './services/CollectionService'
export { StorageService } from './services/StorageService'
export { HttpClient } from './http'
export type {
  ClientConfig,
  ApiResponse,
  StorageRootConfig,
  StorageRootStatus,
  ScanRequest,
  ScanResult,
  WebSocketMessage,
  ScanProgressMessage,
} from './types'
export {
  CatalogizerError,
  AuthenticationError,
  NetworkError,
  ValidationError,
} from './types'
export type { EntityListParams, UserMetadataUpdate } from './services/EntityService'

/** CatalogizerClient is the top-level entry point for the Catalogizer API. */
export class CatalogizerClient extends EventEmitter {
  private readonly http: HttpClient
  private readonly config: ClientConfig

  public readonly auth: AuthService
  public readonly entities: EntityService
  public readonly collections: CollectionService
  public readonly storage: StorageService

  constructor(config: ClientConfig) {
    super()
    this.config = config
    this.http = new HttpClient(config)

    this.auth = new AuthService(this.http)
    this.entities = new EntityService(this.http)
    this.collections = new CollectionService(this.http)
    this.storage = new StorageService(this.http)

    this.http.onTokenRefresh = async () => {
      try {
        const result = await this.auth.refreshToken()
        return result.session_token
      } catch {
        return null
      }
    }

    this.http.onAuthenticationError = () => {
      this.emit('auth:expired')
    }
  }

  /** Set auth token directly (e.g. after loading from storage). */
  public setToken(token: string): void {
    this.http.setAuthToken(token)
  }

  /** Clear auth token (e.g. on logout). */
  public clearToken(): void {
    this.http.clearAuthToken()
  }

  /** Return current auth token if set. */
  public getToken(): string | undefined {
    return this.http.getAuthToken()
  }

  /** Get base URL of the configured server. */
  public getBaseURL(): string {
    return this.config.baseURL
  }
}
