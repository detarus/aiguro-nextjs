import { NextResponse, NextRequest } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';
import { AiguroOrganizationApi } from '@/app/api/organization/handler';

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

  const token = getClerkTokenFromCookie(request);
  if (!token) {
    console.error(
      '[DELETE /api/aiguro-organizations/[id]] No token received from __session cookie.'
    );
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }

  console.log(
    '[DELETE /api/aiguro-organizations/[id]] Token received from __session cookie, deleting organization.'
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
