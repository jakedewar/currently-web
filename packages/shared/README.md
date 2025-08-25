# @currently/shared

Shared types and utilities for Currently web app and Chrome extension.

## Installation

```bash
# In the web app
npm install @currently/shared

# In the Chrome extension
npm install @currently/shared
```

## Usage

### Types

```typescript
import type { Stream, WorkItem, User, DeviceLinkCode } from '@currently/shared'

// Use types in your components
const stream: Stream = {
  id: '123',
  name: 'My Stream',
  status: 'active',
  // ... other properties
}
```

### API Client

```typescript
import { CurrentlyApi } from '@currently/shared'

const api = new CurrentlyApi({
  baseUrl: 'https://your-webapp.com',
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your-anon-key'
})

// Generate device link code (web app)
const linkCode = await api.generateDeviceLinkCode()

// Exchange device link code (extension)
const session = await api.exchangeDeviceLinkCode('ABC123')

// Get streams
const streams = await api.getStreams()

// Create work item
const workItem = await api.createWorkItem('stream-id', {
  title: 'New Task',
  description: 'Task description'
})
```

### Utilities

```typescript
import { formatDate, formatDateTime, getInitials } from '@currently/shared'

const date = formatDate('2024-01-01') // "Jan 1, 2024"
const datetime = formatDateTime('2024-01-01T10:30:00Z') // "Jan 1, 2024, 10:30 AM"
const initials = getInitials('John Doe') // "JD"
```

## Development

```bash
# Build the package
npm run build

# Watch for changes
npm run dev

# Clean build artifacts
npm run clean
```

## Constants

```typescript
import { 
  CURRENTLY_API_VERSION, 
  DEVICE_LINK_CODE_LENGTH, 
  DEVICE_LINK_CODE_EXPIRY_MINUTES 
} from '@currently/shared'
```

## Contributing

When adding new types or utilities:

1. Add them to the appropriate file in `src/`
2. Export them from `src/index.ts`
3. Update this README with usage examples
4. Build the package before committing
