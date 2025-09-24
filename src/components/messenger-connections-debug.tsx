'use client';

import { useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useFunnels } from '@/contexts/FunnelsContext';
import { Button } from '@/components/ui/button';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { MessageSquare, Plus, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export function MessengerConnectionsDebug() {
  const { organization } = useOrganization();
  const { currentFunnel } = useFunnels();

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

  // Состояние для кнопки "Get Organization Messenger Connections"
  const [orgConnectionsData, setOrgConnectionsData] = useState<any>(null);
  const [orgConnectionsLoading, setOrgConnectionsLoading] = useState(false);
  const [orgConnectionsError, setOrgConnectionsError] = useState<string | null>(
    null
  );
  const [orgConnectionsSuccessMessage, setOrgConnectionsSuccessMessage] =
    useState<string | null>(null);

  // Состояние для кнопки "Create New Connection"
  const [createConnectionData, setCreateConnectionData] = useState<any>(null);
  const [createConnectionLoading, setCreateConnectionLoading] = useState(false);
  const [createConnectionError, setCreateConnectionError] = useState<
    string | null
  >(null);
  const [createConnectionSuccessMessage, setCreateConnectionSuccessMessage] =
    useState<string | null>(null);

  // Состояние для кнопки "Attach Messenger Connection"
  const [attachConnectionData, setAttachConnectionData] = useState<any>(null);
  const [attachConnectionLoading, setAttachConnectionLoading] = useState(false);
  const [attachConnectionError, setAttachConnectionError] = useState<
    string | null
  >(null);
  const [attachConnectionSuccessMessage, setAttachConnectionSuccessMessage] =
    useState<string | null>(null);

  // Состояние для кнопки "Detach Messenger Connection"
  const [detachConnectionData, setDetachConnectionData] = useState<any>(null);
  const [detachConnectionLoading, setDetachConnectionLoading] = useState(false);
  const [detachConnectionError, setDetachConnectionError] = useState<
    string | null
  >(null);
  const [detachConnectionSuccessMessage, setDetachConnectionSuccessMessage] =
    useState<string | null>(null);

  // Состояние для модального окна Create Connection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messengerType, setMessengerType] = useState('');
  const [token, setToken] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Состояние для модального окна Attach Connection
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [availableConnections, setAvailableConnections] = useState<any[]>([]);

  // Состояние для модального окна Detach Connection
  const [isDetachModalOpen, setIsDetachModalOpen] = useState(false);
  const [selectedDetachConnectionId, setSelectedDetachConnectionId] =
    useState('');
  const [funnelConnections, setFunnelConnections] = useState<any[]>([]);

  // Получаем backend ID организации из метаданных Clerk
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  // Функция для обновления localStorage значений
  const updateLocalStorageData = () => {
    if (typeof window !== 'undefined') {
      // Используем currentFunnel из контекста, если он есть, иначе из localStorage
      if (currentFunnel) {
        setLocalStorageFunnel(currentFunnel);
      } else {
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
    }
  };

  // Обновляем localStorage значения при монтировании компонента и изменении currentFunnel
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
  }, [currentFunnel]);

  // Очищаем данные при смене организации
  useEffect(() => {
    setAllConnectionsData(null);
    setAllConnectionsError(null);
    setAllConnectionsSuccessMessage(null);
    setOrgConnectionsData(null);
    setOrgConnectionsError(null);
    setOrgConnectionsSuccessMessage(null);
    setCreateConnectionData(null);
    setCreateConnectionError(null);
    setCreateConnectionSuccessMessage(null);
    setAttachConnectionData(null);
    setAttachConnectionError(null);
    setAttachConnectionSuccessMessage(null);
    setDetachConnectionData(null);
    setDetachConnectionError(null);
    setDetachConnectionSuccessMessage(null);
  }, [backendOrgId]);

  // Очищаем данные при смене воронки
  useEffect(() => {
    setAllConnectionsData(null);
    setAllConnectionsError(null);
    setAllConnectionsSuccessMessage(null);
    setOrgConnectionsData(null);
    setOrgConnectionsError(null);
    setOrgConnectionsSuccessMessage(null);
    setCreateConnectionData(null);
    setCreateConnectionError(null);
    setCreateConnectionSuccessMessage(null);
    setAttachConnectionData(null);
    setAttachConnectionError(null);
    setAttachConnectionSuccessMessage(null);
    setDetachConnectionData(null);
    setDetachConnectionError(null);
    setDetachConnectionSuccessMessage(null);
  }, [localStorageFunnel?.id]);

  const handleFetchFunnelConnections = async () => {
    console.log('Get Messenger Connections for Funnel button clicked!');

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

  const handleFetchOrgConnections = async () => {
    console.log('Get Organization Messenger Connections button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setOrgConnectionsError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setOrgConnectionsError('No backend organization ID found in metadata');
      return;
    }

    setOrgConnectionsLoading(true);
    setOrgConnectionsError(null);
    setOrgConnectionsSuccessMessage(null);

    try {
      console.log(
        'Making request to /api/organization/' +
          backendOrgId +
          '/messenger_connections'
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/messenger_connections`,
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
      console.log(
        'Successfully fetched organization messenger connections:',
        data
      );
      setOrgConnectionsData(data);
      setOrgConnectionsSuccessMessage(
        'Запрос успешно отправлен и данные получены!'
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setOrgConnectionsSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error(
        'Error fetching organization messenger connections:',
        error
      );
      setOrgConnectionsError(error.message || 'Unknown error occurred');
    } finally {
      setOrgConnectionsLoading(false);
    }
  };

  const handleAttachConnection = async () => {
    console.log('Attach Messenger Connection button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setAttachConnectionError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setAttachConnectionError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id || localStorageFunnel.id === '0') {
      setAttachConnectionError('No specific funnel selected');
      return;
    }

    if (!selectedConnectionId) {
      setAttachConnectionError('Please select a messenger connection');
      return;
    }

    setAttachConnectionLoading(true);
    setAttachConnectionError(null);
    setAttachConnectionSuccessMessage(null);

    try {
      console.log(
        'Making POST request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id +
          '/attach_messenger_connection?messenger_connection_id=' +
          selectedConnectionId
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/attach_messenger_connection?messenger_connection_id=${selectedConnectionId}`,
        {
          method: 'POST',
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
      console.log('Successfully attached messenger connection:', data);
      setAttachConnectionData(data);
      setAttachConnectionSuccessMessage(
        'Запрос успешно отправлен и подключение привязано к воронке!'
      );

      // Закрываем модальное окно и очищаем форму
      setIsAttachModalOpen(false);
      setSelectedConnectionId('');

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setAttachConnectionSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error attaching messenger connection:', error);
      setAttachConnectionError(error.message || 'Unknown error occurred');
    } finally {
      setAttachConnectionLoading(false);
    }
  };

  const handleOpenAttachModal = async () => {
    // Сначала загружаем доступные подключения
    if (availableConnections.length === 0) {
      await loadAvailableConnections();
    }
    setIsAttachModalOpen(true);
    setAttachConnectionError(null);
    setAttachConnectionSuccessMessage(null);
  };

  const loadAvailableConnections = async () => {
    const token = getClerkTokenFromClientCookie();
    if (!token || !backendOrgId) return;

    try {
      const response = await fetch(
        `/api/organization/${backendOrgId}/messenger_connections`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableConnections(data);
      }
    } catch (error) {
      console.error('Error loading available connections:', error);
    }
  };

  const handleCloseAttachModal = () => {
    setIsAttachModalOpen(false);
    setSelectedConnectionId('');
    setAttachConnectionError(null);
  };

  const handleDetachConnection = async () => {
    console.log('Detach Messenger Connection button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setDetachConnectionError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setDetachConnectionError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id || localStorageFunnel.id === '0') {
      setDetachConnectionError('No specific funnel selected');
      return;
    }

    if (!selectedDetachConnectionId) {
      setDetachConnectionError(
        'Please select a messenger connection to detach'
      );
      return;
    }

    setDetachConnectionLoading(true);
    setDetachConnectionError(null);
    setDetachConnectionSuccessMessage(null);

    try {
      console.log(
        'Making DELETE request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id +
          '/detach_messenger_connection?messenger_connection_id=' +
          selectedDetachConnectionId
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/detach_messenger_connection?messenger_connection_id=${selectedDetachConnectionId}`,
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
      console.log('Successfully detached messenger connection:', data);
      setDetachConnectionData(data);
      setDetachConnectionSuccessMessage(
        'Запрос успешно отправлен и подключение отвязано от воронки!'
      );

      // Закрываем модальное окно и очищаем форму
      setIsDetachModalOpen(false);
      setSelectedDetachConnectionId('');

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setDetachConnectionSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error detaching messenger connection:', error);
      setDetachConnectionError(error.message || 'Unknown error occurred');
    } finally {
      setDetachConnectionLoading(false);
    }
  };

  const handleOpenDetachModal = async () => {
    // Сначала загружаем подключения воронки
    if (funnelConnections.length === 0) {
      await loadFunnelConnections();
    }
    setIsDetachModalOpen(true);
    setDetachConnectionError(null);
    setDetachConnectionSuccessMessage(null);
  };

  const loadFunnelConnections = async () => {
    const token = getClerkTokenFromClientCookie();
    if (
      !token ||
      !backendOrgId ||
      !localStorageFunnel?.id ||
      localStorageFunnel.id === '0'
    )
      return;

    try {
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

      if (response.ok) {
        const data = await response.json();
        setFunnelConnections(data);
      }
    } catch (error) {
      console.error('Error loading funnel connections:', error);
    }
  };

  const handleCloseDetachModal = () => {
    setIsDetachModalOpen(false);
    setSelectedDetachConnectionId('');
    setDetachConnectionError(null);
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
      // Создаем текущую дату в ISO формате
      const currentDate = new Date().toISOString();

      const payload = {
        organization_id: parseInt(backendOrgId),
        messenger_type: messengerType.trim(),
        token: token.trim(),
        is_active: isActive,
        created_at: currentDate,
        last_update: currentDate
      };

      console.log(
        'Making POST request to /api/organization/' +
          backendOrgId +
          '/messenger_connection'
      );
      console.log('Payload:', payload);

      const response = await fetch(
        `/api/organization/${backendOrgId}/messenger_connection`,
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
      setIsActive(true);

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
    setIsActive(true);
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
              onClick={handleFetchOrgConnections}
              disabled={orgConnectionsLoading || !backendOrgId}
              variant='outline'
              size='sm'
              className='w-full justify-start'
            >
              <List className='mr-2 h-4 w-4' />
              {orgConnectionsLoading
                ? 'Loading...'
                : 'Get Organization Messenger Connections'}
            </Button>

            {localStorageFunnel?.id !== '0' && (
              <Button
                onClick={handleFetchFunnelConnections}
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
                  : 'Get Messenger Connections for Funnel'}
              </Button>
            )}

            {localStorageFunnel?.id !== '0' && (
              <Button
                onClick={handleOpenAttachModal}
                disabled={!backendOrgId || !localStorageFunnel?.id}
                variant='outline'
                size='sm'
                className='w-full justify-start'
              >
                <MessageSquare className='mr-2 h-4 w-4' />
                Attach Messenger Connection
              </Button>
            )}

            {localStorageFunnel?.id !== '0' && (
              <Button
                onClick={handleOpenDetachModal}
                disabled={!backendOrgId || !localStorageFunnel?.id}
                variant='outline'
                size='sm'
                className='w-full justify-start'
              >
                <MessageSquare className='mr-2 h-4 w-4' />
                Detach Messenger Connection
              </Button>
            )}

            <Button
              onClick={handleOpenModal}
              disabled={!backendOrgId}
              variant='outline'
              size='sm'
              className='w-full justify-start'
            >
              <Plus className='mr-2 h-4 w-4' />
              Create New Connection
            </Button>
          </div>

          {/* Сообщения об успехе */}
          {orgConnectionsSuccessMessage && (
            <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
              <strong>Успех (Organization Connections):</strong>{' '}
              {orgConnectionsSuccessMessage}
            </div>
          )}

          {allConnectionsSuccessMessage && (
            <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
              <strong>Успех (Funnel Connections):</strong>{' '}
              {allConnectionsSuccessMessage}
            </div>
          )}

          {attachConnectionSuccessMessage && (
            <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
              <strong>Успех (Attach Connection):</strong>{' '}
              {attachConnectionSuccessMessage}
            </div>
          )}

          {detachConnectionSuccessMessage && (
            <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
              <strong>Успех (Detach Connection):</strong>{' '}
              {detachConnectionSuccessMessage}
            </div>
          )}

          {createConnectionSuccessMessage && (
            <div className='mt-2 rounded bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
              <strong>Успех (Create Connection):</strong>{' '}
              {createConnectionSuccessMessage}
            </div>
          )}

          {/* Ошибки */}
          {orgConnectionsError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Organization Connections):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {orgConnectionsError}
              </pre>
            </div>
          )}

          {allConnectionsError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Funnel Connections):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {allConnectionsError}
              </pre>
            </div>
          )}

          {attachConnectionError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Attach Connection):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {attachConnectionError}
              </pre>
            </div>
          )}

          {detachConnectionError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Detach Connection):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {detachConnectionError}
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
          {orgConnectionsData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
                View Organization Connections API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-purple-100 p-2 text-xs dark:bg-purple-900/30 dark:text-purple-200'>
                {JSON.stringify(orgConnectionsData, null, 2)}
              </pre>
            </details>
          )}

          {allConnectionsData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
                View Funnel Connections API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-purple-100 p-2 text-xs dark:bg-purple-900/30 dark:text-purple-200'>
                {JSON.stringify(allConnectionsData, null, 2)}
              </pre>
            </details>
          )}

          {attachConnectionData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
                View Attach Connection API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900/30 dark:text-green-200'>
                {JSON.stringify(attachConnectionData, null, 2)}
              </pre>
            </details>
          )}

          {detachConnectionData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
                View Detach Connection API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900/30 dark:text-green-200'>
                {JSON.stringify(detachConnectionData, null, 2)}
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
                {localStorageFunnel.id === '0'
                  ? 'View All Funnels Local Data'
                  : 'View Current Funnel Local Data'}
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800 dark:text-gray-200'>
                {localStorageFunnel.id === '0'
                  ? JSON.stringify(
                      JSON.parse(localStorage.getItem('funnels') || '[]'),
                      null,
                      2
                    )
                  : JSON.stringify(localStorageFunnel, null, 2)}
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

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='is_active'
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked as boolean)}
                />
                <Label
                  htmlFor='is_active'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Active
                </Label>
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

      {/* Модальное окно для Attach Connection */}
      {isAttachModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Attach Messenger Connection
              </h2>
              <button
                onClick={handleCloseAttachModal}
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
                  htmlFor='connection_id'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Select Messenger Connection
                </Label>
                <Select
                  value={selectedConnectionId}
                  onValueChange={setSelectedConnectionId}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Choose a connection...' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableConnections.map((connection) => (
                      <SelectItem
                        key={connection.id}
                        value={connection.id.toString()}
                      >
                        {connection.name} ({connection.messenger_type}) - ID:{' '}
                        {connection.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {attachConnectionError && (
                <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  <strong>Ошибка:</strong>
                  <pre className='mt-1 text-sm whitespace-pre-wrap'>
                    {attachConnectionError}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  onClick={handleCloseAttachModal}
                  variant='outline'
                  disabled={attachConnectionLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAttachConnection}
                  disabled={attachConnectionLoading || !selectedConnectionId}
                >
                  <MessageSquare className='mr-2 h-4 w-4' />
                  {attachConnectionLoading
                    ? 'Attaching...'
                    : 'Attach Connection'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для Detach Connection */}
      {isDetachModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Detach Messenger Connection
              </h2>
              <button
                onClick={handleCloseDetachModal}
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
                  htmlFor='detach_connection_id'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Select Messenger Connection to Detach
                </Label>
                <Select
                  value={selectedDetachConnectionId}
                  onValueChange={setSelectedDetachConnectionId}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Choose a connection to detach...' />
                  </SelectTrigger>
                  <SelectContent>
                    {funnelConnections.map((connection) => (
                      <SelectItem
                        key={connection.id}
                        value={connection.id.toString()}
                      >
                        {connection.name} ({connection.messenger_type}) - ID:{' '}
                        {connection.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {detachConnectionError && (
                <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  <strong>Ошибка:</strong>
                  <pre className='mt-1 text-sm whitespace-pre-wrap'>
                    {detachConnectionError}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  onClick={handleCloseDetachModal}
                  variant='outline'
                  disabled={detachConnectionLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDetachConnection}
                  disabled={
                    detachConnectionLoading || !selectedDetachConnectionId
                  }
                  variant='destructive'
                >
                  <MessageSquare className='mr-2 h-4 w-4' />
                  {detachConnectionLoading
                    ? 'Detaching...'
                    : 'Detach Connection'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
