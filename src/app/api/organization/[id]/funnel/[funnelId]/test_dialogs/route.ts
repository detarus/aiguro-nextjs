import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  // Extract the organization ID and funnel ID from the URL path
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const orgIdIndex = pathSegments.indexOf('organization') + 1;
  const funnelIdIndex = pathSegments.indexOf('funnel') + 1;
  const orgId = pathSegments[orgIdIndex];
  const funnelId = pathSegments[funnelIdIndex];

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

  const token = getClerkTokenFromCookie(request);
  if (!token) {
    console.error(
      '[GET /api/organization/[id]/funnel/[funnelId]/test_dialogs] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[GET /api/organization/[id]/funnel/[funnelId]/test_dialogs] Token received from __session cookie, fetching test dialogs.'
  );
  console.log(
    `[GET /api/organization/[id]/funnel/[funnelId]/test_dialogs] Request details - orgId: ${orgId}, funnelId: ${funnelId}`
  );

  try {
    const apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/organization/${orgId}/funnel/${funnelId}/dialogs/test`;
    console.log(
      `[GET /api/organization/[id]/funnel/[funnelId]/test_dialogs] Fetching from: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    console.log(
      `[GET /api/organization/[id]/funnel/[funnelId]/test_dialogs] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[GET /api/organization/[id]/funnel/[funnelId]/test_dialogs] API error response:',
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

    const data = await response.json();
    console.log(
      '[GET /api/organization/[id]/funnel/[funnelId]/test_dialogs] Successfully fetched test dialogs:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[GET /api/organization/[id]/funnel/[funnelId]/test_dialogs] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to fetch test dialogs' },
      { status: 500 }
    );
  }
}
