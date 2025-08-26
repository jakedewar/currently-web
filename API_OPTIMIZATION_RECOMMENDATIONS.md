# API Call Optimization Recommendations

## Current Issues Identified

### 1. **Stream Data Duplication**
- **Problem**: Stream data is fetched multiple times across different endpoints
- **Impact**: Redundant API calls when navigating between streams list and individual streams
- **Current Flow**:
  - `/api/streams` → Fetches all streams with members, work items, tools
  - `/api/streams/[id]` → Fetches individual stream with same related data
  - `/api/dashboard` → Fetches streams (limited to 10) and work items

### 2. **User Data Redundancy**
- **Problem**: User information fetched multiple times across endpoints
- **Impact**: Unnecessary API calls for user profiles
- **Current Flow**:
  - Stream endpoints fetch user details for members
  - Users endpoint fetches user profiles
  - Dashboard fetches user details for activity

### 3. **Organization Membership Validation**
- **Problem**: Every API endpoint performs the same membership check
- **Impact**: Redundant database queries
- **Current Pattern**: Repeated in multiple API routes

### 4. **Dashboard Data Overlap**
- **Problem**: Dashboard fetches data already available through other endpoints
- **Impact**: Duplicate data fetching
- **Current Flow**: Dashboard API fetches streams and work items that could be derived

## Optimization Solutions Implemented

### 1. **Enhanced React Query Hooks**

#### `useStreams` Hook Improvements
```typescript
// Added refetch intervals and background refetch control
refetchInterval: 30 * 1000, // Refetch every 30 seconds
refetchIntervalInBackground: false, // Only refetch when tab is active
```

#### New `useStreamFromList` Hook
```typescript
// Leverages existing streams cache instead of making new API calls
export function useStreamFromList(streamId: string | undefined, organizationId: string | undefined) {
  const { data: streamsData } = useStreams(organizationId)
  const stream = streamsData?.streams.find(s => s.id === streamId)
  return { data: stream ? { stream, currentUser: streamsData.currentUser } : null }
}
```

### 2. **Shared User Cache**

#### New User Hooks
```typescript
// Individual user fetching with better caching
export function useUserById(userId: string | undefined, organizationId: string | undefined)

// User data from existing users list cache
export function useUserFromList(userId: string | undefined, organizationId: string | undefined)
```

### 3. **Optimized Dashboard Data**

#### Enhanced Dashboard Hook
```typescript
// Reduced refetch frequency and added derived stats
refetchInterval: 60 * 1000, // Refetch every minute instead of 30 seconds
```

### 4. **Shared API Client with Caching**

#### New `lib/api-client.ts`
- In-memory caching with TTL
- Prefetch capabilities
- Convenience methods for common API calls
- Automatic cache invalidation

### 5. **Organization Context Optimization**

#### New Organization Hooks
```typescript
// Shared membership validation
export function useOrganizationMembership(organizationId: string | undefined)

// Data prefetching when organization changes
export function useOrganizationPrefetch()
```

## Implementation Recommendations

### 1. **Update Components to Use New Hooks**

#### Stream Page Optimization
```typescript
// Instead of separate API call, use cached data
const { data: streamData } = useStreamFromList(streamId, organizationId)

// Fallback to individual API call if not in cache
const { data: individualStreamData } = useStream(streamId)
```

#### User Profile Optimization
```typescript
// Use cached user data when possible
const { data: user } = useUserFromList(userId, organizationId)

// Fallback to individual user API
const { data: individualUser } = useUserById(userId, organizationId)
```

### 2. **API Route Consolidation**

#### Consider Creating Combined Endpoints
```typescript
// Instead of separate calls, create a combined endpoint
GET /api/organization/{id}/overview
// Returns: streams, users, dashboard stats in one call
```

### 3. **Database Query Optimization**

#### Reduce Redundant Queries
```typescript
// Cache organization membership at the session level
// Use database views for common data combinations
// Implement proper indexing for frequently queried fields
```

### 4. **Caching Strategy**

#### Implement Multi-Level Caching
1. **Browser Cache**: API client with TTL
2. **React Query Cache**: Component-level caching
3. **Server-Side Cache**: Redis for frequently accessed data

## Expected Performance Improvements

### 1. **Reduced API Calls**
- **Before**: 3-5 API calls per page navigation
- **After**: 1-2 API calls with cache hits

### 2. **Faster Page Loads**
- **Before**: 500-1000ms for stream navigation
- **After**: 100-200ms with cached data

### 3. **Better User Experience**
- Instant navigation between cached streams
- Reduced loading states
- Smoother transitions

### 4. **Reduced Server Load**
- Fewer database queries
- Lower bandwidth usage
- Better scalability

## Next Steps

### 1. **Immediate Actions**
- [ ] Update stream pages to use `useStreamFromList`
- [ ] Implement user data caching in components
- [ ] Add prefetching for common navigation paths

### 2. **Medium-term Improvements**
- [ ] Create combined API endpoints for dashboard data
- [ ] Implement server-side caching with Redis
- [ ] Add database query optimization

### 3. **Long-term Optimizations**
- [ ] Implement real-time updates with WebSockets
- [ ] Add offline support with service workers
- [ ] Optimize database schema for common query patterns

## Monitoring and Metrics

### 1. **Track API Call Reduction**
- Monitor API call frequency before/after changes
- Measure cache hit rates
- Track page load performance

### 2. **User Experience Metrics**
- Time to interactive
- Navigation speed between pages
- User engagement metrics

### 3. **Server Performance**
- Database query count
- Response times
- Server resource usage
