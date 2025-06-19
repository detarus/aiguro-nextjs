'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/hooks/useFunnels';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/components/ui/sidebar';
import { IconSearch } from '@tabler/icons-react';
import { ClientTable, Client } from './components/client-table';
import { ClientActions } from './components/client-actions';
import { ClientSelectionProvider } from './context/client-selection-context';

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'new'>(
    'all'
  );
  const [clients, setClients] = useState<Client[]>([]);
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
  const getClientsCacheKey = () =>
    `clients_data_${backendOrgId}_${currentFunnel?.id}`;
  const getLastUpdatedKey = () =>
    `clients_last_updated_${backendOrgId}_${currentFunnel?.id}`;

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
      const cachedClients = localStorage.getItem(getClientsCacheKey());
      const lastUpdatedStr = localStorage.getItem(getLastUpdatedKey());

      if (cachedClients && lastUpdatedStr) {
        const parsedClients: Client[] = JSON.parse(cachedClients);
        setClients(parsedClients);
        setLastUpdated(new Date(lastUpdatedStr));

        console.log('Данные клиентов загружены из кэша');
        return true;
      }
    } catch (error) {
      console.error('Ошибка загрузки клиентов из кэша:', error);
    }
    return false;
  };

  // Сохранение в кэш
  const saveToCache = (clientsData: Client[]) => {
    try {
      // Сохраняем клиентов
      localStorage.setItem(getClientsCacheKey(), JSON.stringify(clientsData));

      // Обновляем время последнего обновления
      const now = new Date();
      localStorage.setItem(getLastUpdatedKey(), now.toISOString());
      setLastUpdated(now);
    } catch (error) {
      console.error('Ошибка сохранения клиентов в кэш:', error);
    }
  };

  // Функция для загрузки клиентов с сервера
  const fetchClientsFromServer = async (): Promise<Client[]> => {
    if (!backendOrgId || !currentFunnel?.id) {
      throw new Error('Missing organization or funnel');
    }

    const token = getClerkTokenFromClientCookie();
    if (!token) {
      throw new Error('No authentication token available');
    }

    console.log(`Fetching clients for organization ${backendOrgId}`);

    const response = await fetch(`/api/organization/${backendOrgId}/clients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Fetched clients data:', data);

    // Преобразуем данные из API в формат, ожидаемый компонентом
    const transformedClients: Client[] = data.map(
      (client: any, index: number) => ({
        id: client.id || index + 1,
        name: client.name || 'Неизвестно',
        email: client.email || 'Неизвестно',
        phone: client.phone || 'Неизвестно',
        assignedTo: client.manager || 'Неизвестно',
        stage: 'Новый', // API не возвращает стадию, устанавливаем по умолчанию "Новый"
        created: 'Неизвестно', // API не возвращает дату создания
        lastActivity: 'Неизвестно', // API не возвращает последнюю активность
        status:
          client.status === 'active'
            ? 'Активный'
            : client.status === 'inactive'
              ? 'Неактивный'
              : 'Неизвестно'
      })
    );

    return transformedClients;
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
        const clientsData = await fetchClientsFromServer();

        // Сохраняем в кэш
        saveToCache(clientsData);
        setClients(clientsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setClients([]); // Очищаем клиентов при ошибке
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

  // Загружаем клиентов при монтировании компонента и изменении организации/воронки
  useEffect(() => {
    if (organization && currentFunnel) {
      fetchAllData();
    }
  }, [backendOrgId, currentFunnel?.id, organization, fetchAllData]);

  // Автоматическое обновление каждые 10 минут
  useEffect(() => {
    const interval = setInterval(() => {
      if (backendOrgId && currentFunnel?.id) {
        console.log('Автоматическое обновление клиентов...');
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

  // Фильтрация клиентов на основе поиска и статуса
  const filteredClients = clients.filter((client) => {
    // Поисковая фильтрация
    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch =
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone.toLowerCase().includes(query);
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
                <div className='text-sm font-medium'>Загрузка клиентов...</div>
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
            <p className='mb-4 text-red-600'>
              Ошибка загрузки клиентов: {error}
            </p>
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
              Выберите организацию и воронку для просмотра клиентов
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ClientSelectionProvider>
        <div className='flex w-full max-w-full flex-col space-y-4'>
          {/* Заголовок и кнопки действий */}
          <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
            <div className='flex items-center gap-4'>
              <h1 className='text-xl font-semibold sm:text-2xl'>Клиенты</h1>
            </div>

            <ClientActions />
          </div>

          {/* Поиск */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]'>
            <div className='relative'>
              <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
              <Input
                placeholder='Поиск клиентов...'
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
                Все ({clients.length})
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setStatusFilter('active')}
              >
                Активные (
                {clients.filter((c) => c.status === 'Активный').length})
              </Button>
              <Button
                variant={statusFilter === 'new' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setStatusFilter('new')}
              >
                Закрытые ({clients.filter((c) => c.stage === 'Новый').length})
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
            <div className='min-w-[800px]'>
              {/* Таблица клиентов */}
              <ClientTable clients={filteredClients} />

              {/* Пагинация */}
              <div className='mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row'>
                <div className='text-muted-foreground w-full text-center text-sm sm:w-auto sm:text-left'>
                  Показано {filteredClients.length} из {clients.length} клиентов
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
                <div className='text-sm text-blue-600'>
                  Обновление данных...
                </div>
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
      </ClientSelectionProvider>
    </PageContainer>
  );
}
