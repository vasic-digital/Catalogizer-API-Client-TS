# @vasic-digital/catalogizer-api-client

Type-safe TypeScript client for the Catalogizer API. Wraps all REST endpoints with proper types from `@vasic-digital/media-types`, automatic token refresh, retry logic, and error classification.

## Install

```bash
npm install @vasic-digital/catalogizer-api-client @vasic-digital/media-types
```

## Usage

```typescript
import { CatalogizerClient } from '@vasic-digital/catalogizer-api-client'

const client = new CatalogizerClient({
  baseURL: 'http://localhost:8080',
  timeout: 30000,
})

// Login
const session = await client.auth.login({ username: 'admin', password: 'secret' })

// Browse entities
const movies = await client.entities.browseByType('movie', { limit: 20 })

// Get entity details
const entity = await client.entities.get(1)

// List collections
const collections = await client.collections.list()

// Trigger a scan
const scan = await client.storage.startScan({ storage_root_id: 1 })
```

## Services

| Service | Description |
|---------|-------------|
| `client.auth` | Login, logout, register, token refresh, profile management |
| `client.entities` | Browse, search, detail, metadata, duplicates, user metadata |
| `client.collections` | CRUD collections, manage items, smart rules |
| `client.storage` | Storage roots, scan triggering, scan status |

## Error Handling

```typescript
import { AuthenticationError, NetworkError, ValidationError } from '@vasic-digital/catalogizer-api-client'

try {
  await client.auth.login({ username: 'x', password: 'wrong' })
} catch (err) {
  if (err instanceof AuthenticationError) {
    // 401 — invalid credentials
  } else if (err instanceof NetworkError) {
    // network failure
  }
}
```

## License

MIT
