import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function POST(
  request: NextRequest,
  {
    params
  }: { params: Promise<{ id: string; funnelId: string; dialogUuid: string }> }
) {
  const { id: orgId, funnelId, dialogUuid } = await params;

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
    return NextResponse.json(
      { error: 'Authorization token not found' },
      { status: 401 }
    );
  }

  console.log(
    `[POST /api/organization/[id]/funnel/[funnelId]/dialog/test-stage/[dialogUuid]/message] Request details - orgId: ${orgId}, funnelId: ${funnelId}, dialogUuid: ${dialogUuid}`
  );

  try {
    // Parse request body
    const body = await request.json();
    console.log(
      `[POST /api/organization/[id]/funnel/[funnelId]/dialog/test-stage/[dialogUuid]/message] Request body:`,
      body
    );

    // Validate required fields
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'text is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.role || typeof body.role !== 'string') {
      return NextResponse.json(
        { error: 'role is required and must be a string' },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/organization/${orgId}/funnel/${funnelId}/dialog/test-stage/${dialogUuid}/message`;
    console.log(
      `[POST /api/organization/[id]/funnel/[funnelId]/dialog/test-stage/[dialogUuid]/message] Posting to: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        text: body.text,
        role: body.role
      })
    });

    console.log(
      `[POST /api/organization/[id]/funnel/[funnelId]/dialog/test-stage/[dialogUuid]/message] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[POST /api/organization/[id]/funnel/[funnelId]/dialog/test-stage/[dialogUuid]/message] API error response:',
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
      '[POST /api/organization/[id]/funnel/[funnelId]/dialog/test-stage/[dialogUuid]/message] Successfully sent test stage message:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[POST /api/organization/[id]/funnel/[funnelId]/dialog/test-stage/[dialogUuid]/message] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to send test stage message' },
      { status: 500 }
    );
  }
}
