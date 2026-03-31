import type { HttpClient } from '../http'
import type { ScanResult } from '../types'

/** Parameters for creating a new scan job. */
export interface CreateScanRequest {
  storage_root_id: number
  deep_scan?: boolean
}

/**
 * ScanService manages scan lifecycle operations including creation,
 * listing, status retrieval, and cancellation of media scans.
 */
export class ScanService {
  constructor(private readonly http: HttpClient) {}

  /** Lists past and active scans with optional pagination. */
  public async list(params?: { limit?: number; offset?: number }): Promise<ScanResult[]> {
    return this.http.get<ScanResult[]>('/api/v1/scans', { params })
  }

  /** Creates and starts a new scan on the specified storage root. */
  public async create(data: CreateScanRequest): Promise<ScanResult> {
    return this.http.post<ScanResult>('/api/v1/scans', data)
  }

  /** Retrieves the current status of a scan by its ID. */
  public async get(id: number): Promise<ScanResult> {
    return this.http.get<ScanResult>(`/api/v1/scans/${id}`)
  }

  /** Deletes a completed or failed scan record. */
  public async delete(id: number): Promise<void> {
    return this.http.delete<void>(`/api/v1/scans/${id}`)
  }

  /** Cancels an in-progress scan. */
  public async cancel(id: number): Promise<void> {
    return this.http.post<void>(`/api/v1/scans/${id}/cancel`)
  }
}
