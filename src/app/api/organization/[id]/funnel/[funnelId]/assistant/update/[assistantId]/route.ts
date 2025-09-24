import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function PUT(request: NextRequest) {
  // Extract the organization ID, funnel ID, and assistant ID from the URL path
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const orgIdIndex = pathSegments.indexOf('organization') + 1;
  const funnelIdIndex = pathSegments.indexOf('funnel') + 1;
  const updateIndex = pathSegments.indexOf('update') + 1;
  const orgId = pathSegments[orgIdIndex];
  const funnelId = pathSegments[funnelIdIndex];
  const assistantId = pathSegments[updateIndex];

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

  if (!assistantId) {
    return NextResponse.json(
      { error: 'Assistant ID not found in URL' },
      { status: 400 }
    );
  }

  const token = getClerkTokenFromCookie(request);
  if (!token) {
    console.error(
      '[PUT /api/organization/[id]/funnel/[funnelId]/assistant/[assistantId]] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[PUT /api/organization/[id]/funnel/[funnelId]/assistant/[assistantId]] Token received from __session cookie, updating assistant.'
  );
  console.log(
    `[PUT /api/organization/[id]/funnel/[funnelId]/assistant/[assistantId]] Request details - orgId: ${orgId}, funnelId: ${funnelId}, assistantId: ${assistantId}`
  );

  try {
    const body = await request.json();
    console.log(
      '[PUT /api/organization/[id]/funnel/[funnelId]/assistant/[assistantId]] Request body:',
      body
    );

    const apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/organization/${orgId}/funnel/${funnelId}/assistant/${assistantId}`;
    console.log(
      `[PUT /api/organization/[id]/funnel/[funnelId]/assistant/[assistantId]] Putting to: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    console.log(
      `[PUT /api/organization/[id]/funnel/[funnelId]/assistant/[assistantId]] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[PUT /api/organization/[id]/funnel/[funnelId]/assistant/[assistantId]] API error response:',
          errorData
        );

        if (errorData.error) {
          errorMessage = errorData.error;
        } else {
          errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(
            errorData
          )}`;
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
      '[PUT /api/organization/[id]/funnel/[funnelId]/assistant/[assistantId]] Successfully updated assistant:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[PUT /api/organization/[id]/funnel/[funnelId]/assistant/[assistantId]] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to update assistant' },
      { status: 500 }
    );
  }
}
