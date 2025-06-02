'use client';

import { useOrganization } from '@clerk/nextjs';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export function OrganizationApiDebug() {
  const { organization } = useOrganization();
  const { token, selectedOrganizationId } = useAuth();
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizationData = async () => {
    if (!token || !selectedOrganizationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://app.dev.aiguro.ru/api/organization/${selectedOrganizationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setApiData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && selectedOrganizationId) {
      fetchOrganizationData();
    }
  }, [token, selectedOrganizationId]);

  return (
    <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-900/20'>
      <h3 className='mb-2 font-semibold text-purple-800 dark:text-purple-200'>
        Organization API Debug Info
      </h3>
      <div className='space-y-2 text-sm'>
        <p>
          <strong>Selected Org ID:</strong> {selectedOrganizationId || 'None'}
        </p>
        <p>
          <strong>Has Token:</strong> {token ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Backend ID:</strong>{' '}
          {(organization?.publicMetadata?.id_backend as string) || 'Not set'}
        </p>

        <div className='mt-3'>
          <button
            onClick={fetchOrganizationData}
            disabled={!token || !selectedOrganizationId || loading}
            className='rounded bg-purple-600 px-3 py-1 text-white disabled:bg-gray-400 dark:bg-purple-700 dark:disabled:bg-gray-600'
          >
            {loading ? 'Loading...' : 'Fetch API Data'}
          </button>
        </div>

        {error && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Error:</strong> {error}
          </div>
        )}

        {apiData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-purple-600 dark:text-purple-400'>
              View API Response
            </summary>
            <pre className='mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800 dark:text-gray-200'>
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
