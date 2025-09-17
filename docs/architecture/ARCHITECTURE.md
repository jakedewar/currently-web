# Currently Architecture

## Overview

Currently is a productivity platform consisting of:
- **Web App** (Next.js) - Primary interface for account management, stream creation, and team collaboration
- **Chrome Extension** (WXT) - Browser-based interface for quick work tracking and stream management
- **Shared Package** - Common types, utilities, and API clients used by both web app and extension

## Project Structure

```
currently-webapp/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utilities and configurations
├── packages/
│   └── shared/            # Shared types and utilities
│       ├── src/
│       │   ├── types.ts   # Common TypeScript types
│       │   ├── api.ts     # Shared API client
│       │   └── index.ts   # Main exports
│       └── package.json
├── supabase/
│   ├── functions/         # Edge Functions
│   │   └── device-link/   # Device authentication
│   └── migrations/        # Database migrations
└── package.json

currently-extension/        # Separate Chrome extension project
├── src/
│   ├── popup/            # Extension popup UI
│   ├── background/       # Service worker
│   ├── content-scripts/  # Content scripts
│   └── lib/              # Extension-specific utilities
├── wxt.config.ts         # WXT configuration
└── package.json
```

## Authentication Flow

### Web App Authentication
1. Users sign up/login via Supabase Auth (OAuth, magic links, etc.)
2. Standard web app session management
3. RLS policies secure all database access

### Chrome Extension Authentication
1. User generates device link code on web app
2. User enters code in Chrome extension
3. Extension exchanges code for session via Edge Function
4. Extension stores session in `chrome.storage`
5. Extension uses custom Supabase storage adapter

### Device Link Flow
```
Web App                    Edge Function              Chrome Extension
    |                          |                           |
    |-- Generate Code -------->|                           |
    |<-- Code (ABC123) --------|                           |
    |                          |                           |
    |                          |<-- Exchange Code ---------|
    |                          |-- Validate & Create Session|
    |                          |<-- Session Tokens --------|
    |                          |                           |
    |                          |-- Store in chrome.storage |
```

## Database Schema

### Core Tables
- `users` - User accounts
- `streams` - Work streams/projects
- `stream_members` - Stream participants
- `work_items` - Individual tasks
- `device_link_codes` - Extension authentication codes

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Stream members can access shared stream data
- Device link codes are user-scoped

## API Architecture

### Web App APIs
- `/api/streams/*` - Stream management
- `/api/users/*` - User management
- `/api/device-link/generate` - Device link code generation

### Edge Functions
- `device-link` - Device authentication and session management

### Shared API Client
The `@currently/shared` package provides a unified API client used by both web app and extension.

## Development Workflow

### Local Development
```bash
# Web app
npm run dev

# Shared package (watch mode)
npm run dev:shared

# Chrome extension (in separate project)
npm run dev
```

### Building
```bash
# Build shared package
npm run build:shared

# Build web app
npm run build

# Build extension (in extension project)
npm run build
```

## Security Considerations

### Authentication
- Device link codes are short-lived (5 minutes)
- Single-use codes prevent replay attacks
- Extension sessions use secure storage
- All API calls require valid authentication

### Data Access
- RLS policies enforce data isolation
- Users can only access authorized streams
- Extension uses same security model as web app

### API Security
- Edge Functions handle privileged operations
- No service role secrets in extension
- CORS properly configured for extension domains

## Deployment

### Web App
- Deploy to Vercel/Netlify
- Environment variables for Supabase config
- Edge Functions deployed to Supabase

### Chrome Extension
- Build with WXT
- Submit to Chrome Web Store
- Update extension ID in web app config

### Shared Package
- Build and publish to npm (or use local file references)
- Version management for breaking changes

## Future Considerations

### Scaling
- Consider microservices for high-traffic features
- Database sharding for large organizations
- CDN for static assets

### Features
- Real-time collaboration via Supabase Realtime
- Offline support for extension
- Mobile app using same shared package
- Webhook integrations for external tools

### Monitoring
- Supabase dashboard for database metrics
- Extension analytics via Chrome Web Store
- Error tracking for both platforms
