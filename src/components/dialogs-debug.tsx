'use client';

import { useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { MessageCircle, List, Eye, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export function DialogsDebug() {
  const { organization } = useOrganization();

  // Состояние для отображения localStorage значений
  const [localStorageFunnel, setLocalStorageFunnel] = useState<any>(null);

  // Состояние для кнопки "Get All Dialogs"
  const [allDialogsData, setAllDialogsData] = useState<any>(null);
  const [allDialogsLoading, setAllDialogsLoading] = useState(false);
  const [allDialogsError, setAllDialogsError] = useState<string | null>(null);
  const [allDialogsSuccessMessage, setAllDialogsSuccessMessage] = useState<
    string | null
  >(null);

  // Состояние для кнопки "Get Dialog Messages"
  const [dialogMessagesData, setDialogMessagesData] = useState<any>(null);
  const [dialogMessagesLoading, setDialogMessagesLoading] = useState(false);
  const [dialogMessagesError, setDialogMessagesError] = useState<string | null>(
    null
  );
  const [dialogMessagesSuccessMessage, setDialogMessagesSuccessMessage] =
    useState<string | null>(null);

  // Состояние для кнопки "Delete Dialog"
  const [deleteDialogData, setDeleteDialogData] = useState<any>(null);
  const [deleteDialogLoading, setDeleteDialogLoading] = useState(false);
  const [deleteDialogError, setDeleteDialogError] = useState<string | null>(
    null
  );
  const [deleteDialogSuccessMessage, setDeleteDialogSuccessMessage] = useState<
    string | null
  >(null);

  // Состояние для модального окна просмотра сообщений
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [selectedDialogForMessages, setSelectedDialogForMessages] =
    useState('');

  // Состояние для модального окна удаления
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDialogToDelete, setSelectedDialogToDelete] = useState('');

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
    setAllDialogsData(null);
    setAllDialogsError(null);
    setAllDialogsSuccessMessage(null);
    setDialogMessagesData(null);
    setDialogMessagesError(null);
    setDialogMessagesSuccessMessage(null);
    setDeleteDialogData(null);
    setDeleteDialogError(null);
    setDeleteDialogSuccessMessage(null);
  }, [backendOrgId]);

  // Очищаем данные при смене воронки
  useEffect(() => {
    setAllDialogsData(null);
    setAllDialogsError(null);
    setAllDialogsSuccessMessage(null);
    setDialogMessagesData(null);
    setDialogMessagesError(null);
    setDialogMessagesSuccessMessage(null);
    setDeleteDialogData(null);
    setDeleteDialogError(null);
    setDeleteDialogSuccessMessage(null);
  }, [localStorageFunnel?.id]);

  const handleFetchAllDialogs = async () => {
    console.log('Get All Dialogs button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setAllDialogsError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setAllDialogsError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setAllDialogsError('No current funnel selected');
      return;
    }

    setAllDialogsLoading(true);
    setAllDialogsError(null);
    setAllDialogsSuccessMessage(null);

    try {
      console.log(
        'Making request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id +
          '/dialogs'
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/dialogs`,
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
      console.log('Successfully fetched all dialogs:', data);
      setAllDialogsData(data);
      setAllDialogsSuccessMessage(
        'Запрос успешно отправлен и данные получены!'
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setAllDialogsSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error fetching all dialogs:', error);
      setAllDialogsError(error.message || 'Unknown error occurred');
    } finally {
      setAllDialogsLoading(false);
    }
  };

  const handleGetDialogMessages = async () => {
    console.log('Get Dialog Messages button clicked!');

    // Получаем токен из cookie
    const tokenFromCookie = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!tokenFromCookie);

    if (!tokenFromCookie) {
      setDialogMessagesError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setDialogMessagesError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setDialogMessagesError('No current funnel selected');
      return;
    }

    if (!selectedDialogForMessages) {
      setDialogMessagesError('Please select a dialog to view messages');
      return;
    }

    setDialogMessagesLoading(true);
    setDialogMessagesError(null);
    setDialogMessagesSuccessMessage(null);

    try {
      console.log(
        'Making GET request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id +
          '/dialog/' +
          selectedDialogForMessages +
          '/messages'
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/dialog/${selectedDialogForMessages}/messages`,
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
      console.log('Successfully fetched dialog messages:', data);
      setDialogMessagesData(data);
      setDialogMessagesSuccessMessage(
        `Запрос успешно отправлен и сообщения диалога "${selectedDialogForMessages}" получены!`
      );

      // Закрываем модальное окно и очищаем выбор
      setIsMessagesModalOpen(false);
      setSelectedDialogForMessages('');

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setDialogMessagesSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error fetching dialog messages:', error);
      setDialogMessagesError(error.message || 'Unknown error occurred');
    } finally {
      setDialogMessagesLoading(false);
    }
  };

  const handleDeleteDialog = async () => {
    console.log('Delete Dialog button clicked!');

    // Получаем токен из cookie
    const tokenFromCookie = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!tokenFromCookie);

    if (!tokenFromCookie) {
      setDeleteDialogError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setDeleteDialogError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setDeleteDialogError('No current funnel selected');
      return;
    }

    if (!selectedDialogToDelete) {
      setDeleteDialogError('Please select a dialog to delete');
      return;
    }

    setDeleteDialogLoading(true);
    setDeleteDialogError(null);
    setDeleteDialogSuccessMessage(null);

    try {
      console.log(
        'Making DELETE request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id +
          '/dialog/' +
          selectedDialogToDelete
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/dialog/${selectedDialogToDelete}`,
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
      console.log('Successfully deleted dialog:', data);
      setDeleteDialogData(data);
      setDeleteDialogSuccessMessage(
        `Запрос успешно отправлен и диалог "${selectedDialogToDelete}" удален!`
      );

      // Закрываем модальное окно и очищаем выбор
      setIsDeleteModalOpen(false);
      setSelectedDialogToDelete('');

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setDeleteDialogSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting dialog:', error);
      setDeleteDialogError(error.message || 'Unknown error occurred');
    } finally {
      setDeleteDialogLoading(false);
    }
  };

  const handleOpenMessagesModal = () => {
    setIsMessagesModalOpen(true);
    setDialogMessagesError(null);
    setDialogMessagesSuccessMessage(null);
  };

  const handleCloseMessagesModal = () => {
    setIsMessagesModalOpen(false);
    setSelectedDialogForMessages('');
    setDialogMessagesError(null);
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
    setDeleteDialogError(null);
    setDeleteDialogSuccessMessage(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedDialogToDelete('');
    setDeleteDialogError(null);
  };

  // Получаем список диалогов для селектов
  const availableDialogs =
    allDialogsData && Array.isArray(allDialogsData) ? allDialogsData : [];

  return (
    <>
      <div className='rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/20'>
        <h3 className='mb-2 font-semibold text-orange-800 dark:text-orange-200'>
          Dialogs Debug Info
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
              onClick={handleFetchAllDialogs}
              disabled={
                allDialogsLoading || !backendOrgId || !localStorageFunnel?.id
              }
              variant='outline'
              size='sm'
              className='w-full justify-start'
            >
              <List className='mr-2 h-4 w-4' />
              {allDialogsLoading ? 'Loading...' : 'Get All Dialogs'}
            </Button>

            <Button
              onClick={handleOpenMessagesModal}
              disabled={
                !backendOrgId ||
                !localStorageFunnel?.id ||
                availableDialogs.length === 0
              }
              variant='outline'
              size='sm'
              className='w-full justify-start'
            >
              <Eye className='mr-2 h-4 w-4' />
              Get Dialog Messages
            </Button>

            <Button
              onClick={handleOpenDeleteModal}
              disabled={
                !backendOrgId ||
                !localStorageFunnel?.id ||
                availableDialogs.length === 0
              }
              variant='outline'
              size='sm'
              className='w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Delete Dialog
            </Button>
          </div>

          {/* Сообщения об успехе */}
          {allDialogsSuccessMessage && (
            <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
              <strong>Успех (All Dialogs):</strong> {allDialogsSuccessMessage}
            </div>
          )}

          {dialogMessagesSuccessMessage && (
            <div className='mt-2 rounded bg-orange-100 p-2 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'>
              <strong>Успех (Dialog Messages):</strong>{' '}
              {dialogMessagesSuccessMessage}
            </div>
          )}

          {deleteDialogSuccessMessage && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Успех (Delete Dialog):</strong>{' '}
              {deleteDialogSuccessMessage}
            </div>
          )}

          {/* Ошибки */}
          {allDialogsError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (All Dialogs):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {allDialogsError}
              </pre>
            </div>
          )}

          {dialogMessagesError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Dialog Messages):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {dialogMessagesError}
              </pre>
            </div>
          )}

          {deleteDialogError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Delete Dialog):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {deleteDialogError}
              </pre>
            </div>
          )}

          {/* Результаты API запросов */}
          {allDialogsData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
                View All Dialogs API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-orange-100 p-2 text-xs dark:bg-orange-900/30 dark:text-orange-200'>
                {JSON.stringify(allDialogsData, null, 2)}
              </pre>
            </details>
          )}

          {dialogMessagesData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
                View Dialog Messages API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900/30 dark:text-green-200'>
                {JSON.stringify(dialogMessagesData, null, 2)}
              </pre>
            </details>
          )}

          {deleteDialogData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
                View Delete Dialog API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-red-100 p-2 text-xs dark:bg-red-900/30 dark:text-red-200'>
                {JSON.stringify(deleteDialogData, null, 2)}
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
        </div>
      </div>

      {/* Модальное окно для просмотра сообщений диалога */}
      {isMessagesModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Get Dialog Messages
              </h2>
              <button
                onClick={handleCloseMessagesModal}
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
                  htmlFor='dialog_select_messages'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Select Dialog to View Messages
                </Label>
                <Select
                  value={selectedDialogForMessages}
                  onValueChange={setSelectedDialogForMessages}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Choose a dialog to view messages' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDialogs.map((dialog: any) => (
                      <SelectItem key={dialog.uuid} value={dialog.uuid}>
                        {dialog.uuid} (Thread: {dialog.thread_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {dialogMessagesError && (
                <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  <strong>Ошибка:</strong>
                  <pre className='mt-1 text-sm whitespace-pre-wrap'>
                    {dialogMessagesError}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  onClick={handleCloseMessagesModal}
                  variant='outline'
                  disabled={dialogMessagesLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGetDialogMessages}
                  disabled={dialogMessagesLoading || !selectedDialogForMessages}
                >
                  <MessageCircle className='mr-2 h-4 w-4' />
                  {dialogMessagesLoading ? 'Loading...' : 'Get Messages'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для удаления диалога */}
      {isDeleteModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Delete Dialog
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
                  htmlFor='dialog_select_delete'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Select Dialog to Delete
                </Label>
                <Select
                  value={selectedDialogToDelete}
                  onValueChange={setSelectedDialogToDelete}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Choose a dialog to delete' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDialogs.map((dialog: any) => (
                      <SelectItem key={dialog.uuid} value={dialog.uuid}>
                        {dialog.uuid} (Thread: {dialog.thread_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDialogToDelete && (
                <div className='rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/20'>
                  <p className='text-sm text-yellow-800 dark:text-yellow-200'>
                    <strong>Warning:</strong> You are about to delete dialog "
                    {selectedDialogToDelete}". This action cannot be undone.
                  </p>
                </div>
              )}

              {deleteDialogError && (
                <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  <strong>Ошибка:</strong>
                  <pre className='mt-1 text-sm whitespace-pre-wrap'>
                    {deleteDialogError}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  onClick={handleCloseDeleteModal}
                  variant='outline'
                  disabled={deleteDialogLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteDialog}
                  disabled={deleteDialogLoading || !selectedDialogToDelete}
                  variant='destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  {deleteDialogLoading ? 'Deleting...' : 'Delete Dialog'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
