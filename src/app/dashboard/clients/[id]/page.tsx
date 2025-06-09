'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useOrganization } from '@clerk/nextjs';
import { PageContainer } from '@/components/ui/page-container';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { IconChevronLeft, IconRefresh } from '@tabler/icons-react';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';

// Интерфейсы для данных
interface ClientDialog {
  id: string;
  uuid: string;
  thread_id: string;
  name?: string;
  phone?: string;
  email?: string;
  stage?: string;
  created?: string;
  lastActivity?: string;
  status?: string;
  lastMessage?: string;
  probability?: number;
}

interface ClientInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  manager: string;
  status: string;
  created?: string;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { organization } = useOrganization();
  const clientId = params.id as string;
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Состояния
  const [dialogs, setDialogs] = useState<ClientDialog[]>([]);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Получаем backend ID организации из метаданных Clerk
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  // Ключи для кэширования
  const getClientDialogsCacheKey = () =>
    `client_dialogs_${backendOrgId}_${clientId}`;
  const getClientInfoCacheKey = () => `client_info_${backendOrgId}_${clientId}`;
  const getLastUpdatedKey = () =>
    `client_page_last_updated_${backendOrgId}_${clientId}`;

  // Проверка валидности кэша (10 минут)
  const isCacheValid = () => {
    const lastUpdatedStr = localStorage.getItem(getLastUpdatedKey());
    if (!lastUpdatedStr) return false;

    const lastUpdatedTime = new Date(lastUpdatedStr).getTime();
    const now = new Date().getTime();
    const tenMinutes = 10 * 60 * 1000; // 10 минут в миллисекундах

    return now - lastUpdatedTime < tenMinutes;
  };

  // Загрузка данных из кэша
  const loadFromCache = () => {
    try {
      const cachedDialogs = localStorage.getItem(getClientDialogsCacheKey());
      const cachedClientInfo = localStorage.getItem(getClientInfoCacheKey());
      const lastUpdatedStr = localStorage.getItem(getLastUpdatedKey());

      if (cachedDialogs && cachedClientInfo && lastUpdatedStr) {
        const parsedDialogs: ClientDialog[] = JSON.parse(cachedDialogs);
        const parsedClientInfo: ClientInfo = JSON.parse(cachedClientInfo);

        setDialogs(parsedDialogs);
        setClientInfo(parsedClientInfo);
        setLastUpdated(new Date(lastUpdatedStr));

        console.log('Данные клиента загружены из кэша');
        return true;
      }
    } catch (error) {
      console.error('Ошибка загрузки из кэша:', error);
    }
    return false;
  };

  // Сохранение в кэш
  const saveToCache = (
    dialogsData: ClientDialog[],
    clientInfoData: ClientInfo
  ) => {
    try {
      localStorage.setItem(
        getClientDialogsCacheKey(),
        JSON.stringify(dialogsData)
      );
      localStorage.setItem(
        getClientInfoCacheKey(),
        JSON.stringify(clientInfoData)
      );

      const now = new Date();
      localStorage.setItem(getLastUpdatedKey(), now.toISOString());
      setLastUpdated(now);
    } catch (error) {
      console.error('Ошибка сохранения в кэш:', error);
    }
  };

  // Функция для загрузки информации о клиенте с сервера
  const fetchClientInfoFromServer = async (): Promise<ClientInfo> => {
    if (!backendOrgId || !clientId) {
      throw new Error('Missing organization or client ID');
    }

    const token = getClerkTokenFromClientCookie();
    if (!token) {
      throw new Error('No authentication token available');
    }

    console.log(`Fetching client info for client ${clientId}`);

    const response = await fetch(
      `/api/organization/${backendOrgId}/client/${clientId}`,
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
    console.log('Fetched client info:', data);

    // Преобразуем данные клиента
    const transformedClientInfo: ClientInfo = {
      id: data.id || clientId,
      name: data.name || 'Неизвестно',
      email: data.email || 'Неизвестно',
      phone: data.phone || 'Неизвестно',
      manager: data.manager || 'Неизвестно',
      status:
        data.status === 'active'
          ? 'Активный'
          : data.status === 'inactive'
            ? 'Неактивный'
            : 'Неизвестно',
      created: data.created || 'Неизвестно'
    };

    return transformedClientInfo;
  };

  // Функция для загрузки диалогов клиента с сервера
  const fetchClientDialogsFromServer = async (): Promise<ClientDialog[]> => {
    if (!backendOrgId || !clientId) {
      throw new Error('Missing organization or client ID');
    }

    const token = getClerkTokenFromClientCookie();
    if (!token) {
      throw new Error('No authentication token available');
    }

    console.log(`Fetching dialogs for client ${clientId}`);

    const response = await fetch(
      `/api/organization/${backendOrgId}/client/${clientId}/dialogs`,
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
    console.log('Fetched client dialogs:', data);

    // Преобразуем данные диалогов
    const transformedDialogs: ClientDialog[] = data.map(
      (dialog: any, index: number) => ({
        id: dialog.id || dialog.uuid || `dialog_${index}`,
        uuid: dialog.uuid || `uuid_${index}`,
        thread_id: dialog.thread_id || 'Неизвестно',
        name: dialog.name || 'Неизвестно',
        phone: dialog.phone || 'Неизвестно',
        email: dialog.email || 'Неизвестно',
        stage: getStageFromDialog(dialog) || 'Новый',
        created: dialog.created || 'Неизвестно',
        lastActivity: dialog.last_activity || 'Неизвестно',
        status: 'Активный',
        lastMessage: dialog.last_message || 'Неизвестно',
        probability: getStageProgress(getStageFromDialog(dialog) || 'Новый')
      })
    );

    return transformedDialogs;
  };

  // Функция для определения стадии из диалога
  const getStageFromDialog = (dialog: any): string => {
    // Можно добавить логику определения стадии на основе данных диалога
    if (dialog.stage) return dialog.stage;
    if (dialog.status === 'closed') return 'Закрыт';
    if (dialog.status === 'active') return 'Активный';
    return 'Новый';
  };

  // Функция для определения процента вероятности по стадии
  const getStageProgress = (stage: string): number => {
    const stageProgressMap: { [key: string]: number } = {
      Новый: 10,
      Знакомство: 25,
      Квалификация: 50,
      Презентация: 75,
      Переговоры: 85,
      Закрытие: 95,
      Активный: 60,
      Закрыт: 100
    };
    return stageProgressMap[stage] || 10;
  };

  // Функция для полной загрузки всех данных
  const fetchAllData = useCallback(
    async (forceRefresh = false) => {
      if (!backendOrgId || !clientId) {
        console.log('Missing backendOrgId or clientId, skipping fetch');
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
        // Загружаем информацию о клиенте и его диалоги параллельно
        const [clientInfoData, clientDialogsData] = await Promise.all([
          fetchClientInfoFromServer(),
          fetchClientDialogsFromServer()
        ]);

        // Сохраняем данные
        setClientInfo(clientInfoData);
        setDialogs(clientDialogsData);

        // Сохраняем в кэш
        saveToCache(clientDialogsData, clientInfoData);
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setClientInfo(null);
        setDialogs([]);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [backendOrgId, clientId]
  );

  // Функция обновления данных
  const handleRefresh = () => {
    fetchAllData(true);
  };

  // Загружаем данные при монтировании и изменении параметров
  useEffect(() => {
    if (organization && clientId) {
      fetchAllData();
    }
  }, [backendOrgId, clientId, fetchAllData, organization]);

  // Автообновление каждые 10 минут
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (!isRefreshing && !loading) {
          fetchAllData(true);
        }
      },
      10 * 60 * 1000
    ); // 10 минут

    return () => clearInterval(interval);
  }, [isRefreshing, loading, fetchAllData]);

  // Сброс позиции прокрутки при изменении клиента
  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = 0;
    }
  }, [clientId]);

  const goBack = () => {
    router.back();
  };

  const navigateToChat = (dialog: ClientDialog) => {
    // Переходим на страницу мессенджеров с указанием thread_id для автоматического выбора диалога
    router.push(
      `/dashboard/messengers?tab=dialogs&thread_id=${dialog.thread_id}`
    );
  };

  // Показываем индикатор загрузки
  if (loading) {
    return (
      <PageContainer>
        <div className='flex min-h-[600px] items-center justify-center'>
          <div className='text-center'>
            <div className='border-muted border-t-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4'></div>
            <p className='text-muted-foreground'>Загрузка данных клиента...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Показываем сообщение об ошибке
  if (error) {
    return (
      <PageContainer>
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='text-center'>
            <p className='mb-4 text-red-600'>
              Ошибка загрузки данных клиента: {error}
            </p>
            <Button onClick={() => fetchAllData(true)} variant='outline'>
              Попробовать снова
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Показываем сообщение, если нет организации
  if (!backendOrgId) {
    return (
      <PageContainer>
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='text-center'>
            <p className='text-muted-foreground mb-4'>
              Организация не выбрана или не настроена
            </p>
            <p className='text-muted-foreground text-sm'>
              Выберите организацию для просмотра данных клиента
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={true}>
      <div className='flex h-full'>
        {/* Main area for client dialogs */}
        <div className='flex h-full max-h-[calc(100vh-80px)] flex-1 flex-col'>
          <div className='flex items-center gap-2 border-b p-4'>
            <Button variant='ghost' size='icon' onClick={goBack}>
              <IconChevronLeft className='h-5 w-5' />
            </Button>
            <div className='font-semibold'>
              {clientInfo
                ? `${clientInfo.name} (ID: ${clientId})`
                : `Клиент #${clientId}`}
            </div>
          </div>

          <div className='flex-1 space-y-4 overflow-auto p-4'>
            {dialogs.length === 0 ? (
              <div className='flex items-center justify-center py-12'>
                <div className='text-center'>
                  <div className='text-muted-foreground mb-4'>
                    <svg
                      className='mx-auto h-12 w-12'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1}
                        d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                      />
                    </svg>
                  </div>
                  <h3 className='mb-2 text-lg font-semibold'>
                    Диалогов пока нет
                  </h3>
                  <p className='text-muted-foreground'>
                    У данного клиента пока нет активных диалогов в системе
                  </p>
                </div>
              </div>
            ) : (
              dialogs.map((dialog) => (
                <div
                  key={dialog.id}
                  className='hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors'
                >
                  <div className='flex-1'>
                    <div className='mb-2 flex items-start justify-between'>
                      <div>
                        <div className='mb-1 font-semibold'>
                          Диалог с {dialog.name}
                        </div>
                        <div className='text-muted-foreground mb-1 text-sm'>
                          Thread ID: {dialog.thread_id}
                        </div>
                        <div className='text-muted-foreground text-sm'>
                          {dialog.lastMessage}
                        </div>
                      </div>
                      <div className='flex flex-col items-end gap-2'>
                        <Badge
                          variant={
                            dialog.status === 'Активный'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {dialog.status}
                        </Badge>
                        <div className='text-muted-foreground text-xs'>
                          {dialog.lastActivity}
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-4'>
                        <div className='text-sm'>
                          <span className='text-muted-foreground'>Этап:</span>{' '}
                          {dialog.stage}
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-muted-foreground text-sm'>
                            Вероятность:
                          </span>
                          <Progress
                            value={dialog.probability}
                            className='w-20'
                          />
                          <span className='text-sm'>{dialog.probability}%</span>
                        </div>
                      </div>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => navigateToChat(dialog)}
                      >
                        Перейти к диалогу
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Client details sidebar */}
        <div ref={sidebarRef} className='h-full w-80 overflow-auto border-l'>
          <div className='p-4'>
            <div className='mb-4 flex items-center justify-between'>
              <CardTitle className='text-xl'>Информация о клиенте</CardTitle>
              <Button
                onClick={handleRefresh}
                variant='outline'
                size='sm'
                disabled={isRefreshing}
                className='flex items-center gap-2'
              >
                <IconRefresh
                  className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                {isRefreshing ? 'Обновление...' : 'Обновить'}
              </Button>
            </div>

            {clientInfo && (
              <div className='space-y-4'>
                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Имя
                  </span>
                  <span>{clientInfo.name}</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Email
                  </span>
                  <span>{clientInfo.email}</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Телефон
                  </span>
                  <span>{clientInfo.phone}</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Менеджер
                  </span>
                  <span>{clientInfo.manager}</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Статус
                  </span>
                  <Badge
                    variant={
                      clientInfo.status === 'Активный' ? 'default' : 'secondary'
                    }
                  >
                    {clientInfo.status}
                  </Badge>
                </div>

                <div className='border-t pt-4'>
                  <h4 className='mb-4 font-semibold'>Статистика диалогов</h4>

                  <div className='space-y-3'>
                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Всего диалогов
                      </span>
                      <span>{dialogs.length}</span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Активные диалоги
                      </span>
                      <span>
                        {dialogs.filter((d) => d.status === 'Активный').length}
                      </span>
                    </div>

                    {dialogs.length > 0 && (
                      <div className='flex flex-col'>
                        <span className='text-muted-foreground text-sm font-medium'>
                          Средняя вероятность
                        </span>
                        <div className='flex items-center gap-2'>
                          <Progress
                            value={Math.round(
                              dialogs.reduce(
                                (sum, d) => sum + (d.probability || 0),
                                0
                              ) / dialogs.length
                            )}
                            className='flex-1'
                          />
                          <span>
                            {Math.round(
                              dialogs.reduce(
                                (sum, d) => sum + (d.probability || 0),
                                0
                              ) / dialogs.length
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {lastUpdated && (
                  <div className='border-t pt-4'>
                    <div className='text-muted-foreground text-sm'>
                      Последнее обновление:{' '}
                      {lastUpdated.toLocaleString('ru-RU')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
