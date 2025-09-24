import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
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
      '[POST /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]/message] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[POST /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]/message] Token received from __session cookie, posting message.'
  );

  try {
    const body = await request.json();
    console.log(
      '[POST /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]/message] Request body:',
      body
    );

    // Validate request body
    if (!body.text || !body.role) {
      return NextResponse.json(
        { error: 'Missing required fields: text and role' },
        { status: 400 }
      );
    }

    // Ensure time is a valid ISO string if provided
    if (body.time && typeof body.time !== 'string') {
      body.time = new Date().toISOString();
    }

    const apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/organization/${orgId}/funnel/${funnelId}/dialog/${dialogUuid}/message`;

    console.log(`[PROXY] Sending POST to external backend: ${apiUrl}`);
    const startTime = performance.now();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    console.log(
      `[PROXY] External backend POST request took ${duration}ms. Status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(`[PROXY] API error response from ${apiUrl}:`, errorData);
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
    console.error('[PROXY] Unexpected error in message route:', error);
    return NextResponse.json(
      { error: 'Failed to post message' },
      { status: 500 }
    );
  }
}
