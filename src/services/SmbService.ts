import type { HttpClient } from '../http'

/** Parameters for discovering SMB shares on the local network. */
export interface SmbDiscoverRequest {
  network?: string
  timeout?: number
}

/** Parameters for testing connectivity to a specific SMB share. */
export interface SmbTestRequest {
  host: string
  port?: number
  share_name: string
  username?: string
  password?: string
  domain?: string
}

/** Parameters for browsing the directory tree of an SMB share. */
export interface SmbBrowseParams {
  host: string
  share_name?: string
  path?: string
  username?: string
  password?: string
  domain?: string
}

/**
 * SmbService provides SMB/CIFS network share operations including
 * automatic discovery, connectivity testing, and remote directory browsing.
 */
export class SmbService {
  constructor(private readonly http: HttpClient) {}

  /** Discovers SMB shares on the network, optionally scoped to a subnet. */
  public async discover(data?: SmbDiscoverRequest): Promise<Record<string, unknown>[]> {
    return this.http.post<Record<string, unknown>[]>('/api/v1/smb/discover', data)
  }

  /** Tests connectivity and authentication against a specific SMB share. */
  public async test(data: SmbTestRequest): Promise<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>('/api/v1/smb/test', data)
  }

  /** Browses the directory listing of an SMB share at the given path. */
  public async browse(params: SmbBrowseParams): Promise<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>('/api/v1/smb/browse', { params })
  }
}
