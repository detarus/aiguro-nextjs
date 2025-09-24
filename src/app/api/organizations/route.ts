import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getClerkTokenFromCookie } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Clerk token from cookie for Aiguro API authentication
    const token = getClerkTokenFromCookie(request);
    if (!token) {
      console.error(
        '[/api/organizations POST] No token received from __session cookie. Cannot create organization.'
      );
      return NextResponse.json(
        {
          error: 'Authentication token is missing, cannot create organization.'
        },
        { status: 401 }
      );
    }
    console.log(
      '[/api/organizations POST] Token received from __session cookie.'
    );

    const { organizationName, clerkOrgId } = await request.json();

    if (!organizationName || !clerkOrgId) {
      return NextResponse.json(
        { error: 'Organization name and Clerk organization ID are required' },
        { status: 400 }
      );
    }

    // Create organization in Aiguro backend
    console.log('🚀 Attempting to create organization in Aiguro backend...');
    const requestBody = {
      gid: clerkOrgId,
      display_name: organizationName,
      is_active: true
    };

    console.log('📤 Request data:', {
      url: `${process.env.AIGURO_API_BASE_URL}/api/organization?organization_id=1`,
      method: 'POST',
      body: requestBody,
      clerkOrgId,
      userId,
      hasToken: !!token
    });

    let backendOrgId;

    try {
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
      console.log(
        '📥 Backend response headers:',
        Object.fromEntries(backendResponse.headers.entries())
      );

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('❌ Backend API error response:', errorText);
        throw new Error(
          `Backend API returned ${backendResponse.status}: ${errorText}`
        );
      }

      const backendOrg = await backendResponse.json();
      console.log('✅ Backend response data:', backendOrg);

      // Extract the id from the response (expected format: { id: 0, display_name: "string", is_active: true })
      backendOrgId = backendOrg.id;

      if (backendOrgId === undefined || backendOrgId === null) {
        console.error('❌ No ID found in backend response:', backendOrg);
        throw new Error('Backend did not return an organization ID');
      }

      console.log('🎯 Extracted backend organization ID:', backendOrgId);
    } catch (fetchError) {
      console.error('❌ Error calling Aiguro backend:', fetchError);
      const errorMessage =
        fetchError instanceof Error ? fetchError.message : 'Unknown error';
      console.error('❌ Error details:', {
        message: errorMessage,
        stack: fetchError instanceof Error ? fetchError.stack : undefined
      });
      throw new Error(
        `Failed to create organization in Aiguro backend: ${errorMessage}`
      );
    }

    console.log('Backend organization created with ID:', backendOrgId);

    // Update Clerk organization with backend ID in public metadata
    const client = await clerkClient();
    await client.organizations.updateOrganizationMetadata(clerkOrgId, {
      publicMetadata: {
        id_backend: backendOrgId.toString()
      }
    });

    console.log(
      'Clerk organization metadata updated with backend ID:',
      backendOrgId
    );

    return NextResponse.json({
      success: true,
      backendOrgId,
      clerkOrgId,
      message: 'Organization created successfully'
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
