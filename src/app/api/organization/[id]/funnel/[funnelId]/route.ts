import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
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
      '[GET /api/organization/[id]/funnel/[funnelId]] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[GET /api/organization/[id]/funnel/[funnelId]] Token received from __session cookie, fetching funnel.'
  );

  try {
    const apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/organization/${orgId}/funnel/${funnelId}`;
    console.log(
      `[GET /api/organization/[id]/funnel/[funnelId]] Fetching from: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    console.log(
      `[GET /api/organization/[id]/funnel/[funnelId]] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[GET /api/organization/[id]/funnel/[funnelId]] API error response:',
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
      '[GET /api/organization/[id]/funnel/[funnelId]] Successfully fetched funnel:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[GET /api/organization/[id]/funnel/[funnelId]] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to fetch funnel data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
      '[PUT /api/organization/[id]/funnel/[funnelId]] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[PUT /api/organization/[id]/funnel/[funnelId]] Token received from __session cookie, updating funnel.'
  );

  try {
    const body = await request.json();
    console.log(
      '[PUT /api/organization/[id]/funnel/[funnelId]] Request body:',
      body
    );

    // Validate required fields
    if (!body.display_name) {
      return NextResponse.json(
        { error: 'display_name is required' },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/organization/${orgId}/funnel/${funnelId}`;
    console.log(
      `[PUT /api/organization/[id]/funnel/[funnelId]] Updating at: ${apiUrl}`
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
      `[PUT /api/organization/[id]/funnel/[funnelId]] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[PUT /api/organization/[id]/funnel/[funnelId]] API error response:',
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
      '[PUT /api/organization/[id]/funnel/[funnelId]] Successfully updated funnel:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[PUT /api/organization/[id]/funnel/[funnelId]] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to update funnel' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
      '[DELETE /api/organization/[id]/funnel/[funnelId]] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[DELETE /api/organization/[id]/funnel/[funnelId]] Token received from __session cookie, deleting funnel.'
  );

  try {
    const apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/organization/${orgId}/funnel/${funnelId}`;
    console.log(
      `[DELETE /api/organization/[id]/funnel/[funnelId]] Deleting from: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    console.log(
      `[DELETE /api/organization/[id]/funnel/[funnelId]] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[DELETE /api/organization/[id]/funnel/[funnelId]] API error response:',
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

    // Для DELETE запроса может не быть JSON ответа, проверяем наличие контента
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        // Игнорируем ошибки парсинга для DELETE запросов
      }
    }

    console.log(
      '[DELETE /api/organization/[id]/funnel/[funnelId]] Successfully deleted funnel:',
      data
    );
    return NextResponse.json(
      { message: 'Funnel deleted successfully', data },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      '[DELETE /api/organization/[id]/funnel/[funnelId]] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to delete funnel' },
      { status: 500 }
    );
  }
}
