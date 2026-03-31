import type { HttpClient } from '../http'

/** Parameters for creating a multi-file archive download. */
export interface ArchiveRequest {
  file_ids: number[]
  format?: 'zip' | 'tar'
}

/**
 * DownloadService provides file and directory download operations,
 * including single-file retrieval, multi-file archiving, and direct URL generation.
 */
export class DownloadService {
  constructor(private readonly http: HttpClient) {}

  /** Downloads a single file by its ID as a Blob. */
  public async getFile(id: number): Promise<Blob> {
    return this.http.get<Blob>(`/api/v1/download/file/${id}`, { responseType: 'blob' })
  }

  /** Creates and downloads a zip or tar archive of the specified files. */
  public async createArchive(data: ArchiveRequest): Promise<Blob> {
    return this.http.post<Blob>('/api/v1/download/archive', data, { responseType: 'blob' })
  }

  /** Downloads an entire directory as an archive Blob. */
  public async getDirectory(path: string): Promise<Blob> {
    return this.http.get<Blob>(`/api/v1/download/directory/${path}`, { responseType: 'blob' })
  }

  /** Builds a direct URL for file download (useful for anchor tags). */
  public getFileURL(id: number, baseURL: string): string {
    return `${baseURL}/api/v1/download/file/${id}`
  }

  /** Builds a direct URL for directory download. */
  public getDirectoryURL(path: string, baseURL: string): string {
    return `${baseURL}/api/v1/download/directory/${path}`
  }
}
