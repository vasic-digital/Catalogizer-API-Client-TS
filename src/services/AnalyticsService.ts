import type { HttpClient } from '../http'

export interface AccessEvent {
  entity_id: number
  action: string
  metadata?: Record<string, unknown>
}

export interface AnalyticsEvent {
  event_type: string
  entity_id?: number
  data?: Record<string, unknown>
}

export interface UserAnalytics {
  user_id: number
  total_views: number
  total_plays: number
  recent_activity: Record<string, unknown>[]
  top_genres?: Record<string, number>
}

/** AnalyticsService wraps all /api/v1/analytics/* endpoints. */
export class AnalyticsService {
  constructor(private readonly http: HttpClient) {}

  public async recordAccess(data: AccessEvent): Promise<void> {
    return this.http.post<void>('/api/v1/analytics/access', data)
  }

  public async recordEvent(data: AnalyticsEvent): Promise<void> {
    return this.http.post<void>('/api/v1/analytics/event', data)
  }

  public async getUserAnalytics(userId: number): Promise<UserAnalytics> {
    return this.http.get<UserAnalytics>(`/api/v1/analytics/user/${userId}`)
  }
}
