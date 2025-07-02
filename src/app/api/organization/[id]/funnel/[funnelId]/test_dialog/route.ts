import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
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
      '[POST /api/organization/[id]/funnel/[funnelId]/test_dialog] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[POST /api/organization/[id]/funnel/[funnelId]/test_dialog] Token received from __session cookie, creating test dialog.'
  );

  try {
    // Get the request body
    const requestBody = await request.json();
    console.log(
      '[POST /api/organization/[id]/funnel/[funnelId]/test_dialog] Request body:',
      requestBody
    );

    const apiUrl = `https://app.dev.aiguro.ru/api/organization/${orgId}/funnel/${funnelId}/test_dialog`;
    console.log(
      `[POST /api/organization/[id]/funnel/[funnelId]/test_dialog] Posting to: ${apiUrl}`
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
      `[POST /api/organization/[id]/funnel/[funnelId]/test_dialog] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[POST /api/organization/[id]/funnel/[funnelId]/test_dialog] API error response:',
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
      '[POST /api/organization/[id]/funnel/[funnelId]/test_dialog] Successfully created test dialog:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[POST /api/organization/[id]/funnel/[funnelId]/test_dialog] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to create test dialog' },
      { status: 500 }
    );
  }
}
