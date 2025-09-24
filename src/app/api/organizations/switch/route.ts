import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/organizations/switch called');

    const { userId } = await auth();

    if (!userId) {
      console.error('❌ Unauthorized: No user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clerkOrgId } = await request.json();
    console.log('📋 Request body:', { clerkOrgId });

    if (!clerkOrgId) {
      console.error('❌ Bad request: No clerkOrgId provided');
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

    console.log('📋 Organization from Clerk:', {
      name: organization.name,
      id: organization.id,
      hasBackendId: !!organization.publicMetadata?.id_backend,
      backendId: organization.publicMetadata?.id_backend
    });

    // Check if organization already has backend ID
    if (organization.publicMetadata?.id_backend) {
      console.log(
        '✅ Organization already has backend ID:',
        organization.publicMetadata.id_backend
      );
      return NextResponse.json({
        success: true,
        clerkOrgId,
        backendOrgId: organization.publicMetadata.id_backend,
        organizationName: organization.name,
        message: 'Organization already has backend ID'
      });
    }

    // Get Clerk token for Aiguro API authentication
    const token = getClerkTokenFromCookie(request);
    if (!token) {
      console.error('❌ Organization sync failed: No authentication token');
      return NextResponse.json(
        { error: 'Authentication token is missing' },
        { status: 401 }
      );
    }
    console.log('🔑 Authentication token found');

    // Create organization in Aiguro backend with organization_id=1
    console.log(`🔄 Creating backend organization for: ${organization.name}`);

    const requestBody = {
      gid: clerkOrgId,
      display_name: organization.name,
      is_active: true
    };

    console.log('📤 Request body for backend:', requestBody);

    let backendOrgId;
    try {
      console.log('🌐 Making request to backend API...');
      const backendResponse = await fetch(
        `${process.env.AIGURO_API_BASE_URL}/api/organization?organization_id=1`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        }
      );

      console.log('📥 Backend response status:', backendResponse.status);

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('❌ Backend API error:', errorText);
        throw new Error(
          `Backend API returned ${backendResponse.status}: ${errorText}`
        );
      }

      const backendOrg = await backendResponse.json();
      console.log('📋 Backend response:', backendOrg);
      backendOrgId = backendOrg.id;

      if (backendOrgId === undefined || backendOrgId === null) {
        throw new Error('Backend did not return an organization ID');
      }

      console.log('✅ Backend organization created with ID:', backendOrgId);
    } catch (fetchError) {
      const errorMessage =
        fetchError instanceof Error ? fetchError.message : 'Unknown error';
      console.error('💥 Backend API error:', errorMessage);
      throw new Error(
        `Failed to create organization in Aiguro backend: ${errorMessage}`
      );
    }

    // Update Clerk organization with backend ID in public metadata
    console.log('🔄 Updating Clerk organization metadata...');
    await client.organizations.updateOrganizationMetadata(clerkOrgId, {
      publicMetadata: {
        id_backend: backendOrgId.toString()
      }
    });

    console.log(
      `✅ Organization sync completed: ${organization.name} -> Backend ID: ${backendOrgId}`
    );

    return NextResponse.json({
      success: true,
      clerkOrgId,
      backendOrgId,
      organizationName: organization.name,
      message: 'Organization created in backend and metadata updated'
    });
  } catch (error) {
    console.error('💥 Organization sync error:', error);
    return NextResponse.json(
      { error: 'Failed to handle organization switch' },
      { status: 500 }
    );
  }
}
