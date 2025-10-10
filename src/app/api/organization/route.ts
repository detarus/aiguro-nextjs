import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';
import { AiguroOrganizationApi } from './handler';

export async function GET(request: NextRequest) {
  const token = getClerkTokenFromCookie(request);
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication token is missing.' },
      { status: 401 }
    );
  }

  const orgs = await AiguroOrganizationApi.getOrganizations(token);

  if (!orgs) {
    console.error('Failed to fetch organizations from backend API');
    return NextResponse.json(
      { error: 'Failed to fetch organizations from provider.' },
      { status: 502 }
    );
  }

  return NextResponse.json(orgs);
}

export async function POST(request: NextRequest) {
  const token = getClerkTokenFromCookie(request);
  if (!token) {
    console.error('Organization creation failed: No authentication token');
    return NextResponse.json(
      { error: 'Authentication token is missing' },
      { status: 401 }
    );
  }

  // Get query parameters
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organization_id');

  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error('Invalid JSON in request body:', error);
    return NextResponse.json(
      { error: 'Invalid request body. Expected JSON.' },
      { status: 400 }
    );
  }

  const { display_name, gid } = body;

  // Validate required fields
  if (
    !display_name ||
    typeof display_name !== 'string' ||
    display_name.trim() === ''
  ) {
    console.error('Missing or invalid display_name in request body');
    return NextResponse.json(
      { error: 'display_name (string) is required in request body.' },
      { status: 400 }
    );
  }

  console.log(`Creating organization: ${display_name}`);

  // Use organization_id=1 when not provided, as per requirements
  const effectiveOrganizationId = organizationId || '1';

  const newOrganization = await AiguroOrganizationApi.createOrganization(
    token,
    display_name.trim(),
    gid,
    effectiveOrganizationId
  );

  if (!newOrganization) {
    console.error(`Failed to create organization: ${display_name}`);
    return NextResponse.json(
      { error: 'Failed to create organization with the provider.' },
      { status: 502 }
    );
  }

  console.log(
    `Organization created successfully: ${display_name} -> ID: ${newOrganization.id}`
  );
  return NextResponse.json(newOrganization, { status: 201 });
}
