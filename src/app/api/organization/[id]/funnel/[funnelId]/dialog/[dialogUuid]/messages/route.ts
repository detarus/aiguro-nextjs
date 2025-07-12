import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
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
      '[GET /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]/messages] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[GET /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]/messages] Token received from __session cookie, fetching dialog messages.'
  );

  try {
    const apiUrl = `https://app.dev.aiguro.ru/api/organization/${orgId}/funnel/${funnelId}/dialog/${dialogUuid}/messages`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error('[PROXY] API error response on GET messages:', errorData);
        errorMessage = errorData.error || JSON.stringify(errorData);
      } catch (e) {
        errorMessage = `${errorMessage}\nUnable to parse error response body.`;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[PROXY] Unexpected error in get-messages route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dialog messages' },
      { status: 500 }
    );
  }
}
