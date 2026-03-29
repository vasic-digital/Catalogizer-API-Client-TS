import type { HttpClient } from '../http'

export interface ArchiveRequest {
  file_ids: number[]
  format?: 'zip' | 'tar'
}

/** DownloadService wraps all /api/v1/download/* endpoints. */
export class DownloadService {
  constructor(private readonly http: HttpClient) {}

  public async getFile(id: number): Promise<Blob> {
    return this.http.get<Blob>(`/api/v1/download/file/${id}`, { responseType: 'blob' })
  }

  public async createArchive(data: ArchiveRequest): Promise<Blob> {
    return this.http.post<Blob>('/api/v1/download/archive', data, { responseType: 'blob' })
  }

  public async getDirectory(path: string): Promise<Blob> {
    return this.http.get<Blob>(`/api/v1/download/directory/${path}`, { responseType: 'blob' })
  }

  /** Build a direct URL for file download (useful for <a> tags). */
  public getFileURL(id: number, baseURL: string): string {
    return `${baseURL}/api/v1/download/file/${id}`
  }

  /** Build a direct URL for directory download. */
  public getDirectoryURL(path: string, baseURL: string): string {
    return `${baseURL}/api/v1/download/directory/${path}`
  }
}
