import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StatsService } from '../StatsService'
import type { HttpClient } from '../../http'

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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('StatsService', () => {
  let http: HttpClient
  let service: StatsService

  beforeEach(() => {
    http = makeHttp()
    service = new StatsService(http)
  })

  describe('getOverall', () => {
    it('calls GET /api/v1/stats/overall', async () => {
      const stats = { total_files: 85000, total_size: 10_000_000_000 }
      vi.mocked(http.get).mockResolvedValue(stats)

      const result = await service.getOverall()

      expect(http.get).toHaveBeenCalledWith('/api/v1/stats/overall')
      expect(result).toEqual(stats)
    })
  })

  describe('getFileTypes', () => {
    it('calls GET /api/v1/stats/filetypes', async () => {
      const types = [
        { extension: 'mkv', count: 500 },
        { extension: 'mp4', count: 300 },
      ]
      vi.mocked(http.get).mockResolvedValue(types)

      const result = await service.getFileTypes()

      expect(http.get).toHaveBeenCalledWith('/api/v1/stats/filetypes')
      expect(result).toHaveLength(2)
    })
  })

  describe('getSizes', () => {
    it('calls GET /api/v1/stats/sizes', async () => {
      const sizes = { avg_file_size: 1_500_000_000, max_file_size: 50_000_000_000 }
      vi.mocked(http.get).mockResolvedValue(sizes)

      const result = await service.getSizes()

      expect(http.get).toHaveBeenCalledWith('/api/v1/stats/sizes')
      expect(result).toEqual(sizes)
    })
  })

  describe('getDuplicates', () => {
    it('calls GET /api/v1/stats/duplicates', async () => {
      const dupes = { total_groups: 15, total_wasted_space: 25_000_000_000 }
      vi.mocked(http.get).mockResolvedValue(dupes)

      const result = await service.getDuplicates()

      expect(http.get).toHaveBeenCalledWith('/api/v1/stats/duplicates')
      expect(result).toEqual(dupes)
    })
  })

  describe('getDuplicateGroups', () => {
    it('calls GET /api/v1/stats/duplicates/groups', async () => {
      const groups = [{ title: 'Inception', count: 3 }]
      vi.mocked(http.get).mockResolvedValue(groups)

      const result = await service.getDuplicateGroups()

      expect(http.get).toHaveBeenCalledWith('/api/v1/stats/duplicates/groups', { params: undefined })
      expect(result).toHaveLength(1)
    })

    it('passes limit and offset params', async () => {
      vi.mocked(http.get).mockResolvedValue([])

      await service.getDuplicateGroups({ limit: 10, offset: 20 })

      expect(http.get).toHaveBeenCalledWith('/api/v1/stats/duplicates/groups', {
        params: { limit: 10, offset: 20 },
      })
    })
  })

  describe('getAccess', () => {
    it('calls GET /api/v1/stats/access', async () => {
      const access = { total_accesses: 500, unique_users: 10 }
      vi.mocked(http.get).mockResolvedValue(access)

      const result = await service.getAccess()

      expect(http.get).toHaveBeenCalledWith('/api/v1/stats/access', { params: undefined })
      expect(result).toEqual(access)
    })

    it('passes date range params', async () => {
      vi.mocked(http.get).mockResolvedValue({})

      await service.getAccess({ from: '2024-01-01', to: '2024-06-30' })

      expect(http.get).toHaveBeenCalledWith('/api/v1/stats/access', {
        params: { from: '2024-01-01', to: '2024-06-30' },
      })
    })
  })

  describe('getGrowth', () => {
    it('calls GET /api/v1/stats/growth', async () => {
      const growth = { new_files_this_month: 100, storage_growth_bytes: 500_000_000 }
      vi.mocked(http.get).mockResolvedValue(growth)

      const result = await service.getGrowth()

      expect(http.get).toHaveBeenCalledWith('/api/v1/stats/growth', { params: undefined })
      expect(result).toEqual(growth)
    })

    it('passes date range params', async () => {
      vi.mocked(http.get).mockResolvedValue({})

      await service.getGrowth({ from: '2024-01-01', to: '2024-12-31' })

      expect(http.get).toHaveBeenCalledWith('/api/v1/stats/growth', {
        params: { from: '2024-01-01', to: '2024-12-31' },
      })
    })
  })

  describe('getScans', () => {
    it('calls GET /api/v1/stats/scans', async () => {
      const scans = [
        { scan_id: 1, status: 'completed', files_found: 85000 },
        { scan_id: 2, status: 'running', files_found: 1000 },
      ]
      vi.mocked(http.get).mockResolvedValue(scans)

      const result = await service.getScans()

      expect(http.get).toHaveBeenCalledWith('/api/v1/stats/scans', { params: undefined })
      expect(result).toHaveLength(2)
    })

    it('passes pagination params', async () => {
      vi.mocked(http.get).mockResolvedValue([])

      await service.getScans({ limit: 5, offset: 10 })

      expect(http.get).toHaveBeenCalledWith('/api/v1/stats/scans', {
        params: { limit: 5, offset: 10 },
      })
    })
  })
})
