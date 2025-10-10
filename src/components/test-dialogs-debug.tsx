'use client';

import { useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useFunnels } from '@/contexts/FunnelsContext';
import { Button } from '@/components/ui/button';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { TestTube, Send, MessageSquare, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export function TestDialogsDebug() {
  const { organization } = useOrganization();
  const { currentFunnel } = useFunnels();

  // Состояние для отображения localStorage значений
  const [localStorageFunnel, setLocalStorageFunnel] = useState<any>(null);

  // Состояние для кнопки "Get Test Dialogs"
  const [testDialogsData, setTestDialogsData] = useState<any>(null);
  const [testDialogsLoading, setTestDialogsLoading] = useState(false);
  const [testDialogsError, setTestDialogsError] = useState<string | null>(null);
  const [testDialogsSuccessMessage, setTestDialogsSuccessMessage] = useState<
    string | null
  >(null);

  // Состояние для кнопки "Create Test Dialog"
  const [createTestDialogData, setCreateTestDialogData] = useState<any>(null);
  const [createTestDialogLoading, setCreateTestDialogLoading] = useState(false);
  const [createTestDialogError, setCreateTestDialogError] = useState<
    string | null
  >(null);
  const [createTestDialogSuccessMessage, setCreateTestDialogSuccessMessage] =
    useState<string | null>(null);

  // Состояние для кнопки "Get Test Dialog Messages"
  const [testDialogMessagesData, setTestDialogMessagesData] =
    useState<any>(null);
  const [testDialogMessagesLoading, setTestDialogMessagesLoading] =
    useState(false);
  const [testDialogMessagesError, setTestDialogMessagesError] = useState<
    string | null
  >(null);
  const [
    testDialogMessagesSuccessMessage,
    setTestDialogMessagesSuccessMessage
  ] = useState<string | null>(null);

  // Состояние для кнопки "Send Test Message"
  const [sendTestMessageData, setSendTestMessageData] = useState<any>(null);
  const [sendTestMessageLoading, setSendTestMessageLoading] = useState(false);
  const [sendTestMessageError, setSendTestMessageError] = useState<
    string | null
  >(null);
  const [sendTestMessageSuccessMessage, setSendTestMessageSuccessMessage] =
    useState<string | null>(null);

  // Состояние для модальных окон
  const [isTestDialogMessagesModalOpen, setIsTestDialogMessagesModalOpen] =
    useState(false);
  const [selectedTestDialogForMessages, setSelectedTestDialogForMessages] =
    useState('');
  const [isSendTestMessageModalOpen, setIsSendTestMessageModalOpen] =
    useState(false);
  const [selectedTestDialogForMessage, setSelectedTestDialogForMessage] =
    useState('');
  const [testMessageText, setTestMessageText] = useState('');
  const [testMessageRole, setTestMessageRole] = useState('user');

  // Получаем backend ID организации из метаданных Clerk
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  // Функция для обновления localStorage значений
  const updateLocalStorageData = () => {
    if (typeof window !== 'undefined') {
      // Используем currentFunnel из контекста, если он есть, иначе из localStorage
      if (currentFunnel) {
        setLocalStorageFunnel(currentFunnel);
      } else {
        const savedFunnel = localStorage.getItem('currentFunnel');
        if (savedFunnel) {
          try {
            setLocalStorageFunnel(JSON.parse(savedFunnel));
          } catch (error) {
            console.error('Error parsing saved funnel:', error);
          }
        }
      }
    }
  };

  // Обновляем localStorage значения при изменении currentFunnel
  useEffect(() => {
    updateLocalStorageData();

    const handleStorageChange = () => {
      updateLocalStorageData();
    };

    const interval = setInterval(updateLocalStorageData, 1000);

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFunnel]);

  // Очищаем данные при смене организации
  useEffect(() => {
    setTestDialogsData(null);
    setTestDialogsError(null);
    setTestDialogsSuccessMessage(null);
    setCreateTestDialogData(null);
    setCreateTestDialogError(null);
    setCreateTestDialogSuccessMessage(null);
    setTestDialogMessagesData(null);
    setTestDialogMessagesError(null);
    setTestDialogMessagesSuccessMessage(null);
    setSendTestMessageData(null);
    setSendTestMessageError(null);
    setSendTestMessageSuccessMessage(null);
  }, [backendOrgId]);

  // Очищаем данные при смене воронки
  useEffect(() => {
    setTestDialogsData(null);
    setTestDialogsError(null);
    setTestDialogsSuccessMessage(null);
    setCreateTestDialogData(null);
    setCreateTestDialogError(null);
    setCreateTestDialogSuccessMessage(null);
    setTestDialogMessagesData(null);
    setTestDialogMessagesError(null);
    setTestDialogMessagesSuccessMessage(null);
    setSendTestMessageData(null);
    setSendTestMessageError(null);
    setSendTestMessageSuccessMessage(null);
  }, [localStorageFunnel?.id]);

  // Функции для работы с тестовыми диалогами

  // Обработчик получения тестовых диалогов
  const handleFetchTestDialogs = async () => {
    console.log('Get Test Dialogs button clicked!');

    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setTestDialogsError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setTestDialogsError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setTestDialogsError('No current funnel selected');
      return;
    }

    setTestDialogsLoading(true);
    setTestDialogsError(null);
    setTestDialogsSuccessMessage(null);

    try {
      console.log(
        'Making GET request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id +
          '/test_dialogs'
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/test_dialogs`,
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
      console.log('Successfully fetched test dialogs:', data);
      setTestDialogsData(data);
      setTestDialogsSuccessMessage(
        `Запрос успешно отправлен и тестовые диалоги получены! Найдено: ${Array.isArray(data) ? data.length : 'N/A'} диалогов`
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setTestDialogsSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error fetching test dialogs:', error);
      setTestDialogsError(error.message || 'Unknown error occurred');
    } finally {
      setTestDialogsLoading(false);
    }
  };

  // Обработчик создания тестового диалога
  const handleCreateTestDialog = async () => {
    console.log('Create Test Dialog button clicked!');

    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setCreateTestDialogError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setCreateTestDialogError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setCreateTestDialogError('No current funnel selected');
      return;
    }

    setCreateTestDialogLoading(true);
    setCreateTestDialogError(null);
    setCreateTestDialogSuccessMessage(null);

    try {
      console.log(
        'Making POST request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id +
          '/test_dialog'
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/test_dialog`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: ''
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
      console.log('Successfully created test dialog:', data);
      setCreateTestDialogData(data);
      setCreateTestDialogSuccessMessage(
        `Тестовый диалог успешно создан! UUID: ${data.uuid}`
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setCreateTestDialogSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error creating test dialog:', error);
      setCreateTestDialogError(error.message || 'Unknown error occurred');
    } finally {
      setCreateTestDialogLoading(false);
    }
  };

  // Обработчик получения сообщений тестового диалога
  const handleFetchTestDialogMessages = async () => {
    console.log('Get Test Dialog Messages button clicked!');

    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setTestDialogMessagesError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setTestDialogMessagesError(
        'No backend organization ID found in metadata'
      );
      return;
    }

    if (!localStorageFunnel?.id) {
      setTestDialogMessagesError('No current funnel selected');
      return;
    }

    if (!selectedTestDialogForMessages) {
      setTestDialogMessagesError(
        'Please select a test dialog to view messages'
      );
      return;
    }

    setTestDialogMessagesLoading(true);
    setTestDialogMessagesError(null);
    setTestDialogMessagesSuccessMessage(null);

    try {
      console.log(
        'Making GET request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id +
          '/dialog/' +
          selectedTestDialogForMessages +
          '/messages'
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/dialog/${selectedTestDialogForMessages}/messages`,
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
      console.log('Successfully fetched test dialog messages:', data);
      setTestDialogMessagesData(data);
      setTestDialogMessagesSuccessMessage(
        `Сообщения тестового диалога "${selectedTestDialogForMessages}" успешно получены!`
      );

      // Закрываем модальное окно и очищаем выбор
      setIsTestDialogMessagesModalOpen(false);
      setSelectedTestDialogForMessages('');

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setTestDialogMessagesSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error fetching test dialog messages:', error);
      setTestDialogMessagesError(error.message || 'Unknown error occurred');
    } finally {
      setTestDialogMessagesLoading(false);
    }
  };

  // Обработчик отправки тестового сообщения
  const handleSendTestMessage = async () => {
    console.log('Send Test Message button clicked!');

    const token = getClerkTokenFromClientCookie();
    if (!token) {
      setSendTestMessageError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setSendTestMessageError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setSendTestMessageError('No current funnel selected');
      return;
    }

    if (!selectedTestDialogForMessage) {
      setSendTestMessageError('Please select a test dialog to send message to');
      return;
    }

    if (!testMessageText.trim()) {
      setSendTestMessageError('Message text cannot be empty');
      return;
    }

    setSendTestMessageLoading(true);
    setSendTestMessageError(null);
    setSendTestMessageSuccessMessage(null);

    try {
      const requestBody = {
        text: testMessageText,
        role: testMessageRole,
        time: new Date().toISOString()
      };

      console.log(
        'Making POST request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id +
          '/dialog/test/' +
          selectedTestDialogForMessage +
          '/message'
      );
      console.log('Request body:', requestBody);

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/dialog/test/${selectedTestDialogForMessage}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
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
      console.log('Successfully sent test message:', data);
      setSendTestMessageData(data);
      setSendTestMessageSuccessMessage(
        `Тестовое сообщение успешно отправлено в диалог "${selectedTestDialogForMessage}"!`
      );

      // Закрываем модальное окно и очищаем выбор
      setIsSendTestMessageModalOpen(false);
      setSelectedTestDialogForMessage('');
      setTestMessageText('');
      setTestMessageRole('user');

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSendTestMessageSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error sending test message:', error);
      setSendTestMessageError(error.message || 'Unknown error occurred');
    } finally {
      setSendTestMessageLoading(false);
    }
  };

  // Модальные окна
  const handleOpenTestDialogMessagesModal = () => {
    setIsTestDialogMessagesModalOpen(true);
    setTestDialogMessagesError(null);
    setTestDialogMessagesSuccessMessage(null);
  };

  const handleCloseTestDialogMessagesModal = () => {
    setIsTestDialogMessagesModalOpen(false);
    setSelectedTestDialogForMessages('');
    setTestDialogMessagesError(null);
  };

  const handleOpenSendTestMessageModal = () => {
    setIsSendTestMessageModalOpen(true);
    setSendTestMessageError(null);
    setSendTestMessageSuccessMessage(null);
  };

  const handleCloseSendTestMessageModal = () => {
    setIsSendTestMessageModalOpen(false);
    setSelectedTestDialogForMessage('');
    setTestMessageText('');
    setTestMessageRole('user');
    setSendTestMessageError(null);
  };

  // Получаем доступные тестовые диалоги для селекторов
  const availableTestDialogs =
    testDialogsData && Array.isArray(testDialogsData) ? testDialogsData : [];

  return (
    <>
      <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-900/20'>
        <h3 className='mb-2 font-semibold text-purple-800 dark:text-purple-200'>
          Test Dialogs Debug Info
        </h3>
        <div className='space-y-2 text-sm text-purple-700 dark:text-purple-300'>
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
            {localStorageFunnel?.id !== '0' && (
              <Button
                onClick={handleFetchTestDialogs}
                disabled={
                  testDialogsLoading || !backendOrgId || !localStorageFunnel?.id
                }
                variant='outline'
                size='sm'
                className='mb-2 w-full justify-start text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20 dark:hover:text-purple-300'
              >
                <TestTube className='mr-2 h-4 w-4' />
                {testDialogsLoading ? 'Loading...' : 'Get Test Dialogs'}
              </Button>
            )}

            {localStorageFunnel?.id !== '0' && (
              <Button
                onClick={handleCreateTestDialog}
                disabled={
                  createTestDialogLoading ||
                  !backendOrgId ||
                  !localStorageFunnel?.id
                }
                variant='outline'
                size='sm'
                className='mb-2 w-full justify-start text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-300'
              >
                <Plus className='mr-2 h-4 w-4' />
                {createTestDialogLoading ? 'Creating...' : 'Create Test Dialog'}
              </Button>
            )}

            {localStorageFunnel?.id !== '0' && (
              <Button
                onClick={handleOpenTestDialogMessagesModal}
                disabled={
                  testDialogMessagesLoading ||
                  !backendOrgId ||
                  !localStorageFunnel?.id ||
                  availableTestDialogs.length === 0
                }
                variant='outline'
                size='sm'
                className='mb-2 w-full justify-start text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300'
              >
                <MessageSquare className='mr-2 h-4 w-4' />
                {testDialogMessagesLoading
                  ? 'Loading...'
                  : 'Get Test Dialog Messages'}
              </Button>
            )}

            {localStorageFunnel?.id !== '0' && (
              <Button
                onClick={handleOpenSendTestMessageModal}
                disabled={
                  sendTestMessageLoading ||
                  !backendOrgId ||
                  !localStorageFunnel?.id ||
                  availableTestDialogs.length === 0
                }
                variant='outline'
                size='sm'
                className='w-full justify-start text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700 dark:text-cyan-400 dark:hover:bg-cyan-900/20 dark:hover:text-cyan-300'
              >
                <Send className='mr-2 h-4 w-4' />
                Send Test Message
              </Button>
            )}
          </div>
        </div>

        {/* Сообщения об успехе для тестовых диалогов */}
        {testDialogsSuccessMessage && (
          <div className='mt-2 rounded bg-purple-100 p-2 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'>
            <strong>Успех (Test Dialogs):</strong> {testDialogsSuccessMessage}
          </div>
        )}

        {createTestDialogSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех (Create Test Dialog):</strong>{' '}
            {createTestDialogSuccessMessage}
          </div>
        )}

        {testDialogMessagesSuccessMessage && (
          <div className='mt-2 rounded bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
            <strong>Успех (Test Dialog Messages):</strong>{' '}
            {testDialogMessagesSuccessMessage}
          </div>
        )}

        {sendTestMessageSuccessMessage && (
          <div className='mt-2 rounded bg-cyan-100 p-2 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'>
            <strong>Успех (Send Test Message):</strong>{' '}
            {sendTestMessageSuccessMessage}
          </div>
        )}

        {/* Ошибки для тестовых диалогов */}
        {testDialogsError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Test Dialogs):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {testDialogsError}
            </pre>
          </div>
        )}

        {createTestDialogError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Create Test Dialog):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {createTestDialogError}
            </pre>
          </div>
        )}

        {testDialogMessagesError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Test Dialog Messages):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {testDialogMessagesError}
            </pre>
          </div>
        )}

        {sendTestMessageError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Send Test Message):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {sendTestMessageError}
            </pre>
          </div>
        )}

        {/* Результаты API запросов для тестовых диалогов */}
        {testDialogsData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-purple-600 dark:text-purple-400'>
              View Test Dialogs API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-purple-100 p-2 text-xs dark:bg-purple-900/30 dark:text-purple-200'>
              {JSON.stringify(testDialogsData, null, 2)}
            </pre>
          </details>
        )}

        {createTestDialogData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-green-600 dark:text-green-400'>
              View Create Test Dialog API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900/30 dark:text-green-200'>
              {JSON.stringify(createTestDialogData, null, 2)}
            </pre>
          </details>
        )}

        {testDialogMessagesData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-blue-600 dark:text-blue-400'>
              View Test Dialog Messages API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-blue-100 p-2 text-xs dark:bg-blue-900/30 dark:text-blue-200'>
              {JSON.stringify(testDialogMessagesData, null, 2)}
            </pre>
          </details>
        )}

        {sendTestMessageData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-cyan-600 dark:text-cyan-400'>
              View Send Test Message API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-cyan-100 p-2 text-xs dark:bg-cyan-900/30 dark:text-cyan-200'>
              {JSON.stringify(sendTestMessageData, null, 2)}
            </pre>
          </details>
        )}

        {/* Локальные данные */}
        {localStorageFunnel && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-purple-600 dark:text-purple-400'>
              {localStorageFunnel.id === '0'
                ? 'View All Funnels Local Data'
                : 'View Current Funnel Local Data'}
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900/30 dark:text-gray-200'>
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

      {/* Модальное окно для просмотра сообщений тестового диалога */}
      {isTestDialogMessagesModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Get Test Dialog Messages
              </h2>
              <button
                onClick={handleCloseTestDialogMessagesModal}
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
                  htmlFor='test_dialog_select_messages'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Select Test Dialog to View Messages
                </Label>
                <Select
                  value={selectedTestDialogForMessages}
                  onValueChange={setSelectedTestDialogForMessages}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Choose a test dialog to view messages' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTestDialogs.map((dialog: any) => (
                      <SelectItem key={dialog.uuid} value={dialog.uuid}>
                        {dialog.uuid} (Stage: {dialog.stage})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {availableTestDialogs.length === 0 && (
                <div className='rounded bg-yellow-100 p-2 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'>
                  <strong>Информация:</strong> Сначала загрузите тестовые
                  диалоги с помощью кнопки &quot;Get Test Dialogs&quot;
                </div>
              )}

              {testDialogMessagesError && (
                <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  <strong>Ошибка:</strong>
                  <pre className='mt-1 text-sm whitespace-pre-wrap'>
                    {testDialogMessagesError}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  onClick={handleCloseTestDialogMessagesModal}
                  variant='outline'
                  disabled={testDialogMessagesLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFetchTestDialogMessages}
                  disabled={
                    testDialogMessagesLoading || !selectedTestDialogForMessages
                  }
                  className='bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                >
                  <MessageSquare className='mr-2 h-4 w-4' />
                  {testDialogMessagesLoading ? 'Loading...' : 'Get Messages'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для отправки тестового сообщения */}
      {isSendTestMessageModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Send Test Message
              </h2>
              <button
                onClick={handleCloseSendTestMessageModal}
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
                  htmlFor='test_dialog_select_send_message'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Select Test Dialog to Send Message
                </Label>
                <Select
                  value={selectedTestDialogForMessage}
                  onValueChange={setSelectedTestDialogForMessage}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Choose a test dialog to send message' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTestDialogs.map((dialog: any) => (
                      <SelectItem key={dialog.uuid} value={dialog.uuid}>
                        {dialog.uuid} (Stage: {dialog.stage})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor='test_message_text'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Message Text
                </Label>
                <Input
                  id='test_message_text'
                  type='text'
                  value={testMessageText}
                  onChange={(e) => setTestMessageText(e.target.value)}
                  placeholder='Enter your test message'
                  className='mt-1'
                />
              </div>

              <div>
                <Label
                  htmlFor='test_message_role'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Message Role
                </Label>
                <Select
                  value={testMessageRole}
                  onValueChange={setTestMessageRole}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Choose message role' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='user'>User</SelectItem>
                    <SelectItem value='assistant'>Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {availableTestDialogs.length === 0 && (
                <div className='rounded bg-yellow-100 p-2 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'>
                  <strong>Информация:</strong> Сначала загрузите тестовые
                  диалоги с помощью кнопки &quot;Get Test Dialogs&quot;
                </div>
              )}

              {sendTestMessageError && (
                <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  <strong>Ошибка:</strong>
                  <pre className='mt-1 text-sm whitespace-pre-wrap'>
                    {sendTestMessageError}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  onClick={handleCloseSendTestMessageModal}
                  variant='outline'
                  disabled={sendTestMessageLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendTestMessage}
                  disabled={
                    sendTestMessageLoading ||
                    !selectedTestDialogForMessage ||
                    !testMessageText.trim()
                  }
                  className='bg-cyan-600 text-white hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600'
                >
                  <Send className='mr-2 h-4 w-4' />
                  {sendTestMessageLoading ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
