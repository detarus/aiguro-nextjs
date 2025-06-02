'use client';

import { useFunnels } from '@/hooks/useFunnels';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export function FunnelDebug() {
  const { selectedOrganizationId, token } = useAuth();
  const { funnels, currentFunnel } = useFunnels(selectedOrganizationId);
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFunnelData = async () => {
    if (!token || !selectedOrganizationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://app.dev.aiguro.ru/api/organization/${selectedOrganizationId}/funnel`,
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
      fetchFunnelData();
    }
  }, [token, selectedOrganizationId]);

  return (
    <div className='rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/20'>
      <h3 className='mb-2 font-semibold text-orange-800 dark:text-orange-200'>
        Funnel API Debug Info
      </h3>
      <div className='space-y-2 text-sm'>
        <p>
          <strong>Local Funnels Count:</strong> {funnels?.length || 0}
        </p>
        <p>
          <strong>Current Funnel:</strong>{' '}
          {currentFunnel?.name || currentFunnel?.display_name || 'None'}
        </p>
        <p>
          <strong>Current Funnel ID:</strong> {currentFunnel?.id || 'None'}
        </p>
        <p>
          <strong>Current Funnel Stages:</strong>{' '}
          {currentFunnel?.stages?.length || 0}
        </p>

        <div className='mt-3'>
          <button
            onClick={fetchFunnelData}
            disabled={!token || !selectedOrganizationId || loading}
            className='rounded bg-orange-600 px-3 py-1 text-white disabled:bg-gray-400 dark:bg-orange-700 dark:disabled:bg-gray-600'
          >
            {loading ? 'Loading...' : 'Fetch Funnel API Data'}
          </button>
        </div>

        {error && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Error:</strong> {error}
          </div>
        )}

        {currentFunnel && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
              View Current Funnel Data
            </summary>
            <pre className='mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800 dark:text-gray-200'>
              {JSON.stringify(currentFunnel, null, 2)}
            </pre>
          </details>
        )}

        {apiData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
              View API Response
            </summary>
            <pre className='mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800 dark:text-gray-200'>
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </details>
        )}

        {funnels && funnels.length > 0 && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
              View All Local Funnels
            </summary>
            <pre className='mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800 dark:text-gray-200'>
              {JSON.stringify(funnels, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
