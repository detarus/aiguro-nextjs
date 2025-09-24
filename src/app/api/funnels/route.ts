import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');
  if (!orgId) {
    return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
  }

  const token = getClerkTokenFromCookie(request);
  if (!token) {
    console.error(
      '[/api/funnels GET] No token received from __session cookie.'
    );
    return NextResponse.json({ error: 'No auth token' }, { status: 401 });
  }

  console.log(
    '[/api/funnels GET] Token received from __session cookie, fetching funnels.'
  );

  const apiUrl = `${process.env.AIGURO_API_BASE_URL}/api/organization/${orgId}/funnels`;
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
