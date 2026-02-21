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

/** AuthService exposes all /auth/* endpoints. */
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  public async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.http.post<LoginResponse>('/auth/login', credentials)
    if (response.session_token) {
      this.http.setAuthToken(response.session_token)
    }
    return response
  }

  public async register(userData: RegisterRequest): Promise<User> {
    return this.http.post<User>('/auth/register', userData)
  }

  public async logout(): Promise<void> {
    try {
      await this.http.post<void>('/auth/logout')
    } finally {
      this.http.clearAuthToken()
    }
  }

  public async getStatus(): Promise<AuthStatus> {
    return this.http.get<AuthStatus>('/auth/status')
  }

  public async refreshToken(): Promise<{ session_token: string; expires_at: string }> {
    const response = await this.http.post<{ session_token: string; expires_at: string }>('/auth/refresh')
    this.http.setAuthToken(response.session_token)
    return response
  }

  public async getProfile(): Promise<User> {
    return this.http.get<User>('/auth/profile')
  }

  public async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return this.http.put<User>('/auth/profile', data)
  }

  public async changePassword(data: ChangePasswordRequest): Promise<void> {
    return this.http.post<void>('/auth/change-password', data)
  }
}
