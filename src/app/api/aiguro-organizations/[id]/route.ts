import { NextResponse, NextRequest } from 'next/server';
import { fetchAiguroServerToken } from '@/app/api/aiguro-token/route'; // Adjust path as needed
import { AiguroOrganizationApi } from '../handler'; // Assuming handler is in the parent directory

export async function DELETE(
  request: NextRequest, // request param is conventional, though not used for DELETE body here
  context: { params: { id: string } } // UPDATED: Use the explicit interface for the second argument
) {
  const organizationId = context.params.id; // UPDATED: Access id via context.params.id
  console.log(
    `[/api/aiguro-organizations/${organizationId} DELETE] Received request.`
  );

  if (!organizationId) {
    console.error(
      '[/api/aiguro-organizations/[id] DELETE] Organization ID is missing in path.'
    );
    return NextResponse.json(
      { error: 'Organization ID is required in the path.' },
      { status: 400 }
    );
  }

  const token = await fetchAiguroServerToken();
  if (!token) {
    console.error(
      `[/api/aiguro-organizations/${organizationId} DELETE] Authentication token missing.`
    );
    return NextResponse.json(
      { error: 'Authentication failed. Cannot delete organization.' },
      { status: 401 }
    );
  }
  console.log(
    `[/api/aiguro-organizations/${organizationId} DELETE] Token acquired. Attempting to delete organization.`
  );

  const success = await AiguroOrganizationApi.deleteOrganization(
    token,
    organizationId
  );

  if (success) {
    console.log(
      `[/api/aiguro-organizations/${organizationId} DELETE] Organization deleted successfully by API handler.`
    );
    // Return 200 with message, or 204 No Content if preferred and client handles it
    return NextResponse.json(
      { message: 'Organization deleted successfully.' },
      { status: 200 }
    );
  } else {
    console.error(
      `[/api/aiguro-organizations/${organizationId} DELETE] Failed to delete organization via API handler. Check handler logs.`
    );
    return NextResponse.json(
      { error: 'Failed to delete organization with the provider.' },
      { status: 502 }
    );
  }
}
