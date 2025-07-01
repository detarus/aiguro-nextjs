'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { useFunnels } from '@/hooks/useFunnels';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import {
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandInstagram,
  IconBrandFacebook,
  IconSettings,
  IconUsers,
  IconAlertTriangle
} from '@tabler/icons-react';

// Импорт Kanban компонентов
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Интерфейсы
interface Integration {
  id: string;
  name: string;
  type: 'telegram' | 'whatsapp' | 'instagram' | 'facebook' | 'other';
  status: 'connected' | 'disconnected' | 'error';
  funnel_id?: string;
  connection_name?: string;
  last_activity?: string;
}

interface AgentTeam {
  id: string;
  name: string;
  type: 'Мультиагент' | 'Одиночный';
  cv: number;
  users: number;
  warnings: number;
  errors: number;
  success: number;
  enabled: boolean;
  meetingType?: string;
}

interface Stage {
  name: string;
  assistant_code_name: string;
  prompt?: string;
  followups?: { delay_minutes: number }[];
  deals_count?: number;
  deals_amount?: number;
}

// Конфигурация интеграций
const integrationIcons = {
  telegram: IconBrandTelegram,
  whatsapp: IconBrandWhatsapp,
  instagram: IconBrandInstagram,
  facebook: IconBrandFacebook,
  default: IconSettings
};

// Компонент перемещаемой карточки подключения
function ConnectionCard({
  connection,
  isOverlay
}: {
  connection: Integration;
  isOverlay?: boolean;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: connection.id,
    data: {
      type: 'Connection',
      connection
    }
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform)
  };

  const IconComponent =
    integrationIcons[connection.type as keyof typeof integrationIcons] ||
    integrationIcons.default;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`mb-2 cursor-grab ${isDragging || isOverlay ? 'opacity-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardContent className='p-3'>
        <div className='flex items-center gap-2'>
          <IconComponent className='h-4 w-4' />
          <div>
            <div className='text-sm font-medium'>
              {connection.connection_name || connection.name}
            </div>
            <div className='text-xs text-gray-500'>{connection.type}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Компонент колонки Kanban
function KanbanColumn({
  title,
  children,
  className = '',
  headerContent,
  isDropZone = false
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
  isDropZone?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-gray-50 ${className}`}
      style={{ minHeight: '500px', width: '300px' }}
    >
      <div className='rounded-t-lg border-b bg-white p-4'>
        <h3 className='text-sm font-semibold tracking-wide text-gray-700 uppercase'>
          {title}
        </h3>
        {headerContent}
      </div>
      <div className='p-3'>
        <ScrollArea className='h-[400px]'>{children}</ScrollArea>
      </div>
    </div>
  );
}

function ManagementPageContent() {
  const searchParams = useSearchParams();
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [funnelStages, setFunnelStages] = useState<Stage[]>([]);
  const [assistantsLoading, setAssistantsLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<{
    index: number;
    stage: Stage;
  } | null>(null);

  // Состояния для интеграций
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [integrationsLoading, setIntegrationsLoading] = useState(true);

  // Состояния для агентов
  const [agentTeams, setAgentTeams] = useState<AgentTeam[]>([]);

  // Состояние для модального окна настройки этапа
  const [stageSettingsModal, setStageSettingsModal] = useState<{
    isOpen: boolean;
    stage: Stage | null;
    stageIndex: number;
  }>({
    isOpen: false,
    stage: null,
    stageIndex: -1
  });

  // Состояние для Drag and Drop
  const [activeConnection, setActiveConnection] = useState<Integration | null>(
    null
  );

  const {
    currentFunnel,
    funnels,
    loading: funnelsLoading
  } = useFunnels(backendOrgId);

  // Загрузка интеграций
  const fetchIntegrations = useCallback(async () => {
    if (!backendOrgId) return;

    try {
      setIntegrationsLoading(true);
      const token = getClerkTokenFromClientCookie();

      if (!token) return;

      // Получаем все интеграции для всех воронок
      const allIntegrations: Integration[] = [];

      if (funnels && funnels.length > 0) {
        for (const funnel of funnels) {
          try {
            const response = await fetch(
              `/api/organization/${backendOrgId}/funnel/${funnel.id}/messenger_connections`,
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
              const connections = Array.isArray(data) ? data : [];

              connections.forEach((conn: any) => {
                allIntegrations.push({
                  id: `${funnel.id}-${conn.id || conn.name || Math.random()}`,
                  name:
                    conn.connection_name ||
                    conn.name ||
                    'Неизвестное подключение',
                  type: conn.messenger_type?.toLowerCase() || 'other',
                  status: conn.is_active ? 'connected' : 'disconnected',
                  funnel_id: funnel.id,
                  connection_name: conn.connection_name,
                  last_activity: conn.last_activity
                });
              });
            }
          } catch (error) {
            console.error(
              `Error fetching integrations for funnel ${funnel.id}:`,
              error
            );
          }
        }
      }

      setIntegrations(allIntegrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setIntegrationsLoading(false);
    }
  }, [backendOrgId, funnels]);

  // Загрузка команд агентов
  const loadAgentTeams = useCallback(() => {
    const mockAgentTeams: AgentTeam[] = [
      {
        id: '1',
        name: 'Алексей',
        type: 'Мультиагент',
        cv: 56,
        users: 120,
        warnings: 5,
        errors: 2,
        success: 95,
        enabled: true,
        meetingType: 'Настройки'
      },
      {
        id: '2',
        name: 'Мария',
        type: 'Одиночный',
        cv: 42,
        users: 85,
        warnings: 3,
        errors: 1,
        success: 87,
        enabled: false,
        meetingType: 'Консультация'
      }
    ];
    setAgentTeams(mockAgentTeams);
  }, []);

  // Загрузка этапов воронки
  const fetchFunnelStages = useCallback(async () => {
    if (!currentFunnel || !backendOrgId || funnelsLoading) {
      return;
    }

    try {
      setAssistantsLoading(true);
      const token = getClerkTokenFromClientCookie();

      if (!token) {
        console.error('No token available');
        return;
      }

      const url = `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFunnelStages(data.stages || []);
      } else {
        console.error('Failed to fetch funnel data, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    } finally {
      setAssistantsLoading(false);
    }
  }, [currentFunnel, backendOrgId, funnelsLoading]);

  // Обработчик выбора этапа
  const handleStageSelect = (stageIndex: number | null, stage?: any) => {
    if (stageIndex !== null && stage) {
      setStageSettingsModal({
        isOpen: true,
        stage: stage,
        stageIndex: stageIndex
      });
    }
  };

  // Обработчик закрытия модального окна настройки этапа
  const handleCloseStageSettings = () => {
    setStageSettingsModal({
      isOpen: false,
      stage: null,
      stageIndex: -1
    });
  };

  // Загрузка данных при изменении воронки
  useEffect(() => {
    fetchFunnelStages();
  }, [fetchFunnelStages]);

  // Загрузка интеграций и агентов
  useEffect(() => {
    if (backendOrgId) {
      fetchIntegrations();
      loadAgentTeams();
    }
  }, [backendOrgId, fetchIntegrations, loadAgentTeams]);

  // Настройка сенсоров для Drag and Drop
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  // Обработчики Drag and Drop
  function onDragStart(event: DragStartEvent) {
    const { active } = event;
    const connection = integrations.find((int) => int.id === active.id);
    if (connection) {
      setActiveConnection(connection);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveConnection(null);
    // Здесь можно добавить логику для обработки перемещения
    console.log('Drag ended:', event);
  }

  function onDragOver(event: DragOverEvent) {
    // Здесь можно добавить логику для обработки наведения
    console.log('Drag over:', event);
  }

  // Мемоизированные данные колонок
  const connectionIds = useMemo(
    () => integrations.map((int) => int.id),
    [integrations]
  );

  if (!organization) {
    return <div>Загрузка...</div>;
  }

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <ScrollArea
            className='w-full'
            style={{ maxWidth: 'calc(100vw - 302px)' }}
          >
            <div className='flex gap-6 pb-4'>
              {/* Колонка 1: Доступные источники */}
              <KanbanColumn title='Доступные источники'>
                <SortableContext items={connectionIds}>
                  {integrationsLoading ? (
                    <div className='text-sm text-gray-500'>
                      Загрузка подключений...
                    </div>
                  ) : integrations.length === 0 ? (
                    <div className='text-sm text-gray-500'>Нет подключений</div>
                  ) : (
                    integrations.map((integration) => (
                      <ConnectionCard
                        key={integration.id}
                        connection={integration}
                      />
                    ))
                  )}
                </SortableContext>
              </KanbanColumn>

              {/* Колонка 2: Агенты воронки */}
              <KanbanColumn
                title='Агенты воронки'
                headerContent={
                  <div className='mt-2'>
                    <div className='text-xs text-gray-500'>
                      Настройка агентов
                    </div>
                  </div>
                }
              >
                {agentTeams.map((agent) => (
                  <Card key={agent.id} className='mb-2'>
                    <CardContent className='p-3'>
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <div className='text-sm font-medium'>
                            {agent.name}
                          </div>
                          <Switch checked={agent.enabled} />
                        </div>
                        <Badge
                          variant='outline'
                          className={
                            agent.type === 'Мультиагент'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }
                        >
                          {agent.type}
                        </Badge>
                        <div className='flex justify-between text-xs text-gray-600'>
                          <span>CV Агента</span>
                          <span className='font-medium'>{agent.cv}%</span>
                        </div>
                        <Progress value={agent.cv} className='h-2' />
                        <div className='grid grid-cols-2 gap-2 text-xs'>
                          <div className='flex items-center gap-1'>
                            <IconUsers className='h-3 w-3' />
                            <span>{agent.users}</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <IconAlertTriangle className='h-3 w-3 text-orange-500' />
                            <span>{agent.warnings}</span>
                          </div>
                        </div>
                        <div className='text-xs text-gray-500'>
                          {agent.meetingType}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </KanbanColumn>

              {/* Колонки этапов воронки */}
              {(() => {
                if (funnelsLoading) {
                  return (
                    <div className='text-sm text-gray-500'>
                      Загрузка воронок...
                    </div>
                  );
                }

                if (assistantsLoading) {
                  return (
                    <div className='text-sm text-gray-500'>
                      Загрузка этапов...
                    </div>
                  );
                }

                if (!currentFunnel) {
                  return (
                    <div className='rounded-lg border bg-yellow-50 p-4 text-sm text-gray-500'>
                      <div className='mb-2'>Воронка не выбрана</div>
                      <div className='text-xs'>
                        Доступных воронок: {funnels?.length || 0}
                        {funnels?.length > 0 && (
                          <div className='mt-1'>
                            Доступные:{' '}
                            {funnels
                              .map((f) => f.name || f.display_name)
                              .join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                if (funnelStages.length === 0) {
                  return (
                    <div className='rounded-lg border bg-blue-50 p-4 text-sm text-gray-500'>
                      <div className='mb-2'>
                        Нет этапов в воронке &quot;
                        {currentFunnel.name || currentFunnel.display_name}&quot;
                      </div>
                      <div className='text-xs'>
                        Настройте этапы воронки в разделе AI-ассистенты
                      </div>
                    </div>
                  );
                }

                return funnelStages.map((stage, index) => (
                  <KanbanColumn
                    key={index}
                    title={stage.name}
                    headerContent={
                      <div className='mt-2 space-y-1'>
                        <div className='text-xs text-gray-500'>
                          Этап {index + 1} воронки
                        </div>
                        <div className='flex justify-between text-xs'>
                          <span>Сделки:</span>
                          <span className='font-medium'>
                            {stage.deals_count || 0}
                          </span>
                        </div>
                        <div className='flex justify-between text-xs'>
                          <span>Сумма:</span>
                          <span className='font-medium'>
                            {stage.deals_amount
                              ? `₽${stage.deals_amount.toLocaleString()}`
                              : '₽0'}
                          </span>
                        </div>
                        <div className='flex justify-between text-xs'>
                          <span>Агент:</span>
                          <span className='text-xs font-medium'>
                            {stage.assistant_code_name || 'Не назначен'}
                          </span>
                        </div>
                      </div>
                    }
                  >
                    <Card
                      className='cursor-pointer transition-shadow hover:shadow-md'
                      onClick={() => handleStageSelect(index, stage)}
                    >
                      <CardContent className='p-3'>
                        <div className='mb-2 text-sm text-gray-600'>
                          Промпт этапа
                        </div>
                        <div className='rounded border-2 border-dashed bg-gray-50 p-2 text-xs text-gray-500'>
                          {stage.prompt
                            ? stage.prompt.substring(0, 100) +
                              (stage.prompt.length > 100 ? '...' : '')
                            : 'Нажмите для редактирования промпта'}
                        </div>
                        <div className='mt-2 text-xs text-gray-500'>
                          Количество follow-up: {stage.followups?.length || 0}
                        </div>
                      </CardContent>
                    </Card>
                  </KanbanColumn>
                ));
              })()}
            </div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeConnection && (
              <ConnectionCard connection={activeConnection} isOverlay />
            )}
          </DragOverlay>
        </DndContext>

        {/* Модальное окно настройки этапа */}
        <Dialog
          open={stageSettingsModal.isOpen}
          onOpenChange={handleCloseStageSettings}
        >
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>
                Настройка этапа: {stageSettingsModal.stage?.name}
              </DialogTitle>
            </DialogHeader>

            {stageSettingsModal.stage && (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Название этапа
                    </label>
                    <div className='text-sm text-gray-700'>
                      {stageSettingsModal.stage.name}
                    </div>
                  </div>
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Назначенный агент
                    </label>
                    <div className='text-sm text-gray-700'>
                      {stageSettingsModal.stage.assistant_code_name ||
                        'Не назначен'}
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Сделки
                    </label>
                    <div className='text-lg font-semibold'>
                      {stageSettingsModal.stage.deals_count || 0}
                    </div>
                  </div>
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Сумма
                    </label>
                    <div className='text-lg font-semibold'>
                      {stageSettingsModal.stage.deals_amount
                        ? `₽${stageSettingsModal.stage.deals_amount.toLocaleString()}`
                        : '₽0'}
                    </div>
                  </div>
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Follow-up
                    </label>
                    <div className='text-lg font-semibold'>
                      {stageSettingsModal.stage.followups?.length || 0}
                    </div>
                  </div>
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium'>
                    Промпт этапа
                  </label>
                  <Textarea
                    value={stageSettingsModal.stage.prompt || ''}
                    readOnly
                    className='min-h-[120px] resize-none'
                    placeholder='Промпт не настроен'
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant='outline' onClick={handleCloseStageSettings}>
                Отмена
              </Button>
              <Button
                onClick={() => {
                  if (stageSettingsModal.stage) {
                    window.location.href = `/dashboard/management/ai-assistants?stage=${encodeURIComponent(stageSettingsModal.stage.name)}`;
                  }
                }}
              >
                Редактировать промпт
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

export default function ManagementPage() {
  return <ManagementPageContent />;
}
