import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  // Extract the organization ID and client ID from the URL path
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const orgIdIndex = pathSegments.indexOf('organization') + 1;
  const clientIdIndex = pathSegments.indexOf('client') + 1;
  const orgId = pathSegments[orgIdIndex];
  const clientId = pathSegments[clientIdIndex];

  if (!orgId) {
    return NextResponse.json(
      { error: 'Organization ID not found in URL' },
      { status: 400 }
    );
  }

  if (!clientId) {
    return NextResponse.json(
      { error: 'Client ID not found in URL' },
      { status: 400 }
    );
  }

  const token = getClerkTokenFromCookie(request);
  if (!token) {
    console.error(
      '[GET /api/organization/[id]/client/[clientId]] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[GET /api/organization/[id]/client/[clientId]] Token received from __session cookie, fetching client.'
  );

  try {
    const apiUrl = `https://app.dev.aiguro.ru/api/organization/${orgId}/client/${clientId}`;
    console.log(
      `[GET /api/organization/[id]/client/[clientId]] Fetching from: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    console.log(
      `[GET /api/organization/[id]/client/[clientId]] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[GET /api/organization/[id]/client/[clientId]] API error response:',
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
      '[GET /api/organization/[id]/client/[clientId]] Successfully fetched client:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[GET /api/organization/[id]/client/[clientId]] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Extract the organization ID and client ID from the URL path
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const orgIdIndex = pathSegments.indexOf('organization') + 1;
  const clientIdIndex = pathSegments.indexOf('client') + 1;
  const orgId = pathSegments[orgIdIndex];
  const clientId = pathSegments[clientIdIndex];

  console.log('=== PUT /api/organization/[id]/client/[clientId] ===');
  console.log('URL:', url.toString());
  console.log('Path segments:', pathSegments);
  console.log('Organization ID:', orgId);
  console.log('Client ID:', clientId);

  if (!orgId) {
    console.error('Organization ID not found in URL');
    return NextResponse.json(
      { error: 'Organization ID not found in URL' },
      { status: 400 }
    );
  }

  if (!clientId) {
    console.error('Client ID not found in URL');
    return NextResponse.json(
      { error: 'Client ID not found in URL' },
      { status: 400 }
    );
  }

  const token = getClerkTokenFromCookie(request);
  if (!token) {
    console.error(
      '[PUT /api/organization/[id]/client/[clientId]] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[PUT /api/organization/[id]/client/[clientId]] Token received from __session cookie, updating client.'
  );

  try {
    // Get request body as text first for debugging
    const bodyText = await request.text();
    console.log('Raw request body:', bodyText);
    console.log('Request body length:', bodyText.length);

    // Parse the body as JSON
    let body;
    try {
      body = JSON.parse(bodyText);
      console.log('Parsed request body:', body);
    } catch (e) {
      console.error('Failed to parse request body as JSON:', e);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Check required fields
    if (!body.name) {
      console.error('Missing required field: name');
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    // Ensure all fields are strings
    const sanitizedBody = {
      name: String(body.name || ''),
      phone: String(body.phone || ''),
      email: String(body.email || ''),
      manager: String(body.manager || '')
    };

    console.log('Sanitized request body:', sanitizedBody);

    const apiUrl = `https://app.dev.aiguro.ru/api/organization/${orgId}/client/${clientId}`;
    console.log(
      `[PUT /api/organization/[id]/client/[clientId]] Updating client at: ${apiUrl}`
    );
    console.log('Request body to backend:', sanitizedBody);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(sanitizedBody)
    });

    console.log(
      `[PUT /api/organization/[id]/client/[clientId]] Response status: ${response.status}`
    );
    console.log('Response headers:', {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length')
    });

    // Get response as text first for debugging
    const responseText = await response.text();
    console.log('Raw response body:', responseText);
    console.log('Response body length:', responseText.length);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        // Try to parse the response text as JSON
        const errorData = responseText ? JSON.parse(responseText) : {};
        console.error(
          '[PUT /api/organization/[id]/client/[clientId]] API error response:',
          errorData
        );

        if (errorData.error) {
          errorMessage = errorData.error;
        } else {
          errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
        }
      } catch (parseError) {
        console.error('Failed to parse error response as JSON:', parseError);
        errorMessage = `${errorMessage}\nServer response: ${responseText}`;
      }

      console.error('Returning error to client:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Try to parse the response text as JSON
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
      console.log(
        '[PUT /api/organization/[id]/client/[clientId]] Successfully parsed response:',
        data
      );
    } catch (parseError) {
      console.error('Failed to parse success response as JSON:', parseError);
      // Create a simple success response if parsing fails
      data = {
        success: true,
        message: 'Client updated successfully',
        clientId,
        orgId
      };
    }

    console.log(
      '[PUT /api/organization/[id]/client/[clientId]] Successfully updated client:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[PUT /api/organization/[id]/client/[clientId]] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Extract the organization ID and client ID from the URL path
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const orgIdIndex = pathSegments.indexOf('organization') + 1;
  const clientIdIndex = pathSegments.indexOf('client') + 1;
  const orgId = pathSegments[orgIdIndex];
  const clientId = pathSegments[clientIdIndex];

  if (!orgId) {
    return NextResponse.json(
      { error: 'Organization ID not found in URL' },
      { status: 400 }
    );
  }

  if (!clientId) {
    return NextResponse.json(
      { error: 'Client ID not found in URL' },
      { status: 400 }
    );
  }

  const token = getClerkTokenFromCookie(request);
  if (!token) {
    console.error(
      '[DELETE /api/organization/[id]/client/[clientId]] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[DELETE /api/organization/[id]/client/[clientId]] Token received from __session cookie, deleting client.'
  );

  try {
    const apiUrl = `https://app.dev.aiguro.ru/api/organization/${orgId}/client/${clientId}`;
    console.log(
      `[DELETE /api/organization/[id]/client/[clientId]] Deleting client at: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    console.log(
      `[DELETE /api/organization/[id]/client/[clientId]] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error(
          '[DELETE /api/organization/[id]/client/[clientId]] API error response:',
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
      '[DELETE /api/organization/[id]/client/[clientId]] Successfully deleted client:',
      data
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '[DELETE /api/organization/[id]/client/[clientId]] Unexpected error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
