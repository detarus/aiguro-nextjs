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

    const apiUrl = `https://app.dev.aiguro.ru/api/organization/${orgId}/funnel/${funnelId}/dialog/${dialogUuid}/message`;
    console.log(
      `[POST /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]/message] Posting to: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    console.log(
      `[POST /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]/message] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[POST /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]/message] API error response:',
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

      console.error(
        `[POST /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]/message] Error: ${errorMessage}`
      );
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      '[POST /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]/message] Successfully posted message:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[POST /api/organization/[id]/funnel/[funnelId]/dialog/[dialogUuid]/message] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to post message' },
      { status: 500 }
    );
  }
}
