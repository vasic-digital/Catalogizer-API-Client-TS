import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CollectionService } from '../CollectionService'
import type { HttpClient } from '../../http'
import type { MediaCollection, PaginatedResponse } from '@vasic-digital/media-types'

function makeCollection(overrides: Partial<MediaCollection> = {}): MediaCollection {
  return {
    id: 1,
    name: 'Favorites',
    user_id: 1,
    is_public: false,
    is_smart: false,
    item_count: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makePage<T>(items: T[]): PaginatedResponse<T> {
  return { items, total: items.length, limit: 20, offset: 0 }
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
  } as unknown as HttpClient
}

describe('CollectionService', () => {
  let http: HttpClient
  let service: CollectionService

  beforeEach(() => {
    http = makeHttp()
    service = new CollectionService(http)
  })

  it('list returns paginated collections', async () => {
    vi.mocked(http.get).mockResolvedValue(makePage([makeCollection()]))
    const result = await service.list()
    expect(http.get).toHaveBeenCalledWith('/api/v1/collections', { params: undefined })
    expect(result.items).toHaveLength(1)
  })

  it('get returns a collection by id', async () => {
    vi.mocked(http.get).mockResolvedValue(makeCollection({ id: 3 }))
    const col = await service.get(3)
    expect(http.get).toHaveBeenCalledWith('/api/v1/collections/3')
    expect(col.id).toBe(3)
  })

  it('create posts a new collection', async () => {
    vi.mocked(http.post).mockResolvedValue(makeCollection({ name: 'New' }))
    const result = await service.create({ name: 'New' })
    expect(http.post).toHaveBeenCalledWith('/api/v1/collections', { name: 'New' })
    expect(result.name).toBe('New')
  })

  it('update puts to collection endpoint', async () => {
    vi.mocked(http.put).mockResolvedValue(makeCollection({ name: 'Updated' }))
    const result = await service.update(1, { name: 'Updated' })
    expect(http.put).toHaveBeenCalledWith('/api/v1/collections/1', { name: 'Updated' })
    expect(result.name).toBe('Updated')
  })

  it('delete calls DELETE endpoint', async () => {
    vi.mocked(http.delete).mockResolvedValue(undefined)
    await service.delete(1)
    expect(http.delete).toHaveBeenCalledWith('/api/v1/collections/1')
  })

  it('addItem posts entity id to collection items', async () => {
    vi.mocked(http.post).mockResolvedValue(undefined)
    await service.addItem(1, 42)
    expect(http.post).toHaveBeenCalledWith('/api/v1/collections/1/items', { entity_id: 42 })
  })

  it('removeItem deletes entity from collection', async () => {
    vi.mocked(http.delete).mockResolvedValue(undefined)
    await service.removeItem(1, 42)
    expect(http.delete).toHaveBeenCalledWith('/api/v1/collections/1/items/42')
  })
})
