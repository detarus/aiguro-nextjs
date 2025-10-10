'use client';

import { useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useFunnels } from '@/contexts/FunnelsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { List, Plus, Eye, Edit, Trash2 } from 'lucide-react';

export function ClientsDebug() {
  const { organization } = useOrganization();
  const { currentFunnel } = useFunnels();

  // Состояние для получения всех клиентов
  const [allClientsData, setAllClientsData] = useState<any>(null);
  const [allClientsLoading, setAllClientsLoading] = useState(false);
  const [allClientsError, setAllClientsError] = useState<string | null>(null);
  const [allClientsSuccessMessage, setAllClientsSuccessMessage] = useState<
    string | null
  >(null);

  // Состояние для создания клиента
  const [createClientData, setCreateClientData] = useState<any>(null);
  const [createClientLoading, setCreateClientLoading] = useState(false);
  const [createClientError, setCreateClientError] = useState<string | null>(
    null
  );
  const [createClientSuccessMessage, setCreateClientSuccessMessage] = useState<
    string | null
  >(null);

  // Состояние для получения конкретного клиента
  const [getClientData, setGetClientData] = useState<any>(null);
  const [getClientLoading, setGetClientLoading] = useState(false);
  const [getClientError, setGetClientError] = useState<string | null>(null);
  const [getClientSuccessMessage, setGetClientSuccessMessage] = useState<
    string | null
  >(null);

  // Состояние для обновления клиента
  const [updateClientData, setUpdateClientData] = useState<any>(null);
  const [updateClientLoading, setUpdateClientLoading] = useState(false);
  const [updateClientError, setUpdateClientError] = useState<string | null>(
    null
  );
  const [updateClientSuccessMessage, setUpdateClientSuccessMessage] = useState<
    string | null
  >(null);

  // Состояние для удаления клиента
  const [deleteClientData, setDeleteClientData] = useState<any>(null);
  const [deleteClientLoading, setDeleteClientLoading] = useState(false);
  const [deleteClientError, setDeleteClientError] = useState<string | null>(
    null
  );
  const [deleteClientSuccessMessage, setDeleteClientSuccessMessage] = useState<
    string | null
  >(null);

  // Состояния для модальных окон
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGetModalOpen, setIsGetModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Состояния для выбора клиентов
  const [selectedClientForGet, setSelectedClientForGet] = useState('');
  const [selectedClientForUpdate, setSelectedClientForUpdate] = useState('');
  const [selectedClientForDelete, setSelectedClientForDelete] = useState('');

  // Состояния для форм
  const [createForm, setCreateForm] = useState({
    name: '',
    phone: '',
    email: '',
    manager: '',
    status: 'active'
  });

  const [updateForm, setUpdateForm] = useState({
    name: '',
    phone: '',
    email: '',
    manager: '',
    status: 'active'
  });

  // Состояние для отображения localStorage значений
  const [localStorageFunnel, setLocalStorageFunnel] = useState<any>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFunnel]);

  // Загружаем данные из localStorage при монтировании компонента
  useEffect(() => {
    const savedFunnel = localStorage.getItem('currentFunnel');
    if (savedFunnel) {
      try {
        setLocalStorageFunnel(JSON.parse(savedFunnel));
      } catch (error) {
        console.error('Error parsing saved funnel:', error);
      }
    }
  }, []);

  // Получаем список клиентов для селектов
  const availableClients =
    allClientsData && Array.isArray(allClientsData) ? allClientsData : [];

  const handleGetAllClients = async () => {
    console.log('Get All Clients button clicked!');

    const tokenFromCookie = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!tokenFromCookie);

    if (!tokenFromCookie) {
      setAllClientsError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setAllClientsError('No backend organization ID found in metadata');
      return;
    }

    setAllClientsLoading(true);
    setAllClientsError(null);
    setAllClientsSuccessMessage(null);

    try {
      console.log(
        'Making GET request to /api/organization/' + backendOrgId + '/clients'
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/clients`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenFromCookie}`
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
      console.log('Successfully fetched all clients:', data);
      setAllClientsData(data);
      setAllClientsSuccessMessage('Все клиенты успешно получены!');

      setTimeout(() => {
        setAllClientsSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error fetching all clients:', error);
      setAllClientsError(error.message || 'Unknown error occurred');
    } finally {
      setAllClientsLoading(false);
    }
  };

  const handleCreateClient = async () => {
    console.log('Create Client form submitted!');

    const tokenFromCookie = getClerkTokenFromClientCookie();
    if (!tokenFromCookie) {
      setCreateClientError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setCreateClientError('No backend organization ID found in metadata');
      return;
    }

    setCreateClientLoading(true);
    setCreateClientError(null);
    setCreateClientSuccessMessage(null);

    try {
      const response = await fetch(`/api/organization/${backendOrgId}/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenFromCookie}`
        },
        body: JSON.stringify(createForm)
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = `${errorMessage}\nServer response: ${errorText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully created client:', data);
      setCreateClientData(data);
      setCreateClientSuccessMessage('Клиент успешно создан!');

      // Закрываем модальное окно и очищаем форму
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '',
        phone: '',
        email: '',
        manager: '',
        status: 'active'
      });

      setTimeout(() => {
        setCreateClientSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error creating client:', error);
      setCreateClientError(error.message || 'Unknown error occurred');
    } finally {
      setCreateClientLoading(false);
    }
  };

  const handleGetClient = async () => {
    console.log('Get Client button clicked!');

    const tokenFromCookie = getClerkTokenFromClientCookie();
    if (!tokenFromCookie) {
      setGetClientError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setGetClientError('No backend organization ID found in metadata');
      return;
    }

    if (!selectedClientForGet) {
      setGetClientError('Please select a client to get');
      return;
    }

    setGetClientLoading(true);
    setGetClientError(null);
    setGetClientSuccessMessage(null);

    try {
      const response = await fetch(
        `/api/organization/${backendOrgId}/client/${selectedClientForGet}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenFromCookie}`
          }
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = `${errorMessage}\nServer response: ${errorText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully fetched client:', data);
      setGetClientData(data);
      setGetClientSuccessMessage(`Данные клиента получены!`);

      // Закрываем модальное окно и очищаем выбор
      setIsGetModalOpen(false);
      setSelectedClientForGet('');

      setTimeout(() => {
        setGetClientSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error fetching client:', error);
      setGetClientError(error.message || 'Unknown error occurred');
    } finally {
      setGetClientLoading(false);
    }
  };

  const handleUpdateClient = async () => {
    console.log('Update Client form submitted!');

    const tokenFromCookie = getClerkTokenFromClientCookie();
    if (!tokenFromCookie) {
      setUpdateClientError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setUpdateClientError('No backend organization ID found in metadata');
      return;
    }

    if (!selectedClientForUpdate) {
      setUpdateClientError('Please select a client to update');
      return;
    }

    setUpdateClientLoading(true);
    setUpdateClientError(null);
    setUpdateClientSuccessMessage(null);

    try {
      const response = await fetch(
        `/api/organization/${backendOrgId}/client/${selectedClientForUpdate}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenFromCookie}`
          },
          body: JSON.stringify(updateForm)
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = `${errorMessage}\nServer response: ${errorText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully updated client:', data);
      setUpdateClientData(data);
      setUpdateClientSuccessMessage(`Клиент успешно обновлен!`);

      // Закрываем модальное окно и очищаем форму
      setIsUpdateModalOpen(false);
      setSelectedClientForUpdate('');
      setUpdateForm({
        name: '',
        phone: '',
        email: '',
        manager: '',
        status: 'active'
      });

      setTimeout(() => {
        setUpdateClientSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error updating client:', error);
      setUpdateClientError(error.message || 'Unknown error occurred');
    } finally {
      setUpdateClientLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    console.log('Delete Client button clicked!');

    const tokenFromCookie = getClerkTokenFromClientCookie();
    if (!tokenFromCookie) {
      setDeleteClientError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setDeleteClientError('No backend organization ID found in metadata');
      return;
    }

    if (!selectedClientForDelete) {
      setDeleteClientError('Please select a client to delete');
      return;
    }

    setDeleteClientLoading(true);
    setDeleteClientError(null);
    setDeleteClientSuccessMessage(null);

    try {
      const response = await fetch(
        `/api/organization/${backendOrgId}/client/${selectedClientForDelete}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenFromCookie}`
          }
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = `${errorMessage}\nServer response: ${errorText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully deleted client:', data);
      setDeleteClientData(data);
      setDeleteClientSuccessMessage(`Клиент успешно удален!`);

      // Закрываем модальное окно и очищаем выбор
      setIsDeleteModalOpen(false);
      setSelectedClientForDelete('');

      setTimeout(() => {
        setDeleteClientSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting client:', error);
      setDeleteClientError(error.message || 'Unknown error occurred');
    } finally {
      setDeleteClientLoading(false);
    }
  };

  // Функции для открытия/закрытия модальных окон
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    setCreateClientError(null);
    setCreateClientSuccessMessage(null);
  };

  const handleOpenGetModal = () => {
    setIsGetModalOpen(true);
    setGetClientError(null);
    setGetClientSuccessMessage(null);
  };

  const handleOpenUpdateModal = () => {
    setIsUpdateModalOpen(true);
    setUpdateClientError(null);
    setUpdateClientSuccessMessage(null);
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
    setDeleteClientError(null);
    setDeleteClientSuccessMessage(null);
  };

  // Предзаполнение формы обновления данными выбранного клиента
  const handleClientSelectForUpdate = (clientId: string) => {
    setSelectedClientForUpdate(clientId);
    const selectedClient = availableClients.find(
      (client: any) => client.id === clientId
    );
    if (selectedClient) {
      setUpdateForm({
        name: selectedClient.name || '',
        phone: selectedClient.phone || '',
        email: selectedClient.email || '',
        manager: selectedClient.manager || '',
        status: selectedClient.status || 'active'
      });
    }
  };

  return (
    <>
      <div className='rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-700 dark:bg-teal-900/20'>
        <h3 className='mb-2 font-semibold text-teal-800 dark:text-teal-200'>
          Clients Debug Info
        </h3>
        <div className='space-y-2 text-sm'>
          <p>
            <strong>Backend Org ID:</strong> {backendOrgId || 'None'}
          </p>
          <p>
            <strong>Has Token:</strong>{' '}
            {getClerkTokenFromClientCookie() ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>Available Clients:</strong> {availableClients.length}
          </p>

          {/* Кнопки для API запросов */}
          <div className='mt-4 space-y-2'>
            <Button
              onClick={handleGetAllClients}
              disabled={allClientsLoading || !backendOrgId}
              variant='outline'
              size='sm'
              className='w-full justify-start'
            >
              <List className='mr-2 h-4 w-4' />
              {allClientsLoading ? 'Loading...' : 'Get All Clients'}
            </Button>

            {localStorageFunnel?.id !== '0' && (
              <Button
                onClick={handleOpenCreateModal}
                disabled={!backendOrgId}
                variant='outline'
                size='sm'
                className='w-full justify-start text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-300'
              >
                <Plus className='mr-2 h-4 w-4' />
                Create Client
              </Button>
            )}

            {localStorageFunnel?.id !== '0' && (
              <Button
                onClick={handleOpenGetModal}
                disabled={!backendOrgId || availableClients.length === 0}
                variant='outline'
                size='sm'
                className='w-full justify-start'
              >
                <Eye className='mr-2 h-4 w-4' />
                Get Client
              </Button>
            )}

            {localStorageFunnel?.id !== '0' && (
              <Button
                onClick={handleOpenUpdateModal}
                disabled={!backendOrgId || availableClients.length === 0}
                variant='outline'
                size='sm'
                className='w-full justify-start text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300'
              >
                <Edit className='mr-2 h-4 w-4' />
                Update Client
              </Button>
            )}

            {localStorageFunnel?.id !== '0' && (
              <Button
                onClick={handleOpenDeleteModal}
                disabled={!backendOrgId || availableClients.length === 0}
                variant='outline'
                size='sm'
                className='w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete Client
              </Button>
            )}
          </div>

          {/* Сообщения об успехе */}
          {allClientsSuccessMessage && (
            <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
              <strong>Успех:</strong> {allClientsSuccessMessage}
            </div>
          )}

          {createClientSuccessMessage && (
            <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
              <strong>Успех (Create Client):</strong>{' '}
              {createClientSuccessMessage}
            </div>
          )}

          {getClientSuccessMessage && (
            <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
              <strong>Успех (Get Client):</strong> {getClientSuccessMessage}
            </div>
          )}

          {updateClientSuccessMessage && (
            <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
              <strong>Успех (Update Client):</strong>{' '}
              {updateClientSuccessMessage}
            </div>
          )}

          {deleteClientSuccessMessage && (
            <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
              <strong>Успех (Delete Client):</strong>{' '}
              {deleteClientSuccessMessage}
            </div>
          )}

          {/* Ошибки */}
          {allClientsError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка:</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {allClientsError}
              </pre>
            </div>
          )}

          {createClientError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Create Client):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {createClientError}
              </pre>
            </div>
          )}

          {getClientError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Get Client):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {getClientError}
              </pre>
            </div>
          )}

          {updateClientError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Update Client):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {updateClientError}
              </pre>
            </div>
          )}

          {deleteClientError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Delete Client):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {deleteClientError}
              </pre>
            </div>
          )}

          {/* Результаты API запросов */}
          {allClientsData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-teal-600 dark:text-teal-400'>
                View All Clients API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-teal-100 p-2 text-xs dark:bg-teal-900/30 dark:text-teal-200'>
                {JSON.stringify(allClientsData, null, 2)}
              </pre>
            </details>
          )}

          {createClientData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-teal-600 dark:text-teal-400'>
                View Create Client API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900/30 dark:text-green-200'>
                {JSON.stringify(createClientData, null, 2)}
              </pre>
            </details>
          )}

          {getClientData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-teal-600 dark:text-teal-400'>
                View Get Client API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-blue-100 p-2 text-xs dark:bg-blue-900/30 dark:text-blue-200'>
                {JSON.stringify(getClientData, null, 2)}
              </pre>
            </details>
          )}

          {updateClientData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-teal-600 dark:text-teal-400'>
                View Update Client API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-blue-100 p-2 text-xs dark:bg-blue-900/30 dark:text-blue-200'>
                {JSON.stringify(updateClientData, null, 2)}
              </pre>
            </details>
          )}

          {deleteClientData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-teal-600 dark:text-teal-400'>
                View Delete Client API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-red-100 p-2 text-xs dark:bg-red-900/30 dark:text-red-200'>
                {JSON.stringify(deleteClientData, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>

      {/* Модальное окно для создания клиента */}
      {isCreateModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Create Client
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
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
                  htmlFor='create_name'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Name
                </Label>
                <Input
                  id='create_name'
                  type='text'
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  placeholder='Client name'
                  className='mt-1'
                />
              </div>

              <div>
                <Label
                  htmlFor='create_phone'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Phone
                </Label>
                <Input
                  id='create_phone'
                  type='tel'
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, phone: e.target.value })
                  }
                  placeholder='Phone number'
                  className='mt-1'
                />
              </div>

              <div>
                <Label
                  htmlFor='create_email'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Email
                </Label>
                <Input
                  id='create_email'
                  type='email'
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  placeholder='Email address'
                  className='mt-1'
                />
              </div>

              <div>
                <Label
                  htmlFor='create_manager'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Manager
                </Label>
                <Input
                  id='create_manager'
                  type='text'
                  value={createForm.manager}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, manager: e.target.value })
                  }
                  placeholder='Manager name'
                  className='mt-1'
                />
              </div>

              <div>
                <Label
                  htmlFor='create_status'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Status
                </Label>
                <Select
                  value={createForm.status}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, status: value })
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createClientError && (
                <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  <strong>Ошибка:</strong>
                  <pre className='mt-1 text-sm whitespace-pre-wrap'>
                    {createClientError}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  onClick={() => setIsCreateModalOpen(false)}
                  variant='outline'
                  disabled={createClientLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateClient}
                  disabled={createClientLoading}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  {createClientLoading ? 'Creating...' : 'Create Client'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для получения клиента */}
      {isGetModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Get Client
              </h2>
              <button
                onClick={() => setIsGetModalOpen(false)}
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
                <label
                  htmlFor='client_select_get'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Select Client to Get
                </label>
                <Select
                  value={selectedClientForGet}
                  onValueChange={setSelectedClientForGet}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Choose a client to get' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {getClientError && (
                <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  <strong>Ошибка:</strong>
                  <pre className='mt-1 text-sm whitespace-pre-wrap'>
                    {getClientError}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  onClick={() => setIsGetModalOpen(false)}
                  variant='outline'
                  disabled={getClientLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGetClient}
                  disabled={getClientLoading || !selectedClientForGet}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  {getClientLoading ? 'Loading...' : 'Get Client'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для обновления клиента */}
      {isUpdateModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Update Client
              </h2>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
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
                <label
                  htmlFor='client_select_update'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Select Client to Update
                </label>
                <Select
                  value={selectedClientForUpdate}
                  onValueChange={handleClientSelectForUpdate}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Choose a client to update' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClientForUpdate && (
                <>
                  <div>
                    <Label
                      htmlFor='update_name'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      Name
                    </Label>
                    <Input
                      id='update_name'
                      type='text'
                      value={updateForm.name}
                      onChange={(e) =>
                        setUpdateForm({ ...updateForm, name: e.target.value })
                      }
                      placeholder='Client name'
                      className='mt-1'
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor='update_phone'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      Phone
                    </Label>
                    <Input
                      id='update_phone'
                      type='tel'
                      value={updateForm.phone}
                      onChange={(e) =>
                        setUpdateForm({ ...updateForm, phone: e.target.value })
                      }
                      placeholder='Phone number'
                      className='mt-1'
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor='update_email'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      Email
                    </Label>
                    <Input
                      id='update_email'
                      type='email'
                      value={updateForm.email}
                      onChange={(e) =>
                        setUpdateForm({ ...updateForm, email: e.target.value })
                      }
                      placeholder='Email address'
                      className='mt-1'
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor='update_manager'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      Manager
                    </Label>
                    <Input
                      id='update_manager'
                      type='text'
                      value={updateForm.manager}
                      onChange={(e) =>
                        setUpdateForm({
                          ...updateForm,
                          manager: e.target.value
                        })
                      }
                      placeholder='Manager name'
                      className='mt-1'
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor='update_status'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      Status
                    </Label>
                    <Select
                      value={updateForm.status}
                      onValueChange={(value) =>
                        setUpdateForm({ ...updateForm, status: value })
                      }
                    >
                      <SelectTrigger className='mt-1'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='inactive'>Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {updateClientError && (
                <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  <strong>Ошибка:</strong>
                  <pre className='mt-1 text-sm whitespace-pre-wrap'>
                    {updateClientError}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  onClick={() => setIsUpdateModalOpen(false)}
                  variant='outline'
                  disabled={updateClientLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateClient}
                  disabled={updateClientLoading || !selectedClientForUpdate}
                >
                  <Edit className='mr-2 h-4 w-4' />
                  {updateClientLoading ? 'Updating...' : 'Update Client'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для удаления клиента */}
      {isDeleteModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Delete Client
              </h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
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
                <label
                  htmlFor='client_select_delete'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Select Client to Delete
                </label>
                <Select
                  value={selectedClientForDelete}
                  onValueChange={setSelectedClientForDelete}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Choose a client to delete' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClientForDelete && (
                <div className='rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/20'>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>
                    Are you sure you want to delete client &quot;
                    {
                      availableClients.find(
                        (c: any) => c.id === selectedClientForDelete
                      )?.name
                    }
                    &quot;?
                  </p>
                </div>
              )}

              {deleteClientError && (
                <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  <strong>Ошибка:</strong>
                  <pre className='mt-1 text-sm whitespace-pre-wrap'>
                    {deleteClientError}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  onClick={() => setIsDeleteModalOpen(false)}
                  variant='outline'
                  disabled={deleteClientLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteClient}
                  disabled={deleteClientLoading || !selectedClientForDelete}
                  variant='destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  {deleteClientLoading ? 'Deleting...' : 'Delete Client'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
