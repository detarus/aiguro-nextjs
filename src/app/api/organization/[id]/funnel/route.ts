import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  // Extract the organization ID from the URL path
  const url = new URL(req.url);
  const pathSegments = url.pathname.split('/');
  const orgIdIndex = pathSegments.indexOf('organization') + 1;
  const orgId = pathSegments[orgIdIndex];

  if (!orgId) {
    return NextResponse.json(
      { error: 'Organization ID not found in URL' },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    // Валидация структуры запроса
    if (!body.display_name) {
      return NextResponse.json(
        { error: 'display_name обязателен' },
        { status: 400 }
      );
    }

    // Создаем объект воронки со всеми параметрами из API документации
    const funnel = {
      display_name: body.display_name,
      stages: Array.isArray(body.stages) ? body.stages : [],
      mergeToArray: body.mergeToArray || 0,
      breakSize: body.breakSize || 0,
      breakWait: body.breakWait || 0,
      contextMemorySize: body.contextMemorySize || 0,
      useCompanyKnowledgeBase:
        body.useCompanyKnowledgeBase !== undefined
          ? body.useCompanyKnowledgeBase
          : true,
      useFunnelKnowledgeBase:
        body.useFunnelKnowledgeBase !== undefined
          ? body.useFunnelKnowledgeBase
          : true,
      autoPause: body.autoPause || 0,
      autoPauseFull:
        body.autoPauseFull !== undefined ? body.autoPauseFull : false,
      autoAnswer:
        body.autoAnswer ||
        'К сожалению, мы сейчас не можем вам ответить, напишите позже',
      antiSpam: body.antiSpam || 0,
      acceptFile: body.acceptFile !== undefined ? body.acceptFile : false,
      acceptAudio: body.acceptAudio !== undefined ? body.acceptAudio : false,
      workSchedule: body.workSchedule !== undefined ? body.workSchedule : false,
      workStart: body.workStart || 0,
      workEnd: body.workEnd || 0
    };
    console.log(
      '[POST /api/organization/[id]/funnel] Final request body:',
      JSON.stringify(funnel, null, 2)
    );

    // Get the token from __session cookie
    const token = getClerkTokenFromCookie(req);
    if (!token) {
      console.error(
        '[POST /api/organization/[id]/funnel] No token received from __session cookie.'
      );
      return NextResponse.json({ error: 'No auth token' }, { status: 401 });
    }

    console.log(
      '[POST /api/organization/[id]/funnel] Token received from __session cookie, creating funnel.'
    );

    // Make the real POST request
    const apiUrl = `https://app.dev.aiguro.ru/api/organization/${orgId}/funnel`;
    console.log(
      `[POST /api/organization/[id]/funnel] Making request to: ${apiUrl}`
    );

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(funnel)
    });

    console.log(
      `[POST /api/organization/[id]/funnel] Response status: ${response.status}`
    );

    if (!response.ok) {
      let errorDetails = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error(
          '[POST /api/organization/[id]/funnel] Error response JSON:',
          errorData
        );
        errorDetails =
          errorData.error ||
          errorData.message ||
          errorData.detail ||
          JSON.stringify(errorData);
      } catch (jsonError) {
        // If response is not JSON, try to get text
        try {
          const errorText = await response.text();
          console.error(
            '[POST /api/organization/[id]/funnel] Error response text:',
            errorText
          );
          errorDetails = errorText || errorDetails;
        } catch (textError) {
          console.error(
            '[POST /api/organization/[id]/funnel] Could not read error response'
          );
        }
      }

      return NextResponse.json(
        { error: errorDetails },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      '[POST /api/organization/[id]/funnel] Successfully created funnel:',
      data
    );
    return NextResponse.json(data, { status: response.status });
  } catch (e) {
    console.error('[API /api/organization/[id]/funnel] Error:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
