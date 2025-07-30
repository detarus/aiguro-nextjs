import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔐 User authenticated:', userId);

    const body = await request.json();
    const { clerkOrgId, backendId } = body;

    console.log('📥 Request data:', { clerkOrgId, backendId });

    if (!clerkOrgId || !backendId) {
      return NextResponse.json(
        { error: 'Clerk organization ID and backend ID are required' },
        { status: 400 }
      );
    }

    // Validate backend ID format (you can add your own validation logic here)
    if (typeof backendId !== 'string' || backendId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Backend ID must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate that backend ID is a number (since backend IDs are typically numeric)
    const backendIdNum = parseInt(backendId.trim());
    if (isNaN(backendIdNum)) {
      return NextResponse.json(
        { error: 'Backend ID must be a valid number' },
        { status: 400 }
      );
    }

    // Get organization from Clerk and update metadata
    const client = await clerkClient();

    console.log('🏢 Getting current organization from Clerk...');

    // First, get the current organization to preserve existing metadata
    const currentOrg = await client.organizations.getOrganization({
      organizationId: clerkOrgId
    });

    console.log('📋 Current organization metadata:', currentOrg.publicMetadata);

    // Update the organization with the new backend ID
    console.log('🔄 Updating organization metadata...');

    await client.organizations.updateOrganizationMetadata(clerkOrgId, {
      publicMetadata: {
        ...currentOrg.publicMetadata,
        id_backend: backendIdNum.toString()
      }
    });

    console.log('✅ Organization metadata updated successfully');

    // Get the updated organization to return the latest data
    const updatedOrganization = await client.organizations.getOrganization({
      organizationId: clerkOrgId
    });

    console.log(
      '📋 Updated organization metadata:',
      updatedOrganization.publicMetadata
    );

    return NextResponse.json({
      success: true,
      message: 'Backend ID assigned successfully',
      clerkOrgId,
      backendId: backendIdNum.toString(),
      organizationName: updatedOrganization.name,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error assigning backend ID:', error);
    return NextResponse.json(
      {
        error: 'Failed to assign backend ID',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
