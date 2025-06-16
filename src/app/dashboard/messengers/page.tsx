'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/hooks/useFunnels';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { PageSkeleton } from '@/components/page-skeleton';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { IconPhone } from '@tabler/icons-react';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Интерфейсы для типизации данных
interface Dialog {
  id?: string;
  uuid: string;
  thread_id: string;
  stage?: string;
  created_at?: string;
  updated_at?: string;
  close_ratio?: number;
  manager?: string;
  ai?: boolean;
  unsubscribed?: boolean;
  client?: {
    id?: number;
    name?: string;
    phone?: string;
    email?: string;
    manager?: string;
    status?: string;
    close_ratio?: number;
    messages_count?: number;
  };
  messages?: Message[];
  lastMessage?: string; // Для отображения последнего сообщения в списке
}

interface Message {
  id: string;
  text: string;
  role: 'user' | 'assistant' | 'manager';
  timestamp: string;
  time?: string;
}

interface DialogsViewProps {
  onDialogNotFound: (threadId: string) => void;
}

function DialogsView({ onDialogNotFound }: DialogsViewProps) {
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDialogId, setSelectedDialogId] = useState<string>('');
  const [selectedDialogMessages, setSelectedDialogMessages] = useState<
    Message[]
  >([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 0,
    status: ''
  });

  // Ref для автоматической прокрутки к последнему сообщению
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { organization } = useOrganization();
  const { currentFunnel } = useFunnels(
    organization?.publicMetadata?.id_backend as string
  );
  const searchParams = useSearchParams();

  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  // Константы для localStorage
  const CACHE_DURATION = 10 * 60 * 1000; // 10 минут в миллисекундах
  const getDialogsCacheKey = () =>
    `messengers_dialogs_${backendOrgId}_${currentFunnel?.id}`;
  const getMessagesCacheKey = (dialogUuid: string) =>
    `messengers_messages_${backendOrgId}_${currentFunnel?.id}_${dialogUuid}`;
  const getLastUpdatedKey = () =>
    `messengers_last_updated_${backendOrgId}_${currentFunnel?.id}`;

  // Проверка актуальности кэша
  const isCacheValid = () => {
    const lastUpdatedStr = localStorage.getItem(getLastUpdatedKey());
    if (!lastUpdatedStr) return false;

    const lastUpdatedTime = new Date(lastUpdatedStr);
    const now = new Date();
    return now.getTime() - lastUpdatedTime.getTime() < CACHE_DURATION;
  };

  // Загрузка данных из кэша
  const loadFromCache = () => {
    try {
      const cachedDialogs = localStorage.getItem(getDialogsCacheKey());
      const lastUpdatedStr = localStorage.getItem(getLastUpdatedKey());

      if (cachedDialogs && lastUpdatedStr) {
        const parsedDialogs: Dialog[] = JSON.parse(cachedDialogs);
        setDialogs(parsedDialogs);
        setLastUpdated(new Date(lastUpdatedStr));

        // Загружаем сообщения для каждого диалога из кэша
        const dialogsWithMessages = parsedDialogs.map((dialog) => {
          const cachedMessages = localStorage.getItem(
            getMessagesCacheKey(dialog.uuid)
          );
          if (cachedMessages) {
            const messages: Message[] = JSON.parse(cachedMessages);
            return { ...dialog, messages };
          }
          return dialog;
        });

        setDialogs(dialogsWithMessages);

        // Проверяем, есть ли thread_id в URL для автоматического выбора диалога
        const threadIdParam = searchParams.get('thread_id');
        if (threadIdParam && dialogsWithMessages.length > 0) {
          // Пытаемся найти и выбрать диалог по thread_id
          if (!selectDialogByThreadId(threadIdParam, dialogsWithMessages)) {
            // Если диалог не найден, выбираем первый
            const firstDialog = dialogsWithMessages[0];
            setSelectedDialogId(firstDialog.uuid);
            setSelectedDialogMessages(firstDialog.messages || []);
          }
        } else if (dialogsWithMessages.length > 0 && !selectedDialogId) {
          // Выбираем первый диалог по умолчанию, если нет thread_id в URL
          const firstDialog = dialogsWithMessages[0];
          setSelectedDialogId(firstDialog.uuid);
          setSelectedDialogMessages(firstDialog.messages || []);
        }

        console.log('Данные загружены из кэша');
        return true;
      }
    } catch (error) {
      console.error('Ошибка загрузки из кэша:', error);
    }
    return false;
  };

  // Сохранение в кэш
  const saveToCache = (
    dialogsData: Dialog[],
    dialogUuid?: string,
    messagesData?: Message[]
  ) => {
    try {
      // Сохраняем диалоги
      localStorage.setItem(getDialogsCacheKey(), JSON.stringify(dialogsData));

      // Сохраняем сообщения конкретного диалога
      if (dialogUuid && messagesData) {
        localStorage.setItem(
          getMessagesCacheKey(dialogUuid),
          JSON.stringify(messagesData)
        );
      }

      // Обновляем время последнего обновления
      const now = new Date();
      localStorage.setItem(getLastUpdatedKey(), now.toISOString());
      setLastUpdated(now);
    } catch (error) {
      console.error('Ошибка сохранения в кэш:', error);
    }
  };

  // Функция для загрузки диалогов с сервера
  const fetchDialogsFromServer = async (): Promise<Dialog[]> => {
    if (!backendOrgId || !currentFunnel?.id) {
      throw new Error('Missing organization or funnel');
    }

    const token = getClerkTokenFromClientCookie();
    if (!token) {
      throw new Error('No authentication token available');
    }

    console.log(
      `Fetching dialogs for organization ${backendOrgId}, funnel ${currentFunnel.id}`
    );

    const response = await fetch(
      `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}/dialogs`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Fetched dialogs data:', data);

    // Преобразуем данные из API в формат для отображения
    const transformedDialogs: Dialog[] = data.map(
      (dialog: any, index: number) => ({
        id: dialog.id || dialog.uuid || `dialog_${index}`,
        uuid: dialog.uuid || `uuid_${index}`,
        thread_id: dialog.thread_id || 'Неизвестно',
        stage: dialog.stage || 'Новый',
        created_at: dialog.created_at || new Date().toISOString(),
        updated_at: dialog.updated_at || new Date().toISOString(),
        close_ratio: dialog.close_ratio || 0,
        manager: dialog.manager || 'Неизвестно',
        ai: dialog.ai || false,
        unsubscribed: dialog.unsubscribed || false,
        client: {
          id: dialog.client?.id || 0,
          name: dialog.client?.name || dialog.name || 'Неизвестно',
          phone: dialog.client?.phone || dialog.phone || 'Неизвестно',
          email: dialog.client?.email || dialog.email || 'Неизвестно',
          manager: dialog.client?.manager || dialog.manager || 'Неизвестно',
          status: dialog.client?.status || dialog.status || 'active',
          close_ratio: dialog.client?.close_ratio || dialog.close_ratio || 0,
          messages_count: dialog.client?.messages_count || 0
        },
        lastMessage: 'Нет сообщений',
        messages: []
      })
    );

    return transformedDialogs;
  };

  // Функция для загрузки сообщений диалога с сервера
  const fetchDialogMessagesFromServer = async (
    dialogUuid: string
  ): Promise<Message[]> => {
    if (!backendOrgId || !currentFunnel?.id || !dialogUuid) {
      return [];
    }

    const token = getClerkTokenFromClientCookie();
    if (!token) {
      return [];
    }

    console.log(`Fetching messages for dialog ${dialogUuid}`);

    const response = await fetch(
      `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}/dialog/${dialogUuid}/messages`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch messages for dialog ${dialogUuid}: ${response.status}`
      );
      return [];
    }

    const messagesData = await response.json();
    console.log(`Fetched messages for dialog ${dialogUuid}:`, messagesData);

    // Логируем каждое сообщение для отладки
    messagesData.forEach((msg: any, index: number) => {
      console.log(`Message ${index}:`, {
        original_sender: msg.sender,
        original_role: msg.role,
        text_preview: msg.text?.substring(0, 50) + '...',
        all_fields: Object.keys(msg)
      });
    });

    // Преобразуем сообщения в нужный формат
    const transformedMessages: Message[] = messagesData.map(
      (msg: any, index: number) => {
        // Проверяем и поле role, и поле sender для совместимости
        const originalRole = msg.role || msg.sender;
        let role = originalRole;

        // Корректируем роль, если она не соответствует нашим ожидаемым значениям
        if (originalRole === 'user' || originalRole === 'client') {
          role = 'user';
        } else if (originalRole === 'manager') {
          role = 'manager';
        } else {
          role = 'assistant'; // По умолчанию считаем ассистентом
        }

        console.log(
          `Transforming message ${index}: ${originalRole} -> ${role}`
        );

        return {
          id: msg.id || `msg_${index}`,
          text: msg.text || msg.content || 'Сообщение без текста',
          role: role,
          timestamp:
            msg.timestamp ||
            msg.created_at ||
            msg.time ||
            new Date().toISOString(),
          time:
            msg.time ||
            new Date(
              msg.timestamp || msg.created_at || msg.time || Date.now()
            ).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit'
            })
        };
      }
    );

    return transformedMessages;
  };

  // Функция для полной загрузки всех данных
  const fetchAllData = async (forceRefresh = false) => {
    if (!backendOrgId || !currentFunnel?.id) {
      console.log('Missing backendOrgId or currentFunnel.id, skipping fetch');
      setLoading(false);
      return;
    }

    // Проверяем кэш только если не принудительное обновление
    if (!forceRefresh && isCacheValid() && loadFromCache()) {
      setLoading(false);
      return;
    }

    setError(null);
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Шаг 1: Загружаем список диалогов
      setLoadingProgress({
        current: 0,
        total: 1,
        status: 'Загрузка диалогов...'
      });
      const dialogsData = await fetchDialogsFromServer();

      if (dialogsData.length === 0) {
        setDialogs([]);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Сохраняем диалоги в кэш
      saveToCache(dialogsData);
      setDialogs(dialogsData);

      // Шаг 2: Загружаем сообщения для каждого диалога
      setLoadingProgress({
        current: 0,
        total: dialogsData.length,
        status: 'Загрузка сообщений...'
      });

      const dialogsWithMessages: Dialog[] = [];

      for (let i = 0; i < dialogsData.length; i++) {
        const dialog = dialogsData[i];
        setLoadingProgress({
          current: i + 1,
          total: dialogsData.length,
          status: `Загрузка сообщений ${i + 1}/${dialogsData.length}`
        });

        try {
          const messages = await fetchDialogMessagesFromServer(dialog.uuid);
          const dialogWithMessages = {
            ...dialog,
            messages,
            lastMessage:
              messages.length > 0
                ? messages[messages.length - 1].text
                : 'Неизвестно'
          };

          dialogsWithMessages.push(dialogWithMessages);

          // Сохраняем сообщения в кэш
          saveToCache(dialogsWithMessages, dialog.uuid, messages);

          // Обновляем состояние по мере загрузки
          setDialogs([...dialogsWithMessages]);
        } catch (error) {
          console.error(
            `Error fetching messages for dialog ${dialog.uuid}:`,
            error
          );
          dialogsWithMessages.push(dialog);
        }
      }

      // Проверяем, есть ли thread_id в URL для автоматического выбора диалога
      const threadIdParam = searchParams.get('thread_id');
      const uuidParam = searchParams.get('uuid');

      if (dialogsWithMessages.length > 0) {
        // Проверяем наличие uuid параметра в URL
        if (uuidParam) {
          const dialogWithUuid = dialogsWithMessages.find(
            (d) => d.uuid === uuidParam
          );
          if (dialogWithUuid) {
            setSelectedDialogId(dialogWithUuid.uuid);
            setSelectedDialogMessages(dialogWithUuid.messages || []);
            console.log(`Автоматически выбран диалог с uuid: ${uuidParam}`);
          } else {
            console.log(`Диалог с uuid: ${uuidParam} не найден`);
          }
        }
        // Если нет uuid, но есть thread_id
        else if (threadIdParam) {
          // Пытаемся найти диалог по thread_id только если он ещё не выбран
          const currentSelectedDialog = dialogsWithMessages.find(
            (d) => d.uuid === selectedDialogId
          );
          if (
            !currentSelectedDialog ||
            currentSelectedDialog.thread_id !== threadIdParam
          ) {
            selectDialogByThreadId(threadIdParam, dialogsWithMessages);
          }
        }
      } else if (dialogsWithMessages.length > 0 && !selectedDialogId) {
        // Выбираем первый диалог по умолчанию, если нет thread_id в URL
        const firstDialog = dialogsWithMessages[0];
        setSelectedDialogId(firstDialog.uuid);
        setSelectedDialogMessages(firstDialog.messages || []);
      }

      setLoadingProgress({ current: 0, total: 0, status: '' });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setDialogs([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Функция обновления данных
  const handleRefresh = () => {
    fetchAllData(true);
  };

  // Функция для автоматического выбора диалога по thread_id из URL
  const selectDialogByThreadId = (threadId: string, dialogsList: Dialog[]) => {
    const targetDialog = dialogsList.find(
      (dialog) => dialog.thread_id === threadId
    );
    if (targetDialog) {
      setSelectedDialogId(targetDialog.uuid);
      setSelectedDialogMessages(targetDialog.messages || []);
      console.log(
        `Автоматически выбран диалог с thread_id: ${threadId}, uuid: ${targetDialog.uuid}`
      );
      return true;
    }
    console.log(`Диалог с thread_id: ${threadId} не найден`);
    // Вызываем callback для показа модального окна
    onDialogNotFound(threadId);
    return false;
  };

  // Загружаем данные при монтировании и изменении организации/воронки
  useEffect(() => {
    if (organization && currentFunnel) {
      fetchAllData();
    }
  }, [backendOrgId, currentFunnel?.id]);

  // Автоматическое обновление каждые 10 минут
  useEffect(() => {
    const interval = setInterval(() => {
      if (backendOrgId && currentFunnel?.id) {
        console.log('Автоматическое обновление данных...');
        fetchAllData(true);
      }
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [backendOrgId, currentFunnel?.id]);

  // Обновляем сообщения при выборе диалога
  useEffect(() => {
    if (selectedDialogId) {
      const selectedDialog = dialogs.find((d) => d.uuid === selectedDialogId);
      if (selectedDialog && selectedDialog.messages) {
        setSelectedDialogMessages(selectedDialog.messages);
      } else {
        setSelectedDialogMessages([]);
      }
    }
  }, [selectedDialogId, dialogs]);

  // Отслеживаем изменения thread_id в URL для автоматического выбора диалога
  useEffect(() => {
    const threadIdParam = searchParams.get('thread_id');
    const uuidParam = searchParams.get('uuid');

    if (dialogs.length > 0) {
      // Проверяем наличие uuid параметра в URL
      if (uuidParam) {
        const dialogWithUuid = dialogs.find((d) => d.uuid === uuidParam);
        if (dialogWithUuid) {
          setSelectedDialogId(dialogWithUuid.uuid);
          setSelectedDialogMessages(dialogWithUuid.messages || []);
          console.log(`Автоматически выбран диалог с uuid: ${uuidParam}`);
        } else {
          console.log(`Диалог с uuid: ${uuidParam} не найден`);
        }
      }
      // Если нет uuid, но есть thread_id
      else if (threadIdParam) {
        // Пытаемся найти диалог по thread_id только если он ещё не выбран
        const currentSelectedDialog = dialogs.find(
          (d) => d.uuid === selectedDialogId
        );
        if (
          !currentSelectedDialog ||
          currentSelectedDialog.thread_id !== threadIdParam
        ) {
          selectDialogByThreadId(threadIdParam, dialogs);
        }
      }
    }
  }, [searchParams, dialogs, selectedDialogId]);

  const selectedDialog = dialogs.find((d) => d.uuid === selectedDialogId);

  // Автоматическая прокрутка к последнему сообщению при изменении сообщений
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedDialogMessages]);

  const getInitials = (name: string) => {
    if (!name || name === 'Неизвестно') return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const dateFormatted = date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    });
    return `${time}, ${dateFormatted}`;
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedDialogId) {
      console.log('Sending message:', newMessage);

      const tokenFromCookie = getClerkTokenFromClientCookie();
      if (!tokenFromCookie) {
        console.error('No token available');
        return;
      }

      try {
        console.log(
          `Posting message to dialog ${selectedDialogId} as role "manager"`
        );

        // Debug log for the message body we're sending
        const messageBody = {
          text: newMessage,
          role: 'manager'
        };
        console.log('Message payload:', messageBody);

        const response = await fetch(
          `/api/organization/${backendOrgId}/funnel/${currentFunnel?.id}/dialog/${selectedDialogId}/message`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenFromCookie}`
            },
            body: JSON.stringify(messageBody)
          }
        );

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            console.error('API error response:', errorData);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            console.error('Failed to parse error response');
          }
          console.error(errorMessage);
          return;
        }

        const data = await response.json();
        console.log('Message posted successfully:', data);

        // Add message to local state and update cache
        const newMsg: Message = {
          id: data.id || `temp_${Date.now()}`,
          text: newMessage,
          role: 'manager',
          timestamp: new Date().toISOString(),
          time: new Date().toLocaleTimeString()
        };

        console.log('Adding new message with role:', newMsg.role);

        const updatedMessages = [...selectedDialogMessages, newMsg];
        setSelectedDialogMessages(updatedMessages);

        // Update cache with new message
        saveToCache(dialogs, selectedDialogId, updatedMessages);

        // After successful send, fetch messages again to ensure all data is up to date
        fetchDialogMessagesFromServer(selectedDialogId)
          .then((messages) => {
            setSelectedDialogMessages(messages);
            saveToCache(dialogs, selectedDialogId, messages);
          })
          .catch((err) =>
            console.error('Error updating messages after send:', err)
          );
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setNewMessage(''); // Clear the message input regardless of success/failure
      }
    }
  };

  const getStageProgress = (stage: string) => {
    const stageProgressMap: Record<string, number> = {
      Новый: 25,
      Квалификация: 50,
      Переговоры: 75,
      Закрыто: 100
    };
    return stageProgressMap[stage] || 25;
  };

  // Показываем индикатор загрузки
  if (loading) {
    return (
      <div className='flex min-h-[600px] items-center justify-center'>
        <div className='max-w-md text-center'>
          <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
          <p className='text-muted-foreground mt-4'>
            {loadingProgress.status || 'Загрузка диалогов...'}
          </p>
          {loadingProgress.total > 0 && (
            <div className='mt-2'>
              <div className='h-2 w-full rounded-full bg-gray-200'>
                <div
                  className='h-2 rounded-full bg-blue-600 transition-all duration-300'
                  style={{
                    width: `${(loadingProgress.current / loadingProgress.total) * 100}%`
                  }}
                ></div>
              </div>
              <p className='text-muted-foreground mt-1 text-sm'>
                {loadingProgress.current}/{loadingProgress.total}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Показываем сообщение об ошибке
  if (error) {
    return (
      <div className='flex min-h-[600px] items-center justify-center'>
        <div className='text-center'>
          <p className='mb-4 text-red-600'>Ошибка загрузки диалогов: {error}</p>
          <Button onClick={() => fetchAllData(true)} variant='outline'>
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  // Показываем сообщение, если нет организации или воронки
  if (!backendOrgId || !currentFunnel) {
    return (
      <div className='flex min-h-[600px] items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>
            {!backendOrgId
              ? 'Организация не выбрана или не настроена'
              : 'Воронка не выбрана'}
          </p>
          <p className='text-muted-foreground text-sm'>
            Выберите организацию и воронку для просмотра диалогов
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <div className='flex h-[calc(100vh-280px)] overflow-hidden rounded-lg border'>
        {/* Left panel - Dialogs list */}
        <div className='flex w-1/4 flex-col border-r'>
          <div className='border-b p-4'>
            <h3 className='text-lg font-semibold'>
              Диалоги ({dialogs.length})
            </h3>
            {isRefreshing && (
              <p className='mt-1 text-sm text-blue-600'>Обновление данных...</p>
            )}
          </div>
          <div className='flex-1 overflow-auto'>
            {dialogs.length === 0 ? (
              <div className='text-muted-foreground p-4 text-center'>
                Диалоги не найдены
              </div>
            ) : (
              dialogs.map((dialog) => (
                <div
                  key={dialog.uuid}
                  onClick={() => {
                    setSelectedDialogId(dialog.uuid);
                    // Обновляем URL без перезагрузки страницы, чтобы отразить выбранный диалог
                    const url = new URL(window.location.href);
                    url.searchParams.set('uuid', dialog.uuid);
                    window.history.pushState({}, '', url);
                  }}
                  className={`hover:bg-muted/50 cursor-pointer border-b p-4 transition-colors ${
                    selectedDialogId === dialog.uuid ? 'bg-muted' : ''
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarFallback className='bg-primary/10 text-primary text-sm'>
                        {getInitials(dialog.client?.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0 flex-1'>
                      <div className='mb-1 flex items-center justify-between'>
                        <h4 className='truncate text-sm font-medium'>
                          {dialog.client?.name || 'Неизвестно'}
                        </h4>
                        <span className='text-muted-foreground text-xs'>
                          {new Date(
                            dialog.updated_at || ''
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className='mb-1 flex items-center gap-2'>
                        <IconPhone className='text-muted-foreground h-3 w-3' />
                        <span className='text-muted-foreground text-xs'>
                          {dialog.client?.phone || 'Неизвестно'}
                        </span>
                      </div>
                      <div className='mb-1 flex items-center gap-2'>
                        <span className='text-muted-foreground text-xs'>
                          Telegram
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <p className='text-muted-foreground truncate text-xs'>
                          {dialog.lastMessage || 'Нет сообщений'}
                        </p>

                        {/* {dialog.client?.messages_count &&
                          dialog.client.messages_count > 0 && (
                            <Badge
                              variant='default'
                              className='flex h-5 min-w-5 items-center justify-center text-xs'
                            >
                              {dialog.client.messages_count}
                            </Badge>
                          )} */}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Middle panel - Chat */}
        <div className='flex flex-1 flex-col'>
          {selectedDialog ? (
            <>
              {/* Chat header */}
              <div className='border-b p-4'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback className='bg-primary/10 text-primary text-sm'>
                      {getInitials(selectedDialog.client?.name || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className='font-medium'>
                      {selectedDialog.client?.name || 'Неизвестно'}
                    </h4>
                    <p className='text-muted-foreground text-sm'>
                      {selectedDialog.client?.phone || 'Неизвестно'}
                    </p>
                  </div>
                  <div className='ml-auto flex items-center gap-3'>
                    <div className='text-sm text-gray-500'>Telegram</div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        // Очищаем выбранный диалог
                        setSelectedDialogId('');
                        // Удаляем параметр uuid из URL
                        const url = new URL(window.location.href);
                        url.searchParams.delete('uuid');
                        window.history.pushState({}, '', url);
                      }}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='mr-1'
                      >
                        <path d='M15 18l-6-6 6-6' />
                      </svg>
                      К списку
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className='flex-1 space-y-4 overflow-auto p-4'>
                {selectedDialogMessages.length === 0 ? (
                  <div className='flex h-full items-center justify-center'>
                    <p className='text-muted-foreground'>
                      Сообщения не найдены
                    </p>
                  </div>
                ) : (
                  // Показываем сообщения в порядке от старых к новым (reverse array)
                  [...selectedDialogMessages].reverse().map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] min-w-[180px] rounded-lg border p-3 ${
                          message.role === 'user'
                            ? 'border-gray-600 bg-gray-700 text-white dark:border-gray-500 dark:bg-gray-600'
                            : 'border-gray-200 bg-gray-100 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
                        }`}
                      >
                        <div className='text-sm whitespace-pre-wrap'>
                          {message.text}
                        </div>
                        <div
                          className={`mt-2 flex items-center justify-between text-xs ${
                            message.role === 'user'
                              ? 'text-gray-300 dark:text-gray-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          <span>
                            {message.role === 'user'
                              ? 'Клиент'
                              : message.role === 'manager'
                                ? 'Менеджер'
                                : 'AI-ассистент'}
                          </span>
                          <span className='opacity-70'>
                            {formatDateTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {/* Элемент для автоматической прокрутки */}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className='border-t p-4'>
                <div className='flex gap-2'>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder='Введите сообщение...'
                    className='flex-1'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Отправить
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className='flex flex-1 items-center justify-center'>
              <p className='text-muted-foreground'>
                Выберите диалог для просмотра сообщений
              </p>
            </div>
          )}
        </div>

        {/* Right panel - Client Details */}
        {selectedDialog && (
          <div className='flex w-80 flex-col border-l'>
            <div className='border-b p-4'>
              <h3 className='text-lg font-semibold'>Информация о клиенте</h3>
            </div>
            <div className='flex-1 overflow-auto p-4'>
              <div className='space-y-4'>
                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Имя
                  </span>
                  <span>{selectedDialog.client?.name || 'Неизвестно'}</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Телефон
                  </span>
                  <span>{selectedDialog.client?.phone || 'Неизвестно'}</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Email
                  </span>
                  <span>{selectedDialog.client?.email || 'Неизвестно'}</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Мессенджер
                  </span>
                  <span>Telegram</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    UUID
                  </span>
                  <span className='font-mono text-xs'>
                    {selectedDialog.uuid}
                  </span>
                </div>

                <div className='border-t pt-4'>
                  <h4 className='mb-4 text-lg font-semibold'>
                    Данные о сделке
                  </h4>

                  <div className='space-y-4'>
                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Дата создания
                      </span>
                      <span>
                        {new Date(
                          selectedDialog.created_at || ''
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Количество сообщений
                      </span>
                      <span>
                        {selectedDialog.client?.messages_count ||
                          selectedDialogMessages.length}
                      </span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Текущий этап
                      </span>
                      <span>{selectedDialog.stage || 'Не указан'}</span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Ответственный
                      </span>
                      <span>{selectedDialog.manager || 'Не назначен'}</span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground mb-2 text-sm font-medium'>
                        Статус
                      </span>
                      <Badge
                        variant={
                          selectedDialog.client?.status === 'active'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {selectedDialog.client?.status === 'active'
                          ? 'Активный'
                          : 'Неактивный'}
                      </Badge>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Вероятность закрытия
                      </span>
                      <div className='mt-1 flex items-center gap-2'>
                        <Progress
                          value={selectedDialog.close_ratio || 0}
                          className='flex-1'
                        />
                        <span>{selectedDialog.close_ratio || 0}%</span>
                      </div>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Обновлено
                      </span>
                      <span>
                        {new Date(
                          selectedDialog.updated_at || ''
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        AI-ассистент
                      </span>
                      <Badge
                        variant={selectedDialog.ai ? 'default' : 'outline'}
                      >
                        {selectedDialog.ai ? 'Включен' : 'Выключен'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Панель управления - перенесена в низ */}
      <div className='bg-muted/50 mt-4 flex items-center justify-between rounded-lg border p-3'>
        <div className='flex items-center gap-4'>
          <div className='text-sm'>
            <span className='font-medium'>Воронка:</span>{' '}
            {currentFunnel?.display_name || currentFunnel?.name || 'Неизвестно'}
          </div>
          {lastUpdated && (
            <div className='text-muted-foreground text-sm'>
              Обновлено: {lastUpdated.toLocaleTimeString('ru-RU')}
            </div>
          )}
          {isRefreshing && (
            <div className='text-sm text-blue-600'>Обновление данных...</div>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          variant='outline'
          size='sm'
          disabled={isRefreshing}
          className='flex items-center gap-2'
        >
          <div className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}>
            ↻
          </div>
          {isRefreshing ? 'Обновление...' : 'Обновить'}
        </Button>
      </div>
    </div>
  );
}

export default function MessengersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDialogNotFoundModal, setShowDialogNotFoundModal] = useState(false);
  const [notFoundThreadId, setNotFoundThreadId] = useState<string>('');
  const [shownNotFoundThreadIds, setShownNotFoundThreadIds] = useState<
    Set<string>
  >(new Set());

  // Функция для закрытия модального окна "диалог не найден"
  const handleCloseDialogNotFoundModal = () => {
    setShowDialogNotFoundModal(false);
    setNotFoundThreadId('');
  };

  const handleDialogNotFound = (threadId: string) => {
    // Проверяем, показывали ли уже модальное окно для этого thread_id
    if (shownNotFoundThreadIds.has(threadId)) {
      console.log(
        `Модальное окно для thread_id: ${threadId} уже было показано, пропускаем`
      );
      return;
    }

    // Добавляем thread_id в список показанных
    setShownNotFoundThreadIds((prev) => new Set(prev).add(threadId));

    // Показываем модальное окно
    setNotFoundThreadId(threadId);
    setShowDialogNotFoundModal(true);
  };

  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [editMode, setEditMode] = useState<Set<number>>(new Set());
  const [requests, setRequests] = useState<Record<number, string>>({
    1: 'хочет интегрировать CRM систему в свой бизнес',
    2: 'интересуется автоматизацией бизнес-процессов',
    3: 'ищет решение для управления продажами',
    4: 'нужна помощь с настройкой интеграции',
    5: 'рассматривает внедрение системы для среднего бизнеса'
  });
  const [stages, setStages] = useState<Record<number, string>>({
    1: 'Знакомство',
    2: 'Квалификация',
    3: 'Презентация',
    4: 'Закрытие',
    5: 'Знакомство'
  });

  const toggleRowSelection = (id: number) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const deleteRow = (id: number) => {
    const row = document.getElementById(`row-${id}`);
    if (row) {
      row.style.transition = 'opacity 0.5s ease-out';
      row.style.opacity = '0';
      setTimeout(() => {
        row.style.display = 'none';
        setShowDeleteMessage(true);
        setTimeout(() => {
          setShowDeleteMessage(false);
        }, 3000);
      }, 500);
    }
  };

  const deleteSelectedRows = () => {
    selectedRows.forEach((id: number) => {
      deleteRow(id);
    });
    setSelectedRows(new Set());
  };

  const toggleEditMode = (id: number) => {
    setEditMode((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleRequestChange = (id: number, value: string) => {
    setRequests((prev) => ({ ...prev, [id]: value }));
  };

  const handleStageChange = (id: number, value: string) => {
    setStages((prev) => ({ ...prev, [id]: value }));
  };

  const navigateToChat = (id: number) => {
    router.push(`/dashboard/messengers?id=${id}`);
  };

  return (
    <Suspense fallback={<PageSkeleton />}>
      <div className='p-6'>
        <div className='w-full space-y-4'>
          {/* Заголовок, табы и кнопка экспорта в одной строке */}
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
              <h1 className='text-xl font-semibold sm:text-2xl'>Мессенджеры</h1>
            </div>

            <Button variant='outline'>Экспорт</Button>
          </div>

          {/* Основной контент */}
          <div className='w-full space-y-4'>
            <DialogsView onDialogNotFound={handleDialogNotFound} />
          </div>
        </div>

        {/* Модальное окно "диалог не найден" */}
        {showDialogNotFoundModal && (
          <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
            <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='rounded-full bg-red-100 p-2 dark:bg-red-900/30'>
                  <svg
                    className='h-6 w-6 text-red-600 dark:text-red-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                  Диалог не найден
                </h3>
              </div>

              <div className='mb-6'>
                <p className='mb-2 text-gray-600 dark:text-gray-300'>
                  Диалог с указанным идентификатором не был найден.
                </p>
                <div className='rounded bg-gray-100 p-3 dark:bg-gray-700'>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    Thread ID:
                  </p>
                  <p className='font-mono text-sm break-all text-gray-800 dark:text-gray-200'>
                    {notFoundThreadId}
                  </p>
                </div>
              </div>

              <div className='flex justify-end gap-3'>
                <Button
                  onClick={handleCloseDialogNotFoundModal}
                  className='px-4 py-2'
                >
                  Понятно
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}
