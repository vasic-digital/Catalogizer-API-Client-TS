/** ClientConfig holds connection settings for the CatalogizerClient. */
export interface ClientConfig {
  baseURL: string
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
  enableWebSocket?: boolean
  webSocketURL?: string
  headers?: Record<string, string>
}

/** ApiResponse is the envelope returned by all Catalogizer API endpoints. */
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  status: number
  success: boolean
}

/** StorageRootConfig represents a registered remote/local storage root. */
export interface StorageRootConfig {
  id: number
  name: string
  protocol: string
  host?: string
  port?: number
  share_name?: string
  username?: string
  domain?: string
  local_path?: string
  is_active: boolean
  mount_point?: string
  created_at: string
  updated_at: string
}

/** StorageRootStatus reports connectivity for a storage root. */
export interface StorageRootStatus {
  config_id: number
  is_connected: boolean
  last_check: string
  error_message?: string
}

/** ScanRequest triggers a media scan on a storage root. */
export interface ScanRequest {
  storage_root_id: number
  deep_scan?: boolean
}

/** ScanResult holds the outcome of a scan operation. */
export interface ScanResult {
  scan_id: number
  storage_root_id: number
  status: 'running' | 'completed' | 'failed'
  files_found: number
  files_processed: number
  error_message?: string
  started_at: string
  completed_at?: string
}

/** WebSocketMessage is the base for all WS push events. */
export interface WebSocketMessage {
  type: string
  data: unknown
  timestamp: string
}

/** ScanProgressMessage is pushed during an active scan. */
export interface ScanProgressMessage extends WebSocketMessage {
  type: 'scan_progress'
  data: {
    scan_id: number
    storage_root_id: number
    progress: number
    status: string
    files_found: number
    error?: string
  }
}

// --- Error Classes ---

export class CatalogizerError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string
  ) {
    super(message)
    this.name = 'CatalogizerError'
  }
}

export class AuthenticationError extends CatalogizerError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTH_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class NetworkError extends CatalogizerError {
  constructor(message = 'Network request failed') {
    super(message, 0, 'NETWORK_ERROR')
    this.name = 'NetworkError'
  }
}

export class ValidationError extends CatalogizerError {
  constructor(message = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}
