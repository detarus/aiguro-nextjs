import { NextResponse, NextRequest } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';
import { AiguroOrganizationApi } from './handler';

export async function GET(request: NextRequest) {
  console.log(
    '[/api/organization GET] Attempting to get Clerk token from __session cookie...'
  );
  const token = getClerkTokenFromCookie(request);

  if (!token) {
    console.error(
      '[/api/organization GET] No token received from __session cookie. Cannot fetch organizations.'
    );
    return NextResponse.json(
      { error: 'Authentication token is missing, cannot fetch organizations.' },
      { status: 401 }
    );
  }

  console.log(
    '[/api/organization GET] Token received from __session cookie, attempting to fetch organizations.'
  );
  const orgs = await AiguroOrganizationApi.getOrganizations(token);

  if (!orgs) {
    console.error(
      '[/api/organization GET] Failed to get organizations from AiguroOrganizationApi. Check logs from AiguroOrganizationApi itself.'
    );
    return NextResponse.json(
      { error: 'Failed to fetch organizations from provider.' },
      { status: 502 }
    );
  }

  console.log('[/api/organization GET] Successfully fetched organizations.');
  return NextResponse.json(orgs);
}

export async function POST(request: NextRequest) {
  console.log(
    '[/api/organization POST] Attempting to create new organization...'
  );

  const token = getClerkTokenFromCookie(request);
  if (!token) {
    console.error(
      '[/api/organization POST] No token received from __session cookie. Cannot create organization.'
    );
    return NextResponse.json(
      { error: 'Authentication token is missing, cannot create organization.' },
      { status: 401 }
    );
  }
  console.log('[/api/organization POST] Token received from __session cookie.');

  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error(
      '[/api/organization POST] Invalid JSON in request body:',
      error
    );
    return NextResponse.json(
      { error: 'Invalid request body. Expected JSON.' },
      { status: 400 }
    );
  }

  const { companyName } = body;
  if (
    !companyName ||
    typeof companyName !== 'string' ||
    companyName.trim() === ''
  ) {
    console.error(
      '[/api/organization POST] companyName is missing or invalid in request body.'
    );
    return NextResponse.json(
      { error: 'companyName (string) is required in request body.' },
      { status: 400 }
    );
  }
  console.log(`[/api/organization POST] companyName from body: ${companyName}`);

  const newOrganization = await AiguroOrganizationApi.createOrganization(
    token,
    companyName.trim()
  );

  if (!newOrganization) {
    console.error(
      '[/api/organization POST] Failed to create organization via AiguroOrganizationApi. Check handler logs.'
    );
    return NextResponse.json(
      { error: 'Failed to create organization with the provider.' },
      { status: 502 }
    );
  }

  console.log(
    '[/api/organization POST] Successfully created new organization:',
    newOrganization
  );
  return NextResponse.json(newOrganization, { status: 201 }); // 201 Created status
}
