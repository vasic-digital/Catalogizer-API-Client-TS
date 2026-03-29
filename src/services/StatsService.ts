import type { HttpClient } from '../http'

/** StatsService wraps all /api/v1/stats/* endpoints. */
export class StatsService {
  constructor(private readonly http: HttpClient) {}

  public async getOverall(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/stats/overall')
  }

  public async getFileTypes(): Promise<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>('/api/v1/stats/filetypes')
  }

  public async getSizes(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/stats/sizes')
  }

  public async getDuplicates(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/stats/duplicates')
  }

  public async getDuplicateGroups(params?: { limit?: number; offset?: number }): Promise<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>('/api/v1/stats/duplicates/groups', { params })
  }

  public async getAccess(params?: { from?: string; to?: string }): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/stats/access', { params })
  }

  public async getGrowth(params?: { from?: string; to?: string }): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/stats/growth', { params })
  }

  public async getScans(params?: { limit?: number; offset?: number }): Promise<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>('/api/v1/stats/scans', { params })
  }
}
