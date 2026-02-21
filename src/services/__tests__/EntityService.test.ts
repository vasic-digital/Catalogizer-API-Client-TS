import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EntityService } from '../EntityService'
import type { HttpClient } from '../../http'
import type { MediaEntity, EntityStats, PaginatedResponse } from '@vasic-digital/media-types'

function makeEntity(overrides: Partial<MediaEntity> = {}): MediaEntity {
  return {
    id: 1,
    title: 'Inception',
    status: 'active',
    first_detected: '2024-01-01T00:00:00Z',
    last_updated: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makePage<T>(items: T[], total = items.length): PaginatedResponse<T> {
  return { items, total, limit: 20, offset: 0 }
}

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

describe('EntityService', () => {
  let http: HttpClient
  let service: EntityService

  beforeEach(() => {
    http = makeHttp()
    service = new EntityService(http)
  })

  it('list returns paginated entities', async () => {
    vi.mocked(http.get).mockResolvedValue(makePage([makeEntity()]))
    const result = await service.list({ type: 'movie', limit: 20 })
    expect(http.get).toHaveBeenCalledWith('/api/v1/entities', { params: { type: 'movie', limit: 20 } })
    expect(result.items).toHaveLength(1)
  })

  it('get returns a single entity by id', async () => {
    vi.mocked(http.get).mockResolvedValue(makeEntity({ id: 5 }))
    const entity = await service.get(5)
    expect(http.get).toHaveBeenCalledWith('/api/v1/entities/5')
    expect(entity.id).toBe(5)
  })

  it('getChildren returns children of entity', async () => {
    vi.mocked(http.get).mockResolvedValue(makePage([makeEntity({ parent_id: 1 })]))
    await service.getChildren(1)
    expect(http.get).toHaveBeenCalledWith('/api/v1/entities/1/children', { params: undefined })
  })

  it('getFiles returns files for entity', async () => {
    vi.mocked(http.get).mockResolvedValue([])
    await service.getFiles(3)
    expect(http.get).toHaveBeenCalledWith('/api/v1/entities/3/files')
  })

  it('getMetadata returns external metadata', async () => {
    vi.mocked(http.get).mockResolvedValue([])
    await service.getMetadata(3)
    expect(http.get).toHaveBeenCalledWith('/api/v1/entities/3/metadata')
  })

  it('refreshMetadata posts to metadata/refresh', async () => {
    vi.mocked(http.post).mockResolvedValue(undefined)
    await service.refreshMetadata(3)
    expect(http.post).toHaveBeenCalledWith('/api/v1/entities/3/metadata/refresh')
  })

  it('getDuplicates returns duplicate entities', async () => {
    vi.mocked(http.get).mockResolvedValue([makeEntity({ id: 2 })])
    const dups = await service.getDuplicates(1)
    expect(dups).toHaveLength(1)
  })

  it('getTypes returns media type list', async () => {
    vi.mocked(http.get).mockResolvedValue([{ id: 1, name: 'movie', description: 'Feature film' }])
    const types = await service.getTypes()
    expect(types[0].name).toBe('movie')
  })

  it('browseByType calls correct endpoint', async () => {
    vi.mocked(http.get).mockResolvedValue(makePage([]))
    await service.browseByType('movie', { limit: 10 })
    expect(http.get).toHaveBeenCalledWith('/api/v1/entities/browse/movie', { params: { limit: 10 } })
  })

  it('getStats returns aggregate stats', async () => {
    const stats: EntityStats = {
      total_entities: 500,
      entities_by_type: { movie: 300, tv_show: 200 },
      total_files: 600,
      total_size: 1_000_000_000,
      recent_additions: 10,
      duplicate_groups: 5,
    }
    vi.mocked(http.get).mockResolvedValue(stats)
    const result = await service.getStats()
    expect(result.total_entities).toBe(500)
  })

  it('updateUserMetadata calls PUT endpoint', async () => {
    vi.mocked(http.put).mockResolvedValue({ id: 1, media_item_id: 1, user_id: 1, is_favorite: true, is_watched: false, updated_at: '2024-01-01T00:00:00Z' })
    await service.updateUserMetadata(1, { is_favorite: true })
    expect(http.put).toHaveBeenCalledWith('/api/v1/entities/1/user-metadata', { is_favorite: true })
  })

  it('getStreamURL returns correct URL', () => {
    const url = service.getStreamURL(42, 'http://localhost:8080')
    expect(url).toBe('http://localhost:8080/api/v1/entities/42/stream')
  })

  it('getDownloadURL returns correct URL', () => {
    const url = service.getDownloadURL(7, 'http://localhost:8080')
    expect(url).toBe('http://localhost:8080/api/v1/entities/7/download')
  })
})
