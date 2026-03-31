import type {
  MediaCollection,
  MediaEntity,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  PaginatedResponse,
} from '@vasic-digital/media-types'
import type { HttpClient } from '../http'

/**
 * CollectionService manages user-defined media collections, allowing
 * creation, update, deletion, and item membership operations.
 */
export class CollectionService {
  constructor(private readonly http: HttpClient) {}

  /** Lists all collections with optional pagination. */
  public async list(params?: { limit?: number; offset?: number }): Promise<PaginatedResponse<MediaCollection>> {
    return this.http.get<PaginatedResponse<MediaCollection>>('/api/v1/collections', { params })
  }

  /** Retrieves a single collection by its ID. */
  public async get(id: number): Promise<MediaCollection> {
    return this.http.get<MediaCollection>(`/api/v1/collections/${id}`)
  }

  /** Creates a new collection and returns it. */
  public async create(data: CreateCollectionRequest): Promise<MediaCollection> {
    return this.http.post<MediaCollection>('/api/v1/collections', data)
  }

  /** Updates an existing collection's metadata. */
  public async update(id: number, data: UpdateCollectionRequest): Promise<MediaCollection> {
    return this.http.put<MediaCollection>(`/api/v1/collections/${id}`, data)
  }

  /** Deletes a collection by its ID. */
  public async delete(id: number): Promise<void> {
    return this.http.delete<void>(`/api/v1/collections/${id}`)
  }

  /** Lists the media entities belonging to a collection, with optional pagination. */
  public async getItems(id: number, params?: { limit?: number; offset?: number }): Promise<PaginatedResponse<MediaEntity>> {
    return this.http.get<PaginatedResponse<MediaEntity>>(`/api/v1/collections/${id}/items`, { params })
  }

  /** Adds a media entity to a collection. */
  public async addItem(id: number, entityId: number): Promise<void> {
    return this.http.post<void>(`/api/v1/collections/${id}/items`, { entity_id: entityId })
  }

  /** Removes a media entity from a collection. */
  public async removeItem(id: number, entityId: number): Promise<void> {
    return this.http.delete<void>(`/api/v1/collections/${id}/items/${entityId}`)
  }
}
