'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/hooks/useFunnels';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/components/ui/sidebar';
import {
  IconSearch,
  IconLayoutKanban,
  IconList,
  IconFileDownload,
  IconFileReport
} from '@tabler/icons-react';
import { ClientTable, Client } from './components/client-table';
import { KanbanBoard } from './components/kanban-board';
import { ClientActions } from './components/client-actions';
import { toast } from 'sonner';

// Interface for Dialog data
export interface Dialog {
  id: string;
  uuid: string;
  thread_id: string;
  client_id?: number;
  funnel_id?: string | number;
  created_at: string;
  updated_at: string;
  status: string;
  messages_count?: number;
  last_message?: string;
  close_ratio: number;
  manager: string | null;
  ai: boolean;
  unsubscribed: boolean;
  client?: {
    id: number;
    name: string;
    phone: string;
    email: string;
    manager: string | null;
    status: string;
    close_ratio: number;
    messages_count: number;
  };
  // UI specific fields
  name?: string;
  email?: string;
  phone?: string;
  assignedTo?: string;
  stage?: string;
  lastActivity?: string;
  description?: string;
  tags?: string[];
  price?: number;
  channel?: string;
}

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'new'>(
    'all'
  );
  const [deals, setDeals] = useState<Dialog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { state } = useSidebar();
  const { organization } = useOrganization();
  const { currentFunnel } = useFunnels(
    organization?.publicMetadata?.id_backend as string
  );

  // Получаем backend ID организации
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  // Константы для localStorage
  const CACHE_DURATION = 10 * 60 * 1000; // 10 минут в миллисекундах
  const getDealsCacheKey = () =>
    `deals_data_${backendOrgId}_${currentFunnel?.id}`;
  const getLastUpdatedKey = () =>
    `deals_last_updated_${backendOrgId}_${currentFunnel?.id}`;

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
      const cachedDeals = localStorage.getItem(getDealsCacheKey());
      const lastUpdatedStr = localStorage.getItem(getLastUpdatedKey());

      if (cachedDeals && lastUpdatedStr) {
        const parsedDeals: Dialog[] = JSON.parse(cachedDeals);
        setDeals(parsedDeals);
        setLastUpdated(new Date(lastUpdatedStr));

        console.log('Данные сделок загружены из кэша');
        return true;
      }
    } catch (error) {
      console.error('Ошибка загрузки сделок из кэша:', error);
    }
    return false;
  };

  // Сохранение в кэш
  const saveToCache = (dealsData: Dialog[]) => {
    try {
      // Сохраняем сделки
      localStorage.setItem(getDealsCacheKey(), JSON.stringify(dealsData));

      // Обновляем время последнего обновления
      const now = new Date();
      localStorage.setItem(getLastUpdatedKey(), now.toISOString());
      setLastUpdated(now);
    } catch (error) {
      console.error('Ошибка сохранения сделок в кэш:', error);
    }
  };

  // Функция для загрузки диалогов (сделок) с сервера
  const fetchDealsFromServer = async (): Promise<Dialog[]> => {
    if (!backendOrgId || !currentFunnel?.id) {
      throw new Error('Missing organization or funnel');
    }

    const token = getClerkTokenFromClientCookie();
    if (!token) {
      throw new Error('No authentication token available');
    }

    console.log(
      `Fetching deals for organization ${backendOrgId}, funnel ${currentFunnel.id}`
    );

    // Используем endpoint dialogs для получения сделок
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
    console.log('Fetched deals data:', data);

    // Отладочная информация о стадиях воронки
    if (currentFunnel?.stages) {
      console.log(
        'Funnel stages:',
        currentFunnel.stages.map((stage) => ({
          name: stage.name,
          assistant_code_name: stage.assistant_code_name
        }))
      );
    }

    // Преобразуем данные из API в формат, ожидаемый компонентом на основе предоставленной структуры
    const transformedDeals: Dialog[] = [];

    for (const deal of data) {
      // Извлекаем данные клиента из вложенного объекта client, если они есть
      const clientData = deal.client || {};

      // Определяем этап на основе assistant_code_name из воронки
      let stage = 'Новый';

      // Если есть поле stage в диалоге, используем его
      if (deal.stage) {
        stage = deal.stage;
        console.log(
          `Dialog ${deal.id} - Используем существующий stage: ${stage}`
        );
      }
      // Иначе определяем на основе close_ratio и стадий воронки
      else if (currentFunnel?.stages && currentFunnel.stages.length > 0) {
        const closeRatio = Number(deal.close_ratio || 0);
        const stagesCount = currentFunnel.stages.length;

        // Определяем индекс этапа на основе close_ratio
        const stageIndex = Math.min(
          Math.floor((closeRatio / 100) * stagesCount),
          stagesCount - 1
        );

        console.log(
          `Dialog ${deal.id} - Вычисляем stage по close_ratio: ${closeRatio}%, индекс: ${stageIndex}`
        );

        // Используем assistant_code_name вместо name, если он доступен
        if (
          currentFunnel.stages[stageIndex]?.assistant_code_name &&
          currentFunnel.stages[stageIndex].assistant_code_name.trim() !== ''
        ) {
          stage = currentFunnel.stages[stageIndex]
            .assistant_code_name as string;
          console.log(
            `Dialog ${deal.id} - Установлен assistant_code_name: ${stage}`
          );
        } else {
          // Если assistant_code_name не задан, используем name в нижнем регистре с заменой пробелов на подчеркивания
          const stageName = currentFunnel.stages[stageIndex]?.name || 'Новый';
          stage = stageName.toLowerCase().replace(/\s+/g, '_');
          console.log(
            `Dialog ${deal.id} - Сгенерирован assistant_code_name из name: ${stageName} -> ${stage}`
          );
        }
      }
      // Если нет данных о стадиях, используем стандартную логику
      else {
        const closeRatio = Number(deal.close_ratio || 0);
        console.log(
          `Dialog ${deal.id} - Используем стандартную логику по close_ratio: ${closeRatio}%`
        );

        if (closeRatio >= 0 && closeRatio < 25) {
          stage = 'Новый';
        } else if (closeRatio >= 25 && closeRatio < 50) {
          stage = 'Квалификация';
        } else if (closeRatio >= 50 && closeRatio < 75) {
          stage = 'Переговоры';
        } else if (closeRatio >= 75) {
          stage = 'Закрыто';
        }
        console.log(
          `Dialog ${deal.id} - Установлен стандартный stage: ${stage}`
        );
      }

      // Создаем объект Dialog с правильными типами данных
      const transformedDeal: Dialog = {
        id: deal.id || `dialog_${Math.random().toString(36).substring(7)}`,
        uuid:
          deal.uuid ||
          deal.id ||
          `uuid_${Math.random().toString(36).substring(7)}`,
        thread_id: deal.thread_id || 'Неизвестно',
        client_id: clientData.id,
        funnel_id: deal.funnel_id || currentFunnel.id,
        created_at: deal.created_at || new Date().toISOString(),
        updated_at: deal.updated_at || new Date().toISOString(),
        status: clientData.status || 'active',
        messages_count: clientData.messages_count || 0,
        last_message: deal.last_message || '',
        // Принудительно приводим к числу
        close_ratio: Number(deal.close_ratio || 0),
        // Явно указываем тип для manager
        manager: deal.manager || null,
        // Преобразуем любые значения в строго boolean
        ai: Boolean(deal.ai),
        unsubscribed: Boolean(deal.unsubscribed),
        // Включаем данные клиента
        client: clientData,

        // Дополнительные поля для отображения в UI
        name: clientData.name || `Сделка #${transformedDeals.length + 1}`,
        email: clientData.email || 'Не указано',
        phone: clientData.phone || 'Не указано',
        assignedTo: clientData.manager || deal.manager || 'Не назначено',
        stage: stage,
        lastActivity: deal.updated_at
          ? new Date(deal.updated_at).toLocaleString('ru-RU')
          : 'Не указано',
        description:
          deal.description ||
          'Задача клиента приобрести ряд компонентов связанных с бытовой химией и другими компонентами. Задача клиента приобрести ряд компонентов связанных с бытовой химией и другими компонентами. Задача клиента приобрести ряд компонентов связанных с бытовой химией и другими компонентами. Задача клиента приобрести ряд компонентов связанных с бытовой химией и другими компонентами',
        tags: deal.tags || ['Новый клиент', 'Горячий', 'Горячий'],
        price: deal.price || Math.floor(Math.random() * 500000),
        channel: deal.channel || 'Telegram'
      };

      // Отладочный лог для значения stage
      console.log(
        `Dialog ${transformedDeal.id} - Stage: ${stage}, Original stage: ${deal.stage || 'не указана'}, Close ratio: ${deal.close_ratio || 0}`
      );

      transformedDeals.push(transformedDeal);
    }

    return transformedDeals;
  };

  // Функция для полной загрузки данных
  const fetchAllData = useCallback(
    async (forceRefresh = false) => {
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
        const dealsData = await fetchDealsFromServer();

        // Сохраняем в кэш
        saveToCache(dealsData);
        setDeals(dealsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching deals:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setDeals([]); // Очищаем сделки при ошибке
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [backendOrgId, currentFunnel?.id]
  );

  // Функция обновления данных
  const handleRefresh = () => {
    fetchAllData(true);
  };

  // Предоставляем функцию обновления данных для дочерних компонентов
  const refreshData = useCallback(() => {
    console.log('Запрос на обновление данных от дочернего компонента');
    handleRefresh();
  }, [handleRefresh]);

  // Функция для обновления клиента в массиве сделок
  const handleClientUpdate = (updatedClient: Client) => {
    console.log('=== НАЧАЛО ОБНОВЛЕНИЯ КЛИЕНТА В СДЕЛКАХ ===');
    console.log('Обновленный клиент:', updatedClient);
    console.log('ID клиента для обновления:', updatedClient.id);
    console.log('Текущее количество сделок:', deals.length);

    // Проверка на существование client_id в сделках
    const dealsWithClientId = deals.filter(
      (deal) => deal.client_id === updatedClient.id
    );
    console.log(
      `Найдено ${dealsWithClientId.length} сделок с client_id=${updatedClient.id}`
    );

    // Флаг для отслеживания, были ли внесены изменения
    let updatesApplied = false;

    // Находим соответствующие сделки по ID клиента
    const updatedDeals = deals.map((deal) => {
      // Проверяем соответствие по client_id
      if (deal.client_id === updatedClient.id) {
        console.log(
          `Обновление сделки: ID=${deal.id}, client_id=${deal.client_id}`
        );
        updatesApplied = true;

        // Сохраняем старые значения для отладки
        const oldValues = {
          name: deal.name,
          email: deal.email,
          phone: deal.phone,
          assignedTo: deal.assignedTo,
          clientName: deal.client?.name,
          clientEmail: deal.client?.email,
          clientPhone: deal.client?.phone,
          clientManager: deal.client?.manager
        };

        // Обновляем данные клиента в сделке
        const updatedDeal: Dialog = {
          ...deal,
          name: updatedClient.name,
          email: updatedClient.email,
          phone: updatedClient.phone,
          assignedTo: updatedClient.assignedTo,
          client: {
            ...(deal.client || {}),
            id: updatedClient.id,
            name: updatedClient.name,
            email: updatedClient.email,
            phone: updatedClient.phone,
            manager: updatedClient.assignedTo,
            status: deal.client?.status || 'active',
            close_ratio: deal.client?.close_ratio || 0,
            messages_count: deal.client?.messages_count || 0
          }
        };

        console.log('Изменения в сделке:', {
          id: deal.id,
          old: oldValues,
          new: {
            name: updatedDeal.name,
            email: updatedDeal.email,
            phone: updatedDeal.phone,
            assignedTo: updatedDeal.assignedTo,
            clientName: updatedDeal.client?.name,
            clientEmail: updatedDeal.client?.email,
            clientPhone: updatedDeal.client?.phone,
            clientManager: updatedDeal.client?.manager
          }
        });

        return updatedDeal;
      }
      return deal;
    });

    if (updatesApplied) {
      console.log(`Обновлено ${dealsWithClientId.length} сделок`);

      // Обновляем массив сделок
      setDeals(updatedDeals);
      // Обновляем кэш с новыми данными
      saveToCache(updatedDeals);

      console.log('Данные обновлены в состоянии и кэше');

      // Показываем уведомление об успешном обновлении
      toast.success('Данные клиента обновлены во всех сделках', {
        duration: 3000
      });
    } else {
      console.log(
        'Не найдено сделок для обновления с client_id:',
        updatedClient.id
      );
      console.log(
        'Список ID клиентов в сделках:',
        deals.map((deal) => deal.client_id)
      );

      // Показываем информационное уведомление
      toast.info('Клиент обновлен, но не найдено связанных сделок', {
        duration: 3000
      });
    }

    console.log('=== ЗАВЕРШЕНИЕ ОБНОВЛЕНИЯ КЛИЕНТА В СДЕЛКАХ ===');
  };

  // Загружаем сделки при монтировании компонента и изменении организации/воронки
  useEffect(() => {
    if (organization && currentFunnel) {
      fetchAllData();
    }
  }, [backendOrgId, currentFunnel?.id, organization, fetchAllData]);

  // Автоматическое обновление каждые 10 минут
  useEffect(() => {
    const interval = setInterval(() => {
      if (backendOrgId && currentFunnel?.id) {
        console.log('Автоматическое обновление сделок...');
        fetchAllData(true);
      }
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [backendOrgId, currentFunnel?.id, CACHE_DURATION, fetchAllData]);

  // Динамически рассчитываем max-width в зависимости от состояния сайдбара
  const getMaxWidth = () => {
    if (state === 'collapsed') {
      return 'calc(100vw - 3rem - 2rem)'; // 3rem для свернутого сайдбара + 2rem отступы
    }
    return 'calc(100vw - 16rem - 2rem)'; // 16rem для развернутого сайдбара + 2rem отступы
  };

  // Конвертируем Dialog в формат Client для совместимости с компонентами
  const dealsAsClients: Client[] = deals.map((deal) => ({
    id: Number(deal.id) || Math.floor(Math.random() * 100000),
    name: deal.name || `Сделка ${deal.id}`,
    email: deal.email || 'Не указано',
    phone: deal.phone || 'Не указано',
    assignedTo: deal.assignedTo || 'Не назначено',
    stage: deal.stage || 'Новый',
    created: new Date(deal.created_at).toLocaleString('ru-RU'),
    lastActivity:
      deal.lastActivity || new Date(deal.updated_at).toLocaleString('ru-RU'),
    status: deal.status === 'active' ? 'Активный' : 'Неактивный',
    // Добавляем дополнительные поля для отображения информации о сделке
    dialogId: deal.id,
    dialogUuid: deal.uuid,
    messagesCount: deal.messages_count || 0,
    lastMessage: deal.last_message || '',
    closeRatio: deal.close_ratio,
    // Новые поля для карточек в канбан-доске
    description:
      deal.description ||
      'Задача клиента приобрести ряд компонентов связанных с бытовой химией и другими компонентами',
    tags: deal.tags || ['Новый клиент', 'Горячий', 'Горячий'],
    price: deal.price || Math.floor(Math.random() * 500000),
    channel: deal.channel || 'Telegram'
  }));

  // Фильтрация сделок на основе поиска и статуса
  const filteredClients = dealsAsClients.filter((client) => {
    // Поисковая фильтрация
    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = client.name.toLowerCase().includes(query);
      const emailMatch = client.email.toLowerCase().includes(query);
      const phoneMatch = client.phone.toLowerCase().includes(query);
      const messageMatch = client.lastMessage
        ? client.lastMessage.toLowerCase().includes(query)
        : false;

      matchesSearch = nameMatch || emailMatch || phoneMatch || messageMatch;
    }

    // Фильтрация по статусу
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = client.status === 'Активный';
    } else if (statusFilter === 'new') {
      matchesStatus = client.stage === 'Новый';
    }

    return matchesSearch && matchesStatus;
  });

  // Показываем индикатор загрузки
  if (loading) {
    return (
      <PageContainer>
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='text-center'>
            <div className='mx-auto w-64'>
              <div className='mb-4 flex items-center justify-between'>
                <div className='text-sm font-medium'>Загрузка диалогов...</div>
                <span className='text-xs font-normal'>
                  Пожалуйста, подождите
                </span>
              </div>
              <div className='bg-muted h-2 w-full overflow-hidden rounded-full'>
                <div className='animate-progress-indeterminate bg-primary h-full rounded-full'></div>
              </div>
            </div>
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
            <p className='mb-4 text-red-600'>Ошибка загрузки сделок: {error}</p>
            <Button onClick={() => fetchAllData(true)} variant='outline'>
              Попробовать снова
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Показываем сообщение, если нет организации или воронки
  if (!backendOrgId || !currentFunnel) {
    return (
      <PageContainer>
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='text-center'>
            <p className='text-muted-foreground mb-4'>
              {!backendOrgId
                ? 'Организация не выбрана или не настроена'
                : 'Воронка не выбрана'}
            </p>
            <p className='text-muted-foreground text-sm'>
              Выберите организацию и воронку для просмотра сделок
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex w-full max-w-full flex-col space-y-4'>
        {/* Заголовок и кнопки действий */}
        <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <div className='flex items-center gap-4'>
            <h1 className='text-xl font-semibold sm:text-2xl'>Сделки</h1>

            {/* Переключатель видов */}
            <div className='flex items-center rounded-lg border p-1'>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('kanban')}
                className='h-8 w-8 p-0'
              >
                <IconLayoutKanban className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('list')}
                className='h-8 w-8 p-0'
              >
                <IconList className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <ClientActions />
        </div>

        {/* Поиск */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]'>
          <div className='relative'>
            <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
            <Input
              placeholder='Поиск диалогов...'
              className='pl-8'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Быстрые фильтры для обоих режимов */}
          <div className='hidden items-center gap-2 md:flex'>
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setStatusFilter('all')}
            >
              Все ({deals.length})
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setStatusFilter('active')}
            >
              Активные (
              {dealsAsClients.filter((c) => c.status === 'Активный').length})
            </Button>
            <Button
              variant={statusFilter === 'new' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setStatusFilter('new')}
            >
              Закрытые (
              {dealsAsClients.filter((c) => c.stage === 'Новый').length})
            </Button>
          </div>
        </div>

        {/* Контейнер с горизонтальной прокруткой для контента */}
        <div
          className='overflow-x-auto'
          style={{
            maxWidth: getMaxWidth()
          }}
        >
          <div className={viewMode === 'kanban' ? 'w-full' : 'min-w-[800px]'}>
            {/* Контент в зависимости от выбранного режима */}
            {viewMode === 'list' ? (
              <>
                {/* Таблица сделок */}
                <ClientTable
                  clients={filteredClients}
                  backendOrgId={backendOrgId}
                  onClientUpdate={undefined}
                  onRefresh={refreshData}
                />

                {/* Пагинация */}
                <div className='mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row'>
                  <div className='text-muted-foreground w-full text-center text-sm sm:w-auto sm:text-left'>
                    Показано {filteredClients.length} из {deals.length} сделок
                  </div>
                  <div className='flex w-full justify-center gap-1 sm:w-auto sm:justify-end'>
                    <Button variant='outline' size='sm' disabled>
                      Предыдущая
                    </Button>
                    <Button variant='outline' size='sm'>
                      Следующая
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Kanban доска */
              <KanbanBoard
                clients={filteredClients}
                onClientUpdate={undefined}
                onRefresh={refreshData}
              />
            )}
          </div>
        </div>

        {/* Панель управления - перенесена в низ */}
        <div className='bg-muted/50 mt-4 flex items-center justify-between rounded-lg border p-3'>
          <div className='flex items-center gap-4'>
            <div className='text-sm'>
              <span className='font-medium'>Воронка:</span>{' '}
              {currentFunnel?.display_name ||
                currentFunnel?.name ||
                'Неизвестно'}
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
    </PageContainer>
  );
}
