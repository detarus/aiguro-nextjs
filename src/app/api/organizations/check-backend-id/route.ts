import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clerkOrgId = searchParams.get('clerkOrgId');

    if (!clerkOrgId) {
      return NextResponse.json(
        { error: 'Clerk organization ID is required' },
        { status: 400 }
      );
    }

    // Get organization from Clerk
    const client = await clerkClient();
    const organization = await client.organizations.getOrganization({
      organizationId: clerkOrgId
    });

    const hasBackendId = !!organization.publicMetadata?.id_backend;
    const backendId = organization.publicMetadata?.id_backend as string;

    return NextResponse.json({
      success: true,
      clerkOrgId,
      hasBackendId,
      backendId: hasBackendId ? backendId : null,
      organizationName: organization.name
    });
  } catch (error) {
    console.error('Error checking backend ID:', error);
    return NextResponse.json(
      { error: 'Failed to check backend ID' },
      { status: 500 }
    );
  }
}
