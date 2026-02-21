# API Reference — @vasic-digital/catalogizer-api-client

## `CatalogizerClient`

```typescript
const client = new CatalogizerClient(config: ClientConfig)
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| auth | AuthService | Authentication operations |
| entities | EntityService | Entity browsing and management |
| collections | CollectionService | Collection CRUD |
| storage | StorageService | Storage roots and scanning |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| setToken(token) | void | Set auth token |
| clearToken() | void | Clear auth token |
| getToken() | string \| undefined | Get current token |
| getBaseURL() | string | Get configured base URL |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| auth:expired | — | Token refresh failed, re-login required |

## `AuthService`

| Method | Signature | Description |
|--------|-----------|-------------|
| login | (data: LoginRequest) → LoginResponse | Authenticate and store token |
| logout | () → void | Clear session |
| register | (data: RegisterRequest) → User | Create new account |
| getStatus | () → AuthStatus | Check current auth state |
| refreshToken | () → {session_token, expires_at} | Renew token |
| getProfile | () → User | Get authenticated user |
| updateProfile | (data: UpdateProfileRequest) → User | Update profile |
| changePassword | (data: ChangePasswordRequest) → void | Change password |

## `EntityService`

| Method | Signature | Description |
|--------|-----------|-------------|
| list | (params?) → PaginatedResponse<MediaEntity> | List entities |
| get | (id) → MediaEntity | Get entity by ID |
| getChildren | (id, params?) → PaginatedResponse<MediaEntity> | Get child entities |
| getFiles | (id) → MediaFile[] | Get entity files |
| getMetadata | (id) → EntityExternalMetadata[] | Get external metadata |
| refreshMetadata | (id) → void | Trigger metadata refresh |
| getDuplicates | (id) → MediaEntity[] | Get duplicates for entity |
| getTypes | () → MediaType[] | List all media types |
| browseByType | (typeName, params?) → PaginatedResponse<MediaEntity> | Browse by type |
| getStats | () → EntityStats | Get aggregate stats |
| getAllDuplicates | (params?) → PaginatedResponse<DuplicateGroup> | All duplicate groups |
| updateUserMetadata | (id, data) → UserMetadata | Update ratings/favorites |
| getStreamURL | (id, baseURL) → string | Get stream URL |
| getDownloadURL | (id, baseURL) → string | Get download URL |

## `ClientConfig`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| baseURL | string | — | API base URL |
| timeout | number | 30000 | Request timeout ms |
| retryAttempts | number | 3 | Max retry attempts |
| retryDelay | number | 1000 | Base retry delay ms |
| enableWebSocket | boolean | false | Enable WS connection |
| webSocketURL | string | — | WebSocket URL |
| headers | Record<string,string> | — | Extra request headers |
