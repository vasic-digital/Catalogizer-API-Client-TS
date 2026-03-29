import { EventEmitter } from 'events'
import { HttpClient } from './http'
import { AuthService } from './services/AuthService'
import { EntityService } from './services/EntityService'
import { CollectionService } from './services/CollectionService'
import { StorageService } from './services/StorageService'
import { StatsService } from './services/StatsService'
import { RecommendationService } from './services/RecommendationService'
import { ScanService } from './services/ScanService'
import { SmbService } from './services/SmbService'
import { SyncService } from './services/SyncService'
import { DownloadService } from './services/DownloadService'
import { PlaylistService } from './services/PlaylistService'
import { AnalyticsService } from './services/AnalyticsService'
import { ReportService } from './services/ReportService'
import type { ClientConfig } from './types'

export { AuthService } from './services/AuthService'
export { EntityService } from './services/EntityService'
export { CollectionService } from './services/CollectionService'
export { StorageService } from './services/StorageService'
export { StatsService } from './services/StatsService'
export { RecommendationService } from './services/RecommendationService'
export { ScanService } from './services/ScanService'
export { SmbService } from './services/SmbService'
export { SyncService } from './services/SyncService'
export { DownloadService } from './services/DownloadService'
export { PlaylistService } from './services/PlaylistService'
export { AnalyticsService } from './services/AnalyticsService'
export { ReportService } from './services/ReportService'
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
export type { CreateScanRequest } from './services/ScanService'
export type { SmbDiscoverRequest, SmbTestRequest, SmbBrowseParams } from './services/SmbService'
export type { SyncEndpoint, CreateSyncEndpointRequest, UpdateSyncEndpointRequest, SyncSession } from './services/SyncService'
export type { ArchiveRequest } from './services/DownloadService'
export type { Playlist, PlaylistItem, CreatePlaylistRequest, UpdatePlaylistRequest, AddPlaylistItemRequest } from './services/PlaylistService'
export type { AccessEvent, AnalyticsEvent, UserAnalytics } from './services/AnalyticsService'
export type { ReportParams } from './services/ReportService'

/** CatalogizerClient is the top-level entry point for the Catalogizer API. */
export class CatalogizerClient extends EventEmitter {
  private readonly http: HttpClient
  private readonly config: ClientConfig

  public readonly auth: AuthService
  public readonly entities: EntityService
  public readonly collections: CollectionService
  public readonly storage: StorageService
  public readonly stats: StatsService
  public readonly recommendations: RecommendationService
  public readonly scans: ScanService
  public readonly smb: SmbService
  public readonly sync: SyncService
  public readonly downloads: DownloadService
  public readonly playlists: PlaylistService
  public readonly analytics: AnalyticsService
  public readonly reports: ReportService

  constructor(config: ClientConfig) {
    super()
    this.config = config
    this.http = new HttpClient(config)

    this.auth = new AuthService(this.http)
    this.entities = new EntityService(this.http)
    this.collections = new CollectionService(this.http)
    this.storage = new StorageService(this.http)
    this.stats = new StatsService(this.http)
    this.recommendations = new RecommendationService(this.http)
    this.scans = new ScanService(this.http)
    this.smb = new SmbService(this.http)
    this.sync = new SyncService(this.http)
    this.downloads = new DownloadService(this.http)
    this.playlists = new PlaylistService(this.http)
    this.analytics = new AnalyticsService(this.http)
    this.reports = new ReportService(this.http)

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
