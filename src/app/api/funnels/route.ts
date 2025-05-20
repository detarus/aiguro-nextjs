import { NextRequest, NextResponse } from 'next/server';
import { fetchAiguroServerToken } from '@/app/api/aiguro-token/handler';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');
  if (!orgId) {
    return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
  }

  const token = await fetchAiguroServerToken();
  if (!token) {
    return NextResponse.json({ error: 'No auth token' }, { status: 401 });
  }

  const apiUrl = `https://app.dev.aiguro.ru/api/organization/${orgId}/funnels`;
  const res = await fetch(apiUrl, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch funnels' },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
