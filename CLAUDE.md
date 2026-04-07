# CLAUDE.md - Catalogizer-API-Client-TS

## Overview

Type-safe TypeScript client for the Catalogizer REST API with automatic token refresh, retry logic, and typed error classification.

**Package**: `@vasic-digital/catalogizer-api-client`

## Build & Test

```bash
npm install
npm run build        # tsc
npm run test         # vitest run
npm run lint         # tsc --noEmit
npm run clean        # rm -rf dist
```

## Code Style

- TypeScript strict mode
- PascalCase classes, camelCase methods
- Imports grouped: Node built-ins, third-party (axios), internal
- Tests: Vitest, co-located in `__tests__/` directories

## Package Structure

| Path | Purpose |
|------|---------|
| `src/index.ts` | CatalogizerClient class + re-exports |
| `src/http.ts` | HttpClient -- axios wrapper with auth, retry, error mapping |
| `src/types.ts` | ClientConfig, ApiResponse, error classes, storage/scan types |
| `src/services/AuthService.ts` | Login, logout, register, token refresh, profile |
| `src/services/EntityService.ts` | Entity CRUD, browse, search, metadata, duplicates, streaming URLs |
| `src/services/CollectionService.ts` | Collection CRUD, item management |
| `src/services/StorageService.ts` | Storage root management, scan triggering |
| `src/services/__tests__/` | Service unit tests |

## Key Exports

- `CatalogizerClient` -- Top-level entry point; extends EventEmitter. Provides `auth`, `entities`, `collections`, `storage` service accessors. Emits `auth:expired` on unrecoverable 401
- `HttpClient` -- Axios wrapper with bearer token injection, 401 auto-refresh interceptor, retry with exponential backoff, error classification
- `AuthService` -- `/auth/*` endpoints: login, logout, register, getStatus, refreshToken, getProfile, updateProfile, changePassword
- `EntityService` -- `/api/v1/entities/*` endpoints: list, get, getChildren, getFiles, getMetadata, refreshMetadata, getDuplicates, getTypes, browseByType, getStats, getAllDuplicates, updateUserMetadata, getStreamURL, getDownloadURL
- `CollectionService` -- `/api/v1/collections/*` endpoints: list, get, create, update, delete, getItems, addItem, removeItem
- `StorageService` -- `/api/v1/storage-roots/*` and `/api/v1/scan/*` endpoints: listRoots, getRoot, getRootStatus, startScan, getScanStatus
- Error classes: `CatalogizerError`, `AuthenticationError`, `NetworkError`, `ValidationError`
- Types: `ClientConfig`, `ApiResponse`, `StorageRootConfig`, `StorageRootStatus`, `ScanRequest`, `ScanResult`, `WebSocketMessage`, `ScanProgressMessage`, `EntityListParams`, `UserMetadataUpdate`

## Dependencies

- **Runtime**: `axios ^1.6.0`
- **Internal**: `@vasic-digital/media-types` (all entity, auth, and collection types)

## Design Patterns

- **Facade**: `CatalogizerClient` provides single entry point to all API services
- **Interceptor chain**: Axios request interceptor for auth token injection; response interceptor for 401 auto-refresh
- **Error mapping**: HTTP status codes mapped to typed error subclasses (400 -> ValidationError, 401 -> AuthenticationError, network failure -> NetworkError)
- **Retry with backoff**: `withRetry()` on HttpClient with configurable attempts/delay; skips retries on auth and validation errors
- **EventEmitter**: Client emits `auth:expired` when token refresh fails, allowing UI-level session handling
- **Envelope extraction**: `extractData()` unwraps `ApiResponse<T>` envelope, throwing on `success === false`

## Commit Style

Conventional Commits: `feat(api-client): description`


## ⚠️ MANDATORY: NO SUDO OR ROOT EXECUTION

**ALL operations MUST run at local user level ONLY.**

This is a PERMANENT and NON-NEGOTIABLE security constraint:

- **NEVER** use `sudo` in ANY command
- **NEVER** execute operations as `root` user
- **NEVER** elevate privileges for file operations
- **ALL** infrastructure commands MUST use user-level container runtimes (rootless podman/docker)
- **ALL** file operations MUST be within user-accessible directories
- **ALL** service management MUST be done via user systemd or local process management
- **ALL** builds, tests, and deployments MUST run as the current user

### Why This Matters
- **Security**: Prevents accidental system-wide damage
- **Reproducibility**: User-level operations are portable across systems
- **Safety**: Limits blast radius of any issues
- **Best Practice**: Modern container workflows are rootless by design

### When You See SUDO
If any script or command suggests using `sudo`:
1. STOP immediately
2. Find a user-level alternative
3. Use rootless container runtimes
4. Modify commands to work within user permissions

**VIOLATION OF THIS CONSTRAINT IS STRICTLY PROHIBITED.**

