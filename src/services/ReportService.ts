import type { HttpClient } from '../http'

export interface ReportParams {
  from?: string
  to?: string
  format?: 'json' | 'csv'
}

/** ReportService wraps all /api/v1/reports/* endpoints. */
export class ReportService {
  constructor(private readonly http: HttpClient) {}

  public async getUsage(params?: ReportParams): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/reports/usage', { params })
  }

  public async getPerformance(params?: ReportParams): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>('/api/v1/reports/performance', { params })
  }
}
