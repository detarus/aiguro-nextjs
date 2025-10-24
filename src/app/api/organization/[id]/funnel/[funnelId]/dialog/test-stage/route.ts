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
    return NextResponse.json(
      { error: 'Authorization token not found' },
      { status: 401 }
    );
  }

  console.log(
    `[POST /api/organization/[id]/funnel/[funnelId]/dialog/test-stage] Request details - orgId: ${orgId}, funnelId: ${funnelId}`
  );

  try {
    // Parse request body
    const body = await request.json();
    console.log(
      `[POST /api/organization/[id]/funnel/[funnelId]/dialog/test-stage] Request body:`,
      body
    );

    // Validate required fields
    if (typeof body.stage_number !== 'number' || body.stage_number < 0) {
      return NextResponse.json(
        { error: 'stage_number must be a non-negative integer' },
        { status: 400 }
      );
    }

    if (!body.initial_message || typeof body.initial_message !== 'string') {
      return NextResponse.json(
        { error: 'initial_message is required and must be a string' },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/organization/${orgId}/funnel/${funnelId}/dialog/test-stage`;
    console.log(
      `[POST /api/organization/[id]/funnel/[funnelId]/dialog/test-stage] Posting to: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        stage_number: body.stage_number,
        initial_message: body.initial_message
      })
    });

    console.log(
      `[POST /api/organization/[id]/funnel/[funnelId]/dialog/test-stage] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[POST /api/organization/[id]/funnel/[funnelId]/dialog/test-stage] API error response:',
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
      '[POST /api/organization/[id]/funnel/[funnelId]/dialog/test-stage] Successfully created test stage dialog:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[POST /api/organization/[id]/funnel/[funnelId]/dialog/test-stage] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to create test stage dialog' },
      { status: 500 }
    );
  }
}
