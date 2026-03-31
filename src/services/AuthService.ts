import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AuthStatus,
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@vasic-digital/media-types'
import type { HttpClient } from '../http'

/**
 * AuthService handles authentication operations against the Catalogizer API,
 * including login, registration, token management, and user profile access.
 */
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  /** Logs in with the provided credentials and stores the returned session token. */
  public async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.http.post<LoginResponse>('/auth/login', credentials)
    if (response.session_token) {
      this.http.setAuthToken(response.session_token)
    }
    return response
  }

  /** Registers a new user account and returns the created user. */
  public async register(userData: RegisterRequest): Promise<User> {
    return this.http.post<User>('/auth/register', userData)
  }

  /** Logs out the current user and clears the stored auth token. */
  public async logout(): Promise<void> {
    try {
      await this.http.post<void>('/auth/logout')
    } finally {
      this.http.clearAuthToken()
    }
  }

  /** Returns the current authentication status (logged-in user info and permissions). */
  public async getStatus(): Promise<AuthStatus> {
    return this.http.get<AuthStatus>('/auth/status')
  }

  /** Refreshes the session token and updates the stored token with the new value. */
  public async refreshToken(): Promise<{ session_token: string; expires_at: string }> {
    const response = await this.http.post<{ session_token: string; expires_at: string }>('/auth/refresh')
    this.http.setAuthToken(response.session_token)
    return response
  }

  /** Retrieves the authenticated user's profile. */
  public async getProfile(): Promise<User> {
    return this.http.get<User>('/auth/profile')
  }

  /** Updates the authenticated user's profile fields. */
  public async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return this.http.put<User>('/auth/profile', data)
  }

  /** Changes the authenticated user's password. */
  public async changePassword(data: ChangePasswordRequest): Promise<void> {
    return this.http.post<void>('/auth/change-password', data)
  }
}
