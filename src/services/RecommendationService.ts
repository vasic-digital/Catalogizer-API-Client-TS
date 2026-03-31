import type { HttpClient } from '../http'

/**
 * RecommendationService provides content discovery endpoints for
 * similar media, trending items, and personalized suggestions.
 */
export class RecommendationService {
  constructor(private readonly http: HttpClient) {}

  /** Returns media items similar to the given media entity. */
  public async getSimilar(mediaId: number): Promise<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>(`/api/v1/recommendations/similar/${mediaId}`)
  }

  /** Returns currently trending media items across the catalog. */
  public async getTrending(): Promise<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>('/api/v1/recommendations/trending')
  }

  /** Returns personalized recommendations for a specific user. */
  public async getPersonalized(userId: number): Promise<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>(`/api/v1/recommendations/personalized/${userId}`)
  }
}
