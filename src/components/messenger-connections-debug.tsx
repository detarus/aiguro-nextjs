'use client';

import { useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { MessageSquare, Plus, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function MessengerConnectionsDebug() {
  const { organization } = useOrganization();

  // Состояние для отображения localStorage значений
  const [localStorageFunnel, setLocalStorageFunnel] = useState<any>(null);

  // Состояние для кнопки "Get All Messenger Connections"
  const [allConnectionsData, setAllConnectionsData] = useState<any>(null);
  const [allConnectionsLoading, setAllConnectionsLoading] = useState(false);
  const [allConnectionsError, setAllConnectionsError] = useState<string | null>(
    null
  );
  const [allConnectionsSuccessMessage, setAllConnectionsSuccessMessage] =
    useState<string | null>(null);

  // Состояние для кнопки "Create New Connection"
  const [createConnectionData, setCreateConnectionData] = useState<any>(null);
  const [createConnectionLoading, setCreateConnectionLoading] = useState(false);
  const [createConnectionError, setCreateConnectionError] = useState<
    string | null
  >(null);
  const [createConnectionSuccessMessage, setCreateConnectionSuccessMessage] =
    useState<string | null>(null);

  // Состояние для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messengerType, setMessengerType] = useState('');
  const [token, setToken] = useState('');

  // Получаем backend ID организации из метаданных Clerk
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  // Функция для обновления localStorage значений
  const updateLocalStorageData = () => {
    if (typeof window !== 'undefined') {
      // Обновляем текущую воронку
      const storedFunnel = localStorage.getItem('currentFunnel');
      if (storedFunnel) {
        try {
          setLocalStorageFunnel(JSON.parse(storedFunnel));
        } catch {
          setLocalStorageFunnel(null);
        }
      } else {
        setLocalStorageFunnel(null);
      }
    }
  };

  // Обновляем localStorage значения при монтировании компонента
  useEffect(() => {
    updateLocalStorageData();

    // Добавляем слушатель для изменений localStorage
    const handleStorageChange = () => {
      updateLocalStorageData();
    };

    window.addEventListener('storage', handleStorageChange);

    // Также проверяем localStorage каждые 500ms для отслеживания изменений в том же окне
    const interval = setInterval(updateLocalStorageData, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Очищаем данные при смене организации
  useEffect(() => {
    setAllConnectionsData(null);
    setAllConnectionsError(null);
    setAllConnectionsSuccessMessage(null);
    setCreateConnectionData(null);
    setCreateConnectionError(null);
    setCreateConnectionSuccessMessage(null);
  }, [backendOrgId]);

  // Очищаем данные при смене воронки
  useEffect(() => {
    setAllConnectionsData(null);
    setAllConnectionsError(null);
    setAllConnectionsSuccessMessage(null);
    setCreateConnectionData(null);
    setCreateConnectionError(null);
    setCreateConnectionSuccessMessage(null);
  }, [localStorageFunnel?.id]);

  const handleFetchAllConnections = async () => {
    console.log('Get All Messenger Connections button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setAllConnectionsError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setAllConnectionsError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setAllConnectionsError('No current funnel selected');
      return;
    }

    setAllConnectionsLoading(true);
    setAllConnectionsError(null);
    setAllConnectionsSuccessMessage(null);

    try {
      console.log(
        'Making request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id +
          '/messenger_connections'
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/messenger_connections`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully fetched all messenger connections:', data);
      setAllConnectionsData(data);
      setAllConnectionsSuccessMessage(
        'Запрос успешно отправлен и данные получены!'
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setAllConnectionsSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error fetching all messenger connections:', error);
      setAllConnectionsError(error.message || 'Unknown error occurred');
    } finally {
      setAllConnectionsLoading(false);
    }
  };

  const handleCreateConnection = async () => {
    console.log('Create New Connection button clicked!');

    // Получаем токен из cookie
    const tokenFromCookie = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!tokenFromCookie);

    if (!tokenFromCookie) {
      setCreateConnectionError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setCreateConnectionError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setCreateConnectionError('No current funnel selected');
      return;
    }

    if (!messengerType.trim()) {
      setCreateConnectionError('Messenger type is required');
      return;
    }

    if (!token.trim()) {
      setCreateConnectionError('Token is required');
      return;
    }

    setCreateConnectionLoading(true);
    setCreateConnectionError(null);
    setCreateConnectionSuccessMessage(null);

    try {
      const payload = {
        messenger_type: messengerType.trim(),
        token: token.trim()
      };

      console.log(
        'Making POST request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id +
          '/messenger_connection'
      );
      console.log('Payload:', payload);

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/messenger_connection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenFromCookie}`
          },
          body: JSON.stringify(payload)
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully created messenger connection:', data);
      setCreateConnectionData(data);
      setCreateConnectionSuccessMessage(
        'Запрос успешно отправлен и подключение создано!'
      );

      // Закрываем модальное окно и очищаем форму
      setIsModalOpen(false);
      setMessengerType('');
      setToken('');

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setCreateConnectionSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error creating messenger connection:', error);
      setCreateConnectionError(error.message || 'Unknown error occurred');
    } finally {
      setCreateConnectionLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setCreateConnectionError(null);
    setCreateConnectionSuccessMessage(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMessengerType('');
    setToken('');
    setCreateConnectionError(null);
  };

  return (
    <>
      <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20'>
        <h3 className='mb-2 font-semibold text-blue-800 dark:text-blue-200'>
          Messenger Connections Debug Info
        </h3>
        <div className='space-y-2 text-sm'>
          <p>
            <strong>Current Funnel:</strong>{' '}
            {localStorageFunnel?.name ||
              localStorageFunnel?.display_name ||
              'None'}
          </p>
          <p>
            <strong>Current Funnel ID:</strong>{' '}
            {localStorageFunnel?.id || 'None'}
          </p>
          <p>
            <strong>Backend Org ID:</strong> {backendOrgId || 'None'}
          </p>
          <p>
            <strong>Has Token:</strong>{' '}
            {getClerkTokenFromClientCookie() ? 'Yes' : 'No'}
          </p>

          {/* Кнопки для API запросов */}
          <div className='mt-4 space-y-2'>
            <Button
              onClick={handleFetchAllConnections}
              disabled={
                allConnectionsLoading ||
                !backendOrgId ||
                !localStorageFunnel?.id
              }
              variant='outline'
              size='sm'
              className='w-full justify-start'
            >
              <List className='mr-2 h-4 w-4' />
              {allConnectionsLoading
                ? 'Loading...'
                : 'Get All Messenger Connections'}
            </Button>

            <Button
              onClick={handleOpenModal}
              disabled={!backendOrgId || !localStorageFunnel?.id}
              variant='outline'
              size='sm'
              className='w-full justify-start'
            >
              <Plus className='mr-2 h-4 w-4' />
              Create New Connection
            </Button>
          </div>

          {/* Сообщения об успехе */}
          {allConnectionsSuccessMessage && (
            <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
              <strong>Успех (All Connections):</strong>{' '}
              {allConnectionsSuccessMessage}
            </div>
          )}

          {createConnectionSuccessMessage && (
            <div className='mt-2 rounded bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
              <strong>Успех (Create Connection):</strong>{' '}
              {createConnectionSuccessMessage}
            </div>
          )}

          {/* Ошибки */}
          {allConnectionsError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (All Connections):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {allConnectionsError}
              </pre>
            </div>
          )}

          {createConnectionError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Create Connection):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {createConnectionError}
              </pre>
            </div>
          )}

          {/* Результаты API запросов */}
          {allConnectionsData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
                View All Messenger Connections API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-purple-100 p-2 text-xs dark:bg-purple-900/30 dark:text-purple-200'>
                {JSON.stringify(allConnectionsData, null, 2)}
              </pre>
            </details>
          )}

          {createConnectionData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
                View Create Connection API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900/30 dark:text-green-200'>
                {JSON.stringify(createConnectionData, null, 2)}
              </pre>
            </details>
          )}

          {/* Локальные данные */}
          {localStorageFunnel && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
                View Current Funnel Local Data
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800 dark:text-gray-200'>
                {JSON.stringify(localStorageFunnel, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>

      {/* Модальное окно для создания подключения */}
      {isModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Create New Messenger Connection
              </h2>
              <button
                onClick={handleCloseModal}
                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              >
                <svg
                  className='h-6 w-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <Label
                  htmlFor='messenger_type'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Messenger Type
                </Label>
                <Input
                  id='messenger_type'
                  type='text'
                  value={messengerType}
                  onChange={(e) => setMessengerType(e.target.value)}
                  placeholder='e.g., telegram, whatsapp, discord'
                  className='mt-1'
                />
              </div>

              <div>
                <Label
                  htmlFor='token'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Token
                </Label>
                <Input
                  id='token'
                  type='text'
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder='Enter messenger token'
                  className='mt-1'
                />
              </div>

              {createConnectionError && (
                <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  <strong>Ошибка:</strong>
                  <pre className='mt-1 text-sm whitespace-pre-wrap'>
                    {createConnectionError}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  onClick={handleCloseModal}
                  variant='outline'
                  disabled={createConnectionLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateConnection}
                  disabled={
                    createConnectionLoading ||
                    !messengerType.trim() ||
                    !token.trim()
                  }
                >
                  <MessageSquare className='mr-2 h-4 w-4' />
                  {createConnectionLoading
                    ? 'Creating...'
                    : 'Create Connection'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
