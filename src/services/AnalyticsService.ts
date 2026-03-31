import type { HttpClient } from '../http'

/** An access event recording that a user viewed or interacted with an entity. */
export interface AccessEvent {
  entity_id: number
  action: string
  metadata?: Record<string, unknown>
}

/** A generic analytics event with an optional entity association. */
export interface AnalyticsEvent {
  event_type: string
  entity_id?: number
  data?: Record<string, unknown>
}

/** Aggregated analytics data for a specific user. */
export interface UserAnalytics {
  user_id: number
  total_views: number
  total_plays: number
  recent_activity: Record<string, unknown>[]
  top_genres?: Record<string, number>
}

/**
 * AnalyticsService records user interaction events and retrieves
 * per-user analytics summaries.
 */
export class AnalyticsService {
  constructor(private readonly http: HttpClient) {}

  /** Records a media access event (view, play, download, etc.). */
  public async recordAccess(data: AccessEvent): Promise<void> {
    return this.http.post<void>('/api/v1/analytics/access', data)
  }

  /** Records a generic analytics event. */
  public async recordEvent(data: AnalyticsEvent): Promise<void> {
    return this.http.post<void>('/api/v1/analytics/event', data)
  }

  /** Retrieves aggregated analytics for a specific user. */
  public async getUserAnalytics(userId: number): Promise<UserAnalytics> {
    return this.http.get<UserAnalytics>(`/api/v1/analytics/user/${userId}`)
  }
}
