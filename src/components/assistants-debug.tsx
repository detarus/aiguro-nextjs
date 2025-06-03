'use client';

import { useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { Bot, Plus, List, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export function AssistantsDebug() {
  const { organization } = useOrganization();

  // Состояние для отображения localStorage значений
  const [localStorageFunnel, setLocalStorageFunnel] = useState<any>(null);

  // Состояние для кнопки "Get All Assistants"
  const [allAssistantsData, setAllAssistantsData] = useState<any>(null);
  const [allAssistantsLoading, setAllAssistantsLoading] = useState(false);
  const [allAssistantsError, setAllAssistantsError] = useState<string | null>(
    null
  );
  const [allAssistantsSuccessMessage, setAllAssistantsSuccessMessage] =
    useState<string | null>(null);

  // Состояние для кнопки "Create New Assistant"
  const [createAssistantData, setCreateAssistantData] = useState<any>(null);
  const [createAssistantLoading, setCreateAssistantLoading] = useState(false);
  const [createAssistantError, setCreateAssistantError] = useState<
    string | null
  >(null);
  const [createAssistantSuccessMessage, setCreateAssistantSuccessMessage] =
    useState<string | null>(null);

  // Состояние для кнопки "Delete Assistant"
  const [deleteAssistantData, setDeleteAssistantData] = useState<any>(null);
  const [deleteAssistantLoading, setDeleteAssistantLoading] = useState(false);
  const [deleteAssistantError, setDeleteAssistantError] = useState<
    string | null
  >(null);
  const [deleteAssistantSuccessMessage, setDeleteAssistantSuccessMessage] =
    useState<string | null>(null);

  // Состояние для модального окна создания
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [codeName, setCodeName] = useState('');
  const [text, setText] = useState('');

  // Состояние для модального окна удаления
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAssistantToDelete, setSelectedAssistantToDelete] =
    useState('');

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
    setAllAssistantsData(null);
    setAllAssistantsError(null);
    setAllAssistantsSuccessMessage(null);
    setCreateAssistantData(null);
    setCreateAssistantError(null);
    setCreateAssistantSuccessMessage(null);
    setDeleteAssistantData(null);
    setDeleteAssistantError(null);
    setDeleteAssistantSuccessMessage(null);
  }, [backendOrgId]);

  // Очищаем данные при смене воронки
  useEffect(() => {
    setAllAssistantsData(null);
    setAllAssistantsError(null);
    setAllAssistantsSuccessMessage(null);
    setCreateAssistantData(null);
    setCreateAssistantError(null);
    setCreateAssistantSuccessMessage(null);
    setDeleteAssistantData(null);
    setDeleteAssistantError(null);
    setDeleteAssistantSuccessMessage(null);
  }, [localStorageFunnel?.id]);

  const handleFetchAllAssistants = async () => {
    console.log('Get All Assistants button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setAllAssistantsError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setAllAssistantsError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setAllAssistantsError('No current funnel selected');
      return;
    }

    setAllAssistantsLoading(true);
    setAllAssistantsError(null);
    setAllAssistantsSuccessMessage(null);

    try {
      console.log(
        'Making request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id +
          '/assistants'
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/assistants`,
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
      console.log('Successfully fetched all assistants:', data);
      setAllAssistantsData(data);
      setAllAssistantsSuccessMessage(
        'Запрос успешно отправлен и данные получены!'
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setAllAssistantsSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error fetching all assistants:', error);
      setAllAssistantsError(error.message || 'Unknown error occurred');
    } finally {
      setAllAssistantsLoading(false);
    }
  };

  const handleCreateAssistant = async () => {
    console.log('Create New Assistant button clicked!');

    // Получаем токен из cookie
    const tokenFromCookie = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!tokenFromCookie);

    if (!tokenFromCookie) {
      setCreateAssistantError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setCreateAssistantError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setCreateAssistantError('No current funnel selected');
      return;
    }

    if (!codeName.trim()) {
      setCreateAssistantError('Code name is required');
      return;
    }

    if (!text.trim()) {
      setCreateAssistantError('Text is required');
      return;
    }

    setCreateAssistantLoading(true);
    setCreateAssistantError(null);
    setCreateAssistantSuccessMessage(null);

    try {
      const payload = {
        code_name: codeName.trim(),
        text: text.trim()
      };

      console.log(
        'Making POST request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id +
          '/assistants'
      );
      console.log('Payload:', payload);

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/assistants`,
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
      console.log('Successfully created assistant:', data);
      setCreateAssistantData(data);
      setCreateAssistantSuccessMessage(
        'Запрос успешно отправлен и ассистент создан!'
      );

      // Закрываем модальное окно и очищаем форму
      setIsCreateModalOpen(false);
      setCodeName('');
      setText('');

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setCreateAssistantSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error creating assistant:', error);
      setCreateAssistantError(error.message || 'Unknown error occurred');
    } finally {
      setCreateAssistantLoading(false);
    }
  };

  const handleDeleteAssistant = async () => {
    console.log('Delete Assistant button clicked!');

    // Получаем токен из cookie
    const tokenFromCookie = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!tokenFromCookie);

    if (!tokenFromCookie) {
      setDeleteAssistantError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setDeleteAssistantError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setDeleteAssistantError('No current funnel selected');
      return;
    }

    if (!selectedAssistantToDelete) {
      setDeleteAssistantError('Please select an assistant to delete');
      return;
    }

    setDeleteAssistantLoading(true);
    setDeleteAssistantError(null);
    setDeleteAssistantSuccessMessage(null);

    try {
      console.log(
        'Making DELETE request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id +
          '/assistant/' +
          selectedAssistantToDelete
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/assistant/${selectedAssistantToDelete}`,
        {
          method: 'DELETE',
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
      console.log('Successfully deleted assistant:', data);
      setDeleteAssistantData(data);
      setDeleteAssistantSuccessMessage(
        `Запрос успешно отправлен и ассистент "${selectedAssistantToDelete}" удален!`
      );

      // Закрываем модальное окно и очищаем выбор
      setIsDeleteModalOpen(false);
      setSelectedAssistantToDelete('');

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setDeleteAssistantSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting assistant:', error);
      setDeleteAssistantError(error.message || 'Unknown error occurred');
    } finally {
      setDeleteAssistantLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    setCreateAssistantError(null);
    setCreateAssistantSuccessMessage(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setCodeName('');
    setText('');
    setCreateAssistantError(null);
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
    setDeleteAssistantError(null);
    setDeleteAssistantSuccessMessage(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedAssistantToDelete('');
    setDeleteAssistantError(null);
  };

  // Получаем список ассистентов для селекта удаления
  const availableAssistants =
    allAssistantsData && Array.isArray(allAssistantsData)
      ? allAssistantsData
      : [];

  return (
    <>
      <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-900/20'>
        <h3 className='mb-2 font-semibold text-purple-800 dark:text-purple-200'>
          Assistants Debug Info
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
              onClick={handleFetchAllAssistants}
              disabled={
                allAssistantsLoading || !backendOrgId || !localStorageFunnel?.id
              }
              variant='outline'
              size='sm'
              className='w-full justify-start'
            >
              <List className='mr-2 h-4 w-4' />
              {allAssistantsLoading ? 'Loading...' : 'Get All Assistants'}
            </Button>

            <Button
              onClick={handleOpenCreateModal}
              disabled={!backendOrgId || !localStorageFunnel?.id}
              variant='outline'
              size='sm'
              className='w-full justify-start'
            >
              <Plus className='mr-2 h-4 w-4' />
              Create New Assistant
            </Button>

            <Button
              onClick={handleOpenDeleteModal}
              disabled={
                !backendOrgId ||
                !localStorageFunnel?.id ||
                availableAssistants.length === 0
              }
              variant='outline'
              size='sm'
              className='w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Delete Assistant
            </Button>
          </div>

          {/* Сообщения об успехе */}
          {allAssistantsSuccessMessage && (
            <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
              <strong>Успех (All Assistants):</strong>{' '}
              {allAssistantsSuccessMessage}
            </div>
          )}

          {createAssistantSuccessMessage && (
            <div className='mt-2 rounded bg-purple-100 p-2 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'>
              <strong>Успех (Create Assistant):</strong>{' '}
              {createAssistantSuccessMessage}
            </div>
          )}

          {deleteAssistantSuccessMessage && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Успех (Delete Assistant):</strong>{' '}
              {deleteAssistantSuccessMessage}
            </div>
          )}

          {/* Ошибки */}
          {allAssistantsError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (All Assistants):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {allAssistantsError}
              </pre>
            </div>
          )}

          {createAssistantError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Create Assistant):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {createAssistantError}
              </pre>
            </div>
          )}

          {deleteAssistantError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Delete Assistant):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {deleteAssistantError}
              </pre>
            </div>
          )}

          {/* Результаты API запросов */}
          {allAssistantsData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-purple-600 dark:text-purple-400'>
                View All Assistants API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-purple-100 p-2 text-xs dark:bg-purple-900/30 dark:text-purple-200'>
                {JSON.stringify(allAssistantsData, null, 2)}
              </pre>
            </details>
          )}

          {createAssistantData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-purple-600 dark:text-purple-400'>
                View Create Assistant API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900/30 dark:text-green-200'>
                {JSON.stringify(createAssistantData, null, 2)}
              </pre>
            </details>
          )}

          {deleteAssistantData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-purple-600 dark:text-purple-400'>
                View Delete Assistant API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-red-100 p-2 text-xs dark:bg-red-900/30 dark:text-red-200'>
                {JSON.stringify(deleteAssistantData, null, 2)}
              </pre>
            </details>
          )}

          {/* Локальные данные */}
          {localStorageFunnel && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-purple-600 dark:text-purple-400'>
                View Current Funnel Local Data
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800 dark:text-gray-200'>
                {JSON.stringify(localStorageFunnel, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>

      {/* Модальное окно для создания ассистента */}
      {isCreateModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Create New Assistant
              </h2>
              <button
                onClick={handleCloseCreateModal}
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
                  htmlFor='code_name'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Code Name
                </Label>
                <Input
                  id='code_name'
                  type='text'
                  value={codeName}
                  onChange={(e) => setCodeName(e.target.value)}
                  placeholder='e.g., sales_assistant, support_bot'
                  className='mt-1'
                />
              </div>

              <div>
                <Label
                  htmlFor='text'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Text
                </Label>
                <Textarea
                  id='text'
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder='Enter assistant text/prompt'
                  className='mt-1'
                  rows={4}
                />
              </div>

              {createAssistantError && (
                <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  <strong>Ошибка:</strong>
                  <pre className='mt-1 text-sm whitespace-pre-wrap'>
                    {createAssistantError}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  onClick={handleCloseCreateModal}
                  variant='outline'
                  disabled={createAssistantLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAssistant}
                  disabled={
                    createAssistantLoading || !codeName.trim() || !text.trim()
                  }
                >
                  <Bot className='mr-2 h-4 w-4' />
                  {createAssistantLoading ? 'Creating...' : 'Create Assistant'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для удаления ассистента */}
      {isDeleteModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Delete Assistant
              </h2>
              <button
                onClick={handleCloseDeleteModal}
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
                  htmlFor='assistant_select'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Select Assistant to Delete
                </Label>
                <Select
                  value={selectedAssistantToDelete}
                  onValueChange={setSelectedAssistantToDelete}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Choose an assistant to delete' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAssistants.map((assistant: any) => (
                      <SelectItem
                        key={assistant.code_name}
                        value={assistant.code_name}
                      >
                        {assistant.code_name} (ID: {assistant.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAssistantToDelete && (
                <div className='rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/20'>
                  <p className='text-sm text-yellow-800 dark:text-yellow-200'>
                    <strong>Warning:</strong> You are about to delete assistant
                    "{selectedAssistantToDelete}". This action cannot be undone.
                  </p>
                </div>
              )}

              {deleteAssistantError && (
                <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  <strong>Ошибка:</strong>
                  <pre className='mt-1 text-sm whitespace-pre-wrap'>
                    {deleteAssistantError}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  onClick={handleCloseDeleteModal}
                  variant='outline'
                  disabled={deleteAssistantLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAssistant}
                  disabled={
                    deleteAssistantLoading || !selectedAssistantToDelete
                  }
                  variant='destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  {deleteAssistantLoading ? 'Deleting...' : 'Delete Assistant'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
