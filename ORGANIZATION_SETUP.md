# Organization Creation Setup

## Overview
This implementation automatically creates backend organizations when users create new organizations in Clerk, and stores the backend organization ID in Clerk's public metadata.

## Backend Integration

The system automatically sends POST requests to the Aiguro backend API:
- **Endpoint**: `https://app.dev.aiguro.ru/api/organization`
- **Method**: POST
- **Content-Type**: application/json
- **Authorization**: Bearer token from Clerk session cookie

The system uses the `getClerkTokenFromCookie()` function to extract the authentication token from the `__session` cookie and includes it as a Bearer token in the Authorization header.

## How It Works

1. **Organization Guard**: Forces users to select/create an organization before accessing the dashboard
2. **Organization Creation Detection**: Automatically detects when new organizations are created
3. **Backend Integration**: Sends POST request to Aiguro API with `{ display_name, is_active }`
4. **Response Processing**: Extracts `id` from Aiguro response `{ id, display_name, is_active }`
5. **Metadata Update**: Stores the `id` as `id_backend` in Clerk's organization public metadata

## Metadata Storage

After successful organization creation, the Aiguro organization ID is stored in Clerk:

```json
{
  "publicMetadata": {
    "id_backend": "123"
  }
}
```

This allows you to link Clerk organizations with Aiguro backend organizations.

## API Endpoints

### POST `/api/organizations`
Creates a new organization in the backend and updates Clerk metadata.

**Request Body:**
```json
{
  "display_name": "Company Name",
  "is_active": true
}
```

**Aiguro API Response (Status 200):**
```json
{
  "id": 0,
  "display_name": "string",
  "is_active": true
}
```

**Our API Response:**
```json
{
  "success": true,
  "backendOrgId": 0,
  "clerkOrgId": "org_clerk_id_here",
  "message": "Organization created successfully"
}
```

## Components

- `OrganizationGuard`: Ensures users have an active organization
- `OrganizationCreationProvider`: Handles organization creation events
- `OrganizationDebug`: Shows organization information for debugging

## Testing

1. Sign in to the application
2. If no organization exists, you'll see a modal to create/select one
3. Create a new organization
4. Check the console logs for backend organization creation
5. View the debug component to see the backend ID in metadata

## Console Logs

When creating an organization, you'll see detailed logging:

**Frontend (Organization Detection):**
```
🏢 New organization detected: [Name] ID: [Clerk ID]
🚀 Creating organization in backend...
✅ Organization creation successful!
📊 Backend organization ID: [Backend ID]
🔗 Clerk organization ID: [Clerk ID]
```

**Backend API (Detailed Request/Response):**
```
[/api/organizations POST] Token received from __session cookie.
🚀 Attempting to create organization in Aiguro backend...
📤 Request data: { url, method, body: { display_name, is_active }, clerkOrgId, userId, hasToken: true }
📥 Backend response status: 200
📥 Backend response headers: { ... }
✅ Backend response data: { id: 123, display_name: "Company Name", is_active: true }
🎯 Extracted backend organization ID: 123
Backend organization created with ID: 123
Clerk organization metadata updated with backend ID: 123
```

**Error Logging (if issues occur):**
```
❌ Backend API error response: [Error details]
❌ Error calling Aiguro backend: [Error]
❌ Error details: { message, stack }
``` 