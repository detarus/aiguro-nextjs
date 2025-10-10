'use client';

import { useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useFunnels } from '@/contexts/FunnelsContext';
import { Button } from '@/components/ui/button';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { MessageCircle, List, Eye, Trash2, Send } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export function DialogsDebug() {
  const { organization } = useOrganization();
  const { currentFunnel } = useFunnels();

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

  // Состояние для кнопки "Create Dialog"
  const [createDialogData, setCreateDialogData] = useState<any>(null);
  const [createDialogLoading, setCreateDialogLoading] = useState(false);
  const [createDialogError, setCreateDialogError] = useState<string | null>(
    null
  );
  const [createDialogSuccessMessage, setCreateDialogSuccessMessage] = useState<
    string | null
  >(null);

  // Состояние для кнопки "Get Client Dialogs"
  const [clientDialogsData, setClientDialogsData] = useState<any>(null);
  const [clientDialogsLoading, setClientDialogsLoading] = useState(false);
  const [clientDialogsError, setClientDialogsError] = useState<string | null>(
    null
  );
  const [clientDialogsSuccessMessage, setClientDialogsSuccessMessage] =
    useState<string | null>(null);

  // Состояние для модального окна выбора клиента
  const [isClientSelectModalOpen, setIsClientSelectModalOpen] = useState(false);
  const [selectedClientForDialogs, setSelectedClientForDialogs] = useState('');
  const [availableClients, setAvailableClients] = useState<any[]>([]);

  // Состояние для модального окна просмотра сообщений
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [selectedDialogForMessages, setSelectedDialogForMessages] =
    useState('');

  // Состояние для модального окна удаления
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDialogToDelete, setSelectedDialogToDelete] = useState('');

  // Состояние для кнопки "Post New Message"
  const [postMessageData, setPostMessageData] = useState<any>(null);
  const [postMessageLoading, setPostMessageLoading] = useState(false);
  const [postMessageError, setPostMessageError] = useState<string | null>(null);
  const [postMessageSuccessMessage, setPostMessageSuccessMessage] = useState<
    string | null
  >(null);

  // Состояние для модального окна отправки сообщения
  const [isPostMessageModalOpen, setIsPostMessageModalOpen] = useState(false);
  const [selectedDialogForMessage, setSelectedDialogForMessage] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageRole, setMessageRole] = useState('user');

  // Состояния для тестовых диалогов
  // Состояние для кнопки "Get Test Dialogs"
  const [testDialogsData, setTestDialogsData] = useState<any>(null);
  const [__testDialogsLoading, setTestDialogsLoading] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [testDialogsError, setTestDialogsError] = useState<string | null>(null);
  const [testDialogsSuccessMessage, setTestDialogsSuccessMessage] = useState<
    string | null
  >(null);

  // Состояние для кнопки "Create Test Dialog"
  const [createTestDialogData, setCreateTestDialogData] = useState<any>(null);
  const [_createTestDialogLoading, setCreateTestDialogLoading] = // eslint-disable-line @typescript-eslint/no-unused-vars
    useState(false);
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

  // Состояние для модального окна просмотра сообщений тестового диалога
  const [isTestDialogMessagesModalOpen, setIsTestDialogMessagesModalOpen] =
    useState(false);
  const [selectedTestDialogForMessages, setSelectedTestDialogForMessages] =
    useState('');

  // Состояние для кнопки "Send Test Message"
  const [sendTestMessageData, setSendTestMessageData] = useState<any>(null);
  const [sendTestMessageLoading, setSendTestMessageLoading] = useState(false);
  const [sendTestMessageError, setSendTestMessageError] = useState<
    string | null
  >(null);
  const [sendTestMessageSuccessMessage, setSendTestMessageSuccessMessage] =
    useState<string | null>(null);

  // Состояние для модального окна отправки тестового сообщения
  const [isSendTestMessageModalOpen, setIsSendTestMessageModalOpen] =
    useState(false);
  const [selectedTestDialogForMessage, setSelectedTestDialogForMessage] =
    useState('');
  const [testMessageText, setTestMessageText] = useState('');
  const [testMessageRole, setTestMessageRole] = useState('user');

  // Состояния для загрузки этапов воронки
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [__funnelStages, setFunnelStages] = useState<any[]>([]);
  const [__funnelStagesLoading, setFunnelStagesLoading] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFunnel]);

  // Очищаем данные при смене организации
  useEffect(() => {
    setAllDialogsData(null);
    setAllDialogsError(null);
    setAllDialogsSuccessMessage(null);
    setCreateDialogData(null);
    setCreateDialogError(null);
    setCreateDialogSuccessMessage(null);
    setDialogMessagesData(null);
    setDialogMessagesError(null);
    setDialogMessagesSuccessMessage(null);
    setDeleteDialogData(null);
    setDeleteDialogError(null);
    setDeleteDialogSuccessMessage(null);
    setClientDialogsData(null);
    setClientDialogsError(null);
    setClientDialogsSuccessMessage(null);
    setPostMessageData(null);
    setPostMessageError(null);
    setPostMessageSuccessMessage(null);
    // Очищаем состояния тестовых диалогов
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
    setAllDialogsData(null);
    setAllDialogsError(null);
    setAllDialogsSuccessMessage(null);
    setCreateDialogData(null);
    setCreateDialogError(null);
    setCreateDialogSuccessMessage(null);
    setDialogMessagesData(null);
    setDialogMessagesError(null);
    setDialogMessagesSuccessMessage(null);
    setDeleteDialogData(null);
    setDeleteDialogError(null);
    setDeleteDialogSuccessMessage(null);
    setClientDialogsData(null);
    setClientDialogsError(null);
    setClientDialogsSuccessMessage(null);
    setPostMessageData(null);
    setPostMessageError(null);
    setPostMessageSuccessMessage(null);
    // Очищаем состояния тестовых диалогов
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

  const handleCreateDialog = async () => {
    console.log('=== CREATE DIALOG REQUEST START ===');
    console.log('Create Dialog button clicked!');
    console.log('Timestamp:', new Date().toISOString());

    // Получаем токен из cookie
    const tokenFromCookie = getClerkTokenFromClientCookie();
    console.log('=== AUTHENTICATION INFO ===');
    console.log('Token from cookie available:', !!tokenFromCookie);
    console.log('Token length:', tokenFromCookie ? tokenFromCookie.length : 0);
    console.log(
      'Token preview (first 20 chars):',
      tokenFromCookie ? tokenFromCookie.substring(0, 20) + '...' : 'N/A'
    );

    if (!tokenFromCookie) {
      console.error(
        '❌ AUTHENTICATION FAILED: No token available in __session cookie'
      );
      setCreateDialogError('No token available in __session cookie');
      return;
    }

    console.log('=== ORGANIZATION INFO ===');
    console.log('Backend Org ID:', backendOrgId);
    if (!backendOrgId) {
      console.error(
        '❌ ORGANIZATION VALIDATION FAILED: No backend organization ID found in metadata'
      );
      setCreateDialogError('No backend organization ID found in metadata');
      return;
    }

    console.log('=== FUNNEL INFO ===');
    console.log('Current Funnel:', localStorageFunnel);
    console.log('Current Funnel ID:', localStorageFunnel?.id);
    if (!localStorageFunnel?.id) {
      console.error('❌ FUNNEL VALIDATION FAILED: No current funnel selected');
      setCreateDialogError('No current funnel selected');
      return;
    }

    setCreateDialogLoading(true);
    setCreateDialogError(null);
    setCreateDialogSuccessMessage(null);

    try {
      const postUrl = `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/dialog`;
      console.log('=== API REQUEST INFO ===');
      console.log('POST URL:', postUrl);
      console.log('Request Method: POST');
      console.log('Request Body: {}'); // Пустое тело запроса

      console.log('=== MAKING POST REQUEST ===');
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenFromCookie}`
        },
        body: JSON.stringify({}) // Пустое тело запроса как запрашивал пользователь
      });

      console.log('=== RESPONSE INFO ===');
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers));

      if (!response.ok) {
        console.log('❌ RESPONSE NOT OK - Processing error...');
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
          console.log('Failed to parse error as JSON, trying text...');
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            console.log('Failed to read error response as text');
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        console.error('Final error message:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('=== SUCCESS ===');
      console.log('✅ Successfully created dialog:', data);
      console.log('Response data type:', typeof data);
      console.log('Response data:', JSON.stringify(data, null, 2));

      setCreateDialogData(data);
      setCreateDialogSuccessMessage(
        'Запрос успешно отправлен и диалог создан!'
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setCreateDialogSuccessMessage(null);
      }, 3000);

      console.log('=== CREATE DIALOG REQUEST SUCCESS ===');
    } catch (error: any) {
      console.log('=== ERROR HANDLING ===');
      console.error('❌ Error creating dialog:', error);
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      const errorMessage = error.message || 'Unknown error occurred';
      console.log('Setting error state with message:', errorMessage);
      setCreateDialogError(errorMessage);

      console.log('=== CREATE DIALOG REQUEST FAILED ===');
    } finally {
      console.log('=== CLEANUP ===');
      console.log('Setting loading state to false');
      setCreateDialogLoading(false);
      console.log('=== CREATE DIALOG REQUEST END ===');
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

  // Функция для получения диалогов клиента
  const handleGetClientDialogs = async () => {
    console.log('Get Client Dialogs button clicked!');

    const token = getClerkTokenFromClientCookie();
    if (!token) {
      setClientDialogsError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setClientDialogsError('No backend organization ID found in metadata');
      return;
    }

    if (!selectedClientForDialogs) {
      setClientDialogsError('Please select a client to get dialogs');
      return;
    }

    setClientDialogsLoading(true);
    setClientDialogsError(null);
    setClientDialogsSuccessMessage(null);

    try {
      console.log(
        'Making request to /api/organization/' +
          backendOrgId +
          '/client/' +
          selectedClientForDialogs +
          '/dialogs'
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/client/${selectedClientForDialogs}/dialogs`,
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
      console.log('Successfully fetched client dialogs:', data);
      setClientDialogsData(data);
      setClientDialogsSuccessMessage(
        `Запрос успешно отправлен и диалоги клиента получены!`
      );

      // Закрываем модальное окно и очищаем выбор
      setIsClientSelectModalOpen(false);
      setSelectedClientForDialogs('');

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setClientDialogsSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error fetching client dialogs:', error);
      setClientDialogsError(error.message || 'Unknown error occurred');
    } finally {
      setClientDialogsLoading(false);
    }
  };

  // Функции для управления модальным окном выбора клиента
  const handleOpenClientSelectModal = async () => {
    setIsClientSelectModalOpen(true);
    setClientDialogsError(null);
    setClientDialogsSuccessMessage(null);

    // Загружаем список клиентов с сервера
    if (!backendOrgId) {
      setClientDialogsError('No backend organization ID found');
      return;
    }

    const token = getClerkTokenFromClientCookie();
    if (!token) {
      setClientDialogsError('No token available');
      return;
    }

    try {
      console.log('Fetching clients list for modal...');
      const response = await fetch(
        `/api/organization/${backendOrgId}/clients`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const clients = await response.json();
        setAvailableClients(Array.isArray(clients) ? clients : []);
        console.log('Clients loaded for modal:', clients.length);
      } else {
        console.error('Failed to fetch clients for modal');
        setAvailableClients([]);
      }
    } catch (error) {
      console.error('Error fetching clients for modal:', error);
      setAvailableClients([]);
    }
  };

  const handleCloseClientSelectModal = () => {
    setIsClientSelectModalOpen(false);
    setSelectedClientForDialogs('');
    setClientDialogsError(null);
  };

  // Получаем список диалогов для селектов
  const availableDialogs =
    allDialogsData && Array.isArray(allDialogsData) ? allDialogsData : [];

  // Получаем список тестовых диалогов для селектов
  const availableTestDialogs =
    testDialogsData && Array.isArray(testDialogsData) ? testDialogsData : [];

  // Функция загрузки этапов воронки
  const loadFunnelStages = async () => {
    if (!backendOrgId || !localStorageFunnel?.id) {
      setFunnelStages([]);
      return;
    }

    setFunnelStagesLoading(true);
    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) {
        console.error('No token available');
        setFunnelStages([]);
        return;
      }

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

      if (response.ok) {
        const data = await response.json();
        setFunnelStages(data.stages || []);
      } else {
        console.error('Failed to fetch funnel stages');
        setFunnelStages([]);
      }
    } catch (error) {
      console.error('Error loading funnel stages:', error);
      setFunnelStages([]);
    } finally {
      setFunnelStagesLoading(false);
    }
  };

  // Загружаем этапы воронки при изменении воронки
  useEffect(() => {
    loadFunnelStages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendOrgId, localStorageFunnel?.id]);

  // Функции для работы с тестовыми диалогами

  // Обработчик получения тестовых диалогов
  const __handleFetchTestDialogs = async () => {
    // eslint-disable-line @typescript-eslint/no-unused-vars
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
  const __handleCreateTestDialog = async () => {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    console.log('Create Test Dialog button clicked!');

    const token = getClerkTokenFromClientCookie();
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
          body: '' // Пустое тело запроса согласно новому API
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
  const handleGetTestDialogMessages = async () => {
    console.log('Get Test Dialog Messages button clicked!');

    const token = getClerkTokenFromClientCookie();
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
        role: testMessageRole
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

  const __handleOpenTestDialogMessagesModal = () => {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    setIsTestDialogMessagesModalOpen(true);
    setTestDialogMessagesError(null);
    setTestDialogMessagesSuccessMessage(null);
  };

  const handleCloseTestDialogMessagesModal = () => {
    setIsTestDialogMessagesModalOpen(false);
    setSelectedTestDialogForMessages('');
    setTestDialogMessagesError(null);
  };

  const __handleOpenSendTestMessageModal = () => {
    // eslint-disable-line @typescript-eslint/no-unused-vars
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

  const handleOpenPostMessageModal = () => {
    setIsPostMessageModalOpen(true);
    setPostMessageError(null);
    setPostMessageSuccessMessage(null);
  };

  const handleClosePostMessageModal = () => {
    setIsPostMessageModalOpen(false);
    setSelectedDialogForMessage('');
    setMessageText('');
    setMessageRole('user');
    setPostMessageError(null);
  };

  const handlePostMessage = async () => {
    console.log('Post Message button clicked!');

    // Получаем токен из cookie
    const tokenFromCookie = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!tokenFromCookie);

    if (!tokenFromCookie) {
      setPostMessageError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setPostMessageError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setPostMessageError('No current funnel selected');
      return;
    }

    if (!selectedDialogForMessage) {
      setPostMessageError('Please select a dialog to post message to');
      return;
    }

    if (!messageText.trim()) {
      setPostMessageError('Message text cannot be empty');
      return;
    }

    setPostMessageLoading(true);
    setPostMessageError(null);
    setPostMessageSuccessMessage(null);

    try {
      console.log(
        'Making POST request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id +
          '/dialog/' +
          selectedDialogForMessage +
          '/message'
      );

      console.log('Request body:', {
        text: messageText,
        role: messageRole
      });

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}/dialog/${selectedDialogForMessage}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenFromCookie}`
          },
          body: JSON.stringify({
            text: messageText,
            role: messageRole
          })
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
      console.log('Successfully posted message:', data);
      setPostMessageData(data);
      setPostMessageSuccessMessage(
        `Message successfully posted to dialog "${selectedDialogForMessage}"!`
      );

      // Закрываем модальное окно и очищаем выбор
      setIsPostMessageModalOpen(false);
      setSelectedDialogForMessage('');
      setMessageText('');
      setMessageRole('user');

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setPostMessageSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error posting message:', error);
      setPostMessageError(error.message || 'Unknown error occurred');
    } finally {
      setPostMessageLoading(false);
    }
  };

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

            {localStorageFunnel?.id !== '0' && (
              <Button
                onClick={handleCreateDialog}
                disabled={
                  createDialogLoading ||
                  !backendOrgId ||
                  !localStorageFunnel?.id
                }
                variant='outline'
                size='sm'
                className='w-full justify-start text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-300'
              >
                <MessageCircle className='mr-2 h-4 w-4' />
                {createDialogLoading ? 'Creating...' : 'Create Dialog'}
              </Button>
            )}

            {localStorageFunnel?.id !== '0' && (
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
            )}

            {localStorageFunnel?.id !== '0' && (
              <Button
                onClick={handleOpenPostMessageModal}
                disabled={
                  !backendOrgId ||
                  !localStorageFunnel?.id ||
                  availableDialogs.length === 0 ||
                  postMessageLoading
                }
                variant='outline'
                size='sm'
                className='w-full justify-start text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300'
              >
                <Send className='mr-2 h-4 w-4' />
                Post New Message
              </Button>
            )}

            {localStorageFunnel?.id !== '0' && (
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
            )}

            {localStorageFunnel?.id !== '0' && (
              <Button
                onClick={handleOpenClientSelectModal}
                disabled={!backendOrgId || clientDialogsLoading}
                variant='outline'
                size='sm'
                className='w-full justify-start text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300'
              >
                <MessageCircle className='mr-2 h-4 w-4' />
                {clientDialogsLoading ? 'Loading...' : 'Get Client Dialogs'}
              </Button>
            )}
          </div>

          {/* Сообщения об успехе */}
          {allDialogsSuccessMessage && (
            <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
              <strong>Успех (All Dialogs):</strong> {allDialogsSuccessMessage}
            </div>
          )}

          {createDialogSuccessMessage && (
            <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
              <strong>Успех (Create Dialog):</strong>{' '}
              {createDialogSuccessMessage}
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

          {clientDialogsSuccessMessage && (
            <div className='mt-2 rounded bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
              <strong>Успех (Client Dialogs):</strong>{' '}
              {clientDialogsSuccessMessage}
            </div>
          )}

          {postMessageSuccessMessage && (
            <div className='mt-2 rounded bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'>
              <strong>Успех (Post Message):</strong> {postMessageSuccessMessage}
            </div>
          )}

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
            <div className='mt-2 rounded bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'>
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

          {/* Ошибки */}
          {allDialogsError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (All Dialogs):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {allDialogsError}
              </pre>
            </div>
          )}

          {createDialogError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Create Dialog):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {createDialogError}
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

          {clientDialogsError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Client Dialogs):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {clientDialogsError}
              </pre>
            </div>
          )}

          {postMessageError && (
            <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <strong>Ошибка (Post Message):</strong>
              <pre className='mt-1 text-sm whitespace-pre-wrap'>
                {postMessageError}
              </pre>
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

          {createDialogData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
                View Create Dialog API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900/30 dark:text-green-200'>
                {JSON.stringify(createDialogData, null, 2)}
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

          {clientDialogsData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
                View Client Dialogs API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-blue-100 p-2 text-xs dark:bg-blue-900/30 dark:text-blue-200'>
                {JSON.stringify(clientDialogsData, null, 2)}
              </pre>
            </details>
          )}

          {postMessageData && (
            <details className='mt-2'>
              <summary className='cursor-pointer text-indigo-600 dark:text-indigo-400'>
                View Post Message API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-indigo-100 p-2 text-xs dark:bg-indigo-900/30 dark:text-indigo-200'>
                {JSON.stringify(postMessageData, null, 2)}
              </pre>
            </details>
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
              <summary className='cursor-pointer text-indigo-600 dark:text-indigo-400'>
                View Test Dialog Messages API Response
              </summary>
              <pre className='mt-2 max-h-64 overflow-auto rounded bg-indigo-100 p-2 text-xs dark:bg-indigo-900/30 dark:text-indigo-200'>
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
              <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
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
                        {dialog.uuid}
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
                  <p className='text-sm text-gray-600'>
                    Are you sure you want to delete dialog &quot;
                    {selectedDialogToDelete}&quot;?
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

      {/* Модальное окно для выбора клиента */}
      {isClientSelectModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Get Client Dialogs
              </h2>
              <button
                onClick={handleCloseClientSelectModal}
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
                  htmlFor='client_select_dialogs'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Select Client to Get Dialogs
                </Label>
                <Select
                  value={selectedClientForDialogs}
                  onValueChange={setSelectedClientForDialogs}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Choose a client to get dialogs' />
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

              {availableClients.length === 0 && (
                <div className='rounded bg-yellow-100 p-2 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'>
                  <strong>Информация:</strong> Список клиентов загружается...
                  <br />
                  <small>
                    Если список не загружается, сначала выполните &quot;Get All
                    Clients&quot; в Clients Debug Info
                  </small>
                </div>
              )}

              {clientDialogsError && (
                <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  <strong>Ошибка:</strong>
                  <pre className='mt-1 text-sm whitespace-pre-wrap'>
                    {clientDialogsError}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  onClick={handleCloseClientSelectModal}
                  variant='outline'
                  disabled={clientDialogsLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGetClientDialogs}
                  disabled={clientDialogsLoading || !selectedClientForDialogs}
                >
                  <MessageCircle className='mr-2 h-4 w-4' />
                  {clientDialogsLoading ? 'Loading...' : 'Get Dialogs'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для отправки сообщения */}
      {isPostMessageModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Post New Message
              </h2>
              <button
                onClick={handleClosePostMessageModal}
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
                  htmlFor='dialog_select_post_message'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Select Dialog to Post Message
                </Label>
                <Select
                  value={selectedDialogForMessage}
                  onValueChange={setSelectedDialogForMessage}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Choose a dialog to post message to' />
                  </SelectTrigger>
                  <SelectContent>
                    {allDialogsData?.map((dialog: any) => (
                      <SelectItem key={dialog.uuid} value={dialog.uuid}>
                        {dialog.uuid}image.png
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor='message_text'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Message Text
                </Label>
                <textarea
                  id='message_text'
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={5}
                  className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
                  placeholder='Enter your message text here...'
                />
              </div>

              <div>
                <Label
                  htmlFor='message_role'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Message Role
                </Label>
                <Select value={messageRole} onValueChange={setMessageRole}>
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Choose message role' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='user'>user</SelectItem>
                    <SelectItem value='manager'>manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {postMessageError && (
                <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  <strong>Ошибка:</strong>
                  <pre className='mt-1 text-sm whitespace-pre-wrap'>
                    {postMessageError}
                  </pre>
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  onClick={handleClosePostMessageModal}
                  variant='outline'
                  disabled={postMessageLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePostMessage}
                  disabled={
                    postMessageLoading ||
                    !selectedDialogForMessage ||
                    !messageText.trim()
                  }
                  className='bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600'
                >
                  <Send className='mr-2 h-4 w-4' />
                  {postMessageLoading ? 'Posting...' : 'Post Message'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальные окна для тестовых диалогов */}

      {/* Модальное окно для просмотра сообщений тестового диалога */}
      {isTestDialogMessagesModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
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
                  onClick={handleGetTestDialogMessages}
                  disabled={
                    testDialogMessagesLoading || !selectedTestDialogForMessages
                  }
                  className='bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600'
                >
                  <Eye className='mr-2 h-4 w-4' />
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
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
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
                    <SelectValue placeholder='Choose a test dialog to send message to' />
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
                <Textarea
                  id='test_message_text'
                  value={testMessageText}
                  onChange={(e) => setTestMessageText(e.target.value)}
                  rows={5}
                  className='mt-1'
                  placeholder='Enter your test message text here...'
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
                    <SelectItem value='user'>user</SelectItem>
                    <SelectItem value='manager'>manager</SelectItem>
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
