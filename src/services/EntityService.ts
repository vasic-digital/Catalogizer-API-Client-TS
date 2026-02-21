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

export interface EntityListParams {
  type?: string
  query?: string
  limit?: number
  offset?: number
  parent_id?: number
}

export interface UserMetadataUpdate {
  is_favorite?: boolean
  is_watched?: boolean
  user_rating?: number
  notes?: string
}

/** EntityService wraps all /api/v1/entities/* endpoints. */
export class EntityService {
  constructor(private readonly http: HttpClient) {}

  public async list(params?: EntityListParams): Promise<PaginatedResponse<MediaEntity>> {
    return this.http.get<PaginatedResponse<MediaEntity>>('/api/v1/entities', { params })
  }

  public async get(id: number): Promise<MediaEntity> {
    return this.http.get<MediaEntity>(`/api/v1/entities/${id}`)
  }

  public async getChildren(id: number, params?: { limit?: number; offset?: number }): Promise<PaginatedResponse<MediaEntity>> {
    return this.http.get<PaginatedResponse<MediaEntity>>(`/api/v1/entities/${id}/children`, { params })
  }

  public async getFiles(id: number): Promise<MediaFile[]> {
    return this.http.get<MediaFile[]>(`/api/v1/entities/${id}/files`)
  }

  public async getMetadata(id: number): Promise<EntityExternalMetadata[]> {
    return this.http.get<EntityExternalMetadata[]>(`/api/v1/entities/${id}/metadata`)
  }

  public async refreshMetadata(id: number): Promise<void> {
    return this.http.post<void>(`/api/v1/entities/${id}/metadata/refresh`)
  }

  public async getDuplicates(id: number): Promise<MediaEntity[]> {
    return this.http.get<MediaEntity[]>(`/api/v1/entities/${id}/duplicates`)
  }

  public async getTypes(): Promise<MediaType[]> {
    return this.http.get<MediaType[]>('/api/v1/entities/types')
  }

  public async browseByType(
    typeName: string,
    params?: { limit?: number; offset?: number; query?: string }
  ): Promise<PaginatedResponse<MediaEntity>> {
    return this.http.get<PaginatedResponse<MediaEntity>>(`/api/v1/entities/browse/${typeName}`, { params })
  }

  public async getStats(): Promise<EntityStats> {
    return this.http.get<EntityStats>('/api/v1/entities/stats')
  }

  public async getAllDuplicates(params?: { limit?: number; offset?: number }): Promise<PaginatedResponse<DuplicateGroup>> {
    return this.http.get<PaginatedResponse<DuplicateGroup>>('/api/v1/entities/duplicates', { params })
  }

  public async updateUserMetadata(id: number, data: UserMetadataUpdate): Promise<UserMetadata> {
    return this.http.put<UserMetadata>(`/api/v1/entities/${id}/user-metadata`, data)
  }

  public getStreamURL(id: number, baseURL: string): string {
    return `${baseURL}/api/v1/entities/${id}/stream`
  }

  public getDownloadURL(id: number, baseURL: string): string {
    return `${baseURL}/api/v1/entities/${id}/download`
  }
}
