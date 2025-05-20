import { NextResponse, NextRequest } from 'next/server';
import { fetchAiguroServerToken } from '@/app/api/aiguro-token/route'; // Adjust path as needed
import { AiguroOrganizationApi } from '../handler'; // Assuming handler is in the parent directory

export async function DELETE(
  request: NextRequest // Only one argument
) {
  const pathname = request.nextUrl.pathname;
  // Extract the last segment of the path, e.g., 'org-id' from '/api/aiguro-organizations/org-id'
  const segments = pathname.split('/').filter(Boolean); // filter(Boolean) removes empty strings from leading/trailing slashes
  const organizationId = segments.pop(); // Get the last segment

  // Check if organizationId was successfully extracted
  if (!organizationId) {
    console.error(
      '[/api/aiguro-organizations/[id] DELETE] Could not extract Organization ID from path.'
    );
    return NextResponse.json(
      { error: 'Organization ID could not be determined from the path.' },
      { status: 400 }
    );
  }

  console.log(
    `[/api/aiguro-organizations/${organizationId} DELETE] Received request.`
  );

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
