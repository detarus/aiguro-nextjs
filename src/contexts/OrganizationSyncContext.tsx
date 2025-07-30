'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { useOrganization } from '@clerk/nextjs';

interface OrganizationSyncContextType {
  isSyncing: boolean;
  syncError: string | null;
  syncProgress: string | null;
  triggerSync: () => Promise<void>;
}

const OrganizationSyncContext = createContext<
  OrganizationSyncContextType | undefined
>(undefined);

export function OrganizationSyncProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { organization, isLoaded } = useOrganization();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<string | null>(null);
  const processedOrgs = useRef<Set<string>>(new Set());
  const isProcessing = useRef(false);

  const triggerSync = async () => {
    if (!organization || isProcessing.current) {
      return;
    }

    const orgId = organization.id;

    // Check if already processed
    if (processedOrgs.current.has(orgId)) {
      return;
    }

    // Check if already has backend ID
    if (organization.publicMetadata?.id_backend) {
      processedOrgs.current.add(orgId);
      return;
    }

    isProcessing.current = true;
    setIsSyncing(true);
    setSyncError(null);
    setSyncProgress('Creating organization in backend...');

    try {
      console.log('🔄 Starting organization sync for:', organization.name);

      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organizationName: organization.name,
          clerkOrgId: orgId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Failed to create organization in backend'
        );
      }

      const result = await response.json();
      console.log('✅ Organization sync completed:', result);

      setSyncProgress('Organization created successfully!');

      // Mark as processed
      processedOrgs.current.add(orgId);

      // Wait a moment to show success message
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(null);
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Organization sync failed:', errorMessage);

      setSyncError(errorMessage);
      setIsSyncing(false);
      setSyncProgress(null);
    } finally {
      isProcessing.current = false;
    }
  };

  useEffect(() => {
    if (!isLoaded || !organization) {
      return;
    }

    const orgId = organization.id;
    const backendOrgId = organization.publicMetadata?.id_backend as string;

    // If organization has backend ID, mark as processed
    if (backendOrgId) {
      processedOrgs.current.add(orgId);
      setIsSyncing(false);
      setSyncError(null);
      setSyncProgress(null);
      return;
    }

    // If organization doesn't have backend ID and hasn't been processed, trigger sync
    if (!processedOrgs.current.has(orgId) && !isProcessing.current) {
      triggerSync();
    }
  }, [organization?.id, organization?.publicMetadata?.id_backend, isLoaded]);

  return (
    <OrganizationSyncContext.Provider
      value={{
        isSyncing,
        syncError,
        syncProgress,
        triggerSync
      }}
    >
      {children}
    </OrganizationSyncContext.Provider>
  );
}

export function useOrganizationSync() {
  const context = useContext(OrganizationSyncContext);
  if (context === undefined) {
    throw new Error(
      'useOrganizationSync must be used within an OrganizationSyncProvider'
    );
  }
  return context;
}
