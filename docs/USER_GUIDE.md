# User Guide — @vasic-digital/catalogizer-api-client

## Installation

```bash
npm install @vasic-digital/catalogizer-api-client @vasic-digital/media-types
```

## Quickstart

```typescript
import { CatalogizerClient } from '@vasic-digital/catalogizer-api-client'

const client = new CatalogizerClient({
  baseURL: 'http://localhost:8080',
  timeout: 30000,
})

// Login
const session = await client.auth.login({ username: 'admin', password: 'secret' })
console.log('Logged in as', session.user.username)

// Browse movies
const movies = await client.entities.browseByType('movie', { limit: 20, offset: 0 })
console.log(`Found ${movies.total} movies`)

// Get entity detail
const entity = await client.entities.get(movies.items[0].id)
console.log(entity.title, entity.year)
```

## Handling Auth Expiry

```typescript
client.on('auth:expired', () => {
  // Redirect to login page
  window.location.href = '/login'
})
```

## Error Handling

```typescript
import { AuthenticationError, NetworkError, CatalogizerError } from '@vasic-digital/catalogizer-api-client'

try {
  await client.entities.get(999)
} catch (err) {
  if (err instanceof AuthenticationError) {
    // 401 — re-authenticate
  } else if (err instanceof NetworkError) {
    // No network connection
  } else if (err instanceof CatalogizerError && err.status === 404) {
    // Entity not found
  }
}
```

## Restoring a saved token

```typescript
const savedToken = localStorage.getItem('auth_token')
if (savedToken) {
  client.setToken(savedToken)
}
```
