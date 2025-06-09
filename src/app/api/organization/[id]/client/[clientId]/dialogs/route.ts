import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; clientId: string } }
): Promise<NextResponse> {
  console.log('=== GET CLIENT DIALOGS API START ===');
  console.log('Organization ID:', params.id);
  console.log('Client ID:', params.clientId);
  console.log('Method: GET');
  console.log('URL:', request.url);
  console.log('Timestamp:', new Date().toISOString());

  try {
    // Проверяем авторизацию
    console.log('=== AUTHORIZATION CHECK ===');
    const token = getClerkTokenFromCookie(request);
    if (!token) {
      console.error(
        '❌ AUTHORIZATION FAILED: No token found in __session cookie'
      );
      return NextResponse.json(
        { error: 'Authentication failed. No token in __session cookie' },
        { status: 401 }
      );
    }

    console.log('✅ Token extracted from cookie, length:', token.length);

    // Валидация параметров
    console.log('=== PARAMETER VALIDATION ===');
    if (!params.id) {
      console.error('❌ VALIDATION FAILED: Organization ID is required');
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    if (!params.clientId) {
      console.error('❌ VALIDATION FAILED: Client ID is required');
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    console.log('✅ Parameters validated successfully');

    // Делаем запрос к backend API
    console.log('=== BACKEND REQUEST PREPARATION ===');
    const apiUrl = `https://app.dev.aiguro.ru/api/organization/${params.id}/client/${params.clientId}/dialogs`;
    console.log('Making GET request to:', apiUrl);

    // Выполняем запрос к backend
    console.log('=== BACKEND REQUEST EXECUTION ===');
    const backendResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Backend response status:', backendResponse.status);
    console.log('Backend response statusText:', backendResponse.statusText);

    // Обрабатываем ответ от backend
    console.log('=== BACKEND RESPONSE PROCESSING ===');
    if (!backendResponse.ok) {
      console.error('❌ BACKEND REQUEST FAILED');
      console.error('Status:', backendResponse.status);
      console.error('Status Text:', backendResponse.statusText);

      let errorData;
      try {
        errorData = await backendResponse.json();
        console.error('Backend error data:', errorData);
      } catch (parseError) {
        console.error('Could not parse backend error response');
        try {
          const errorText = await backendResponse.text();
          console.error('Backend error text:', errorText);
          errorData = { error: errorText };
        } catch (textError) {
          console.error('Could not read backend error response as text');
          errorData = { error: 'Unknown backend error' };
        }
      }

      return NextResponse.json(
        {
          error:
            errorData?.error ||
            `Backend error: ${backendResponse.status} ${backendResponse.statusText}`,
          details: errorData
        },
        { status: backendResponse.status }
      );
    }

    // Парсим успешный ответ
    let responseData;
    try {
      responseData = await backendResponse.json();
      console.log('✅ Backend response parsed successfully');
      console.log('Response data type:', typeof responseData);
      console.log(
        'Response data length:',
        Array.isArray(responseData) ? responseData.length : 'Not an array'
      );
    } catch (parseError) {
      console.error('❌ BACKEND RESPONSE PARSING FAILED:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse backend response' },
        { status: 500 }
      );
    }

    console.log('=== SUCCESS ===');
    console.log('Returning client dialogs data');
    console.log(
      'Total dialogs found:',
      Array.isArray(responseData) ? responseData.length : 'Unknown'
    );

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error(
      'Error message:',
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
