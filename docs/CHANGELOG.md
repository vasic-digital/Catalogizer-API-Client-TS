# Changelog — @vasic-digital/catalogizer-api-client

## [0.1.0] — 2026-02-21

### Added
- `CatalogizerClient` facade with automatic token refresh and auth:expired event
- `AuthService`: login, logout, register, status, refresh, profile, updateProfile, changePassword
- `EntityService`: list, get, children, files, metadata, refresh, duplicates, types, browse, stats, user-metadata, stream/download URLs
- `CollectionService`: list, get, create, update, delete, items, addItem, removeItem
- `StorageService`: listRoots, getRoot, getRootStatus, startScan, getScanStatus
- `HttpClient`: axios wrapper with token injection, 401 retry, error classification
- `CatalogizerError`, `AuthenticationError`, `NetworkError`, `ValidationError` error classes
