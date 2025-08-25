# Chrome Extension Setup Guide

## Overview

This guide explains how to integrate your existing WXT Chrome extension with the Currently web app using the shared package.

**Note**: The Chrome extension is built as a separate project. This guide assumes you have an existing WXT extension project in a different directory.

## Prerequisites

- Existing WXT Chrome extension project in a separate directory
- Currently web app with shared package built
- Supabase project configured
- Both projects should be at the same directory level for easy linking

## Step 1: Install Shared Package

In your Chrome extension project:

```bash
# Add the shared package as a dependency
npm install @currently/shared

# Or if using local development (recommended for development)
npm install file:../currently-webapp/packages/shared
```

## Step 2: Update Extension Configuration

Update your `wxt.config.ts`:

```typescript
import { defineConfig } from 'wxt'

export default defineConfig({
  manifest: {
    name: 'Currently',
    description: 'Track your work and stay organized with Currently',
    version: '1.0.0',
    permissions: [
      'storage',
      'activeTab',
      'scripting'
    ],
    host_permissions: [
      'https://*.supabase.co/*',
      'https://your-webapp-domain.com/*' // Update with your domain
    ],
    action: {
      default_popup: 'src/popup/index.html',
      default_title: 'Currently'
    },
    background: {
      service_worker: 'src/background/index.ts'
    },
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['src/content-scripts/main.ts']
      }
    ]
  }
})
```

## Step 3: Create Environment Configuration

Create `.env` file in your extension project:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
WEBAPP_URL=https://your-webapp-domain.com
```

## Step 4: Update Supabase Client

Replace your existing Supabase client with the shared one:

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Custom storage adapter for chrome.storage
const chromeStorageAdapter = {
  getItem: (key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null)
      })
    })
  },
  setItem: (key: string, value: string): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve()
      })
    })
  },
  removeItem: (key: string): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], () => {
        resolve()
      })
    })
  }
}

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: chromeStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
)
```

## Step 5: Create Device Link Authentication

Create a device link authentication component:

```typescript
// src/components/DeviceLinkAuth.vue
<template>
  <div class="device-link-auth">
    <div v-if="!isAuthenticated" class="auth-form">
      <h3>Connect to Currently</h3>
      <p>Enter the code from your Currently web app to connect this extension.</p>
      
      <input 
        v-model="linkCode" 
        placeholder="Enter 6-digit code"
        maxlength="6"
        class="code-input"
      />
      
      <button 
        @click="connectDevice" 
        :disabled="!linkCode || isConnecting"
        class="connect-btn"
      >
        {{ isConnecting ? 'Connecting...' : 'Connect' }}
      </button>
      
      <p v-if="error" class="error">{{ error }}</p>
    </div>
    
    <div v-else class="connected">
      <h3>Connected!</h3>
      <p>Welcome, {{ user?.full_name || user?.email }}</p>
      <button @click="disconnect" class="disconnect-btn">Disconnect</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase, exchangeDeviceLinkCode, getCurrentUser } from '../lib/supabase'
import type { User } from '@currently/shared'

const linkCode = ref('')
const isConnecting = ref(false)
const isAuthenticated = ref(false)
const user = ref<User | null>(null)
const error = ref('')

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    isAuthenticated.value = true
    user.value = await getCurrentUser()
  }
})

const connectDevice = async () => {
  if (!linkCode.value) return
  
  isConnecting.value = true
  error.value = ''
  
  try {
    const result = await exchangeDeviceLinkCode(linkCode.value)
    isAuthenticated.value = true
    user.value = result.user
    linkCode.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to connect'
  } finally {
    isConnecting.value = false
  }
}

const disconnect = async () => {
  await supabase.auth.signOut()
  isAuthenticated.value = false
  user.value = null
}
</script>

<style scoped>
.device-link-auth {
  padding: 16px;
  width: 300px;
}

.auth-form {
  text-align: center;
}

.code-input {
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  text-align: center;
  font-size: 18px;
  letter-spacing: 2px;
}

.connect-btn {
  width: 100%;
  padding: 8px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.connect-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  font-size: 12px;
}

.connected {
  text-align: center;
}

.disconnect-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

## Step 6: Update Popup Component

Update your main popup to use the authentication:

```typescript
// src/popup/App.vue
<template>
  <div class="app">
    <DeviceLinkAuth v-if="!isAuthenticated" />
    <MainInterface v-else :user="user" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase, getCurrentUser } from '../lib/supabase'
import DeviceLinkAuth from '../components/DeviceLinkAuth.vue'
import MainInterface from '../components/MainInterface.vue'
import type { User } from '@currently/shared'

const isAuthenticated = ref(false)
const user = ref<User | null>(null)

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    isAuthenticated.value = true
    user.value = await getCurrentUser()
  }
  
  // Listen for auth state changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      isAuthenticated.value = true
      user.value = await getCurrentUser()
    } else if (event === 'SIGNED_OUT') {
      isAuthenticated.value = false
      user.value = null
    }
  })
})
</script>
```

## Step 7: Create Main Interface

Create the main extension interface:

```typescript
// src/components/MainInterface.vue
<template>
  <div class="main-interface">
    <header>
      <h3>Currently</h3>
      <span class="user-name">{{ user?.full_name || user?.email }}</span>
    </header>
    
    <div class="content">
      <div v-if="loading" class="loading">Loading streams...</div>
      <div v-else-if="streams.length === 0" class="empty">
        <p>No active streams found.</p>
        <a :href="webappUrl" target="_blank">Create a stream</a>
      </div>
      <div v-else class="streams">
        <div 
          v-for="stream in streams" 
          :key="stream.id"
          class="stream-item"
          @click="selectStream(stream)"
        >
          <h4>{{ stream.name }}</h4>
          <p>{{ stream.description }}</p>
          <div class="stream-meta">
            <span class="status">{{ stream.status }}</span>
            <span class="progress">{{ stream.progress }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CurrentlyApi } from '@currently/shared'
import type { Stream, User } from '@currently/shared'

const props = defineProps<{
  user: User
}>()

const streams = ref<Stream[]>([])
const loading = ref(true)
const webappUrl = process.env.WEBAPP_URL

const api = new CurrentlyApi({
  baseUrl: process.env.WEBAPP_URL!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!
})

onMounted(async () => {
  try {
    streams.value = await api.getStreams()
  } catch (error) {
    console.error('Failed to load streams:', error)
  } finally {
    loading.value = false
  }
})

const selectStream = (stream: Stream) => {
  // Handle stream selection
  console.log('Selected stream:', stream)
}
</script>

<style scoped>
.main-interface {
  width: 350px;
  max-height: 500px;
}

header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-name {
  font-size: 12px;
  color: #666;
}

.content {
  padding: 16px;
}

.stream-item {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
}

.stream-item:hover {
  background: #f5f5f5;
}

.stream-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.loading, .empty {
  text-align: center;
  color: #666;
}
</style>
```

## Step 8: Build and Test

```bash
# Build the extension
npm run build

# Preview the extension
npm run preview

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the .output directory
```

## Step 9: Test Authentication Flow

1. Start your web app: `npm run dev`
2. Go to Settings → Connect Chrome Extension
3. Generate a device link code
4. Open your Chrome extension
5. Enter the code to connect
6. Verify the extension shows your streams

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your web app domain is in `host_permissions`
2. **Authentication Fails**: Check that the Edge Function is deployed
3. **Storage Issues**: Verify the chrome storage adapter is working
4. **Build Errors**: Ensure the shared package is built and linked correctly

### Debug Tips

- Use Chrome DevTools for the extension popup
- Check the background script console
- Verify environment variables are loaded
- Test the Edge Function directly

## Next Steps

1. Add real-time updates using Supabase subscriptions
2. Implement work item creation/editing
3. Add keyboard shortcuts
4. Create content scripts for page integration
5. Add offline support
