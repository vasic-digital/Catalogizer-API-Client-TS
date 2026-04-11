import type { HttpClient } from '../http'

/**
 * Unit of the `position` / `total_amount` fields on a playback
 * session. Video/audio sessions use `seconds`, book and comic
 * reading sessions use `pages`, game launches use `events`. Kept
 * as a string union so callers can switch on it at display time.
 */
export type PlaybackUnit = 'seconds' | 'pages' | 'events'

/** One reproduction session row returned by the playback API. */
export interface PlaybackSession {
  id: number
  user_id: number
  media_item_id: number
  file_id?: number | null
  started_at: string
  ended_at?: string | null
  position_unit: PlaybackUnit
  start_position: number
  end_position: number
  total_amount: number
  completed: boolean
}

/**
 * Rolled-up per-user, per-item progress that powers the
 * `ProgressBadge` indicator on every media card.
 */
export interface MediaProgress {
  user_id: number
  media_item_id: number
  position_unit: PlaybackUnit
  duration_total: number | null
  last_position: number
  last_session_amount: number
  total_reproductions: number
  aggregate_amount: number
  last_session_ended_at: string | null
  updated_at: string
}

/** Payload for `start()`. */
export interface StartPlaybackRequest {
  media_item_id: number
  file_id?: number
  position_unit: PlaybackUnit
  start_position?: number
}

/**
 * PlaybackService wires the five backend routes added by the
 * playback session tracking feature:
 *
 *   POST /api/v1/playback/sessions/start
 *   POST /api/v1/playback/sessions/progress
 *   POST /api/v1/playback/sessions/end
 *   GET  /api/v1/entities/:id/progress
 *   GET  /api/v1/entities/:id/history
 *
 * Browser + desktop + mobile TS consumers share this module via
 * the @vasic-digital/catalogizer-api-client package.
 */
export class PlaybackService {
  constructor(private readonly http: HttpClient) {}

  /** Opens a new session and returns its id. */
  public async start(req: StartPlaybackRequest): Promise<number> {
    const body = await this.http.post<{ session_id: number }>(
      '/api/v1/playback/sessions/start',
      req,
    )
    return body.session_id
  }

  /**
   * Updates the running session's `end_position` / `total_amount`
   * without finalising it. Meant to be called on a ~15s tick from
   * the player so a crash leaves a reasonably fresh snapshot.
   */
  public async progress(
    sessionId: number,
    endPosition: number,
    totalAmount: number,
  ): Promise<void> {
    await this.http.post('/api/v1/playback/sessions/progress', {
      session_id: sessionId,
      end_position: endPosition,
      total_amount: totalAmount,
    })
  }

  /**
   * Finalises a session. Triggers a server-side upsert of the
   * `media_progress` row so subsequent `getProgress()` calls
   * reflect the new state.
   */
  public async end(
    sessionId: number,
    endPosition: number,
    totalAmount: number,
    completed: boolean,
  ): Promise<void> {
    await this.http.post('/api/v1/playback/sessions/end', {
      session_id: sessionId,
      end_position: endPosition,
      total_amount: totalAmount,
      completed,
    })
  }

  /**
   * Fetches the per-user summary for a media item. Returns null
   * when the user has never reproduced the item (the backend
   * replies with `{"progress": null}` on first load so the UI
   * doesn't have to special-case a 404).
   */
  public async getProgress(mediaItemId: number): Promise<MediaProgress | null> {
    const body = await this.http.get<{ progress: MediaProgress | null }>(
      `/api/v1/entities/${mediaItemId}/progress`,
    )
    return body.progress ?? null
  }

  /**
   * Lists up to `limit` reproduction sessions for a media item
   * ordered newest-first. Used by the history drawer.
   */
  public async listHistory(
    mediaItemId: number,
    limit = 50,
  ): Promise<PlaybackSession[]> {
    const body = await this.http.get<{ sessions: PlaybackSession[]; count: number }>(
      `/api/v1/entities/${mediaItemId}/history`,
      { params: { limit } },
    )
    return body.sessions ?? []
  }
}
