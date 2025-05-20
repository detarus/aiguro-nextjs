import { NextResponse, NextRequest } from 'next/server';
import { fetchAiguroServerToken } from '@/lib/fetchAiguroServerToken';
import { AiguroOrganizationApi } from './handler';

export async function GET() {
  console.log(
    '[/api/aiguro-organizations GET] Attempting to fetch Aiguro server token...'
  );
  const token = await fetchAiguroServerToken();

  if (!token) {
    console.error(
      '[/api/aiguro-organizations GET] No token received from fetchAiguroServerToken. Cannot fetch organizations.'
    );
    // Ensuring a distinct error message if token is missing before calling getOrganizations
    return NextResponse.json(
      { error: 'Authentication token is missing, cannot fetch organizations.' },
      { status: 401 }
    );
  }

  console.log(
    '[/api/aiguro-organizations GET] Token received, attempting to fetch organizations.'
  );
  // AiguroOrganizationApi should be defined here now due to previous handler.ts creation
  const orgs = await AiguroOrganizationApi.getOrganizations(token);

  if (!orgs) {
    console.error(
      '[/api/aiguro-organizations GET] Failed to get organizations from AiguroOrganizationApi. Check logs from AiguroOrganizationApi itself.'
    );
    return NextResponse.json(
      { error: 'Failed to fetch organizations from provider.' },
      { status: 502 }
    );
  }

  console.log(
    '[/api/aiguro-organizations GET] Successfully fetched organizations.'
  );
  return NextResponse.json(orgs);
}

export async function POST(request: NextRequest) {
  console.log(
    '[/api/aiguro-organizations POST] Attempting to create new organization...'
  );

  const token = await fetchAiguroServerToken();
  if (!token) {
    console.error(
      '[/api/aiguro-organizations POST] No token received from fetchAiguroServerToken. Cannot create organization.'
    );
    return NextResponse.json(
      { error: 'Authentication token is missing, cannot create organization.' },
      { status: 401 }
    );
  }
  console.log('[/api/aiguro-organizations POST] Token received.');

  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error(
      '[/api/aiguro-organizations POST] Invalid JSON in request body:',
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
      '[/api/aiguro-organizations POST] companyName is missing or invalid in request body.'
    );
    return NextResponse.json(
      { error: 'companyName (string) is required in request body.' },
      { status: 400 }
    );
  }
  console.log(
    `[/api/aiguro-organizations POST] companyName from body: ${companyName}`
  );

  const newOrganization = await AiguroOrganizationApi.createOrganization(
    token,
    companyName.trim()
  );

  if (!newOrganization) {
    console.error(
      '[/api/aiguro-organizations POST] Failed to create organization via AiguroOrganizationApi. Check handler logs.'
    );
    return NextResponse.json(
      { error: 'Failed to create organization with the provider.' },
      { status: 502 }
    );
  }

  console.log(
    '[/api/aiguro-organizations POST] Successfully created new organization:',
    newOrganization
  );
  return NextResponse.json(newOrganization, { status: 201 }); // 201 Created status
}
