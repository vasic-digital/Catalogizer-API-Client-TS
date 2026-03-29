import type { HttpClient } from '../http'
import type { ScanResult } from '../types'

export interface CreateScanRequest {
  storage_root_id: number
  deep_scan?: boolean
}

/** ScanService wraps all /api/v1/scans/* endpoints. */
export class ScanService {
  constructor(private readonly http: HttpClient) {}

  public async list(params?: { limit?: number; offset?: number }): Promise<ScanResult[]> {
    return this.http.get<ScanResult[]>('/api/v1/scans', { params })
  }

  public async create(data: CreateScanRequest): Promise<ScanResult> {
    return this.http.post<ScanResult>('/api/v1/scans', data)
  }

  public async get(id: number): Promise<ScanResult> {
    return this.http.get<ScanResult>(`/api/v1/scans/${id}`)
  }

  public async delete(id: number): Promise<void> {
    return this.http.delete<void>(`/api/v1/scans/${id}`)
  }

  public async cancel(id: number): Promise<void> {
    return this.http.post<void>(`/api/v1/scans/${id}/cancel`)
  }
}
