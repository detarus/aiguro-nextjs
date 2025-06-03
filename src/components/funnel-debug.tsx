'use client';

import { useFunnels } from '@/hooks/useFunnels';
import { useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { Button } from '@/components/ui/button';
import { RefreshCw, List, Trash2 } from 'lucide-react';

export function FunnelDebug() {
  const { organization } = useOrganization();
  const { funnels } = useFunnels(
    organization?.publicMetadata?.id_backend as string
  );

  // Состояние для отображения localStorage значений
  const [localStorageFunnel, setLocalStorageFunnel] = useState<any>(null);
  const [localStorageFunnels, setLocalStorageFunnels] = useState<any[]>([]);

  // Состояние для кнопки "Get All Funnels"
  const [allFunnelsData, setAllFunnelsData] = useState<any>(null);
  const [allFunnelsLoading, setAllFunnelsLoading] = useState(false);
  const [allFunnelsError, setAllFunnelsError] = useState<string | null>(null);
  const [allFunnelsSuccessMessage, setAllFunnelsSuccessMessage] = useState<
    string | null
  >(null);

  // Состояние для кнопки "Get Current Funnel"
  const [currentFunnelData, setCurrentFunnelData] = useState<any>(null);
  const [currentFunnelLoading, setCurrentFunnelLoading] = useState(false);
  const [currentFunnelError, setCurrentFunnelError] = useState<string | null>(
    null
  );
  const [currentFunnelSuccessMessage, setCurrentFunnelSuccessMessage] =
    useState<string | null>(null);

  // Состояние для кнопки "Delete Current Funnel"
  const [deleteFunnelData, setDeleteFunnelData] = useState<any>(null);
  const [deleteFunnelLoading, setDeleteFunnelLoading] = useState(false);
  const [deleteFunnelError, setDeleteFunnelError] = useState<string | null>(
    null
  );
  const [deleteFunnelSuccessMessage, setDeleteFunnelSuccessMessage] = useState<
    string | null
  >(null);

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

      // Обновляем список воронок
      const storedFunnels = localStorage.getItem('funnels');
      if (storedFunnels) {
        try {
          setLocalStorageFunnels(JSON.parse(storedFunnels));
        } catch {
          setLocalStorageFunnels([]);
        }
      } else {
        setLocalStorageFunnels([]);
      }
    }
  };

  // Отслеживаем изменения funnels из хука (для синхронизации)
  useEffect(() => {
    console.log('FunnelDebug: funnels from hook changed:', funnels);
    updateLocalStorageData();
  }, [funnels]);

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
    setAllFunnelsData(null);
    setAllFunnelsError(null);
    setAllFunnelsSuccessMessage(null);
    setCurrentFunnelData(null);
    setCurrentFunnelError(null);
    setCurrentFunnelSuccessMessage(null);
    setDeleteFunnelData(null);
    setDeleteFunnelError(null);
    setDeleteFunnelSuccessMessage(null);
  }, [backendOrgId]);

  // Очищаем данные текущей воронки при её смене
  useEffect(() => {
    setCurrentFunnelData(null);
    setCurrentFunnelError(null);
    setCurrentFunnelSuccessMessage(null);
    setDeleteFunnelData(null);
    setDeleteFunnelError(null);
    setDeleteFunnelSuccessMessage(null);
  }, [localStorageFunnel?.id]);

  const handleFetchAllFunnels = async () => {
    console.log('Get All Funnels button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setAllFunnelsError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setAllFunnelsError('No backend organization ID found in metadata');
      return;
    }

    setAllFunnelsLoading(true);
    setAllFunnelsError(null);
    setAllFunnelsSuccessMessage(null);

    try {
      console.log(
        'Making request to /api/organization/' + backendOrgId + '/funnels'
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnels`,
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
      console.log('Successfully fetched all funnels:', data);
      setAllFunnelsData(data);
      setAllFunnelsSuccessMessage(
        'Запрос успешно отправлен и данные получены!'
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setAllFunnelsSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error fetching all funnels:', error);
      setAllFunnelsError(error.message || 'Unknown error occurred');
    } finally {
      setAllFunnelsLoading(false);
    }
  };

  const handleFetchCurrentFunnel = async () => {
    console.log('Get Current Funnel button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setCurrentFunnelError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setCurrentFunnelError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setCurrentFunnelError('No current funnel selected');
      return;
    }

    setCurrentFunnelLoading(true);
    setCurrentFunnelError(null);
    setCurrentFunnelSuccessMessage(null);

    try {
      console.log(
        'Making request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}`,
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
      console.log('Successfully fetched current funnel:', data);
      setCurrentFunnelData(data);
      setCurrentFunnelSuccessMessage(
        'Запрос успешно отправлен и данные получены!'
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setCurrentFunnelSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error fetching current funnel:', error);
      setCurrentFunnelError(error.message || 'Unknown error occurred');
    } finally {
      setCurrentFunnelLoading(false);
    }
  };

  const handleDeleteCurrentFunnel = async () => {
    console.log('Delete Current Funnel button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setDeleteFunnelError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setDeleteFunnelError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setDeleteFunnelError('No current funnel selected');
      return;
    }

    // Подтверждение удаления
    const confirmDelete = window.confirm(
      `Вы уверены, что хотите удалить воронку "${localStorageFunnel?.display_name || localStorageFunnel?.name}" с ID: ${localStorageFunnel.id}?\n\nЭто действие необратимо!`
    );

    if (!confirmDelete) {
      console.log('Delete operation cancelled by user');
      return;
    }

    setDeleteFunnelLoading(true);
    setDeleteFunnelError(null);
    setDeleteFunnelSuccessMessage(null);

    try {
      console.log(
        'Making DELETE request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}`,
        {
          method: 'DELETE',
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
      console.log('Successfully deleted current funnel:', data);
      setDeleteFunnelData(data);
      setDeleteFunnelSuccessMessage(
        'Запрос успешно отправлен и воронка удалена!'
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setDeleteFunnelSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting current funnel:', error);
      setDeleteFunnelError(error.message || 'Unknown error occurred');
    } finally {
      setDeleteFunnelLoading(false);
    }
  };

  return (
    <div className='rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/20'>
      <h3 className='mb-2 font-semibold text-orange-800 dark:text-orange-200'>
        Funnel API Debug Info
      </h3>
      <div className='space-y-2 text-sm'>
        <p>
          <strong>Local Funnels Count:</strong>{' '}
          {localStorageFunnels?.length || 0}
        </p>
        <p>
          <strong>Current Funnel:</strong>{' '}
          {localStorageFunnel?.name ||
            localStorageFunnel?.display_name ||
            'None'}
        </p>
        <p>
          <strong>Current Funnel ID:</strong> {localStorageFunnel?.id || 'None'}
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
            onClick={handleFetchAllFunnels}
            disabled={allFunnelsLoading || !backendOrgId}
            variant='outline'
            size='sm'
            className='w-full justify-start'
          >
            <List className='mr-2 h-4 w-4' />
            {allFunnelsLoading ? 'Loading...' : 'Get All Funnels'}
          </Button>

          <Button
            onClick={handleFetchCurrentFunnel}
            disabled={
              currentFunnelLoading || !backendOrgId || !localStorageFunnel?.id
            }
            variant='outline'
            size='sm'
            className='w-full justify-start'
          >
            <RefreshCw className='mr-2 h-4 w-4' />
            {currentFunnelLoading ? 'Loading...' : 'Get Current Funnel'}
          </Button>

          <Button
            onClick={handleDeleteCurrentFunnel}
            disabled={
              deleteFunnelLoading || !backendOrgId || !localStorageFunnel?.id
            }
            variant='outline'
            size='sm'
            className='w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            {deleteFunnelLoading ? 'Deleting...' : 'Delete Current Funnel'}
          </Button>
        </div>

        {/* Сообщения об успехе */}
        {allFunnelsSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех (All Funnels):</strong> {allFunnelsSuccessMessage}
          </div>
        )}

        {currentFunnelSuccessMessage && (
          <div className='mt-2 rounded bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
            <strong>Успех (Current Funnel):</strong>{' '}
            {currentFunnelSuccessMessage}
          </div>
        )}

        {deleteFunnelSuccessMessage && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Успех (Delete Funnel):</strong> {deleteFunnelSuccessMessage}
          </div>
        )}

        {/* Ошибки */}
        {allFunnelsError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (All Funnels):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {allFunnelsError}
            </pre>
          </div>
        )}

        {currentFunnelError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Current Funnel):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {currentFunnelError}
            </pre>
          </div>
        )}

        {deleteFunnelError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Delete Funnel):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {deleteFunnelError}
            </pre>
          </div>
        )}

        {/* Результаты API запросов */}
        {allFunnelsData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
              View All Funnels API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-purple-100 p-2 text-xs dark:bg-purple-900/30 dark:text-purple-200'>
              {JSON.stringify(allFunnelsData, null, 2)}
            </pre>
          </details>
        )}

        {currentFunnelData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
              View Current Funnel API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900/30 dark:text-green-200'>
              {JSON.stringify(currentFunnelData, null, 2)}
            </pre>
          </details>
        )}

        {deleteFunnelData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
              View Delete Funnel API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-red-100 p-2 text-xs dark:bg-red-900/30 dark:text-red-200'>
              {JSON.stringify(deleteFunnelData, null, 2)}
            </pre>
          </details>
        )}

        {/* Локальные данные */}
        {localStorageFunnel && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
              View Current Funnel Local Data
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800 dark:text-gray-200'>
              {JSON.stringify(localStorageFunnel, null, 2)}
            </pre>
          </details>
        )}

        {localStorageFunnels && localStorageFunnels.length > 0 && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
              View All Local Funnels
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800 dark:text-gray-200'>
              {JSON.stringify(localStorageFunnels, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
