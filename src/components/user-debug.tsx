'use client';

import { useUser } from '@clerk/nextjs';

export function UserDebug() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className='rounded bg-gray-100 p-4'>Loading user data...</div>;
  }

  if (!user) {
    return <div className='rounded bg-yellow-100 p-4'>No user logged in</div>;
  }

  return (
    <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20'>
      <h3 className='mb-2 font-semibold text-green-800 dark:text-green-200'>
        User Clerk Debug Info
      </h3>
      <div className='space-y-1 text-sm'>
        <p>
          <strong>Full Name:</strong> {user.fullName || 'Not set'}
        </p>
        <p>
          <strong>Email:</strong>{' '}
          {user.primaryEmailAddress?.emailAddress || 'Not set'}
        </p>
        <p>
          <strong>Clerk User ID:</strong> {user.id}
        </p>
        <p>
          <strong>Username:</strong> {user.username || 'Not set'}
        </p>
        <p>
          <strong>Created At:</strong>{' '}
          {user.createdAt ? user.createdAt.toLocaleString() : 'Not set'}
        </p>
        <p>
          <strong>Last Sign In:</strong>{' '}
          {user.lastSignInAt ? user.lastSignInAt.toLocaleString() : 'Never'}
        </p>
        <details className='mt-2'>
          <summary className='cursor-pointer text-green-600 dark:text-green-400'>
            View Full User Data
          </summary>
          <pre className='mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800 dark:text-gray-200'>
            {JSON.stringify(
              {
                id: user.id,
                fullName: user.fullName,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                emailAddresses: user.emailAddresses,
                phoneNumbers: user.phoneNumbers,
                publicMetadata: user.publicMetadata,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastSignInAt: user.lastSignInAt
              },
              null,
              2
            )}
          </pre>
        </details>
      </div>
    </div>
  );
}
