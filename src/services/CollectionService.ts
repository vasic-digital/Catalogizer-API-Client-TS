import type {
  MediaCollection,
  MediaEntity,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  PaginatedResponse,
} from '@vasic-digital/media-types'
import type { HttpClient } from '../http'

/** CollectionService wraps all /api/v1/collections/* endpoints. */
export class CollectionService {
  constructor(private readonly http: HttpClient) {}

  public async list(params?: { limit?: number; offset?: number }): Promise<PaginatedResponse<MediaCollection>> {
    return this.http.get<PaginatedResponse<MediaCollection>>('/api/v1/collections', { params })
  }

  public async get(id: number): Promise<MediaCollection> {
    return this.http.get<MediaCollection>(`/api/v1/collections/${id}`)
  }

  public async create(data: CreateCollectionRequest): Promise<MediaCollection> {
    return this.http.post<MediaCollection>('/api/v1/collections', data)
  }

  public async update(id: number, data: UpdateCollectionRequest): Promise<MediaCollection> {
    return this.http.put<MediaCollection>(`/api/v1/collections/${id}`, data)
  }

  public async delete(id: number): Promise<void> {
    return this.http.delete<void>(`/api/v1/collections/${id}`)
  }

  public async getItems(id: number, params?: { limit?: number; offset?: number }): Promise<PaginatedResponse<MediaEntity>> {
    return this.http.get<PaginatedResponse<MediaEntity>>(`/api/v1/collections/${id}/items`, { params })
  }

  public async addItem(id: number, entityId: number): Promise<void> {
    return this.http.post<void>(`/api/v1/collections/${id}/items`, { entity_id: entityId })
  }

  public async removeItem(id: number, entityId: number): Promise<void> {
    return this.http.delete<void>(`/api/v1/collections/${id}/items/${entityId}`)
  }
}
