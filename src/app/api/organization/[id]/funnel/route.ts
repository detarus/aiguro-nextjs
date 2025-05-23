import { NextRequest, NextResponse } from 'next/server';
import { fetchAiguroServerToken } from '@/app/api/token/handler';

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const orgId = context.params.id;
  try {
    const body = await req.json();
    // Валидация структуры запроса
    if (!body.display_name || !Array.isArray(body.stages)) {
      return NextResponse.json(
        { error: 'Некорректные данные' },
        { status: 400 }
      );
    }
    const funnel = {
      display_name: body.display_name,
      stages: body.stages.map((stage: any) => ({
        name: stage.name,
        assistant_code_name: stage.assistant_code_name,
        followups: Array.isArray(stage.followups)
          ? stage.followups.map((f: any) => ({
              delay_minutes: f.delay_minutes,
              assistant_code_name: f.assistant_code_name
            }))
          : []
      }))
    };
    console.log(
      '[POST /api/organization/[id]/funnel] Final request body:',
      JSON.stringify(funnel, null, 2)
    );

    // Fetch the token
    const token = await fetchAiguroServerToken();
    if (!token) {
      return NextResponse.json({ error: 'No auth token' }, { status: 401 });
    }

    // Make the real POST request
    const apiUrl = `https://app.dev.aiguro.ru/api/organization/${orgId}/funnel`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(funnel)
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (e) {
    // Log the error for server-side debugging
    console.error('[API /api/organization/[id]/funnel] Error:', e);
    // Return a generic error response
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
