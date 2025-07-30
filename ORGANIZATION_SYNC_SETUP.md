# Organization Synchronization Setup

## Overview
This implementation provides comprehensive organization synchronization between Clerk and the Aiguro backend. It automatically handles organization creation, switching, and ensures that every Clerk organization has a corresponding backend organization with the backend ID stored in Clerk's metadata.

## Key Features

### 1. Automatic Organization Creation
- **Trigger**: When user creates a new organization from Clerk menu
- **Action**: Automatically creates corresponding organization in Aiguro backend
- **Result**: Backend ID is stored in Clerk organization's public metadata

### 2. Organization Switching with Backend ID Check
- **Trigger**: When user switches to a different organization
- **Action**: Checks if the organization has a backend ID
- **Result**: If no backend ID exists, creates organization in backend and updates metadata

### 3. Debug Tools
- **Check Backend ID**: Debug method to verify if Clerk organization has backend ID
- **Organization Switch Handler**: Component that monitors organization changes
- **Comprehensive Logging**: Detailed console logs for debugging

## API Endpoints

### POST `/api/organizations`
Creates a new organization in the backend and updates Clerk metadata.

**Request Body:**
```json
{
  "organizationName": "Company Name",
  "clerkOrgId": "org_2abc123def456ghi789"
}
```

**Response:**
```json
{
  "success": true,
  "backendOrgId": 123,
  "clerkOrgId": "org_2abc123def456ghi789",
  "message": "Organization created successfully"
}
```

### POST `/api/organizations/switch`
Handles organization switching and ensures backend ID exists.

**Request Body:**
```json
{
  "clerkOrgId": "org_2abc123def456ghi789"
}
```

**Response:**
```json
{
  "success": true,
  "clerkOrgId": "org_2abc123def456ghi789",
  "backendOrgId": 123,
  "organizationName": "Company Name",
  "message": "Organization created in backend and metadata updated"
}
```

### GET `/api/organizations/check-backend-id`
Checks if a Clerk organization has a backend ID set.

**Query Parameters:**
- `clerkOrgId`: The Clerk organization ID to check

**Response:**
```json
{
  "success": true,
  "clerkOrgId": "org_2abc123def456ghi789",
  "hasBackendId": true,
  "backendId": "123",
  "organizationName": "Company Name"
}
```

## Components and Hooks

### OrganizationCreationProvider
- **Location**: `src/contexts/OrganizationCreationContext.tsx`
- **Purpose**: Handles organization creation events and provides context
- **Features**: 
  - Detects new organization creation
  - Calls backend API to create organization
  - Updates Clerk metadata with backend ID

### OrganizationSwitchHandler
- **Location**: `src/components/organization-switch-handler.tsx`
- **Purpose**: Monitors organization switching and ensures backend ID exists
- **Features**:
  - Uses `useOrganizationSwitch` hook
  - Automatically handles organization switching
  - Creates backend organization if needed

### useOrganizationSwitch Hook
- **Location**: `src/hooks/useOrganizationSwitch.ts`
- **Purpose**: Hook for handling organization switching logic
- **Features**:
  - Tracks organization changes
  - Checks for backend ID existence
  - Creates backend organization if missing

### OrganizationDebug Component
- **Location**: `src/components/organization-debug.tsx`
- **Purpose**: Debug interface for organization information
- **Features**:
  - Displays organization details
  - "Check if Clerk has Backend ID" button
  - Shows backend ID check results
  - Displays full metadata

## How It Works

### 1. Organization Creation Flow
```
User creates organization in Clerk
    ↓
OrganizationCreationProvider detects new organization
    ↓
Checks if organization has backend ID
    ↓
If no backend ID: Calls /api/organizations
    ↓
Creates organization in Aiguro backend
    ↓
Updates Clerk metadata with backend ID
    ↓
Organization is ready for use
```

### 2. Organization Switching Flow
```
User switches to different organization
    ↓
OrganizationSwitchHandler detects change
    ↓
Checks if organization has backend ID
    ↓
If no backend ID: Calls /api/organizations/switch
    ↓
Creates organization in Aiguro backend
    ↓
Updates Clerk metadata with backend ID
    ↓
Organization switch is complete
```

### 3. Debug Flow
```
User clicks "Check if Clerk has Backend ID"
    ↓
Calls /api/organizations/check-backend-id
    ↓
Returns organization status
    ↓
Displays result in debug interface
```

## Integration Points

### Dashboard Layout
The dashboard layout includes the `OrganizationSwitchHandler` component:
```tsx
<OrganizationGuard>
  <OrganizationCreationProvider>
    <OrganizationSwitchHandler />
    {/* Rest of dashboard */}
  </OrganizationCreationProvider>
</OrganizationGuard>
```

### Debug Page
The debug page includes the `OrganizationDebug` component with the new backend ID check functionality.

## Console Logs

### Organization Creation
```
🏢 New organization detected: [Name] ID: [Clerk ID]
🚀 Creating organization in backend...
✅ Organization creation successful!
📊 Backend organization ID: [Backend ID]
🔗 Clerk organization ID: [Clerk ID]
```

### Organization Switching
```
🔄 Organization switch detected: [Name] ID: [Clerk ID]
🚀 Organization missing backend ID, creating in backend...
✅ Organization switch handled successfully!
📊 Backend organization ID: [Backend ID]
🔗 Clerk organization ID: [Clerk ID]
📝 Message: [Status message]
```

### Backend API Calls
```
[/api/organizations/switch POST] Token received from __session cookie.
🚀 Attempting to create organization in Aiguro backend...
📤 Request data: { url, method, body, clerkOrgId, userId, hasToken }
📥 Backend response status: 200
✅ Backend response data: { id, gid, display_name, is_active }
🎯 Extracted backend organization ID: [Backend ID]
✅ Clerk organization metadata updated with backend ID: [Backend ID]
```

## Testing

### 1. Organization Creation Test
1. Sign in to the application
2. Create a new organization through Clerk menu
3. Check console logs for backend creation
4. Verify backend ID appears in organization metadata

### 2. Organization Switching Test
1. Switch to an organization without backend ID
2. Check console logs for automatic backend creation
3. Verify backend ID is added to metadata
4. Switch to another organization and repeat

### 3. Debug Test
1. Navigate to `/dashboard/debug`
2. Click "Check if Clerk has Backend ID" button
3. Verify the result shows correct status
4. Check organization metadata display

## Error Handling

### Missing Authentication Token
- **Error**: "Authentication token is missing, cannot create organization"
- **Solution**: Ensure user is properly authenticated with Clerk

### Backend API Errors
- **Error**: "Backend API returned [status]: [error]"
- **Solution**: Check Aiguro backend status and API configuration

### Organization Not Found
- **Error**: "Failed to check backend ID"
- **Solution**: Verify Clerk organization ID is valid

## Configuration

### Environment Variables
Ensure these are properly configured:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- Aiguro backend API endpoint

### Backend API Configuration
- **Endpoint**: `https://app.dev.aiguro.ru/api/organization`
- **Method**: POST
- **Authentication**: Bearer token from Clerk session

## Troubleshooting

### Organization Not Creating in Backend
1. Check console logs for authentication errors
2. Verify Clerk token is being passed correctly
3. Check Aiguro backend API status
4. Verify organization name and ID are valid

### Backend ID Not Appearing in Metadata
1. Check if backend API call was successful
2. Verify Clerk metadata update call
3. Check for any permission issues with Clerk API
4. Refresh organization data to see updated metadata

### Debug Button Not Working
1. Check network tab for API call errors
2. Verify organization ID is being passed correctly
3. Check if user has proper permissions
4. Verify API endpoint is accessible 