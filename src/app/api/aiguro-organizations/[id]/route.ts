import { NextResponse, NextRequest } from 'next/server';
import { fetchAiguroServerToken } from '@/app/api/aiguro-token/handler';
import { AiguroOrganizationApi } from '../handler';

export async function DELETE(request: NextRequest) {
  const organizationId = request.nextUrl.pathname
    .split('/')
    .filter(Boolean)
    .pop();
  if (!organizationId)
    return NextResponse.json(
      { error: 'Organization ID missing.' },
      { status: 400 }
    );
  const token = await fetchAiguroServerToken();
  if (!token)
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  const success = await AiguroOrganizationApi.deleteOrganization(
    token,
    organizationId
  );
  if (success)
    return NextResponse.json(
      { message: 'Organization deleted.' },
      { status: 200 }
    );
  return NextResponse.json(
    { error: 'Failed to delete organization.' },
    { status: 502 }
  );
}
