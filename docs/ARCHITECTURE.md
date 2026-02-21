# Architecture — @vasic-digital/catalogizer-api-client

## Overview

Type-safe HTTP client for the Catalogizer REST API. Built on axios with automatic token refresh, retry logic, and error classification.

## Design Principles

- **Single Responsibility**: Each service class handles one API domain
- **Dependency Inversion**: Services depend on `HttpClient` abstraction, not axios directly
- **Open/Closed**: Add new service methods without modifying existing ones
- **Fail Fast**: Error mapping converts HTTP status codes to typed error classes immediately

## Design Patterns

- **Facade**: `CatalogizerClient` exposes a unified API hiding service composition complexity
- **Repository**: Each service class is a repository for its domain (auth, entities, collections, storage)
- **Decorator**: `HttpClient.withRetry()` wraps any operation with retry behavior
- **Observer**: `CatalogizerClient extends EventEmitter` — emits `auth:expired` events

## Module Structure

```
src/
  index.ts                    — CatalogizerClient (Facade) + barrel exports
  http.ts                     — HttpClient with interceptors and retry
  types.ts                    — ClientConfig, error classes, storage/scan types
  services/
    AuthService.ts            — /auth/* endpoints
    EntityService.ts          — /api/v1/entities/* endpoints
    CollectionService.ts      — /api/v1/collections/* endpoints
    StorageService.ts         — /api/v1/storage-roots + /api/v1/scan endpoints
```

## Token Refresh Flow

```
Request → 401 response
  → HttpClient calls onTokenRefresh()
  → CatalogizerClient calls AuthService.refreshToken()
  → New token stored, original request retried
  → If refresh fails → emit('auth:expired')
```

## Error Hierarchy

```
CatalogizerError
  ├── AuthenticationError (401)
  ├── NetworkError (no response)
  └── ValidationError (400)
```
