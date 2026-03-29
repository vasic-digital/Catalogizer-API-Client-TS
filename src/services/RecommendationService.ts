import type { HttpClient } from '../http'

/** RecommendationService wraps all /api/v1/recommendations/* endpoints. */
export class RecommendationService {
  constructor(private readonly http: HttpClient) {}

  public async getSimilar(mediaId: number): Promise<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>(`/api/v1/recommendations/similar/${mediaId}`)
  }

  public async getTrending(): Promise<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>('/api/v1/recommendations/trending')
  }

  public async getPersonalized(userId: number): Promise<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>(`/api/v1/recommendations/personalized/${userId}`)
  }
}
