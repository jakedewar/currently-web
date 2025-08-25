# Supabase Edge Functions

This directory contains Supabase Edge Functions that run in a Deno environment.

## TypeScript Errors

The TypeScript errors you see in VS Code are expected because:

1. **Deno Environment**: Edge Functions run in Deno, not Node.js
2. **URL Imports**: Deno uses URL imports which TypeScript doesn't recognize in Node.js context
3. **Global Objects**: `Deno` is a global object in Deno runtime

## Development

### Local Development
```bash
# Start Supabase locally
supabase start

# Deploy function locally
supabase functions serve device-link

# Test the function
curl -X POST http://localhost:54321/functions/v1/device-link/generate \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Production Deployment
```bash
# Deploy to production
supabase functions deploy device-link
```

## Functions

### device-link
Handles Chrome extension authentication via device link codes.

**Endpoints:**
- `POST /generate` - Generate a device link code
- `POST /exchange` - Exchange code for session

**Usage:**
```bash
# Generate code (from web app)
curl -X POST https://your-project.supabase.co/functions/v1/device-link/generate \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Exchange code (from extension)
curl -X POST https://your-project.supabase.co/functions/v1/device-link/exchange \
  -H "Content-Type: application/json" \
  -d '{"code": "ABC123"}'
```

## Configuration

- `deno.json` - Deno configuration
- `tsconfig.json` - TypeScript configuration for Deno
- `types.d.ts` - Type declarations for Deno globals

## Notes

- These functions are deployed to Supabase, not your Next.js app
- They run in a Deno environment, not Node.js
- TypeScript errors in VS Code are expected and can be ignored
- The functions work correctly when deployed to Supabase
