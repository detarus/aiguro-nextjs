import { NextRequest, NextResponse } from 'next/server';
import { fetchAiguroServerToken } from '@/app/api/token/handler';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: orgId } = params;
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
    // Improved error logging
    console.error('[API /api/organization/[id]/funnel] Server Error:', e);
    // Check if 'e' is an instance of Error to safely access its message property
    const errorMessage = e instanceof Error ? e.message : 'Ошибка сервера';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// If you need to handle other methods, you can export them similarly:
// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//   // ... GET logic ...
//   return NextResponse.json({ message: "GET request received" });
// }

// By not exporting other methods (GET, PUT, DELETE, etc.), Next.js will
// automatically return a 405 Method Not Allowed response for those requests.
