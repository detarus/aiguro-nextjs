import { NextRequest, NextResponse } from 'next/server';
interface FunnelStage {
  name: string;
  assistant_code_name: string;
  followups?: Array<{
    delay_minutes: number;
    assistant_code_name: string;
  }>;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    // Валидация структуры запроса
    if (!body.display_name || !Array.isArray(body.stages)) {
      return NextResponse.json(
        { error: 'Некорректные данные' },
        { status: 400 }
      );
    }
    // Здесь должна быть логика сохранения в БД
    // Для примера возвращаем то, что пришло
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
    return NextResponse.json(funnel, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
