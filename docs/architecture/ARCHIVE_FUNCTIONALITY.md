# Stream Archiving Functionality

This document outlines the stream archiving functionality that has been implemented in the Currently webapp.

## Overview

Streams can now be archived when they are completed or no longer actively being worked on. Archived streams are preserved but hidden from the main view, allowing teams to maintain a clean workspace while keeping historical data accessible.

## Features

### 1. Archive Streams
- **Location**: Stream detail page → Actions dropdown → "Archive Stream"
- **Permission**: Stream owners, admins, and organization admins can archive streams
- **Effect**: Stream status changes to "archived"

### 2. Unarchive Streams
- **Location**: 
  - Stream detail page → Actions dropdown → "Unarchive Stream" (for archived streams)
  - Archived streams section → "Unarchive" button
- **Permission**: Stream owners, admins, and organization admins can unarchive streams
- **Effect**: Stream status changes back to "active"

### 3. Visual Indicators
- **Archived streams** are displayed with:
  - Reduced opacity (75%)
  - Muted background color
  - "Archived" badge with destructive styling
  - Archive icon in the streams list

### 4. Filtering and Organization
- **Status Filter**: New "Archived" option in the status filter dropdown
- **Archived Section**: Dedicated section at the bottom of the streams list
- **Toggle**: "Show/Hide Archived" button to expand/collapse archived streams
- **Count Badge**: Shows the number of archived streams

## Implementation Details

### Database
- Streams table already supports `archived` status
- No additional database changes required

### API Endpoints
- `PATCH /api/streams/[id]` - Supports `update_status` action with `archived` status
- Existing endpoint handles both archive and unarchive operations

### Components
- **Stream Component** (`components/streams/stream.tsx`):
  - Archive/unarchive functionality in actions dropdown
  - Visual styling for archived streams
  - Conditional action buttons based on stream status

- **Streams List** (`components/streams/streams-list.tsx`):
  - "Archived" status filter option
  - Visual indicators for archived streams
  - Archived streams section with toggle

- **Archived Streams** (`components/streams/archived-streams.tsx`):
  - Dedicated component for displaying archived streams
  - Bulk unarchive functionality
  - Empty state for no archived streams

### Utility Functions
- **Filter Functions** (`lib/utils/streams.tsx`):
  - Updated to support "archived" status in filtering
  - Maintains existing filtering logic

## User Experience

### Archiving a Stream
1. Navigate to the stream detail page
2. Click the "Actions" dropdown menu
3. Select "Archive Stream"
4. Stream is immediately archived and moved to archived section

### Viewing Archived Streams
1. On the streams list page, scroll to the bottom
2. Click "Show Archived" to expand the archived streams section
3. Archived streams are displayed with reduced visual prominence
4. Click "Hide Archived" to collapse the section

### Unarchiving a Stream
1. **From stream detail page**: Use the "Unarchive Stream" action
2. **From archived section**: Click the "Unarchive" button on any archived stream card
3. Stream is immediately restored to active status

### Filtering Archived Streams
1. Use the status filter dropdown
2. Select "Archived" to show only archived streams
3. Combine with other filters (search, priority, etc.)

## Benefits

1. **Clean Workspace**: Active streams are clearly separated from completed/archived ones
2. **Historical Preservation**: All stream data is preserved for future reference
3. **Easy Restoration**: Streams can be quickly unarchived if work resumes
4. **Flexible Organization**: Multiple ways to view and manage archived content
5. **Team Clarity**: Clear visual distinction between active and archived work

## Future Enhancements

Potential improvements that could be added:
- Bulk archive/unarchive operations
- Archive date tracking
- Archive reason/notes
- Automatic archiving based on completion status
- Archive retention policies
- Export archived stream data
