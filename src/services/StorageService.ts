import type { HttpClient } from '../http'
import type {
  StorageRootConfig,
  StorageRootStatus,
  ScanRequest,
  ScanResult,
} from '../types'

/** StorageService manages storage roots and triggers media scans. */
export class StorageService {
  constructor(private readonly http: HttpClient) {}

  public async listRoots(): Promise<StorageRootConfig[]> {
    return this.http.get<StorageRootConfig[]>('/api/v1/storage-roots')
  }

  public async getRoot(id: number): Promise<StorageRootConfig> {
    return this.http.get<StorageRootConfig>(`/api/v1/storage-roots/${id}`)
  }

  public async getRootStatus(id: number): Promise<StorageRootStatus> {
    return this.http.get<StorageRootStatus>(`/api/v1/storage-roots/${id}/status`)
  }

  public async startScan(request: ScanRequest): Promise<ScanResult> {
    return this.http.post<ScanResult>('/api/v1/scan', request)
  }

  public async getScanStatus(scanId: number): Promise<ScanResult> {
    return this.http.get<ScanResult>(`/api/v1/scan/${scanId}`)
  }
}
