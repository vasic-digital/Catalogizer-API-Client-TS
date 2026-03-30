# AGENTS.md - Catalogizer-API-Client-TS Multi-Agent Coordination

## Module Identity

- **Package**: `@vasic-digital/catalogizer-api-client`
- **Role**: Type-safe TypeScript client for the Catalogizer REST API
- **Runtime Dependencies**: `axios ^1.6.0`
- **Internal Dependencies**: `@vasic-digital/media-types`
- **TypeScript**: Strict mode

## Agent Responsibilities

### API Client Agent

The API Client agent owns the HTTP layer, error classification, and all service wrappers:

1. **HTTP Client** (`src/http.ts`) -- Axios wrapper with bearer token injection, 401 auto-refresh interceptor, retry with exponential backoff, error classification into typed subclasses.

2. **Client Facade** (`src/index.ts`) -- `CatalogizerClient` top-level entry point extending EventEmitter. Provides service accessors (`auth`, `entities`, `collections`, `storage`, etc.) and emits `auth:expired` on unrecoverable 401.

3. **Type Definitions** (`src/types.ts`) -- `ClientConfig`, `ApiResponse`, error classes (`CatalogizerError`, `AuthenticationError`, `NetworkError`, `ValidationError`), storage/scan types.

4. **Service Layer** (`src/services/`) -- Individual service classes wrapping REST endpoints:
   - `AuthService` -- `/auth/*` (login, logout, register, token refresh, profile)
   - `EntityService` -- `/api/v1/entities/*` (CRUD, browse, search, metadata, duplicates, streaming)
   - `CollectionService` -- `/api/v1/collections/*` (CRUD, item management)
   - `StorageService` -- `/api/v1/storage-roots/*` and `/api/v1/scan/*`
   - `AnalyticsService`, `DownloadService`, `PlaylistService`, `RecommendationService`, `ReportService`, `ScanService`, `SmbService`, `StatsService`, `SyncService`

## Cross-Agent Coordination

### Upstream Dependencies

- **`@vasic-digital/media-types`**: All entity, auth, and collection types come from this package. Type changes there require updates here.

### Downstream Consumers

All React UI modules that fetch data use this client:

| Consumer | Service Used | Purpose |
|----------|-------------|---------|
| `@vasic-digital/auth-context` | `AuthService` | Login, logout, token refresh |
| `@vasic-digital/media-browser` | `EntityService` | Entity browsing and search |
| `@vasic-digital/media-player` | `EntityService` | Stream URL resolution |
| `@vasic-digital/collection-manager` | `CollectionService` | Collection CRUD |
| `@vasic-digital/dashboard-analytics` | `EntityService` | Stats and distribution data |

### Coordination Rules

- Adding a new API endpoint requires a new method on the appropriate service class
- Error class hierarchy changes affect all consumers that catch typed errors
- `auth:expired` event semantics must not change without coordinating with `AuthProvider`

## File Map

```
Catalogizer-API-Client-TS/
  src/
    index.ts                           -- CatalogizerClient facade + re-exports
    http.ts                            -- HttpClient (axios wrapper, auth, retry)
    types.ts                           -- Config, response envelope, error classes
    services/
      AuthService.ts                   -- Authentication endpoints
      EntityService.ts                 -- Entity CRUD and browsing
      CollectionService.ts             -- Collection management
      StorageService.ts                -- Storage roots and scanning
      AnalyticsService.ts              -- Analytics endpoints
      DownloadService.ts               -- Download endpoints
      PlaylistService.ts               -- Playlist management
      RecommendationService.ts         -- Recommendations
      ReportService.ts                 -- Report generation
      ScanService.ts                   -- Scan operations
      SmbService.ts                    -- SMB-specific operations
      StatsService.ts                  -- Statistics endpoints
      SyncService.ts                   -- Sync operations
      __tests__/                       -- Service unit tests
```

## Testing Standards

```bash
npm install
npm run build        # tsc
npm run test         # vitest run
npm run lint         # tsc --noEmit
```

## Conventions

- Facade pattern: `CatalogizerClient` is the single entry point
- Interceptor chain: request interceptor for auth, response interceptor for 401 refresh
- Error mapping: HTTP status -> typed error subclass (400 -> ValidationError, 401 -> AuthenticationError)
- Envelope extraction: `extractData()` unwraps `ApiResponse<T>`, throwing on `success === false`
- EventEmitter: emits `auth:expired` for UI-level session handling

## Constraints

- **No CI/CD pipelines**: GitHub Actions, GitLab CI/CD, and all automated pipeline configurations are permanently disabled. All testing is local.
- **API contract alignment**: Service methods must match the catalog-api REST endpoints exactly.
- **No direct DOM access**: This is a pure HTTP client library with no React or browser dependencies.
