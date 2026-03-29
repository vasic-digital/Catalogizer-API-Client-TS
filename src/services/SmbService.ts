import type { HttpClient } from '../http'

export interface SmbDiscoverRequest {
  network?: string
  timeout?: number
}

export interface SmbTestRequest {
  host: string
  port?: number
  share_name: string
  username?: string
  password?: string
  domain?: string
}

export interface SmbBrowseParams {
  host: string
  share_name?: string
  path?: string
  username?: string
  password?: string
  domain?: string
}

/** SmbService wraps all /api/v1/smb/* endpoints. */
export class SmbService {
  constructor(private readonly http: HttpClient) {}

  public async discover(data?: SmbDiscoverRequest): Promise<Record<string, unknown>[]> {
    return this.http.post<Record<string, unknown>[]>('/api/v1/smb/discover', data)
  }

  public async test(data: SmbTestRequest): Promise<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>('/api/v1/smb/test', data)
  }

  public async browse(params: SmbBrowseParams): Promise<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>('/api/v1/smb/browse', { params })
  }
}
