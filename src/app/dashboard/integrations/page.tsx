'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  IconTrash,
  IconSettings,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandInstagram,
  IconBrandFacebook,
  IconRefresh
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

  const [integrationData, setIntegrationData] = useState(integrationDetails);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [messengerConnections, setMessengerConnections] = useState<
    MessengerConnection[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const loadData = useCallback(async () => {
    if (!backendOrgId) return;

    setLoading(true);
    setError(null);

    try {
      // Загружаем воронки
      const funnelsData = await fetchFunnels();
      setFunnels(funnelsData);

      // Загружаем интеграции для каждой воронки
      const allConnections: MessengerConnection[] = [];
      for (const funnel of funnelsData) {
        const connections = await fetchMessengerConnections(funnel.id);
        allConnections.push(...connections);
      }

      setMessengerConnections(allConnections);

      // Обновляем данные интеграций
      updateIntegrationData(funnelsData, allConnections);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [backendOrgId]);

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

    setIntegrationData(newIntegrationData);
    setIntegrationStatuses(newStatuses);
  };

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    if (backendOrgId) {
      loadData();
    }
  }, [backendOrgId, loadData]);

  const handleIntegrationClick = (integrationId: string) => {
    const integration = integrationServices.find((i) => i.id === integrationId);
    if (integration && integration.clickable) {
      setSelectedIntegration(integrationId);
      setIsDialogOpen(true);
    }
  };

  const handleStatusToggle = (integrationId: string, newStatus: boolean) => {
    setIntegrationStatuses((prev) => ({
      ...prev,
      [integrationId]: newStatus
    }));
  };

  // Обработчик для предотвращения открытия диалога при клике на переключатель
  const handleSwitchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Функция для удаления подключения
  const handleDeleteConnection = (connectionId: string) => {
    setMessengerConnections((prev) =>
      prev.filter((conn) => conn.id !== connectionId)
    );
  };

  // Функция для обработки изменений подключений воронок
  const handleFunnelConnectionChange = (funnelId: string, value: string) => {
    setMessengerConnections((prev) => {
      const existingConnectionIndex = prev.findIndex(
        (conn) =>
          conn.messenger_type === selectedIntegration &&
          (conn.funnel_id === funnelId ||
            conn.funnel_id === funnelId.toString())
      );

      if (existingConnectionIndex >= 0) {
        // Обновляем существующее подключение
        const updated = [...prev];
        updated[existingConnectionIndex] = {
          ...updated[existingConnectionIndex],
          name: value,
          connection_data: {
            ...updated[existingConnectionIndex].connection_data,
            account: value
          }
        };
        return updated;
      } else if (value.trim()) {
        // Создаем новое подключение, если введено значение
        const newConnection: MessengerConnection = {
          id: `temp-${Date.now()}-${funnelId}`,
          name: value,
          funnel_id: funnelId,
          messenger_type: selectedIntegration || '',
          connection_data: { account: value },
          is_active: false
        };
        return [...prev, newConnection];
      }

      return prev;
    });
  };

  const getFirstThreeAccounts = (integrationId: string) => {
    // Получаем подключения для данного типа мессенджера
    const serviceConnections = messengerConnections.filter(
      (conn) => conn.messenger_type === integrationId
    );

    // Преобразуем в формат для отображения, используя реальные названия воронок
    return serviceConnections.slice(0, 3).map((conn) => {
      // Пытаемся найти воронку по ID (учитываем разные типы)
      const funnel = conn.funnel_id
        ? funnels.find(
            (f) => f.id === conn.funnel_id || f.id.toString() === conn.funnel_id
          )
        : null;
      const funnelName =
        funnel?.display_name ||
        funnel?.name ||
        conn.name ||
        `Подключение ${conn.id}`;

      // Извлекаем значение подключения из различных возможных полей
      const connectionValue =
        conn.connection_data?.account ||
        conn.connection_data?.username ||
        conn.connection_data?.token ||
        conn.connection_data?.phone ||
        conn.name ||
        (conn.connection_data ? JSON.stringify(conn.connection_data) : null) ||
        'Подключение';

      return {
        id: conn.id,
        label: funnelName,
        value: connectionValue,
        editable: true
      };
    });
  };

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
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={loadData}
              disabled={loading}
            >
              <IconRefresh
                size={16}
                className={cn('mr-2', loading && 'animate-spin')}
              />
              Обновить
            </Button>
          </div>
        </div>

        {error && (
          <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
            <p className='text-sm text-red-800'>{error}</p>
          </div>
        )}

        {loading && (
          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
            <p className='text-sm text-blue-800'>Загрузка интеграций...</p>
          </div>
        )}

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {integrationServices.map((service) => {
            const IconComponent = service.icon;
            const isActive = integrationStatuses[service.id];
            const firstThreeAccounts = getFirstThreeAccounts(service.id);

            return (
              <Card
                key={service.id}
                className={cn(
                  'min-h-[280px] cursor-pointer transition-all hover:shadow-md',
                  service.clickable
                    ? 'hover:border-primary'
                    : 'cursor-not-allowed opacity-60',
                  isActive
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : ''
                )}
                onClick={() => handleIntegrationClick(service.id)}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <IconComponent size={24} className='text-primary' />
                      <CardTitle className='text-lg'>{service.name}</CardTitle>
                    </div>
                    <Badge
                      variant={isActive ? 'default' : 'secondary'}
                      className={isActive ? 'bg-green-500' : ''}
                    >
                      {isActive ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </div>

                  {/* Переключатель активности для кликабельных интеграций */}
                  {service.clickable && (
                    <div className='mt-3 flex items-center space-x-2'>
                      <Label
                        htmlFor={`switch-${service.id}`}
                        className='text-sm font-medium'
                      >
                        Активность:
                      </Label>
                      <Switch
                        id={`switch-${service.id}`}
                        checked={isActive}
                        onCheckedChange={(checked) =>
                          handleStatusToggle(service.id, checked)
                        }
                        onClick={handleSwitchClick}
                      />
                    </div>
                  )}
                </CardHeader>

                <CardContent className='space-y-3'>
                  <p className='text-muted-foreground text-sm'>
                    {service.description}
                  </p>

                  {/* Отображение первых трех аккаунтов для интеграций с подключениями */}
                  {service.clickable && firstThreeAccounts.length > 0 && (
                    <div className='space-y-2'>
                      <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Подключенные воронки:
                      </div>
                      <div className='space-y-1'>
                        {firstThreeAccounts.map((account) => (
                          <div
                            key={account.id}
                            className='flex items-center justify-between rounded bg-gray-50 p-2 text-xs dark:bg-gray-800'
                          >
                            <span className='font-medium text-gray-600 dark:text-gray-400'>
                              {account.label}:
                            </span>
                            <span className='max-w-[120px] truncate text-gray-800 dark:text-gray-200'>
                              {account.value || 'Не указан'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {service.clickable && (
                    <div className='flex justify-end pt-2'>
                      <Button variant='outline' size='sm'>
                        <IconSettings size={16} className='mr-2' />
                        Настроить
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Integration Configuration Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
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

            {selectedIntegration && (
              <div className='space-y-4'>
                {/* Показываем воронки с их подключениями */}
                {funnels.map((funnel) => {
                  // Находим подключение для этой воронки
                  const connection = messengerConnections.find(
                    (conn) =>
                      conn.messenger_type === selectedIntegration &&
                      (conn.funnel_id === funnel.id ||
                        conn.funnel_id === funnel.id.toString())
                  );

                  // Проверяем, активно ли подключение
                  const isConnectionActive = connection?.is_active === true;

                  const connectionValue =
                    connection?.connection_data?.account ||
                    connection?.connection_data?.username ||
                    connection?.connection_data?.token ||
                    connection?.name ||
                    '';

                  return (
                    <div key={funnel.id} className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <Label
                          htmlFor={`funnel-${funnel.id}`}
                          className='text-sm font-medium'
                        >
                          {funnel.display_name || funnel.name}
                          {isConnectionActive && (
                            <span className='ml-2 text-xs font-normal text-green-600'>
                              (Активное подключение)
                            </span>
                          )}
                        </Label>
                        {connection && (
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
                        )}
                      </div>
                      <Input
                        id={`funnel-${funnel.id}`}
                        value={connectionValue}
                        onChange={(e) =>
                          handleFunnelConnectionChange(
                            funnel.id,
                            e.target.value
                          )
                        }
                        placeholder={
                          isConnectionActive
                            ? 'Активное подключение'
                            : `Введите данные интеграции для ${funnel.display_name || funnel.name}`
                        }
                        className={cn(
                          'w-full',
                          isConnectionActive && 'border-green-200 bg-green-50'
                        )}
                        disabled={isConnectionActive}
                        readOnly={isConnectionActive}
                      />
                      {connection && (
                        <div
                          className={cn(
                            'text-xs',
                            isConnectionActive
                              ? 'text-green-600'
                              : 'text-blue-600'
                          )}
                        >
                          {isConnectionActive
                            ? '✓ Активная интеграция'
                            : '○ Неактивная интеграция'}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Если нет подключений для данного типа */}
                {messengerConnections.filter(
                  (conn) => conn.messenger_type === selectedIntegration
                ).length === 0 && (
                  <div className='text-muted-foreground py-4 text-center text-sm'>
                    Подключения для{' '}
                    {
                      integrationServices.find(
                        (s) => s.id === selectedIntegration
                      )?.name
                    }{' '}
                    не найдены
                  </div>
                )}

                <div className='flex justify-end gap-2 border-t pt-4'>
                  <Button
                    variant='outline'
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Сохранить
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

export default IntegrationsPage;
