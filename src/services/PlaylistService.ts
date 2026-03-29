import type { HttpClient } from '../http'

export interface Playlist {
  id: number
  name: string
  description?: string
  is_public: boolean
  item_count: number
  created_at: string
  updated_at: string
}

export interface PlaylistItem {
  id: number
  playlist_id: number
  media_id: number
  position: number
  added_at: string
}

export interface CreatePlaylistRequest {
  name: string
  description?: string
  is_public?: boolean
}

export interface UpdatePlaylistRequest {
  name?: string
  description?: string
  is_public?: boolean
}

export interface AddPlaylistItemRequest {
  media_id: number
  position?: number
}

/** PlaylistService wraps all /api/v1/playlists/* endpoints. */
export class PlaylistService {
  constructor(private readonly http: HttpClient) {}

  public async list(params?: { limit?: number; offset?: number }): Promise<Playlist[]> {
    return this.http.get<Playlist[]>('/api/v1/playlists', { params })
  }

  public async create(data: CreatePlaylistRequest): Promise<Playlist> {
    return this.http.post<Playlist>('/api/v1/playlists', data)
  }

  public async get(id: number): Promise<Playlist> {
    return this.http.get<Playlist>(`/api/v1/playlists/${id}`)
  }

  public async update(id: number, data: UpdatePlaylistRequest): Promise<Playlist> {
    return this.http.put<Playlist>(`/api/v1/playlists/${id}`, data)
  }

  public async delete(id: number): Promise<void> {
    return this.http.delete<void>(`/api/v1/playlists/${id}`)
  }

  public async addItem(id: number, data: AddPlaylistItemRequest): Promise<PlaylistItem> {
    return this.http.post<PlaylistItem>(`/api/v1/playlists/${id}/items`, data)
  }

  public async removeItem(id: number, itemId: number): Promise<void> {
    return this.http.delete<void>(`/api/v1/playlists/${id}/items/${itemId}`)
  }
}
