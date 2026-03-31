# Architecture -- Catalogizer-API-Client-TS

## Purpose

Type-safe TypeScript client for the Catalogizer REST API. Wraps all REST endpoints with proper types from `@vasic-digital/media-types`, provides automatic token refresh, retry logic with exponential backoff, and typed error classification.

## Structure

```
src/
  index.ts                       CatalogizerClient class + re-exports
  http.ts                        HttpClient -- axios wrapper with auth, retry, error mapping
  types.ts                       ClientConfig, ApiResponse, error classes, storage/scan types
  services/
    AuthService.ts               Login, logout, register, token refresh, profile management
    EntityService.ts             Entity CRUD, browse, search, metadata, duplicates, streaming URLs
    CollectionService.ts         Collection CRUD, item management
    StorageService.ts            Storage root management, scan triggering
    __tests__/                   Service unit tests
```

## Key Components

- **`CatalogizerClient`** -- Facade providing `auth`, `entities`, `collections`, `storage` service accessors. Extends EventEmitter, emits `auth:expired`
- **`HttpClient`** -- Axios wrapper with bearer token injection, 401 auto-refresh interceptor, retry with exponential backoff, and error classification
- **`AuthService`** -- Login, logout, register, getStatus, refreshToken, profile management
- **`EntityService`** -- Browse by type, search, get details/children/files/metadata, duplicates, stream/download URLs
- **`CollectionService`** -- CRUD collections, add/remove items
- **`StorageService`** -- List/get storage roots, trigger scans, check scan status
- **Error hierarchy** -- CatalogizerError > AuthenticationError, NetworkError, ValidationError

## Data Flow

```
CatalogizerClient.entities.browseByType("movie", params)
    |
    EntityService -> HttpClient.get("/api/v1/entities/browse/movie", params)
        |
        axios request interceptor: inject Authorization bearer token
        |
        axios response interceptor: 401? -> refreshToken() -> retry original request
        |
        error? -> classify: 400=ValidationError, 401=AuthenticationError, network=NetworkError
        |
        success -> extractData(ApiResponse<T>) -> return typed data
```

## Dependencies

- `axios` -- HTTP client
- `@vasic-digital/media-types` -- Shared type definitions
- `vitest` for testing

## Testing Strategy

Vitest with service unit tests. Tests cover request construction, token injection, retry behavior, error classification, and API response envelope extraction.
