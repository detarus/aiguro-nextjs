'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  IconTrash,
  IconSettings,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandInstagram,
  IconBrandFacebook
} from '@tabler/icons-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { usePageHeaderContext } from '@/contexts/PageHeaderContext';

// Интерфейсы для API данных
interface Funnel {
  id: string;
  name?: string;
  display_name?: string;
  is_active?: boolean;
}

interface MessengerConnection {
  id: string;
  name: string | null;
  messenger_type: string;
  is_active: boolean;
  funnel_id?: string; // Может отсутствовать
  connection_data?: any; // Может отсутствовать
  funnel_name?: string; // Название воронки
  funnel_info?: Funnel; // Полная информация о воронке
}

// Integration services configuration
const integrationServices = [
  {
    id: 'telegram',
    name: 'Telegram',
    status: 'active',
    icon: IconBrandTelegram,
    clickable: true,
    description: 'Интеграция с мессенджером Telegram'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    status: 'inactive',
    icon: IconBrandWhatsapp,
    clickable: false,
    description: 'Интеграция с мессенджером WhatsApp'
  },
  {
    id: 'amocrm',
    name: 'AmoCRM',
    status: 'inactive',
    icon: IconSettings,
    clickable: false,
    description: 'Интеграция с CRM системой AmoCRM'
  },
  {
    id: 'bitrix',
    name: 'Bitrix24',
    status: 'inactive',
    icon: IconSettings,
    clickable: false,
    description: 'Интеграция с CRM системой Bitrix24'
  },
  {
    id: 'avito',
    name: 'AVITO',
    status: 'inactive',
    icon: IconSettings,
    clickable: false,
    description: 'Интеграция с площадкой AVITO'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    status: 'inactive',
    icon: IconBrandInstagram,
    clickable: false,
    description: 'Интеграция с Instagram'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    status: 'inactive',
    icon: IconBrandFacebook,
    clickable: false,
    description: 'Интеграция с Facebook Messenger'
  },
  {
    id: 'slack',
    name: 'Slack',
    status: 'inactive',
    icon: IconSettings,
    clickable: false,
    description: 'Интеграция со Slack'
  },
  {
    id: 'viber',
    name: 'Viber',
    status: 'inactive',
    icon: IconSettings,
    clickable: false,
    description: 'Интеграция с Viber'
  },
  {
    id: 'wildberries',
    name: 'WildBerries',
    status: 'inactive',
    icon: IconSettings,
    clickable: false,
    description: 'Интеграция с маркетплейсом WildBerries'
  }
];

// Integration details templates
const integrationDetails = {
  telegram: {
    id: 'telegram-detail',
    name: 'Telegram',
    fields: [
      { id: 1, label: 'Аккаунт 1', value: '+79999999999', editable: true },
      { id: 2, label: 'Аккаунт 2', value: '@username', editable: true },
      { id: 3, label: 'Аккаунт 3', value: '@tareev_site', editable: true },
      { id: 4, label: 'Аккаунт 4', value: '+79999999999', editable: true },
      { id: 5, label: 'Аккаунт 5', value: 'user1@example.com', editable: true }
    ]
  },
  whatsapp: {
    id: 'whatsapp-detail',
    name: 'WhatsApp',
    fields: [
      { id: 6, label: 'Аккаунт 1', value: '+79995599999', editable: true },
      { id: 7, label: 'Аккаунт 2', value: '+79999999943', editable: true },
      { id: 8, label: 'Аккаунт 3', value: '@whatsapp_account', editable: true },
      { id: 9, label: 'Аккаунт 4', value: '+79999999999', editable: true }
    ]
  },
  amocrm: {
    id: 'amocrm-detail',
    name: 'AmoCRM',
    fields: [
      { id: 10, label: 'API ключ', value: 'your-api-key-here', editable: true },
      { id: 11, label: 'Поддомен', value: 'yourcompany', editable: true },
      {
        id: 12,
        label: 'Пользователь',
        value: 'admin@company.com',
        editable: true
      },
      {
        id: 13,
        label: 'Секретный ключ',
        value: 'secret-key-here',
        editable: true
      }
    ]
  },
  bitrix: {
    id: 'bitrix-detail',
    name: 'Bitrix24',
    fields: []
  },
  avito: {
    id: 'avito-detail',
    name: 'AVITO',
    fields: []
  },
  instagram: {
    id: 'instagram-detail',
    name: 'Instagram',
    fields: []
  },
  facebook: {
    id: 'facebook-detail',
    name: 'Facebook',
    fields: []
  },
  slack: {
    id: 'slack-detail',
    name: 'Slack',
    fields: []
  },
  viber: {
    id: 'viber-detail',
    name: 'Viber',
    fields: []
  },
  wildberries: {
    id: 'wildberries-detail',
    name: 'WildBerries',
    fields: []
  }
};

function IntegrationsPage() {
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const { updateConfig } = usePageHeaderContext();

  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [messengerConnections, setMessengerConnections] = useState<
    MessengerConnection[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [integrationStatuses, setIntegrationStatuses] = useState<
    Record<string, boolean>
  >(() => {
    const initialStatuses: Record<string, boolean> = {};
    integrationServices.forEach((service) => {
      initialStatuses[service.id] = service.status === 'active';
    });
    return initialStatuses;
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [newTokens, setNewTokens] = useState<Record<string, string>>({});
  const [creatingConnection, setCreatingConnection] = useState<
    Record<string, boolean>
  >({});

  // Новые состояния
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 0,
    status: ''
  });

  // Константы для localStorage
  const CACHE_DURATION = 10 * 60 * 1000; // 10 минут в миллисекундах
  const getIntegrationStatusCacheKey = () =>
    `integration_statuses_${backendOrgId}`;
  const getFunnelsCacheKey = () => `integrations_funnels_${backendOrgId}`;
  const getConnectionsCacheKey = () =>
    `integrations_connections_${backendOrgId}`;
  const getLastUpdatedKey = () => `integrations_last_updated_${backendOrgId}`;

  // Проверка актуальности кэша
  const isCacheValid = () => {
    const lastUpdatedStr = localStorage.getItem(getLastUpdatedKey());
    if (!lastUpdatedStr) return false;

    const lastUpdatedTime = new Date(lastUpdatedStr);
    const now = new Date();
    return now.getTime() - lastUpdatedTime.getTime() < CACHE_DURATION;
  };

  // Загрузка статусов интеграций из localStorage
  const loadIntegrationStatusesFromCache = () => {
    try {
      const cachedStatuses = localStorage.getItem(
        getIntegrationStatusCacheKey()
      );
      if (cachedStatuses) {
        const parsedStatuses = JSON.parse(cachedStatuses);
        setIntegrationStatuses(parsedStatuses);
        console.log('Loaded integration statuses from cache:', parsedStatuses);
        return true;
      }
    } catch (error) {
      console.error('Error loading integration statuses from cache:', error);
    }
    return false;
  };

  // Сохранение статусов интеграций в localStorage
  const saveIntegrationStatusesToCache = (
    statuses: Record<string, boolean>
  ) => {
    try {
      localStorage.setItem(
        getIntegrationStatusCacheKey(),
        JSON.stringify(statuses)
      );
      console.log('Saved integration statuses to cache:', statuses);
    } catch (error) {
      console.error('Error saving integration statuses to cache:', error);
    }
  };

  // Загрузка данных из кэша
  const loadFromCache = () => {
    try {
      const cachedFunnels = localStorage.getItem(getFunnelsCacheKey());
      const cachedConnections = localStorage.getItem(getConnectionsCacheKey());
      const lastUpdatedStr = localStorage.getItem(getLastUpdatedKey());

      if (
        cachedFunnels &&
        cachedConnections &&
        lastUpdatedStr &&
        isCacheValid()
      ) {
        const parsedFunnels: Funnel[] = JSON.parse(cachedFunnels);
        const parsedConnections: MessengerConnection[] =
          JSON.parse(cachedConnections);

        setFunnels(parsedFunnels);
        setMessengerConnections(parsedConnections);
        setMessengerConnections(parsedConnections);
        setLastUpdated(new Date(lastUpdatedStr));

        // Обновляем данные интеграций
        updateIntegrationData(parsedFunnels, parsedConnections);

        console.log('Loaded integrations data from cache');
        return true;
      }
    } catch (error) {
      console.error('Error loading integrations data from cache:', error);
    }
    return false;
  };

  // Сохранение в кэш
  const saveToCache = (
    funnelsData: Funnel[],
    connectionsData: MessengerConnection[]
  ) => {
    try {
      localStorage.setItem(getFunnelsCacheKey(), JSON.stringify(funnelsData));
      localStorage.setItem(
        getConnectionsCacheKey(),
        JSON.stringify(connectionsData)
      );

      const now = new Date();
      localStorage.setItem(getLastUpdatedKey(), now.toISOString());
      setLastUpdated(now);

      console.log('Saved integrations data to cache');
    } catch (error) {
      console.error('Error saving integrations data to cache:', error);
    }
  };

  // Функция загрузки воронок
  const fetchFunnels = async () => {
    if (!backendOrgId) return [];

    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) throw new Error('No token available');

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnels`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch funnels');
      return await response.json();
    } catch (error) {
      console.error('Error fetching funnels:', error);
      return [];
    }
  };

  // Функция загрузки интеграций для воронки
  const fetchMessengerConnections = async (funnelId: string) => {
    if (!backendOrgId) return [];

    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) throw new Error('No token available');

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${funnelId}/messenger_connections`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching messenger connections:', error);
      return [];
    }
  };

  // Функция загрузки всех данных
  const loadData = useCallback(
    async (forceRefresh = false) => {
      if (!backendOrgId) return;

      // Проверяем кэш только если не принудительное обновление
      if (!forceRefresh && isCacheValid() && loadFromCache()) {
        setLoading(false);
        return;
      }

      // Error state removed
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        // Шаг 1: Загружаем воронки
        setLoadingProgress({
          current: 0,
          total: 1,
          status: 'Загрузка воронок...'
        });

        const funnelsData = await fetchFunnels();
        setFunnels(funnelsData);

        if (funnelsData.length === 0) {
          setMessengerConnections([]);
          setMessengerConnections([]);
          updateIntegrationData([], []);
          setLoadingProgress({ current: 0, total: 0, status: '' });
          return;
        }

        // Шаг 2: Загружаем интеграции для каждой воронки
        setLoadingProgress({
          current: 0,
          total: funnelsData.length,
          status: 'Загрузка интеграций...'
        });

        const allConnections: MessengerConnection[] = [];
        for (let i = 0; i < funnelsData.length; i++) {
          const funnel = funnelsData[i];

          setLoadingProgress({
            current: i + 1,
            total: funnelsData.length,
            status: `Загрузка интеграций ${i + 1}/${funnelsData.length}`
          });

          const connections = await fetchMessengerConnections(funnel.id);
          // Добавляем информацию о воронке в каждое подключение
          const connectionsWithFunnelInfo = connections.map((conn: any) => ({
            ...conn,
            funnel_id: funnel.id,
            funnel_name:
              funnel.display_name || funnel.name || `Воронка ${funnel.id}`,
            funnel_info: funnel // Полная информация о воронке
          }));
          console.log(
            `Loaded connections for funnel ${funnel.id} (${funnel.name || funnel.display_name}):`,
            connectionsWithFunnelInfo
          );
          allConnections.push(...connectionsWithFunnelInfo);
        }

        console.log('All connections with funnel info:', allConnections);
        setMessengerConnections(allConnections);
        setMessengerConnections(allConnections);

        // Сохраняем в кэш
        saveToCache(funnelsData, allConnections);

        // Обновляем данные интеграций
        updateIntegrationData(funnelsData, allConnections);

        setLoadingProgress({ current: 0, total: 0, status: '' });
      } catch (error) {
        console.error('Error loading data:', error);
        console.error('Ошибка загрузки данных');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [backendOrgId]
  );

  // Функция обновления данных интеграций
  const updateIntegrationData = (
    funnelsData: Funnel[],
    connections: MessengerConnection[]
  ) => {
    const newIntegrationData = { ...integrationDetails };
    const newStatuses: Record<string, boolean> = {};

    // Для каждого типа интеграции обновляем данные
    integrationServices.forEach((service) => {
      const serviceConnections = connections.filter(
        (conn) => conn.messenger_type === service.id
      );

      // Определяем активность на основе наличия подключений
      const hasActiveConnections = serviceConnections.some(
        (conn) => conn.is_active
      );
      newStatuses[service.id] = hasActiveConnections && service.clickable;

      if (serviceConnections.length > 0) {
        const fields = serviceConnections.map((conn, index) => {
          const funnel = funnelsData.find((f) => f.id === conn.funnel_id);
          const funnelName =
            funnel?.display_name || funnel?.name || `Воронка ${index + 1}`;

          return {
            id: parseInt(conn.id) || index,
            label: funnelName,
            value: String(
              conn.connection_data?.account ||
                conn.connection_data?.username ||
                'Не указано'
            ),
            editable: true
          };
        });

        (newIntegrationData as any)[service.id] = {
          id: `${service.id}-detail`,
          name: service.name,
          fields
        };
      } else {
        // Если нет подключений, показываем воронки как потенциальные интеграции
        const fields = funnelsData.slice(0, 3).map((funnel, index) => ({
          id: index + 1,
          label: funnel.display_name || funnel.name || `Воронка ${index + 1}`,
          value: '',
          editable: true
        }));

        (newIntegrationData as any)[service.id] = {
          id: `${service.id}-detail`,
          name: service.name,
          fields
        };
      }
    });

    setIntegrationStatuses(newStatuses);
    // Сохраняем статусы в localStorage
    saveIntegrationStatusesToCache(newStatuses);
  };

  // Функция обновления данных
  const handleRefresh = () => {
    loadData(true);
  };

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    if (backendOrgId) {
      // Сначала загружаем статусы интеграций из кэша
      loadIntegrationStatusesFromCache();
      // Затем загружаем остальные данные
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendOrgId, loadData]);

  // Автоматическое обновление каждые 10 минут
  useEffect(() => {
    const interval = setInterval(() => {
      if (backendOrgId) {
        console.log('Автоматическое обновление интеграций...');
        loadData(true);
      }
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [backendOrgId, loadData, CACHE_DURATION]);

  useEffect(() => {
    updateConfig({ onSearch: setSearchQuery });
    return () => updateConfig({});
  }, [updateConfig]);

  const filteredIntegrationServices = React.useMemo(() => {
    if (!searchQuery) {
      return integrationServices;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return integrationServices.filter((service) =>
      service.name.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery]);

  const handleIntegrationClick = (integrationId: string) => {
    const integration = integrationServices.find((i) => i.id === integrationId);
    if (integration && integration.clickable) {
      setSelectedIntegration(integrationId);
      setIsDialogOpen(true);
      // Устанавливаем первую воронку как активную вкладку
      if (funnels.length > 0) {
        setActiveTab(funnels[0].id);
      }
    }
  };

  const handleStatusToggle = (integrationId: string, newStatus: boolean) => {
    const newStatuses = {
      ...integrationStatuses,
      [integrationId]: newStatus
    };
    setIntegrationStatuses(newStatuses);
    // Сохраняем в localStorage
    saveIntegrationStatusesToCache(newStatuses);
  };

  // Обработчик для предотвращения открытия диалога при клике на переключатель
  const handleSwitchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Функция для удаления подключения
  const handleDeleteConnection = async (connectionId: string) => {
    if (!backendOrgId) return;

    try {
      // Находим подключение для определения funnel_id
      const connection = messengerConnections.find(
        (conn) => conn.id === connectionId
      );
      if (!connection?.funnel_id) {
        console.error('Connection or funnel_id not found');
        return;
      }

      const token = getClerkTokenFromClientCookie();
      if (!token) throw new Error('No token available');

      // TODO: Реализовать DELETE endpoint
      console.log(
        'Delete connection:',
        connectionId,
        'from funnel:',
        connection.funnel_id
      );

      // Временно удаляем из локального состояния
      setMessengerConnections((prev) =>
        prev.filter((conn) => conn.id !== connectionId)
      );

      setMessengerConnections((prev) =>
        prev.filter((conn) => conn.id !== connectionId)
      );
    } catch (error) {
      console.error('Error deleting connection:', error);
    }
  };

  // Функция для создания нового подключения
  const handleCreateConnection = async (funnelId: string) => {
    if (!backendOrgId || !selectedIntegration) return;

    const token = newTokens[funnelId];
    if (!token?.trim()) {
      console.error('Token is required');
      return;
    }

    setCreatingConnection((prev) => ({ ...prev, [funnelId]: true }));

    try {
      const authToken = getClerkTokenFromClientCookie();
      if (!authToken) throw new Error('No auth token available');

      const payload = {
        messenger_type: selectedIntegration,
        token: token.trim()
      };

      console.log('Creating connection:', payload, 'for funnel:', funnelId);

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${funnelId}/messenger_connection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP ${response.status}`);
      }

      const newConnection = await response.json();
      console.log('Successfully created connection:', newConnection);

      // Добавляем информацию о воронке к новому подключению
      const funnel = funnels.find((f) => f.id === funnelId);
      const enrichedConnection = {
        ...newConnection,
        funnel_id: funnelId,
        funnel_name:
          funnel?.display_name || funnel?.name || `Воронка ${funnelId}`,
        funnel_info: funnel
      };

      // Обновляем состояние подключений
      setMessengerConnections((prev) => [...prev, enrichedConnection]);
      setMessengerConnections((prev) => [...prev, enrichedConnection]);

      // Очищаем поле ввода токена
      setNewTokens((prev) => ({ ...prev, [funnelId]: '' }));

      console.log('Connection added to UI successfully');
    } catch (error) {
      console.error('Error creating connection:', error);
      // TODO: Показать ошибку пользователю
    } finally {
      setCreatingConnection((prev) => ({ ...prev, [funnelId]: false }));
    }
  };

  // Функция для обработки изменений токена нового подключения
  const handleNewTokenChange = (funnelId: string, value: string) => {
    setNewTokens((prev) => ({ ...prev, [funnelId]: value }));
  };

  // Показываем индикатор загрузки
  if (loading) {
    return (
      <PageContainer>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Интеграции</h1>
              <p className='text-muted-foreground'>
                Управление подключениями мессенджеров и внешних сервисов
              </p>
            </div>
          </div>

          <div className='flex min-h-[400px] items-center justify-center'>
            <div className='max-w-md text-center'>
              <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
              <p className='text-muted-foreground mt-4'>
                {loadingProgress.status || 'Загрузка интеграций...'}
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
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex h-full flex-col'>
        <main className='flex-1 p-4 md:p-6'>
          <Tabs defaultValue='all'>
            <TabsList>
              <TabsTrigger value='all'>Все</TabsTrigger>
              <TabsTrigger value='active'>Активные</TabsTrigger>
              <TabsTrigger value='crm'>CRM</TabsTrigger>
              <TabsTrigger value='messengers'>Мессенджеры</TabsTrigger>
            </TabsList>

            <TabsContent value='all' className='mt-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {filteredIntegrationServices.map((service) => (
                  <Card
                    key={service.id}
                    className={cn(
                      'min-h-[280px] cursor-pointer transition-all hover:shadow-md',
                      service.clickable
                        ? 'hover:border-primary'
                        : 'cursor-not-allowed opacity-60',
                      integrationStatuses[service.id]
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : ''
                    )}
                    onClick={() =>
                      service.clickable && handleIntegrationClick(service.id)
                    }
                  >
                    <CardHeader className='flex flex-row items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <service.icon className='h-6 w-6' />
                        <CardTitle className='text-lg'>
                          {service.name}
                        </CardTitle>
                      </div>
                      <Switch
                        checked={integrationStatuses[service.id]}
                        onCheckedChange={(checked) =>
                          handleStatusToggle(service.id, checked)
                        }
                        onClick={handleSwitchClick}
                      />
                    </CardHeader>
                    <CardContent>
                      <p className='text-muted-foreground text-sm'>
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='active' className='mt-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {filteredIntegrationServices
                  .filter((service) => integrationStatuses[service.id])
                  .map((service) => (
                    <Card
                      key={service.id}
                      className={cn(
                        'min-h-[280px] cursor-pointer transition-all hover:shadow-md',
                        service.clickable
                          ? 'hover:border-primary'
                          : 'cursor-not-allowed opacity-60',
                        integrationStatuses[service.id]
                          ? 'border-green-500 bg-green-50 dark:bg-green-950'
                          : ''
                      )}
                      onClick={() =>
                        service.clickable && handleIntegrationClick(service.id)
                      }
                    >
                      <CardHeader className='flex flex-row items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <service.icon className='h-6 w-6' />
                          <CardTitle className='text-lg'>
                            {service.name}
                          </CardTitle>
                        </div>
                        <Switch
                          checked={integrationStatuses[service.id]}
                          onCheckedChange={(checked) =>
                            handleStatusToggle(service.id, checked)
                          }
                          onClick={handleSwitchClick}
                        />
                      </CardHeader>
                      <CardContent>
                        <p className='text-muted-foreground text-sm'>
                          {service.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value='crm' className='mt-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {filteredIntegrationServices
                  .filter((service) =>
                    ['amocrm', 'bitrix'].includes(service.id)
                  )
                  .map((service) => (
                    <Card
                      key={service.id}
                      className={cn(
                        'min-h-[280px] cursor-pointer transition-all hover:shadow-md',
                        service.clickable
                          ? 'hover:border-primary'
                          : 'cursor-not-allowed opacity-60',
                        integrationStatuses[service.id]
                          ? 'border-green-500 bg-green-50 dark:bg-green-950'
                          : ''
                      )}
                      onClick={() =>
                        service.clickable && handleIntegrationClick(service.id)
                      }
                    >
                      <CardHeader className='flex flex-row items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <service.icon className='h-6 w-6' />
                          <CardTitle className='text-lg'>
                            {service.name}
                          </CardTitle>
                        </div>
                        <Switch
                          checked={integrationStatuses[service.id]}
                          onCheckedChange={(checked) =>
                            handleStatusToggle(service.id, checked)
                          }
                          onClick={handleSwitchClick}
                        />
                      </CardHeader>
                      <CardContent>
                        <p className='text-muted-foreground text-sm'>
                          {service.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value='messengers' className='mt-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {filteredIntegrationServices
                  .filter((service) =>
                    [
                      'telegram',
                      'whatsapp',
                      'instagram',
                      'facebook',
                      'viber',
                      'slack'
                    ].includes(service.id)
                  )
                  .map((service) => (
                    <Card
                      key={service.id}
                      className={cn(
                        'min-h-[280px] cursor-pointer transition-all hover:shadow-md',
                        service.clickable
                          ? 'hover:border-primary'
                          : 'cursor-not-allowed opacity-60',
                        integrationStatuses[service.id]
                          ? 'border-green-500 bg-green-50 dark:bg-green-950'
                          : ''
                      )}
                      onClick={() =>
                        service.clickable && handleIntegrationClick(service.id)
                      }
                    >
                      <CardHeader className='flex flex-row items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <service.icon className='h-6 w-6' />
                          <CardTitle className='text-lg'>
                            {service.name}
                          </CardTitle>
                        </div>
                        <Switch
                          checked={integrationStatuses[service.id]}
                          onCheckedChange={(checked) =>
                            handleStatusToggle(service.id, checked)
                          }
                          onClick={handleSwitchClick}
                        />
                      </CardHeader>
                      <CardContent>
                        <p className='text-muted-foreground text-sm'>
                          {service.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Integration Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='flex max-h-[80vh] max-w-2xl flex-col overflow-hidden'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              {selectedIntegration && (
                <>
                  {React.createElement(
                    integrationServices.find(
                      (s) => s.id === selectedIntegration
                    )?.icon || IconSettings,
                    { size: 24 }
                  )}
                  Настройка интеграции:{' '}
                  {
                    integrationServices.find(
                      (s) => s.id === selectedIntegration
                    )?.name
                  }
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Настройте интеграцию для каждой воронки в вашей организации.
              Введите необходимые данные подключения или оставьте поле пустым.
            </DialogDescription>
          </DialogHeader>

          {selectedIntegration && funnels.length > 0 && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='flex w-full flex-1 flex-col overflow-hidden'
            >
              <div
                className='flex-shrink-0 overflow-x-auto'
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e0 #f7fafc'
                }}
              >
                <TabsList className='bg-muted text-muted-foreground flex h-10 w-max min-w-full items-center justify-start rounded-md p-1'>
                  {funnels.map((funnel) => (
                    <TabsTrigger
                      key={funnel.id}
                      value={funnel.id}
                      className='data-[state=active]:bg-background data-[state=active]:text-foreground flex-shrink-0 px-3 py-1.5 text-sm whitespace-nowrap data-[state=active]:shadow-sm'
                    >
                      {funnel.display_name || funnel.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className='flex-1 overflow-y-auto'>
                {funnels.map((funnel) => {
                  // Отладочная информация
                  console.log(
                    'Funnel:',
                    funnel.id,
                    funnel.name || funnel.display_name
                  );
                  console.log(
                    'All messengerConnections:',
                    messengerConnections
                  );
                  console.log('Selected integration:', selectedIntegration);

                  return (
                    <TabsContent
                      key={funnel.id}
                      value={funnel.id}
                      className='mt-4 space-y-4 focus:outline-none'
                    >
                      <div className='space-y-4'>
                        <h3 className='text-lg font-medium'>
                          Подключения для воронки &quot;
                          {funnel.display_name || funnel.name}&quot;
                        </h3>

                        {/* Добавление нового подключения */}
                        <div className='space-y-3 border-t pt-4'>
                          <div className='space-y-2'>
                            <Label
                              htmlFor={`new-connection-${funnel.id}`}
                              className='text-sm'
                            >
                              Введите уникальный токен бота:
                            </Label>
                            <div className='flex gap-2'>
                              <Input
                                id={`new-connection-${funnel.id}`}
                                value={newTokens[funnel.id] || ''}
                                placeholder={`Введите токен для подключения`}
                                onChange={(e) =>
                                  handleNewTokenChange(
                                    funnel.id,
                                    e.target.value
                                  )
                                }
                                className='flex-1'
                                disabled={creatingConnection[funnel.id]}
                              />
                              <Button
                                onClick={() =>
                                  handleCreateConnection(funnel.id)
                                }
                                disabled={
                                  !newTokens[funnel.id]?.trim() ||
                                  creatingConnection[funnel.id]
                                }
                                className='px-4'
                              >
                                {creatingConnection[funnel.id]
                                  ? 'Добавление...'
                                  : 'Добавить'}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Существующие подключения для этой воронки */}
                        {(() => {
                          // Находим подключения для этой воронки из основного массива messengerConnections
                          const funnelConnections = messengerConnections.filter(
                            (conn) => {
                              const matches =
                                conn.messenger_type === selectedIntegration &&
                                (conn.funnel_id === funnel.id ||
                                  conn.funnel_id === funnel.id.toString());

                              // Отладочная информация для каждого подключения
                              if (conn.messenger_type === selectedIntegration) {
                                console.log(`Checking connection ${conn.id}:`, {
                                  messenger_type: conn.messenger_type,
                                  funnel_id: conn.funnel_id,
                                  funnel_name: conn.funnel_name,
                                  target_funnel_id: funnel.id,
                                  matches
                                });
                              }

                              return matches;
                            }
                          );

                          if (funnelConnections.length === 0) {
                            return (
                              <div className='rounded-lg border bg-gray-50 py-6 text-center text-gray-500 dark:bg-gray-800/50'>
                                <p className='text-sm'>
                                  Нет подключений{' '}
                                  {
                                    integrationServices.find(
                                      (s) => s.id === selectedIntegration
                                    )?.name
                                  }{' '}
                                  для воронки &quot;
                                  {funnel.display_name || funnel.name}&quot;
                                </p>
                                <p className='mt-1 text-xs text-gray-400'>
                                  Используйте поле ниже для создания нового
                                  подключения
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div className='space-y-3'>
                              <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                Список активных подключений (
                                {funnelConnections.length}):
                              </h4>
                              {funnelConnections.map((connection) => {
                                const isConnectionActive =
                                  connection.is_active === true;
                                const connectionName =
                                  connection.name ||
                                  connection.connection_data?.account ||
                                  connection.connection_data?.username ||
                                  connection.connection_data?.token ||
                                  `Подключение для ${connection.funnel_name || 'воронки'}`;

                                return (
                                  <div
                                    key={connection.id}
                                    className='space-y-2 rounded-lg border bg-blue-50 p-3 dark:bg-blue-900/20'
                                  >
                                    <div className='flex items-center justify-between'>
                                      <div className='flex items-center gap-2'>
                                        <span className='text-sm font-medium'>
                                          {connectionName}
                                        </span>
                                        {isConnectionActive && (
                                          <Badge
                                            variant='default'
                                            className='bg-green-500 text-xs'
                                          >
                                            Активно
                                          </Badge>
                                        )}
                                        {!isConnectionActive && (
                                          <Badge
                                            variant='secondary'
                                            className='text-xs'
                                          >
                                            Неактивно
                                          </Badge>
                                        )}
                                      </div>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                          handleDeleteConnection(connection.id)
                                        }
                                        className='h-6 w-6 p-0 text-red-500 hover:text-red-700'
                                      >
                                        <IconTrash size={14} />
                                      </Button>
                                    </div>
                                    <div
                                      className={cn(
                                        'rounded px-2 py-1 text-xs',
                                        isConnectionActive
                                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                      )}
                                    >
                                      {isConnectionActive
                                        ? '✓ Подключение активно для этой воронки'
                                        : '○ Подключение настроено для этой воронки'}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </TabsContent>
                  );
                })}
              </div>

              <div className='mt-6 flex flex-shrink-0 justify-end gap-2 border-t pt-4'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsDialogOpen(false);
                  }}
                >
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    setIsDialogOpen(false);
                    setNewTokens({});
                    setCreatingConnection({});
                  }}
                >
                  Сохранить
                </Button>
              </div>
            </Tabs>
          )}

          {selectedIntegration && funnels.length === 0 && (
            <div className='py-8 text-center'>
              <p className='text-muted-foreground'>
                В организации нет воронок для настройки интеграций
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Панель управления - внизу страницы */}
      <div className='bg-muted/50 mt-4 flex items-center justify-between rounded-lg border p-3'>
        <div className='flex items-center gap-4'>
          <div className='text-sm'>
            <span className='font-medium'>Активных интеграций:</span>{' '}
            {Object.values(integrationStatuses).filter(Boolean).length}
          </div>
          <div className='text-sm'>
            <span className='font-medium'>Всего подключений:</span>{' '}
            {messengerConnections.length}
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
    </PageContainer>
  );
}

export default IntegrationsPage;
