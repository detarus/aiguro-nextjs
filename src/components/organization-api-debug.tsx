'use client';

import { useOrganization } from '@clerk/nextjs';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';

export function OrganizationApiDebug() {
  const { organization } = useOrganization();

  const [allOrgsData, setAllOrgsData] = useState<any>(null);
  const [allOrgsLoading, setAllOrgsLoading] = useState(false);
  const [allOrgsError, setAllOrgsError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [currentOrgData, setCurrentOrgData] = useState<any>(null);
  const [currentOrgLoading, setCurrentOrgLoading] = useState(false);
  const [currentOrgError, setCurrentOrgError] = useState<string | null>(null);
  const [currentOrgSuccessMessage, setCurrentOrgSuccessMessage] = useState<
    string | null
  >(null);

  const handleFetchAllOrganizations = async () => {
    console.log('Button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setAllOrgsError('No token available in __session cookie');
      return;
    }

    setAllOrgsLoading(true);
    setAllOrgsError(null);
    setSuccessMessage(null);

    try {
      console.log('Sending request to /api/aiguro-organizations...');

      const response = await fetch('/api/aiguro-organizations', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      setAllOrgsData(data);
      setSuccessMessage('Запрос успешно отправлен и данные получены!');

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setAllOrgsError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAllOrgsLoading(false);
    }
  };

  const handleFetchCurrentOrganization = async () => {
    console.log('Get Current Organization button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setCurrentOrgError('No token available in __session cookie');
      return;
    }

    // Получаем backend ID из метаданных организации
    const backendOrgId = organization?.publicMetadata?.id_backend as string;
    console.log('Backend Organization ID:', backendOrgId);

    if (!backendOrgId) {
      setCurrentOrgError('No backend organization ID found in metadata');
      return;
    }

    setCurrentOrgLoading(true);
    setCurrentOrgError(null);
    setCurrentOrgSuccessMessage(null);

    try {
      const apiUrl = `https://app.dev.aiguro.ru/api/organization/${backendOrgId}`;
      console.log('Sending request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Current organization data:', data);

      setCurrentOrgData(data);
      setCurrentOrgSuccessMessage(
        'Данные текущей организации успешно получены!'
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setCurrentOrgSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error fetching current organization:', err);
      setCurrentOrgError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCurrentOrgLoading(false);
    }
  };

  // Получаем backend ID для отображения
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  return (
    <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-900/20'>
      <h3 className='mb-2 font-semibold text-purple-800 dark:text-purple-200'>
        Organization API Debug Info
      </h3>
      <div className='space-y-2 text-sm'>
        <p>
          <strong>Selected Org ID (Backend):</strong> {backendOrgId || 'None'}
        </p>
        <p>
          <strong>Has Token in Cookie:</strong>{' '}
          {getClerkTokenFromClientCookie() ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Clerk Org ID:</strong> {organization?.id || 'Not set'}
        </p>

        <div className='mt-3 space-y-2'>
          <div className='flex flex-wrap gap-2'>
            <Button
              onClick={handleFetchAllOrganizations}
              disabled={allOrgsLoading}
              variant='default'
              size='sm'
              className='cursor-pointer transition-colors hover:bg-blue-600 active:bg-blue-700'
            >
              {allOrgsLoading ? 'Loading...' : 'Get All Organizations'}
            </Button>

            <Button
              onClick={handleFetchCurrentOrganization}
              disabled={
                currentOrgLoading || !organization?.publicMetadata?.id_backend
              }
              variant='secondary'
              size='sm'
              className='cursor-pointer transition-colors hover:bg-gray-600 active:bg-gray-700'
            >
              {currentOrgLoading ? 'Loading...' : 'Get Current Organization'}
            </Button>
          </div>
        </div>

        {successMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Success:</strong> {successMessage}
          </div>
        )}

        {currentOrgSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Success:</strong> {currentOrgSuccessMessage}
          </div>
        )}

        {allOrgsError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Error (All Orgs):</strong> {allOrgsError}
          </div>
        )}

        {currentOrgError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Error (Current Org):</strong> {currentOrgError}
          </div>
        )}

        {allOrgsData && (
          <div className='mt-2'>
            <h4 className='mb-2 font-medium text-purple-700 dark:text-purple-300'>
              All Organizations (
              {Array.isArray(allOrgsData) ? allOrgsData.length : 'N/A'} found):
            </h4>
            <pre className='max-h-64 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800 dark:text-gray-200'>
              {JSON.stringify(allOrgsData, null, 2)}
            </pre>
          </div>
        )}

        {currentOrgData && (
          <div className='mt-2'>
            <h4 className='mb-2 font-medium text-green-700 dark:text-green-300'>
              Current Organization Data:
            </h4>
            <pre className='max-h-64 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800 dark:text-gray-200'>
              {JSON.stringify(currentOrgData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
