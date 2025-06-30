'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageSkeleton } from '@/components/page-skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { IconAdjustments, IconCreditCard } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/ui/page-container';
import Link from 'next/link';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/hooks/useFunnels';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { StagesBlock } from '@/components/ui/stages-block';
import { AgentTeamSelection } from '@/components/ui/agent-team-selection';
import { StageSettings } from '@/components/ui/stage-settings';
import { FunnelSettingsSidebar } from '@/components/ui/funnel-settings-sidebar';

function ManagementPageContent() {
  const { organization } = useOrganization();
  const searchParams = useSearchParams();
  const stageParam = searchParams?.get('stage');

  const { currentFunnel } = useFunnels(
    organization?.publicMetadata?.id_backend as string
  );

  const [assistantsCount, setAssistantsCount] = useState<number | null>(null);
  const [assistantsLoading, setAssistantsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [funnelStages, setFunnelStages] = useState<any[]>([]);
  const [selectedStage, setSelectedStage] = useState<{
    index: number;
    stage: any;
  } | null>(null);

  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  // Функция для загрузки количества ассистентов по этапам из воронки
  const fetchAssistantsCount = async () => {
    if (!backendOrgId || !currentFunnel?.id) {
      return;
    }

    const token = getClerkTokenFromClientCookie();
    if (!token) {
      return;
    }

    setAssistantsLoading(true);

    try {
      // Получаем данные воронки, которая содержит этапы
      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const funnelData = await response.json();
        console.log('Funnel data:', funnelData);

        // Подсчитываем количество этапов с ассистентами
        if (funnelData.stages && Array.isArray(funnelData.stages)) {
          const stagesWithAssistants = funnelData.stages.filter(
            (stage: any) =>
              stage.assistant_code_name &&
              stage.assistant_code_name.trim() !== ''
          );
          setAssistantsCount(stagesWithAssistants.length);

          // Сохраняем этапы для отображения в блоке этапов
          setFunnelStages(funnelData.stages);
        } else {
          setAssistantsCount(0);
          setFunnelStages([]);
        }
      } else {
        console.error('Failed to fetch funnel data:', response.status);
        setAssistantsCount(0);
        setFunnelStages([]);
      }
    } catch (error) {
      console.error('Error fetching funnel data:', error);
      setAssistantsCount(0);
      setFunnelStages([]);
    } finally {
      setAssistantsLoading(false);
    }
  };

  // Обработчик выбора этапа
  const handleStageSelect = (stageIndex: number | null, stage?: any) => {
    if (stageIndex !== null && stage) {
      setSelectedStage({ index: stageIndex, stage });
    } else {
      setSelectedStage(null);
    }
  };

  // Автоматический выбор этапа по URL параметру
  useEffect(() => {
    if (stageParam && funnelStages.length > 0 && !assistantsLoading) {
      // Небольшая задержка для обеспечения полной загрузки данных
      const timer = setTimeout(() => {
        try {
          const decodedStageParam = decodeURIComponent(stageParam);
          const stageIndex = funnelStages.findIndex(
            (stage) => stage.name === decodedStageParam
          );

          if (stageIndex !== -1) {
            handleStageSelect(stageIndex, funnelStages[stageIndex]);
          }
        } catch (error) {
          console.error('Error decoding stage parameter:', error);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [stageParam, funnelStages, assistantsLoading]);

  // Загружаем данные при монтировании и изменении организации/воронки
  useEffect(() => {
    if (organization && currentFunnel) {
      fetchAssistantsCount();
    }
  }, [backendOrgId, currentFunnel?.id]);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <div className='flex h-screen'>
        {/* Боковой блок настроек воронки - всегда показан */}
        <FunnelSettingsSidebar funnelName={currentFunnel?.name} />

        {/* Основной контент */}
        <div className='max-w-full min-w-0 flex-1 overflow-hidden'>
          <PageContainer
            scrollable={true}
            className='w-full max-w-full min-w-0 p-4'
          >
            {/* Блок этапов сделок */}
            {currentFunnel && backendOrgId ? (
              <div className='mb-6 w-full max-w-full min-w-0 overflow-hidden'>
                <StagesBlock
                  organizationId={backendOrgId}
                  funnelId={currentFunnel.id}
                  stages={funnelStages}
                  isLoading={assistantsLoading}
                  onStageUpdate={fetchAssistantsCount}
                  onStageSelect={handleStageSelect}
                />
              </div>
            ) : (
              <div className='mb-6'>
                <div className='text-muted-foreground py-8 text-center'>
                  Выберите воронку для просмотра этапов
                </div>
              </div>
            )}

            {/* Условное отображение: либо настройки этапа, либо блок выбора команды агентов */}
            {selectedStage ? (
              <StageSettings
                stage={selectedStage.stage}
                stageIndex={selectedStage.index}
              />
            ) : (
              <AgentTeamSelection />
            )}

            {/* Временно скрыто - основная сетка блоков */}
            <div className='hidden space-y-6'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
                <Card className='flex h-full flex-col p-6'>
                  <div className='mb-2 flex items-center justify-between'>
                    <h3 className='text-lg font-medium'>AI-ассистенты</h3>
                    <Switch />
                  </div>
                  <div className='text-muted-foreground mb-6 text-sm'>
                    Мультиагент, отвечающий за этапы воронки
                  </div>
                  <div className='mt-auto flex gap-3'>
                    <Link
                      href='/dashboard/management/agent-testing?agent=ai-assistants'
                      className='flex-1'
                    >
                      <Button variant='outline' className='w-full'>
                        Тест агента
                      </Button>
                    </Link>
                    <Link
                      href='/dashboard/management/ai-assistants/'
                      className='flex-1'
                    >
                      <Button className='w-full'>Настройки</Button>
                    </Link>
                  </div>
                </Card>

                <Card className='flex h-full flex-col p-6'>
                  <div className='mb-2 flex items-center justify-between'>
                    <h3 className='text-lg font-medium'>Фоллоу Ап (анализ)</h3>
                    <Switch />
                  </div>
                  <div className='text-muted-foreground mb-6 text-sm'>
                    Системный агент, отвечающий за напоминания клиентам
                  </div>
                  <div className='mt-auto flex gap-3'>
                    <Link
                      href='/dashboard/management/agent-testing?agent=follow-up'
                      className='flex-1'
                    >
                      <Button variant='outline' className='w-full'>
                        Тест агента
                      </Button>
                    </Link>
                    <Link
                      href='/dashboard/management/follow-up/'
                      className='flex-1'
                    >
                      <Button className='w-full'>Настройки</Button>
                    </Link>
                  </div>
                </Card>

                <Card className='flex h-full flex-col p-6'>
                  <div className='mb-2 flex items-center justify-between'>
                    <h3 className='text-lg font-medium'>Фоллоу Ап (сообы)</h3>
                    <Switch />
                  </div>
                  <div className='text-muted-foreground mb-6 text-sm'>
                    Агент, отвечающий за напоминания клиентам
                  </div>
                  <div className='mt-auto flex gap-3'>
                    <Link
                      href='/dashboard/management/agent-testing?agent=follow-up-messages'
                      className='flex-1'
                    >
                      <Button variant='outline' className='w-full'>
                        Тест агента
                      </Button>
                    </Link>
                    <Link
                      href='/dashboard/management/follow-up-messages/'
                      className='flex-1'
                    >
                      <Button className='w-full'>Настройки</Button>
                    </Link>
                  </div>
                </Card>

                <Card className='flex h-full flex-col p-6'>
                  <div className='mb-2 flex items-center justify-between'>
                    <h3 className='text-lg font-medium'>Анализ</h3>
                    <Switch />
                  </div>
                  <div className='text-muted-foreground mb-6 text-sm'>
                    Агент, отвечающий за аналитику данных
                  </div>
                  <div className='mt-auto flex gap-3'>
                    <Link
                      href='/dashboard/management/agent-testing?agent=analysis'
                      className='flex-1'
                    >
                      <Button variant='outline' className='w-full'>
                        Тест агента
                      </Button>
                    </Link>
                    <Link
                      href='/dashboard/management/analysis/'
                      className='flex-1'
                    >
                      <Button className='w-full'>Настройки</Button>
                    </Link>
                  </div>
                </Card>

                {/* <Card className="h-full flex flex-col p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-lg">РОП</h3>
                <Switch />
              </div>
              <div className="text-muted-foreground text-sm mb-6">
                Агент аналитики второго уровня
              </div>
              <div className="mt-auto flex gap-3">
                <Button variant="outline" className="flex-1">Тест агента</Button>
                <Link href='/dashboard/management/sales-manager/' className="flex-1">
                  <Button className="w-full">Настройки</Button>
                </Link>
              </div>
            </Card> */}

                <Card className='flex h-full flex-col p-6'>
                  <div className='mb-2 flex items-center justify-between'>
                    <h3 className='text-lg font-medium'>РОП</h3>
                    <div className='flex items-center'>
                      <Switch />
                      {/* <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-md">Текстовый</span> */}
                    </div>
                  </div>
                  <div className='text-muted-foreground mb-6 text-sm'>
                    Агент аналитики второго уровня
                  </div>
                  <div className='mt-auto'>
                    <Button
                      className='w-full'
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      Создать
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Модальное окно создания агента */}
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle className='text-xl font-bold'>
                    Создать агента
                  </DialogTitle>
                  <DialogDescription>
                    Выбирите какого агента хотите создать
                  </DialogDescription>
                </DialogHeader>
                <div className='grid grid-cols-2 gap-4 py-4'>
                  <div className='flex cursor-pointer flex-col items-center justify-center rounded-md border p-4 hover:border-black'>
                    <IconCreditCard className='mb-2 h-12 w-12' />
                    <span className='text-center'>Простой агент</span>
                  </div>
                  <div className='flex cursor-pointer flex-col items-center justify-center rounded-md border border-black p-4 hover:border-black'>
                    <IconCreditCard className='mb-2 h-12 w-12' />
                    <span className='text-center'>Мультиагент</span>
                  </div>
                </div>
                <DialogFooter className='sm:justify-between'>
                  <Button
                    variant='outline'
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type='button'>Создать</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PageContainer>
        </div>
      </div>
    </Suspense>
  );
}

export default function ManagementPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ManagementPageContent />
    </Suspense>
  );
}
