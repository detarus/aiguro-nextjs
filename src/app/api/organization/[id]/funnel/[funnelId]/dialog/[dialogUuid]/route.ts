import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function DELETE(request: NextRequest) {
  // Extract the organization ID, funnel ID, and dialog UUID from the URL path
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const orgIdIndex = pathSegments.indexOf('organization') + 1;
  const funnelIdIndex = pathSegments.indexOf('funnel') + 1;
  const dialogUuidIndex = pathSegments.indexOf('dialog') + 1;
  const orgId = pathSegments[orgIdIndex];
  const funnelId = pathSegments[funnelIdIndex];
  const dialogUuid = pathSegments[dialogUuidIndex];

  if (!orgId) {
    return NextResponse.json(
      { error: 'Organization ID not found in URL' },
      { status: 400 }
    );
  }

  if (!funnelId) {
    return NextResponse.json(
      { error: 'Funnel ID not found in URL' },
      { status: 400 }
    );
  }

  if (!dialogUuid) {
    return NextResponse.json(
      { error: 'Dialog UUID not found in URL' },
      { status: 400 }
    );
  }

  const token = getClerkTokenFromCookie(request);
  if (!token) {
    console.error(
      '[DELETE /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[DELETE /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]] Token received from __session cookie, deleting dialog.'
  );

  try {
    const apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/organization/${orgId}/funnel/${funnelId}/dialog/${dialogUuid}`;
    console.log(
      `[DELETE /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]] Deleting from: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    console.log(
      `[DELETE /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[DELETE /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]] API error response:',
          errorData
        );

        if (errorData.error) {
          errorMessage = errorData.error;
        } else {
          errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
        }
      } catch (parseError) {
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = `${errorMessage}\nServer response: ${errorText}`;
          }
        } catch (textError) {
          errorMessage = `${errorMessage}\nUnable to read server response`;
        }
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // For DELETE requests, the response might be empty
    let data = null;
    try {
      const responseText = await response.text();
      if (responseText) {
        data = JSON.parse(responseText);
      }
    } catch (parseError) {
      // If response is empty or not JSON, that's fine for DELETE
      data = { message: 'Dialog deleted successfully' };
    }

    console.log(
      '[DELETE /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]] Successfully deleted dialog:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[DELETE /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to delete dialog' },
      { status: 500 }
    );
  }
}
