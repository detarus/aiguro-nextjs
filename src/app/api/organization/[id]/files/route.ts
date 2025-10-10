import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    console.log('GET /api/organization/[id]/files');
    console.log('Organization ID:', organizationId);
    console.log('Category filter:', category);

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
    let apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/api/organizations/${organizationId}/files`;

    // Добавляем query параметры если есть
    const queryParams = new URLSearchParams();
    if (category) {
      queryParams.append('category', category);
    }

    if (queryParams.toString()) {
      apiUrl += `?${queryParams.toString()}`;
    }

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
    console.log('Successfully fetched files:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/organization/[id]/files:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;

    console.log('POST /api/organization/[id]/files');
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

    // Получаем FormData из запроса
    const formData = await request.formData();

    console.log('FormData keys:', Array.from(formData.keys()));

    // Проверяем наличие файла
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Строим URL для внешнего API
    const apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/api/organizations/${organizationId}/files`;
    console.log('External API URL:', apiUrl);

    // Создаем новый FormData для внешнего API
    const externalFormData = new FormData();
    externalFormData.append('file', file);

    // Добавляем дополнительные поля если они есть
    const description = formData.get('description') as string;
    if (description) {
      externalFormData.append('description', description);
    }

    const category = formData.get('category') as string;
    if (category) {
      externalFormData.append('category', category);
    }

    const isPublic = formData.get('is_public') as string;
    if (isPublic) {
      externalFormData.append('is_public', isPublic);
    }

    // Отправляем запрос к внешнему API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
        // Не указываем Content-Type, браузер сам установит multipart/form-data с boundary
      },
      body: externalFormData
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
    console.log('Successfully uploaded file:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/organization/[id]/files:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
