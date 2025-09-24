'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/contexts/FunnelsContext';
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
import { cn } from '@/lib/utils';
import { usePageHeaderContext } from '@/contexts/PageHeaderContext';
import { AllFunnelsDealsPlaceholder } from '@/components/all-funnels-placeholder';

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
  const { currentFunnel, funnels } = useFunnels();
  const { updateConfig, clearConfig } = usePageHeaderContext();

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

    // Отладочная информация о воронке
    if (currentFunnel) {
      console.log('Current funnel:', currentFunnel);
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
      // Иначе используем стандартную логику
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

      // Если выбраны "Все воронки", не загружаем данные
      if (currentFunnel.id === '0') {
        console.log('All funnels selected, skipping data fetch');
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

  // Обновляем конфигурацию заголовка при изменении состояния
  useEffect(() => {
    updateConfig({
      title: 'Сделки',
      viewMode,
      onViewModeChange: setViewMode,
      showViewToggle: true,
      onSearch: (query) => setSearchQuery(query),
      onTimeFilterChange: (period) => console.log('Time filter:', period),
      timeFilterOptions: [
        { value: 'week', label: 'За неделю' },
        { value: 'month', label: 'За месяц' },
        { value: 'year', label: 'За год' }
      ],
      actions: {
        onExport: () => console.log('Export'),
        onFilters: () => console.log('Filters'),
        onView: () => console.log('View'),
        onData: () => console.log('Data')
      }
    });

    // Очистка конфигурации при размонтировании компонента
    return () => {
      clearConfig();
    };
  }, [viewMode, updateConfig, clearConfig]);

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

  // Показываем заглушку для "Все воронки"
  if (currentFunnel?.id === '0') {
    return (
      <PageContainer>
        <AllFunnelsDealsPlaceholder />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Отображение в зависимости от выбранного режима */}
        {viewMode === 'kanban' ? (
          <KanbanBoard clients={filteredClients} />
        ) : (
          <ClientTable
            clients={filteredClients}
            backendOrgId={backendOrgId}
            onClientUpdate={handleClientUpdate}
            onRefresh={handleRefresh}
          />
        )}
      </div>
    </PageContainer>
  );
}
