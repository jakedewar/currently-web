# Organization Management

This document outlines the organization management features that have been added to the Currently platform.

## Overview

The organization management system allows users to:
- Create and manage multiple organizations
- Invite team members to organizations
- Manage member roles and permissions
- Accept invitations to join organizations

## Features

### 1. Organization Management Page

**Location**: `/protected/organizations`

The organization management page provides a comprehensive interface for managing organizations:

- **Organization List**: View all organizations you're a member of
- **Organization Details**: See organization information, member count, and creation date
- **Create Organization**: Create new organizations with custom names and slugs
- **Member Management**: Add, view, and manage organization members
- **Invitation System**: Create and manage invitations for new members

### 2. Member Management

**Roles Available**:
- **Owner**: Full control over the organization, can manage all aspects
- **Admin**: Can manage members and invitations, but cannot delete the organization
- **Member**: Basic access to organization resources

**Member Operations**:
- Add new members by email address
- Assign roles during invitation
- View member list with roles and join dates
- Remove members (for admins and owners)

### 3. Invitation System

**Invitation Features**:
- Generate unique invitation codes
- Set expiration dates (1, 3, 7, 14, or 30 days)
- Email-based invitations
- Role assignment during invitation creation
- Copy invitation links to clipboard

**Invitation Status**:
- **Active**: Valid and can be used
- **Accepted**: Successfully used to join organization
- **Expired**: Past expiration date

### 4. Join Organization

**Location**: `/auth/join`

Users can join organizations using invitation codes:
- Enter invitation code manually
- Validate invitation before joining
- See organization details before accepting
- Automatic role assignment based on invitation

## API Endpoints

### Organizations

- `GET /api/organizations` - List user's organizations
- `POST /api/organizations` - Create new organization

### Organization Members

- `GET /api/organizations/[id]/members` - List organization members
- `POST /api/organizations/[id]/members` - Add member to organization

### Organization Invitations

- `GET /api/organizations/[id]/invitations` - List organization invitations
- `POST /api/organizations/[id]/invitations` - Create new invitation

### Invitation Management

- `POST /api/invitations/validate` - Validate invitation code
- `POST /api/invitations/accept` - Accept invitation and join organization

## Database Schema

### organization_invitations Table

```sql
CREATE TABLE organization_invitations (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    invitation_code TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_by UUID REFERENCES auth.users(id),
    accepted_by UUID REFERENCES auth.users(id),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## User Flow

### Creating an Organization

1. Navigate to `/protected/organizations`
2. Click "Create Organization"
3. Enter organization name and slug
4. Organization is created with user as owner

### Inviting Team Members

1. Select an organization from the list
2. Go to "Invitations" tab
3. Click "Create Invitation"
4. Enter email address and select role
5. Choose expiration period
6. Copy invitation link and share with team member

### Joining an Organization

1. User receives invitation link
2. Navigate to `/auth/join?code=INVITATION_CODE`
3. Validate invitation
4. Accept invitation to join organization
5. Redirected to dashboard

## Security Features

- **Row Level Security (RLS)**: Database-level security policies
- **Role-based Access Control**: Different permissions for different roles
- **Invitation Expiration**: Automatic expiration of unused invitations
- **Unique Invitation Codes**: Cryptographically secure invitation codes
- **Email Validation**: Invitations are tied to specific email addresses

## Integration with Existing Features

### Sign-up Flow

The sign-up form now supports joining organizations:
1. User can choose to create a new organization or join existing one
2. If joining, they enter an invitation code
3. Organization membership is established during account creation

### Navigation

- Organizations page added to main navigation
- Organization selector in sidebar includes link to management page
- Quick access to organization settings from dropdown menus

## Future Enhancements

Potential improvements for the organization management system:

1. **Bulk Invitations**: Invite multiple users at once
2. **Invitation Templates**: Customizable invitation messages
3. **Organization Settings**: Customize organization appearance and settings
4. **Member Activity**: Track member activity and engagement
5. **Advanced Permissions**: Granular permission system
6. **Organization Analytics**: Usage statistics and insights
7. **SSO Integration**: Single sign-on for enterprise organizations
8. **API Access**: Programmatic organization management

## Troubleshooting

### Common Issues

1. **Invitation Not Found**: Check if invitation code is correct and not expired
2. **Permission Denied**: Ensure user has appropriate role for the action
3. **Organization Creation Failed**: Verify organization name and slug are unique
4. **Member Addition Failed**: Check if user already exists and email is valid

### Database Migration

To set up the organization management system:

1. Run the migration: `supabase/migrations/20241202000000_create_organization_invitations.sql`
2. Verify RLS policies are active
3. Test invitation creation and acceptance

## Support

For issues with organization management features, check:
1. Database logs for RLS policy violations
2. API response codes and error messages
3. Browser console for client-side errors
4. Supabase dashboard for authentication issues
