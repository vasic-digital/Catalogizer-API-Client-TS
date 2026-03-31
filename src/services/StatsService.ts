import type { HttpClient } from '../http'

/**
 * StatsService provides catalog-wide statistics including file type breakdowns,
 * size distributions, duplicate summaries, access patterns, and growth trends.
 */
export class StatsService {
  constructor(private readonly http: HttpClient) {}

  /** Returns high-level overall catalog statistics (file counts, total size, etc.). */
  public async getOverall(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/stats/overall')
  }

  /** Returns a breakdown of files grouped by file type/extension. */
  public async getFileTypes(): Promise<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>('/api/v1/stats/filetypes')
  }

  /** Returns storage size distribution statistics. */
  public async getSizes(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/stats/sizes')
  }

  /** Returns summary statistics about detected duplicate files. */
  public async getDuplicates(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/stats/duplicates')
  }

  /** Returns paginated groups of duplicate files. */
  public async getDuplicateGroups(params?: { limit?: number; offset?: number }): Promise<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>('/api/v1/stats/duplicates/groups', { params })
  }

  /** Returns file access statistics within an optional date range. */
  public async getAccess(params?: { from?: string; to?: string }): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/stats/access', { params })
  }

  /** Returns catalog growth trends within an optional date range. */
  public async getGrowth(params?: { from?: string; to?: string }): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/stats/growth', { params })
  }

  /** Returns a paginated list of past scan summaries. */
  public async getScans(params?: { limit?: number; offset?: number }): Promise<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>('/api/v1/stats/scans', { params })
  }
}
