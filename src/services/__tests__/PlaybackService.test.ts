import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PlaybackService } from '../PlaybackService'
import type { HttpClient } from '../../http'

function makeHttp(): HttpClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    setAuthToken: vi.fn(),
    clearAuthToken: vi.fn(),
    getAuthToken: vi.fn(),
    withRetry: vi.fn(),
  } as unknown as HttpClient
}

describe('PlaybackService', () => {
  let http: HttpClient
  let service: PlaybackService

  beforeEach(() => {
    http = makeHttp()
    service = new PlaybackService(http)
  })

  describe('start', () => {
    it('posts start payload and returns session_id', async () => {
      vi.mocked(http.post).mockResolvedValue({ session_id: 42 })

      const id = await service.start({
        media_item_id: 7,
        position_unit: 'seconds',
        start_position: 0,
      })

      expect(id).toBe(42)
      expect(http.post).toHaveBeenCalledWith(
        '/api/v1/playback/sessions/start',
        { media_item_id: 7, position_unit: 'seconds', start_position: 0 },
      )
    })
  })

  describe('progress', () => {
    it('posts session_id and current position', async () => {
      vi.mocked(http.post).mockResolvedValue(undefined)

      await service.progress(42, 30, 30)

      expect(http.post).toHaveBeenCalledWith(
        '/api/v1/playback/sessions/progress',
        { session_id: 42, end_position: 30, total_amount: 30 },
      )
    })
  })

  describe('end', () => {
    it('posts completed flag on finalisation', async () => {
      vi.mocked(http.post).mockResolvedValue(undefined)

      await service.end(42, 3600, 3600, true)

      expect(http.post).toHaveBeenCalledWith(
        '/api/v1/playback/sessions/end',
        {
          session_id: 42,
          end_position: 3600,
          total_amount: 3600,
          completed: true,
        },
      )
    })
  })

  describe('getProgress', () => {
    it('unwraps the nested progress field', async () => {
      const progress = {
        user_id: 1,
        media_item_id: 7,
        position_unit: 'seconds' as const,
        duration_total: 7200,
        last_position: 1800,
        last_session_amount: 1800,
        total_reproductions: 3,
        aggregate_amount: 5400,
        last_session_ended_at: '2026-04-11T22:00:00Z',
        updated_at: '2026-04-11T22:00:00Z',
      }
      vi.mocked(http.get).mockResolvedValue({ progress })

      const result = await service.getProgress(7)

      expect(http.get).toHaveBeenCalledWith('/api/v1/entities/7/progress')
      expect(result).toEqual(progress)
    })

    it('returns null when the user has never reproduced the item', async () => {
      vi.mocked(http.get).mockResolvedValue({ progress: null })
      const result = await service.getProgress(99)
      expect(result).toBeNull()
    })
  })

  describe('listHistory', () => {
    it('unwraps the sessions array and forwards limit param', async () => {
      const sessions = [
        {
          id: 1,
          user_id: 1,
          media_item_id: 7,
          started_at: '2026-04-11T21:00:00Z',
          position_unit: 'seconds' as const,
          start_position: 0,
          end_position: 120,
          total_amount: 120,
          completed: false,
        },
      ]
      vi.mocked(http.get).mockResolvedValue({ sessions, count: 1 })

      const result = await service.listHistory(7, 10)

      expect(http.get).toHaveBeenCalledWith(
        '/api/v1/entities/7/history',
        { params: { limit: 10 } },
      )
      expect(result).toEqual(sessions)
    })

    it('returns empty array when backend omits sessions', async () => {
      vi.mocked(http.get).mockResolvedValue({ count: 0 })
      const result = await service.listHistory(7)
      expect(result).toEqual([])
    })
  })
})
