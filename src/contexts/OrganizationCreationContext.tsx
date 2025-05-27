'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useOrganization } from '@clerk/nextjs';

interface OrganizationCreationContextType {
  handleOrganizationCreated: (organization: any) => Promise<void>;
}

const OrganizationCreationContext = createContext<
  OrganizationCreationContextType | undefined
>(undefined);

export function OrganizationCreationProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { organization, isLoaded } = useOrganization();
  const previousOrgId = useRef<string | null>(null);
  const processedOrgs = useRef<Set<string>>(new Set());

  const handleOrganizationCreated = async (org: any) => {
    try {
      console.log('🏢 New organization detected:', org.name, 'ID:', org.id);

      // Check if organization already has backend ID
      if (org.publicMetadata?.id_backend) {
        console.log(
          '✅ Organization already has backend ID:',
          org.publicMetadata.id_backend
        );
        return;
      }

      console.log('🚀 Creating organization in backend...');

      // Call our API to create organization in backend
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organizationName: org.name,
          clerkOrgId: org.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to create organization in backend: ${errorData.error}`
        );
      }

      const result = await response.json();
      console.log('✅ Organization creation successful!');
      console.log('📊 Backend organization ID:', result.backendOrgId);
      console.log('🔗 Clerk organization ID:', result.clerkOrgId);

      // Mark as processed
      processedOrgs.current.add(org.id);
    } catch (error) {
      console.error('❌ Error handling new organization:', error);
    }
  };

  useEffect(() => {
    if (!isLoaded || !organization) {
      return;
    }

    const currentOrgId = organization.id;

    // Check if this is a new organization that we haven't processed yet
    const isNewOrganization =
      previousOrgId.current !== currentOrgId &&
      !processedOrgs.current.has(currentOrgId) &&
      previousOrgId.current !== null; // Don't trigger on initial load

    if (isNewOrganization) {
      handleOrganizationCreated(organization);
    }

    previousOrgId.current = currentOrgId;
  }, [organization, isLoaded]);

  return (
    <OrganizationCreationContext.Provider value={{ handleOrganizationCreated }}>
      {children}
    </OrganizationCreationContext.Provider>
  );
}

export function useOrganizationCreationContext() {
  const context = useContext(OrganizationCreationContext);
  if (context === undefined) {
    throw new Error(
      'useOrganizationCreationContext must be used within an OrganizationCreationProvider'
    );
  }
  return context;
}
