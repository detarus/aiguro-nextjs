import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  {
    params
  }: { params: Promise<{ id: string; funnelId: string; stageNumber: string }> }
) {
  const { id: orgId, funnelId, stageNumber } = await params;

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

  if (!stageNumber) {
    return NextResponse.json(
      { error: 'Stage number not found in URL' },
      { status: 400 }
    );
  }

  // Validate stage number is a valid integer
  const stageNum = parseInt(stageNumber);
  if (isNaN(stageNum) || stageNum < 0) {
    return NextResponse.json(
      { error: 'Stage number must be a non-negative integer' },
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
    `[GET /api/organization/[id]/funnel/[funnelId]/dialog/test-stage-dialogs/[stageNumber]] Request details - orgId: ${orgId}, funnelId: ${funnelId}, stageNumber: ${stageNumber}`
  );

  try {
    const apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/organization/${orgId}/funnel/${funnelId}/dialog/test-stage/${stageNumber}`;
    console.log(
      `[GET /api/organization/[id]/funnel/[funnelId]/dialog/test-stage-dialogs/[stageNumber]] Fetching from: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    console.log(
      `[GET /api/organization/[id]/funnel/[funnelId]/dialog/test-stage-dialogs/[stageNumber]] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[GET /api/organization/[id]/funnel/[funnelId]/dialog/test-stage-dialogs/[stageNumber]] API error response:',
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
      '[GET /api/organization/[id]/funnel/[funnelId]/dialog/test-stage-dialogs/[stageNumber]] Successfully fetched test stage dialogs:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[GET /api/organization/[id]/funnel/[funnelId]/dialog/test-stage-dialogs/[stageNumber]] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to fetch test stage dialogs' },
      { status: 500 }
    );
  }
}
