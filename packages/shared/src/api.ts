import type { 
  ApiResponse, 
  DeviceLinkResponse, 
  DeviceLinkExchangeResponse,
  Stream,
  WorkItem,
  User
} from './types'

// Base API client
export class CurrentlyApi {
  private baseUrl: string
  private supabaseUrl: string
  private supabaseAnonKey: string

  constructor(config: { baseUrl: string; supabaseUrl: string; supabaseAnonKey: string }) {
    this.baseUrl = config.baseUrl
    this.supabaseUrl = config.supabaseUrl
    this.supabaseAnonKey = config.supabaseAnonKey
  }

  // Device link code generation
  async generateDeviceLinkCode(): Promise<DeviceLinkResponse> {
    const response = await fetch(`${this.baseUrl}/api/device-link/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to generate device link code')
    }

    return response.json()
  }

  // Device link code exchange
  async exchangeDeviceLinkCode(code: string): Promise<DeviceLinkExchangeResponse> {
    const response = await fetch(`${this.supabaseUrl}/functions/v1/device-link/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.supabaseAnonKey}`
      },
      body: JSON.stringify({ code })
    })

    if (!response.ok) {
      throw new Error('Failed to exchange device link code')
    }

    return response.json()
  }

  // Streams API
  async getStreams(): Promise<Stream[]> {
    const response = await fetch(`${this.baseUrl}/api/streams`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch streams')
    }

    const data = await response.json()
    return data.streams || []
  }

  async getStream(id: string): Promise<Stream> {
    const response = await fetch(`${this.baseUrl}/api/streams/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch stream')
    }

    return response.json()
  }

  async createWorkItem(streamId: string, workItem: Partial<WorkItem>): Promise<WorkItem> {
    const response = await fetch(`${this.baseUrl}/api/streams/${streamId}/work-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workItem)
    })

    if (!response.ok) {
      throw new Error('Failed to create work item')
    }

    return response.json()
  }

  async updateWorkItem(streamId: string, workItemId: string, updates: Partial<WorkItem>): Promise<WorkItem> {
    const response = await fetch(`${this.baseUrl}/api/streams/${streamId}/work-items/${workItemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      throw new Error('Failed to update work item')
    }

    return response.json()
  }
}

// Utility functions
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
