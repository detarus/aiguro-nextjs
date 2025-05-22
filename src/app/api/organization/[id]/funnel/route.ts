import { NextApiRequest, NextApiResponse } from 'next';
import { fetchAiguroServerToken } from '@/app/api/token/handler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { id: orgId } = req.query;
    try {
      const body = await req.body;
      // Валидация структуры запроса
      if (!body.display_name || !Array.isArray(body.stages)) {
        return res.status(400).json({ error: 'Некорректные данные' });
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
        return res.status(401).json({ error: 'No auth token' });
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
      return res.status(response.status).json(data);
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
