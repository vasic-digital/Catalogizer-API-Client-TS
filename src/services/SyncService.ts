import type { HttpClient } from '../http'

export interface SyncEndpoint {
  id: number
  name: string
  type: string
  url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateSyncEndpointRequest {
  name: string
  type: string
  url: string
  username?: string
  password?: string
}

export interface UpdateSyncEndpointRequest {
  name?: string
  url?: string
  is_active?: boolean
  username?: string
  password?: string
}

export interface SyncSession {
  id: number
  endpoint_id: number
  status: string
  started_at: string
  completed_at?: string
  files_synced?: number
  error_message?: string
}

/** SyncService wraps all /api/v1/sync/* endpoints. */
export class SyncService {
  constructor(private readonly http: HttpClient) {}

  public async createEndpoint(data: CreateSyncEndpointRequest): Promise<SyncEndpoint> {
    return this.http.post<SyncEndpoint>('/api/v1/sync/endpoints', data)
  }

  public async listEndpoints(): Promise<SyncEndpoint[]> {
    return this.http.get<SyncEndpoint[]>('/api/v1/sync/endpoints')
  }

  public async getEndpoint(id: number): Promise<SyncEndpoint> {
    return this.http.get<SyncEndpoint>(`/api/v1/sync/endpoints/${id}`)
  }

  public async updateEndpoint(id: number, data: UpdateSyncEndpointRequest): Promise<SyncEndpoint> {
    return this.http.put<SyncEndpoint>(`/api/v1/sync/endpoints/${id}`, data)
  }

  public async deleteEndpoint(id: number): Promise<void> {
    return this.http.delete<void>(`/api/v1/sync/endpoints/${id}`)
  }

  public async triggerSync(id: number): Promise<SyncSession> {
    return this.http.post<SyncSession>(`/api/v1/sync/endpoints/${id}/sync`)
  }

  public async listSessions(params?: { endpoint_id?: number; limit?: number; offset?: number }): Promise<SyncSession[]> {
    return this.http.get<SyncSession[]>('/api/v1/sync/sessions', { params })
  }

  public async getStatistics(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/sync/statistics')
  }
}
