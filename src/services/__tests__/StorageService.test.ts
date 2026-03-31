import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StorageService } from '../StorageService'
import type { HttpClient } from '../../http'
import type { StorageRootConfig, StorageRootStatus, ScanResult } from '../../types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeHttp(): HttpClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    setAuthToken: vi.fn(),
    clearAuthToken: vi.fn(),
    getAuthToken: vi.fn(),
    withRetry: vi.fn(),
  } as unknown as HttpClient
}

function makeStorageRoot(overrides: Partial<StorageRootConfig> = {}): StorageRootConfig {
  return {
    id: 1,
    name: 'NAS Main',
    protocol: 'smb',
    host: 'synology.local',
    port: 445,
    share_name: 'media',
    username: 'admin',
    domain: 'WORKGROUP',
    is_active: true,
    mount_point: '/mnt/nas',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeRootStatus(overrides: Partial<StorageRootStatus> = {}): StorageRootStatus {
  return {
    config_id: 1,
    is_connected: true,
    last_check: '2024-06-15T10:00:00Z',
    ...overrides,
  }
}

function makeScanResult(overrides: Partial<ScanResult> = {}): ScanResult {
  return {
    scan_id: 100,
    storage_root_id: 1,
    status: 'running',
    files_found: 0,
    files_processed: 0,
    started_at: '2024-06-15T10:00:00Z',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('StorageService', () => {
  let http: HttpClient
  let service: StorageService

  beforeEach(() => {
    http = makeHttp()
    service = new StorageService(http)
  })

  describe('listRoots', () => {
    it('calls GET /api/v1/storage-roots', async () => {
      const roots = [makeStorageRoot(), makeStorageRoot({ id: 2, name: 'Local' })]
      vi.mocked(http.get).mockResolvedValue(roots)

      const result = await service.listRoots()

      expect(http.get).toHaveBeenCalledWith('/api/v1/storage-roots')
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('NAS Main')
    })

    it('returns empty array when no roots exist', async () => {
      vi.mocked(http.get).mockResolvedValue([])
      const result = await service.listRoots()
      expect(result).toEqual([])
    })
  })

  describe('getRoot', () => {
    it('calls GET /api/v1/storage-roots/:id', async () => {
      const root = makeStorageRoot({ id: 5 })
      vi.mocked(http.get).mockResolvedValue(root)

      const result = await service.getRoot(5)

      expect(http.get).toHaveBeenCalledWith('/api/v1/storage-roots/5')
      expect(result.id).toBe(5)
    })

    it('returns the full storage root config', async () => {
      const root = makeStorageRoot({
        protocol: 'nfs',
        host: '192.168.0.100',
        local_path: '/exports/media',
      })
      vi.mocked(http.get).mockResolvedValue(root)

      const result = await service.getRoot(1)
      expect(result.protocol).toBe('nfs')
      expect(result.host).toBe('192.168.0.100')
    })
  })

  describe('getRootStatus', () => {
    it('calls GET /api/v1/storage-roots/:id/status', async () => {
      const status = makeRootStatus({ config_id: 3, is_connected: true })
      vi.mocked(http.get).mockResolvedValue(status)

      const result = await service.getRootStatus(3)

      expect(http.get).toHaveBeenCalledWith('/api/v1/storage-roots/3/status')
      expect(result.is_connected).toBe(true)
    })

    it('returns disconnected status with error message', async () => {
      const status = makeRootStatus({
        is_connected: false,
        error_message: 'Connection refused',
      })
      vi.mocked(http.get).mockResolvedValue(status)

      const result = await service.getRootStatus(1)
      expect(result.is_connected).toBe(false)
      expect(result.error_message).toBe('Connection refused')
    })
  })

  describe('startScan', () => {
    it('calls POST /api/v1/scan with scan request', async () => {
      const scanResult = makeScanResult({ scan_id: 200, status: 'running' })
      vi.mocked(http.post).mockResolvedValue(scanResult)

      const result = await service.startScan({ storage_root_id: 1 })

      expect(http.post).toHaveBeenCalledWith('/api/v1/scan', { storage_root_id: 1 })
      expect(result.scan_id).toBe(200)
      expect(result.status).toBe('running')
    })

    it('passes deep_scan option', async () => {
      const scanResult = makeScanResult()
      vi.mocked(http.post).mockResolvedValue(scanResult)

      await service.startScan({ storage_root_id: 1, deep_scan: true })

      expect(http.post).toHaveBeenCalledWith('/api/v1/scan', {
        storage_root_id: 1,
        deep_scan: true,
      })
    })
  })

  describe('getScanStatus', () => {
    it('calls GET /api/v1/scan/:scanId', async () => {
      const scanResult = makeScanResult({
        scan_id: 100,
        status: 'completed',
        files_found: 85000,
        files_processed: 85000,
        completed_at: '2024-06-15T10:30:00Z',
      })
      vi.mocked(http.get).mockResolvedValue(scanResult)

      const result = await service.getScanStatus(100)

      expect(http.get).toHaveBeenCalledWith('/api/v1/scan/100')
      expect(result.status).toBe('completed')
      expect(result.files_found).toBe(85000)
    })

    it('returns failed scan with error message', async () => {
      const scanResult = makeScanResult({
        status: 'failed',
        error_message: 'Permission denied',
      })
      vi.mocked(http.get).mockResolvedValue(scanResult)

      const result = await service.getScanStatus(1)
      expect(result.status).toBe('failed')
      expect(result.error_message).toBe('Permission denied')
    })
  })
})
