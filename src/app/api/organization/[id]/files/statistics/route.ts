import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;

    console.log('GET /api/organization/[id]/files/statistics');
    console.log('Organization ID:', organizationId);

    // Получаем токен из заголовка Authorization
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('Token extracted:', token ? 'Yes' : 'No');

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token available' },
        { status: 401 }
      );
    }

    // Строим URL для внешнего API
    const apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/api/organizations/${organizationId}/files/statistics`;
    console.log('External API URL:', apiUrl);

    // Отправляем запрос к внешнему API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    console.log('External API response status:', response.status);

    if (!response.ok) {
      let errorMessage = `External API error: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error('External API error response:', errorData);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = `${errorMessage}\nResponse: ${errorText}`;
          }
        } catch (textError) {
          console.error('Failed to read error response as text:', textError);
        }
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Successfully fetched file statistics:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      'Error in GET /api/organization/[id]/files/statistics:',
      error
    );
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
