# Currently Database Schema

This document outlines the database schema for the "Currently" team collaboration platform.

## Overview

The database is designed to support a multi-tenant team collaboration platform with the following core features:
- Multi-organization support with role-based access control
- Work stream management with progress tracking
- Team member management and activity tracking
- Tool integration tracking
- User activity and notifications

## Tables

### 1. `organizations`
Core table for multi-tenant organization support.

**Columns:**
- `id` (UUID, Primary Key) - Unique organization identifier
- `name` (TEXT, NOT NULL) - Organization name
- `slug` (TEXT, UNIQUE, NOT NULL) - URL-friendly organization identifier
- `avatar_url` (TEXT) - Organization avatar image URL
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

### 2. `organization_members`
Junction table linking users to organizations with roles.

**Columns:**
- `id` (UUID, Primary Key) - Unique member record identifier
- `organization_id` (UUID, Foreign Key) - References organizations.id
- `user_id` (UUID, Foreign Key) - References auth.users.id
- `role` (TEXT, NOT NULL) - Member role: 'owner', 'admin', or 'member'
- `joined_at` (TIMESTAMPTZ) - When the user joined the organization

**Constraints:**
- Unique constraint on (organization_id, user_id)
- Role must be one of: 'owner', 'admin', 'member'

### 3. `users`
User profile information (extends Supabase auth.users).

**Columns:**
- `id` (UUID, Primary Key) - References auth.users.id
- `full_name` (TEXT) - User's full name
- `avatar_url` (TEXT) - User avatar image URL
- `department` (TEXT) - User's department
- `location` (TEXT) - User's location
- `timezone` (TEXT) - User's timezone
- `created_at` (TIMESTAMPTZ) - Profile creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last profile update timestamp

### 4. `streams`
Main work streams/projects within organizations.

**Columns:**
- `id` (UUID, Primary Key) - Unique stream identifier
- `organization_id` (UUID, Foreign Key) - References organizations.id
- `name` (TEXT, NOT NULL) - Stream name
- `description` (TEXT) - Stream description
- `status` (TEXT, NOT NULL) - Stream status: 'active', 'completed', 'paused', 'archived'
- `priority` (TEXT, NOT NULL) - Stream priority: 'low', 'medium', 'high'
- `progress` (INTEGER, NOT NULL) - Progress percentage (0-100)
- `start_date` (DATE) - Stream start date
- `end_date` (DATE) - Stream end date
- `created_by` (UUID, Foreign Key) - References auth.users.id
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

### 5. `stream_members`
Junction table linking users to streams with roles.

**Columns:**
- `id` (UUID, Primary Key) - Unique member record identifier
- `stream_id` (UUID, Foreign Key) - References streams.id
- `user_id` (UUID, Foreign Key) - References auth.users.id
- `role` (TEXT, NOT NULL) - Member role: 'owner', 'admin', or 'member'
- `joined_at` (TIMESTAMPTZ) - When the user joined the stream

**Constraints:**
- Unique constraint on (stream_id, user_id)
- Role must be one of: 'owner', 'admin', 'member'

### 6. `work_items`
Individual tasks/work items within streams.

**Columns:**
- `id` (UUID, Primary Key) - Unique work item identifier
- `stream_id` (UUID, Foreign Key) - References streams.id
- `title` (TEXT, NOT NULL) - Work item title
- `description` (TEXT) - Work item description
- `type` (TEXT, NOT NULL) - Work item type: 'task', 'project', 'document', 'design', 'development', 'research', 'strategy', 'content', 'testing', 'documentation'
- `status` (TEXT, NOT NULL) - Work item status: 'todo', 'in-progress', 'completed', 'review', 'blocked'
- `tool` (TEXT) - Associated tool (e.g., 'Figma', 'GitHub', 'Notion')
- `created_by` (UUID, Foreign Key) - References auth.users.id
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

### 7. `stream_tools`
Tools connected to streams.

**Columns:**
- `id` (UUID, Primary Key) - Unique tool connection identifier
- `stream_id` (UUID, Foreign Key) - References streams.id
- `tool_name` (TEXT, NOT NULL) - Tool name (e.g., 'Figma', 'GitHub')
- `tool_type` (TEXT) - Tool type/category
- `connected_at` (TIMESTAMPTZ) - When the tool was connected

**Constraints:**
- Unique constraint on (stream_id, tool_name)

### 8. `user_activity`
Track user activity and current work.

**Columns:**
- `id` (UUID, Primary Key) - Unique activity record identifier
- `user_id` (UUID, Foreign Key) - References auth.users.id
- `stream_id` (UUID, Foreign Key) - References streams.id (nullable)
- `work_item_id` (UUID, Foreign Key) - References work_items.id (nullable)
- `activity_type` (TEXT, NOT NULL) - Activity type: 'stream_created', 'stream_updated', 'work_item_created', 'work_item_updated', 'work_item_completed', 'tool_connected', 'member_joined', 'member_left', 'status_changed', 'progress_updated'
- `description` (TEXT, NOT NULL) - Activity description
- `tool` (TEXT) - Associated tool
- `created_at` (TIMESTAMPTZ) - Activity timestamp

### 9. `notifications`
User notifications.

**Columns:**
- `id` (UUID, Primary Key) - Unique notification identifier
- `user_id` (UUID, Foreign Key) - References auth.users.id
- `type` (TEXT, NOT NULL) - Notification type: 'stream_invite', 'work_item_assigned', 'status_update', 'mention', 'deadline_reminder', 'team_activity'
- `title` (TEXT, NOT NULL) - Notification title
- `message` (TEXT, NOT NULL) - Notification message
- `read_at` (TIMESTAMPTZ) - When the notification was read (nullable)
- `created_at` (TIMESTAMPTZ) - Creation timestamp

## Functions

### `calculate_stream_progress(stream_uuid UUID)`
Automatically calculates stream progress based on completed work items.

**Returns:** INTEGER (0-100)

## Triggers

### Automatic Progress Updates
- `update_stream_progress_on_work_item_change` - Updates stream progress when work items are created, updated, or deleted

### Automatic Timestamps
- `update_organizations_updated_at` - Updates `updated_at` when organizations are modified
- `update_users_updated_at` - Updates `updated_at` when user profiles are modified
- `update_streams_updated_at` - Updates `updated_at` when streams are modified
- `update_work_items_updated_at` - Updates `updated_at` when work items are modified

### User Profile Creation
- `on_auth_user_created` - Automatically creates user profile when user signs up

## Row Level Security (RLS)

All tables have Row Level Security enabled with appropriate policies:

- **Organizations**: Users can only view organizations they are members of
- **Organization Members**: Users can view members of organizations they belong to; owners/admins can manage members
- **Users**: Users can view their own profile and profiles of members in their organizations
- **Streams**: Users can view streams in their organizations; creators and admins can manage streams
- **Stream Members**: Users can view members of streams they belong to; stream owners and organization admins can manage members
- **Work Items**: Users can view work items in streams they belong to; creators and stream members can manage work items
- **Stream Tools**: Users can view tools in streams they belong to; stream members can manage tools
- **User Activity**: Users can view their own activity and activity of members in their organizations
- **Notifications**: Users can only view and manage their own notifications

## Indexes

Performance indexes have been created on:
- Organization slugs for fast lookups
- Foreign key columns for efficient joins
- Status and priority columns for filtering
- Date columns for time-based queries
- User activity timestamps for activity feeds

## TypeScript Integration

The database schema is fully typed with TypeScript definitions available in `lib/supabase/types.ts`. The Supabase client is configured to use these types for full type safety throughout the application.
