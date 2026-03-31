import type { HttpClient } from '../http'

/** A user-created playlist of media items. */
export interface Playlist {
  id: number
  name: string
  description?: string
  is_public: boolean
  item_count: number
  created_at: string
  updated_at: string
}

/** A single item within a playlist, linking to a media entity at a position. */
export interface PlaylistItem {
  id: number
  playlist_id: number
  media_id: number
  position: number
  added_at: string
}

/** Parameters for creating a new playlist. */
export interface CreatePlaylistRequest {
  name: string
  description?: string
  is_public?: boolean
}

/** Fields that can be updated on an existing playlist. */
export interface UpdatePlaylistRequest {
  name?: string
  description?: string
  is_public?: boolean
}

/** Parameters for adding a media item to a playlist. */
export interface AddPlaylistItemRequest {
  media_id: number
  position?: number
}

/**
 * PlaylistService manages user-created playlists and their items,
 * supporting CRUD operations and ordered item management.
 */
export class PlaylistService {
  constructor(private readonly http: HttpClient) {}

  /** Lists all playlists with optional pagination. */
  public async list(params?: { limit?: number; offset?: number }): Promise<Playlist[]> {
    return this.http.get<Playlist[]>('/api/v1/playlists', { params })
  }

  /** Creates a new playlist and returns it. */
  public async create(data: CreatePlaylistRequest): Promise<Playlist> {
    return this.http.post<Playlist>('/api/v1/playlists', data)
  }

  /** Retrieves a single playlist by its ID. */
  public async get(id: number): Promise<Playlist> {
    return this.http.get<Playlist>(`/api/v1/playlists/${id}`)
  }

  /** Updates an existing playlist's metadata. */
  public async update(id: number, data: UpdatePlaylistRequest): Promise<Playlist> {
    return this.http.put<Playlist>(`/api/v1/playlists/${id}`, data)
  }

  /** Deletes a playlist by its ID. */
  public async delete(id: number): Promise<void> {
    return this.http.delete<void>(`/api/v1/playlists/${id}`)
  }

  /** Adds a media item to a playlist at an optional position. */
  public async addItem(id: number, data: AddPlaylistItemRequest): Promise<PlaylistItem> {
    return this.http.post<PlaylistItem>(`/api/v1/playlists/${id}/items`, data)
  }

  /** Removes an item from a playlist. */
  public async removeItem(id: number, itemId: number): Promise<void> {
    return this.http.delete<void>(`/api/v1/playlists/${id}/items/${itemId}`)
  }
}
