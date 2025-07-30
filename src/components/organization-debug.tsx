'use client';

import { useOrganization } from '@clerk/nextjs';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useOrganizationSync } from '@/contexts/OrganizationSyncContext';

export function OrganizationDebug() {
  const { organization, isLoaded } = useOrganization();
  const { triggerSync } = useOrganizationSync();
  const [checkingBackendId, setCheckingBackendId] = useState(false);
  const [syncingOrganization, setSyncingOrganization] = useState(false);
  const [backendIdCheckResult, setBackendIdCheckResult] = useState<{
    hasBackendId: boolean;
    backendId: string | null;
    organizationName: string;
    clerkOrgId: string;
  } | null>(null);

  const handleCheckBackendId = async () => {
    if (!organization) return;

    setCheckingBackendId(true);
    setBackendIdCheckResult(null);

    try {
      const response = await fetch(
        `/api/organizations/check-backend-id?clerkOrgId=${organization.id}`
      );

      if (!response.ok) {
        throw new Error('Failed to check backend ID');
      }

      const result = await response.json();
      setBackendIdCheckResult(result);
    } catch (error) {
      console.error('Error checking backend ID:', error);
    } finally {
      setCheckingBackendId(false);
    }
  };

  const handleSyncOrganization = async () => {
    if (!organization) return;

    setSyncingOrganization(true);
    try {
      console.log('🔄 Manual sync requested for:', organization.name);
      await triggerSync();
      console.log('✅ Manual sync completed successfully');
    } catch (error) {
      console.error('💥 Error during manual sync:', error);
    } finally {
      setSyncingOrganization(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className='rounded bg-gray-100 p-4'>
        Loading organization data...
      </div>
    );
  }

  if (!organization) {
    return (
      <div className='rounded bg-yellow-100 p-4'>No organization selected</div>
    );
  }

  return (
    <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20'>
      <h3 className='mb-2 font-semibold text-blue-800 dark:text-blue-200'>
        Organization Debug Info
      </h3>
      <div className='space-y-1 text-sm'>
        <p>
          <strong>Name:</strong> {organization.name}
        </p>
        <p>
          <strong>Clerk ID:</strong> {organization.id}
        </p>
        <p>
          <strong>Backend ID:</strong>{' '}
          {(organization.publicMetadata?.id_backend as string) || 'Not set'}
        </p>
        <p>
          <strong>Created At:</strong>{' '}
          {new Date(organization.createdAt).toLocaleString()}
        </p>

        {/* Check Backend ID Button */}
        <div className='mt-4'>
          <Button
            onClick={handleCheckBackendId}
            disabled={checkingBackendId}
            variant='outline'
            size='sm'
            className='w-full'
          >
            {checkingBackendId ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Checking...
              </>
            ) : (
              'Check if Clerk has Backend ID'
            )}
          </Button>
        </div>

        {/* Sync Organization Button */}
        {!organization.publicMetadata?.id_backend && (
          <div className='mt-2'>
            <Button
              onClick={handleSyncOrganization}
              disabled={syncingOrganization}
              variant='default'
              size='sm'
              className='w-full bg-green-600 hover:bg-green-700'
            >
              {syncingOrganization ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Синхронизация...
                </>
              ) : (
                <>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Синхронизировать организацию
                </>
              )}
            </Button>
          </div>
        )}

        {/* Backend ID Check Result */}
        {backendIdCheckResult && (
          <div className='mt-3 rounded-md border p-3'>
            <div className='flex items-center gap-2'>
              {backendIdCheckResult.hasBackendId ? (
                <CheckCircle className='h-4 w-4 text-green-600' />
              ) : (
                <AlertCircle className='h-4 w-4 text-yellow-600' />
              )}
              <span className='font-medium'>
                {backendIdCheckResult.hasBackendId
                  ? 'Backend ID Found'
                  : 'No Backend ID Found'}
              </span>
            </div>
            <div className='mt-2 space-y-1 text-xs'>
              <p>
                <strong>Organization:</strong>{' '}
                {backendIdCheckResult.organizationName}
              </p>
              <p>
                <strong>Clerk ID:</strong> {backendIdCheckResult.clerkOrgId}
              </p>
              {backendIdCheckResult.hasBackendId && (
                <p>
                  <strong>Backend ID:</strong> {backendIdCheckResult.backendId}
                </p>
              )}
            </div>
          </div>
        )}

        <details className='mt-2'>
          <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
            View Full Metadata
          </summary>
          <pre className='mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800 dark:text-gray-200'>
            {JSON.stringify(organization.publicMetadata, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
