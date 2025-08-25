// Database types
export interface User {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}

export interface Stream {
  id: string
  name: string
  description?: string
  status: 'active' | 'archived' | 'completed'
  priority: 'low' | 'medium' | 'high'
  progress: number
  start_date: string
  end_date: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface StreamMember {
  id: string
  stream_id: string
  user_id: string
  role: 'owner' | 'member' | 'viewer'
  joined_at: string
  users?: User
}

export interface WorkItem {
  id: string
  stream_id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assigned_to?: string
  due_date?: string
  created_by: string
  created_at: string
  updated_at: string
}

// Device link types
export interface DeviceLinkCode {
  id: string
  code: string
  user_id: string
  user_email?: string
  expires_at: string
  used: boolean
  created_at: string
  updated_at: string
}

// API response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface DeviceLinkResponse {
  code: string
  expires_at: string
}

export interface DeviceLinkExchangeResponse {
  user: User
  message: string
}

// Extension-specific types
export interface ExtensionConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  webappUrl: string
}

export interface ExtensionState {
  isAuthenticated: boolean
  user?: User
  currentStream?: Stream
}
