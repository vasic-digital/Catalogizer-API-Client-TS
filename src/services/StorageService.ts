import type { HttpClient } from '../http'
import type {
  StorageRootConfig,
  StorageRootStatus,
  ScanRequest,
  ScanResult,
} from '../types'

/**
 * StorageService manages storage roots (SMB, FTP, NFS, local, etc.)
 * and provides scan triggering and status polling.
 */
export class StorageService {
  constructor(private readonly http: HttpClient) {}

  /** Lists all registered storage roots. */
  public async listRoots(): Promise<StorageRootConfig[]> {
    return this.http.get<StorageRootConfig[]>('/api/v1/storage-roots')
  }

  /** Retrieves a single storage root by its ID. */
  public async getRoot(id: number): Promise<StorageRootConfig> {
    return this.http.get<StorageRootConfig>(`/api/v1/storage-roots/${id}`)
  }

  /** Returns the connectivity status for a storage root. */
  public async getRootStatus(id: number): Promise<StorageRootStatus> {
    return this.http.get<StorageRootStatus>(`/api/v1/storage-roots/${id}/status`)
  }

  /** Starts a new media scan on a storage root. */
  public async startScan(request: ScanRequest): Promise<ScanResult> {
    return this.http.post<ScanResult>('/api/v1/scan', request)
  }

  /** Retrieves the current status of an in-progress or completed scan. */
  public async getScanStatus(scanId: number): Promise<ScanResult> {
    return this.http.get<ScanResult>(`/api/v1/scan/${scanId}`)
  }
}
