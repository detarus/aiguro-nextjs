import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  // Extract the organization ID from the URL path
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const orgIdIndex = pathSegments.indexOf('organization') + 1;
  const orgId = pathSegments[orgIdIndex];

  if (!orgId) {
    return NextResponse.json(
      { error: 'Organization ID not found in URL' },
      { status: 400 }
    );
  }

  const token = getClerkTokenFromCookie(request);
  if (!token) {
    console.error(
      '[GET /api/organization/[id]/funnels] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[GET /api/organization/[id]/funnels] Token received from __session cookie, fetching funnels.'
  );

  try {
    const apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/organization/${orgId}/funnels`;
    console.log(
      `[GET /api/organization/[id]/funnels] Fetching from: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    console.log(
      `[GET /api/organization/[id]/funnels] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorDetails = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error(
          '[GET /api/organization/[id]/funnels] Error response JSON:',
          errorData
        );
        errorDetails =
          errorData.error ||
          errorData.message ||
          errorData.detail ||
          JSON.stringify(errorData);
      } catch (jsonError) {
        try {
          const errorText = await response.text();
          console.error(
            '[GET /api/organization/[id]/funnels] Error response text:',
            errorText
          );
          errorDetails = errorText || errorDetails;
        } catch (textError) {
          console.error(
            '[GET /api/organization/[id]/funnels] Could not read error response'
          );
        }
      }

      return NextResponse.json(
        { error: errorDetails },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      '[GET /api/organization/[id]/funnels] Successfully fetched funnels:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[GET /api/organization/[id]/funnels] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to fetch funnels data' },
      { status: 500 }
    );
  }
}
