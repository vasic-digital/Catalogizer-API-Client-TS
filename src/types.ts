/** ClientConfig holds connection settings for the CatalogizerClient. */
export interface ClientConfig {
  /** Base URL of the Catalogizer API (e.g., "http://localhost:8080"). */
  baseURL: string
  /** Request timeout in milliseconds (default: 30000). */
  timeout?: number
  /** Number of retry attempts for transient failures (default: 3). */
  retryAttempts?: number
  /** Base delay in milliseconds between retries, multiplied by attempt number (default: 1000). */
  retryDelay?: number
  /** Whether to establish a WebSocket connection for real-time events. */
  enableWebSocket?: boolean
  /** Custom WebSocket URL; derived from baseURL if omitted. */
  webSocketURL?: string
  /** Additional HTTP headers to include in every request. */
  headers?: Record<string, string>
}

/** ApiResponse is the envelope returned by all Catalogizer API endpoints. */
export interface ApiResponse<T = unknown> {
  /** The response payload, present on success. */
  data?: T
  /** Error message, present on failure. */
  error?: string
  /** Human-readable status message. */
  message?: string
  /** HTTP status code. */
  status: number
  /** Whether the request succeeded. */
  success: boolean
}

/** StorageRootConfig represents a registered remote or local storage root. */
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

/** StorageRootStatus reports connectivity and health for a storage root. */
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

/** ScanResult holds the outcome and progress of a scan operation. */
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

/** WebSocketMessage is the base shape for all real-time push events. */
export interface WebSocketMessage {
  type: string
  data: unknown
  timestamp: string
}

/** ScanProgressMessage is pushed via WebSocket during an active scan. */
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

/** Base error class for all Catalogizer API errors, carrying HTTP status and error code. */
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

/** Thrown when authentication fails (HTTP 401). */
export class AuthenticationError extends CatalogizerError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTH_ERROR')
    this.name = 'AuthenticationError'
  }
}

/** Thrown when a network-level failure prevents the request from completing. */
export class NetworkError extends CatalogizerError {
  constructor(message = 'Network request failed') {
    super(message, 0, 'NETWORK_ERROR')
    this.name = 'NetworkError'
  }
}

/** Thrown when the server rejects the request due to invalid input (HTTP 400). */
export class ValidationError extends CatalogizerError {
  constructor(message = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}
