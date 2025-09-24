import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  // Extract the organization ID, funnel ID, and dialog UUID from the URL path
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const orgIdIndex = pathSegments.indexOf('organization') + 1;
  const funnelIdIndex = pathSegments.indexOf('funnel') + 1;
  const dialogUuidIndex = pathSegments.indexOf('dialog') + 2; // +2 because of 'test' in path
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
      '[POST /api/organization/[id]/funnel/[funnelId]/dialog/test/[dialogUuid]/message] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[POST /api/organization/[id]/funnel/[funnelId]/dialog/test/[dialogUuid]/message] Token received from __session cookie, sending test message.'
  );
  console.log(
    `[POST /api/organization/[id]/funnel/[funnelId]/dialog/test/[dialogUuid]/message] Request details - orgId: ${orgId}, funnelId: ${funnelId}, dialogUuid: ${dialogUuid}`
  );

  try {
    const requestBody = await request.json();
    console.log(
      '[POST /api/organization/[id]/funnel/[funnelId]/dialog/test/[dialogUuid]/message] Request body:',
      requestBody
    );

    // Ensure time is a valid ISO string if provided
    if (requestBody.time && typeof requestBody.time !== 'string') {
      requestBody.time = new Date().toISOString();
    }

    const apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/organization/${orgId}/funnel/${funnelId}/dialog/test/${dialogUuid}/message`;
    console.log(
      `[POST /api/organization/[id]/funnel/[funnelId]/dialog/test/[dialogUuid]/message] Posting to: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log(
      `[POST /api/organization/[id]/funnel/[funnelId]/dialog/test/[dialogUuid]/message] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[POST /api/organization/[id]/funnel/[funnelId]/dialog/test/[dialogUuid]/message] API error response:',
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
      '[POST /api/organization/[id]/funnel/[funnelId]/dialog/test/[dialogUuid]/message] Successfully sent test message:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[POST /api/organization/[id]/funnel/[funnelId]/dialog/test/[dialogUuid]/message] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to send test message' },
      { status: 500 }
    );
  }
}
