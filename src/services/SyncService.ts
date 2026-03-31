import type { HttpClient } from '../http'

/** A registered synchronization endpoint (remote server or device). */
export interface SyncEndpoint {
  id: number
  name: string
  type: string
  url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

/** Parameters for registering a new sync endpoint. */
export interface CreateSyncEndpointRequest {
  name: string
  type: string
  url: string
  username?: string
  password?: string
}

/** Fields that can be updated on an existing sync endpoint. */
export interface UpdateSyncEndpointRequest {
  name?: string
  url?: string
  is_active?: boolean
  username?: string
  password?: string
}

/** A record of a single synchronization session between endpoints. */
export interface SyncSession {
  id: number
  endpoint_id: number
  status: string
  started_at: string
  completed_at?: string
  files_synced?: number
  error_message?: string
}

/**
 * SyncService manages synchronization endpoints and sessions, allowing
 * catalog data to be replicated across remote servers or devices.
 */
export class SyncService {
  constructor(private readonly http: HttpClient) {}

  /** Registers a new sync endpoint. */
  public async createEndpoint(data: CreateSyncEndpointRequest): Promise<SyncEndpoint> {
    return this.http.post<SyncEndpoint>('/api/v1/sync/endpoints', data)
  }

  /** Lists all registered sync endpoints. */
  public async listEndpoints(): Promise<SyncEndpoint[]> {
    return this.http.get<SyncEndpoint[]>('/api/v1/sync/endpoints')
  }

  /** Retrieves a single sync endpoint by its ID. */
  public async getEndpoint(id: number): Promise<SyncEndpoint> {
    return this.http.get<SyncEndpoint>(`/api/v1/sync/endpoints/${id}`)
  }

  /** Updates an existing sync endpoint's configuration. */
  public async updateEndpoint(id: number, data: UpdateSyncEndpointRequest): Promise<SyncEndpoint> {
    return this.http.put<SyncEndpoint>(`/api/v1/sync/endpoints/${id}`, data)
  }

  /** Deletes a sync endpoint by its ID. */
  public async deleteEndpoint(id: number): Promise<void> {
    return this.http.delete<void>(`/api/v1/sync/endpoints/${id}`)
  }

  /** Triggers an immediate synchronization for the given endpoint. */
  public async triggerSync(id: number): Promise<SyncSession> {
    return this.http.post<SyncSession>(`/api/v1/sync/endpoints/${id}/sync`)
  }

  /** Lists sync sessions with optional filtering by endpoint and pagination. */
  public async listSessions(params?: { endpoint_id?: number; limit?: number; offset?: number }): Promise<SyncSession[]> {
    return this.http.get<SyncSession[]>('/api/v1/sync/sessions', { params })
  }

  /** Returns aggregate synchronization statistics. */
  public async getStatistics(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/sync/statistics')
  }
}
