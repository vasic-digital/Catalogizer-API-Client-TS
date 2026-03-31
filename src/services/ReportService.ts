import type { HttpClient } from '../http'

/** Parameters for filtering report data by date range and output format. */
export interface ReportParams {
  from?: string
  to?: string
  format?: 'json' | 'csv'
}

/**
 * ReportService generates usage and performance reports over
 * configurable date ranges in JSON or CSV format.
 */
export class ReportService {
  constructor(private readonly http: HttpClient) {}

  /** Generates a usage report covering access patterns and activity within the date range. */
  public async getUsage(params?: ReportParams): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/reports/usage', { params })
  }

  /** Generates a performance report covering response times and throughput within the date range. */
  public async getPerformance(params?: ReportParams): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/reports/performance', { params })
  }
}
