'use client';

import { useOrganization } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

export function useOrganizationCreation() {
  const { organization, isLoaded } = useOrganization();
  const previousOrgId = useRef<string | null>(null);
  const hasProcessedOrg = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoaded || !organization) {
      return;
    }

    const currentOrgId = organization.id;

    // Check if this is a new organization that we haven't processed yet
    const isNewOrganization =
      previousOrgId.current !== currentOrgId &&
      !hasProcessedOrg.current.has(currentOrgId) &&
      previousOrgId.current !== null; // Don't trigger on initial load

    if (isNewOrganization) {
      handleNewOrganization(organization);
      hasProcessedOrg.current.add(currentOrgId);
    }

    previousOrgId.current = currentOrgId;
  }, [organization, isLoaded]);

  const handleNewOrganization = async (org: any) => {
    try {
      console.log('New organization detected:', org.name, 'ID:', org.id);

      // Check if organization already has backend ID
      if (org.publicMetadata?.id_backend) {
        console.log(
          'Organization already has backend ID:',
          org.publicMetadata.id_backend
        );
        return;
      }

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
        throw new Error('Failed to create organization in backend');
      }

      const result = await response.json();
      console.log('Organization creation result:', result);
      console.log('Backend organization ID:', result.backendOrgId);
    } catch (error) {
      console.error('Error handling new organization:', error);
    }
  };

  return {
    organization,
    isLoaded
  };
}
