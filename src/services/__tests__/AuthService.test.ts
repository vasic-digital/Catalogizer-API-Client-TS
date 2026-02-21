import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '../AuthService'
import type { HttpClient } from '../../http'
import type { LoginResponse, User } from '@vasic-digital/media-types'

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    role_id: 1,
    role: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeLoginResponse(overrides: Partial<LoginResponse> = {}): LoginResponse {
  return {
    user: makeUser(),
    session_token: 'sess_abc',
    refresh_token: 'ref_xyz',
    expires_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

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

describe('AuthService', () => {
  let http: HttpClient
  let service: AuthService

  beforeEach(() => {
    http = makeHttp()
    service = new AuthService(http)
  })

  it('login posts credentials and sets token', async () => {
    const resp = makeLoginResponse()
    vi.mocked(http.post).mockResolvedValue(resp)

    const result = await service.login({ username: 'admin', password: 'secret' })

    expect(http.post).toHaveBeenCalledWith('/auth/login', { username: 'admin', password: 'secret' })
    expect(http.setAuthToken).toHaveBeenCalledWith('sess_abc')
    expect(result.session_token).toBe('sess_abc')
  })

  it('logout clears token even if request fails', async () => {
    vi.mocked(http.post).mockRejectedValue(new Error('network'))

    await expect(service.logout()).rejects.toThrow('network')
    expect(http.clearAuthToken).toHaveBeenCalled()
  })

  it('logout calls /auth/logout and clears token on success', async () => {
    vi.mocked(http.post).mockResolvedValue(undefined)

    await service.logout()

    expect(http.post).toHaveBeenCalledWith('/auth/logout')
    expect(http.clearAuthToken).toHaveBeenCalled()
  })

  it('getStatus calls /auth/status', async () => {
    vi.mocked(http.get).mockResolvedValue({ authenticated: true, user: makeUser() })
    const status = await service.getStatus()
    expect(http.get).toHaveBeenCalledWith('/auth/status')
    expect(status.authenticated).toBe(true)
  })

  it('refreshToken updates auth token', async () => {
    vi.mocked(http.post).mockResolvedValue({ session_token: 'new_token', expires_at: '2025-12-31T00:00:00Z' })
    const result = await service.refreshToken()
    expect(http.setAuthToken).toHaveBeenCalledWith('new_token')
    expect(result.session_token).toBe('new_token')
  })

  it('register posts user data', async () => {
    const user = makeUser({ username: 'newuser' })
    vi.mocked(http.post).mockResolvedValue(user)

    const result = await service.register({
      username: 'newuser',
      email: 'new@example.com',
      password: 'pass',
      first_name: 'New',
      last_name: 'User',
    })
    expect(result.username).toBe('newuser')
  })

  it('updateProfile calls PUT /auth/profile', async () => {
    const user = makeUser({ first_name: 'Jane' })
    vi.mocked(http.put).mockResolvedValue(user)

    const result = await service.updateProfile({ first_name: 'Jane' })
    expect(http.put).toHaveBeenCalledWith('/auth/profile', { first_name: 'Jane' })
    expect(result.first_name).toBe('Jane')
  })

  it('changePassword posts to /auth/change-password', async () => {
    vi.mocked(http.post).mockResolvedValue(undefined)
    await service.changePassword({ current_password: 'old', new_password: 'new' })
    expect(http.post).toHaveBeenCalledWith('/auth/change-password', { current_password: 'old', new_password: 'new' })
  })
})
