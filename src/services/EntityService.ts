import type {
  MediaEntity,
  MediaType,
  MediaFile,
  EntityExternalMetadata,
  UserMetadata,
  EntityStats,
  DuplicateGroup,
  PaginatedResponse,
} from '@vasic-digital/media-types'
import type { HttpClient } from '../http'

/** Parameters for filtering and paginating entity listings. */
export interface EntityListParams {
  type?: string
  query?: string
  limit?: number
  offset?: number
  parent_id?: number
}

/** Fields that can be updated on a user's per-entity metadata. */
export interface UserMetadataUpdate {
  is_favorite?: boolean
  is_watched?: boolean
  user_rating?: number
  notes?: string
}

/**
 * EntityService provides access to all media entity endpoints, including
 * CRUD, hierarchy traversal, metadata, duplicate detection, and streaming URLs.
 */
export class EntityService {
  constructor(private readonly http: HttpClient) {}

  /** Lists entities with optional type, search, pagination, and parent filters. */
  public async list(params?: EntityListParams): Promise<PaginatedResponse<MediaEntity>> {
    return this.http.get<PaginatedResponse<MediaEntity>>('/api/v1/entities', { params })
  }

  /** Retrieves a single entity by its ID. */
  public async get(id: number): Promise<MediaEntity> {
    return this.http.get<MediaEntity>(`/api/v1/entities/${id}`)
  }

  /** Retrieves child entities (e.g., episodes of a season) with optional pagination. */
  public async getChildren(id: number, params?: { limit?: number; offset?: number }): Promise<PaginatedResponse<MediaEntity>> {
    return this.http.get<PaginatedResponse<MediaEntity>>(`/api/v1/entities/${id}/children`, { params })
  }

  /** Returns the files associated with an entity. */
  public async getFiles(id: number): Promise<MediaFile[]> {
    return this.http.get<MediaFile[]>(`/api/v1/entities/${id}/files`)
  }

  /** Retrieves external metadata (TMDB, OMDB, etc.) for an entity. */
  public async getMetadata(id: number): Promise<EntityExternalMetadata[]> {
    return this.http.get<EntityExternalMetadata[]>(`/api/v1/entities/${id}/metadata`)
  }

  /** Triggers a refresh of external metadata for an entity. */
  public async refreshMetadata(id: number): Promise<void> {
    return this.http.post<void>(`/api/v1/entities/${id}/metadata/refresh`)
  }

  /** Returns entities detected as duplicates of the given entity. */
  public async getDuplicates(id: number): Promise<MediaEntity[]> {
    return this.http.get<MediaEntity[]>(`/api/v1/entities/${id}/duplicates`)
  }

  /** Lists all available media types (movie, tv_show, song, etc.). */
  public async getTypes(): Promise<MediaType[]> {
    return this.http.get<MediaType[]>('/api/v1/entities/types')
  }

  /** Browses entities of a specific type with optional search and pagination. */
  public async browseByType(
    typeName: string,
    params?: { limit?: number; offset?: number; query?: string }
  ): Promise<PaginatedResponse<MediaEntity>> {
    return this.http.get<PaginatedResponse<MediaEntity>>(`/api/v1/entities/browse/${typeName}`, { params })
  }

  /** Returns aggregate statistics about entities (counts per type, totals). */
  public async getStats(): Promise<EntityStats> {
    return this.http.get<EntityStats>('/api/v1/entities/stats')
  }

  /** Lists all detected duplicate groups across the catalog. */
  public async getAllDuplicates(params?: { limit?: number; offset?: number }): Promise<PaginatedResponse<DuplicateGroup>> {
    return this.http.get<PaginatedResponse<DuplicateGroup>>('/api/v1/entities/duplicates', { params })
  }

  /** Creates or updates the current user's metadata (rating, favorite, watched) for an entity. */
  public async updateUserMetadata(id: number, data: UserMetadataUpdate): Promise<UserMetadata> {
    return this.http.put<UserMetadata>(`/api/v1/entities/${id}/user-metadata`, data)
  }

  /** Builds the absolute streaming URL for an entity's primary media file. */
  public getStreamURL(id: number, baseURL: string): string {
    return `${baseURL}/api/v1/entities/${id}/stream`
  }

  /** Builds the absolute download URL for an entity's primary media file. */
  public getDownloadURL(id: number, baseURL: string): string {
    return `${baseURL}/api/v1/entities/${id}/download`
  }
}
