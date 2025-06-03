import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  // Extract the organization ID, funnel ID, and code name from the URL path
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const orgIdIndex = pathSegments.indexOf('organization') + 1;
  const funnelIdIndex = pathSegments.indexOf('funnel') + 1;
  const codeNameIndex = pathSegments.indexOf('assistant') + 1;
  const orgId = pathSegments[orgIdIndex];
  const funnelId = pathSegments[funnelIdIndex];
  const codeName = pathSegments[codeNameIndex];

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

  if (!codeName) {
    return NextResponse.json(
      { error: 'Assistant code name not found in URL' },
      { status: 400 }
    );
  }

  const token = getClerkTokenFromCookie(request);
  if (!token) {
    console.error(
      '[GET /api/organization/[id]/funnel/[funnelId]/assistant/[codeName]] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[GET /api/organization/[id]/funnel/[funnelId]/assistant/[codeName]] Token received from __session cookie, fetching assistant.'
  );

  try {
    const apiUrl = `https://app.dev.aiguro.ru/api/organization/${orgId}/funnel/${funnelId}/assistant/${codeName}`;
    console.log(
      `[GET /api/organization/[id]/funnel/[funnelId]/assistant/[codeName]] Fetching from: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    console.log(
      `[GET /api/organization/[id]/funnel/[funnelId]/assistant/[codeName]] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[GET /api/organization/[id]/funnel/[funnelId]/assistant/[codeName]] API error response:',
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
      '[GET /api/organization/[id]/funnel/[funnelId]/assistant/[codeName]] Successfully fetched assistant:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[GET /api/organization/[id]/funnel/[funnelId]/assistant/[codeName]] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to fetch assistant' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Extract the organization ID, funnel ID, and code name from the URL path
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const orgIdIndex = pathSegments.indexOf('organization') + 1;
  const funnelIdIndex = pathSegments.indexOf('funnel') + 1;
  const codeNameIndex = pathSegments.indexOf('assistant') + 1;
  const orgId = pathSegments[orgIdIndex];
  const funnelId = pathSegments[funnelIdIndex];
  const codeName = pathSegments[codeNameIndex];

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

  if (!codeName) {
    return NextResponse.json(
      { error: 'Assistant code name not found in URL' },
      { status: 400 }
    );
  }

  const token = getClerkTokenFromCookie(request);
  if (!token) {
    console.error(
      '[DELETE /api/organization/[id]/funnel/[funnelId]/assistant/[codeName]] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[DELETE /api/organization/[id]/funnel/[funnelId]/assistant/[codeName]] Token received from __session cookie, deleting assistant.'
  );

  try {
    const apiUrl = `https://app.dev.aiguro.ru/api/organization/${orgId}/funnel/${funnelId}/assistant/${codeName}`;
    console.log(
      `[DELETE /api/organization/[id]/funnel/[funnelId]/assistant/[codeName]] Deleting from: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    console.log(
      `[DELETE /api/organization/[id]/funnel/[funnelId]/assistant/[codeName]] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[DELETE /api/organization/[id]/funnel/[funnelId]/assistant/[codeName]] API error response:',
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

    // For DELETE requests, the response might be empty
    let data = null;
    try {
      const responseText = await response.text();
      if (responseText) {
        data = JSON.parse(responseText);
      }
    } catch (parseError) {
      // If response is empty or not JSON, that's fine for DELETE
      data = { message: 'Assistant deleted successfully' };
    }

    console.log(
      '[DELETE /api/organization/[id]/funnel/[funnelId]/assistant/[codeName]] Successfully deleted assistant:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[DELETE /api/organization/[id]/funnel/[funnelId]/assistant/[codeName]] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to delete assistant' },
      { status: 500 }
    );
  }
}
