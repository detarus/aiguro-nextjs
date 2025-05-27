'use client';

import { useOrganization } from '@clerk/nextjs';

export function OrganizationDebug() {
  const { organization, isLoaded } = useOrganization();

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
    <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
      <h3 className='mb-2 font-semibold text-blue-800'>
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
        <details className='mt-2'>
          <summary className='cursor-pointer text-blue-600'>
            View Full Metadata
          </summary>
          <pre className='mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs'>
            {JSON.stringify(organization.publicMetadata, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
