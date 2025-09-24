'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import PageContainer from '@/components/layout/page-container';
import { TableHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconPlus,
  IconCheck,
  IconX,
  IconSettings
} from '@tabler/icons-react';
import { useFunnels } from '@/contexts/FunnelsContext';
import AddFunnelModal from './AddFunnelModal';
import { OverviewProvider } from '@/contexts/OverviewContext';
import { AllFunnelsPlaceholder } from '@/components/all-funnels-placeholder';

export default function OverViewLayout({
  children,
  area_stats,
  pie_stats
}: {
  children: React.ReactNode;
  area_stats: React.ReactNode;
  pie_stats: React.ReactNode;
}) {
  const [activeTimeFilter, setActiveTimeFilter] = useState('week');
  const [showPercentage, setShowPercentage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Состояния для диалогов и статистики
  const [dialogs, setDialogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Состояния для создания нового этапа
  const [isCreatingNewStage, setIsCreatingNewStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageTransferType, setNewStageTransferType] = useState('manager');

  const { organization } = useOrganization();
  const router = useRouter();

  // Получаем backend ID организации из метаданных Clerk
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  const {
    currentFunnel,
    funnels,
    selectFunnel,
    refreshFunnels,
    setNewFunnelAsSelected
  } = useFunnels();
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newFunnelName, setNewFunnelName] = useState('');

  // Функция для загрузки диалогов с сервера
  const fetchDialogsFromServer = useCallback(async (): Promise<any[]> => {
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
    console.log('Fetched dialogs data for overview:', data);
    return data;
  }, [backendOrgId, currentFunnel?.id]);

  // Функция для загрузки всех данных
  const fetchAllData = useCallback(async () => {
    if (!backendOrgId || !currentFunnel?.id) {
      console.log('Missing backendOrgId or currentFunnel.id, skipping fetch');
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const dialogsData = await fetchDialogsFromServer();
      setDialogs(dialogsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching overview data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setDialogs([]);
    } finally {
      setLoading(false);
    }
  }, [fetchDialogsFromServer, backendOrgId, currentFunnel?.id]);

  // Загрузка данных при изменении воронки
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // По умолчанию три этапа с предустановленными названиями
  const [stages, setStages] = useState([
    {
      id: Date.now() + Math.random(),
      name: 'Квалификация',
      prompt: '',
      followups: [60]
    },
    {
      id: Date.now() + Math.random() + 1,
      name: 'Презентация',
      prompt: '',
      followups: [60]
    },
    {
      id: Date.now() + Math.random() + 2,
      name: 'Закрытие',
      prompt: '',
      followups: [60]
    }
  ]);
  // Состояние для раскрытия follow-up в каждом этапе
  const [showFollowup, setShowFollowup] = useState<{ [key: number]: boolean }>(
    {}
  );

  useEffect(() => {
    // Log __session cookie value when user navigates to /dashboard/overview
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const sessionCookie = getCookie('__session');
    console.log('Current __session cookie value:', sessionCookie);
    console.log('Current organization:', organization?.name);
    console.log('Backend organization ID:', backendOrgId);
  }, [organization, backendOrgId]);

  useEffect(() => {
    if (funnels && funnels.length > 0) {
      console.log('Текущий список воронок компании:', funnels);
    } else {
      console.log('Воронки не найдены для текущей компании.');
    }
  }, [funnels, currentFunnel]);

  // Подсчет статистики по этапам
  const stageStats = useMemo(() => {
    // Используем мок-данные для stages
    const mockStages = [
      { name: 'qualification', assistant_code_name: 'qualification' },
      { name: 'presentation', assistant_code_name: 'presentation' },
      { name: 'closing', assistant_code_name: 'closing' }
    ];

    // Создаем карту стадий для сопоставления кодовых имен с русскими названиями
    const stageMap: Record<string, { name: string; color: string }> = {};
    mockStages.forEach((stage) => {
      const codeName =
        stage.assistant_code_name?.toLowerCase() || stage.name.toLowerCase();
      stageMap[codeName] = {
        name: stage.name,
        color: 'default'
      };

      // Добавляем также английские варианты для известных стадий
      if (stage.name.toLowerCase() === 'квалификация') {
        stageMap['qualification'] = { name: stage.name, color: 'default' };
      } else if (stage.name.toLowerCase() === 'презентация') {
        stageMap['presentation'] = { name: stage.name, color: 'default' };
      } else if (stage.name.toLowerCase() === 'закрытие') {
        stageMap['closing'] = { name: stage.name, color: 'default' };
      }
    });

    // Подсчитываем количество диалогов по этапам
    const stageCounts: Record<string, number> = {};

    dialogs.forEach((dialog) => {
      const stageName = dialog.stage || 'Неизвестно';
      const normalizedStageName = stageName.toLowerCase();

      // Ищем соответствующий этап в карте
      const mappedStage = stageMap[normalizedStageName];
      const finalStageName = mappedStage ? mappedStage.name : stageName;

      stageCounts[finalStageName] = (stageCounts[finalStageName] || 0) + 1;
    });

    // Создаем статистику для каждого этапа воронки
    return mockStages.map((stage) => ({
      name: stage.name,
      count: stageCounts[stage.name] || 0,
      assistant_code_name: stage.assistant_code_name
    }));
  }, [dialogs]);

  // Общее количество диалогов
  const totalDialogs = useMemo(() => {
    return dialogs.length;
  }, [dialogs]);

  // Данные для карточек конверсии
  const conversionData = useMemo(() => {
    // Используем мок-данные для stages
    const mockStages = [
      { name: 'qualification', assistant_code_name: 'qualification' },
      { name: 'presentation', assistant_code_name: 'presentation' },
      { name: 'closing', assistant_code_name: 'closing' }
    ];

    // Создаем карточки по этапам с реальными данными
    return mockStages.map(
      (
        stage: { name: string; assistant_code_name?: string },
        index: number
      ) => {
        const stageStatItem = stageStats.find(
          (stat) => stat.name === stage.name
        );
        const absolute = stageStatItem ? stageStatItem.count : 0;
        const percentage =
          totalDialogs > 0 ? Math.round((absolute / totalDialogs) * 100) : 0;

        return {
          absolute,
          percentage,
          stage: `${index + 1}/${mockStages.length}`,
          name: stage.name,
          assistant_code_name: stage.assistant_code_name
        };
      }
    );
  }, [stageStats, totalDialogs]);

  // Фильтры для мобильного и десктопного отображения
  const timeFilters = [
    { id: 'today', label: 'Сегодня' },
    { id: 'week', label: 'За неделю' },
    { id: 'month', label: 'За месяц' },
    { id: 'quarter', label: 'За квартал' },
    { id: 'period', label: 'За период' }
  ];

  // При смене воронки выводим все воронки
  const handleFunnelChange = (funnelId: string) => {
    const funnel = funnels.find((f) => f.id === funnelId);
    if (funnel) {
      selectFunnel(funnelId);
      console.log('Все воронки:', funnels);
      console.log('Выбрана воронка:', funnel);
    }
    if (funnelId === 'add-funnel') {
      setAddModalOpen(true);
    }
  };

  // Добавить этап
  const handleAddStage = () => {
    setStages([
      ...stages,
      { id: Date.now() + Math.random(), name: '', prompt: '', followups: [60] }
    ]);
  };

  // Удалить этап
  const handleRemoveStage = (id: number) => {
    setStages(stages.filter((stage) => stage.id !== id));
  };

  // Изменить поле этапа
  const handleStageChange = (id: number, field: string, value: string) => {
    setStages(
      stages.map((stage) =>
        stage.id === id ? { ...stage, [field]: value } : stage
      )
    );
  };

  // Добавить followup
  const handleAddFollowup = (id: number) => {
    setStages(
      stages.map((stage) =>
        stage.id === id && stage.followups.length < 5
          ? { ...stage, followups: [...stage.followups, 60] }
          : stage
      )
    );
  };

  // Удалить followup
  const handleRemoveFollowup = (id: number, followupIdx: number) => {
    setStages(
      stages.map((stage) =>
        stage.id === id
          ? {
              ...stage,
              followups: stage.followups.filter((_, j) => j !== followupIdx)
            }
          : stage
      )
    );
  };

  // Изменить значение followup
  const handleFollowupChange = (
    id: number,
    followupIdx: number,
    value: number
  ) => {
    setStages(
      stages.map((stage) =>
        stage.id === id
          ? {
              ...stage,
              followups: stage.followups.map((f, j) =>
                j === followupIdx ? value : f
              )
            }
          : stage
      )
    );
  };

  // Функция для перехода к настройкам агента этапа
  const handleStageAgentSettings = (stageName: string) => {
    const encodedStageName = encodeURIComponent(stageName);
    router.push(`/dashboard/management?stage=${encodedStageName}`);
  };

  // Функции для создания нового этапа
  const handleStartCreatingStage = () => {
    setIsCreatingNewStage(true);
    setNewStageName('');
    setNewStageTransferType('manager');
  };

  const handleCancelCreatingStage = () => {
    setIsCreatingNewStage(false);
    setNewStageName('');
    setNewStageTransferType('manager');
  };

  const handleSaveNewStage = () => {
    if (!newStageName.trim()) return;

    // Добавляем новый этап к существующим данным конверсии
    // Здесь можно добавить логику сохранения на сервер
    console.log('Создание нового этапа:', {
      name: newStageName,
      transferType: newStageTransferType
    });

    // Пока просто сбрасываем состояние создания
    handleCancelCreatingStage();

    // TODO: Добавить API-запрос для создания нового этапа в воронке
    // TODO: Обновить данные воронки после создания
  };

  // Обработка добавления воронки
  const handleAddFunnel = async (newFunnel?: any) => {
    console.log('handleAddFunnel called with:', newFunnel);

    if (newFunnel) {
      // Если передана новая воронка, устанавливаем её как выбранную
      setNewFunnelAsSelected(newFunnel);
    } else {
      // Если воронка не передана, обновляем список воронок
      refreshFunnels();
    }

    // Закрываем модальное окно и сбрасываем форму
    setAddModalOpen(false);
    setNewFunnelName('');
    setStages([
      {
        id: Date.now() + Math.random(),
        name: 'Квалификация',
        prompt: '',
        followups: [60]
      },
      {
        id: Date.now() + Math.random() + 1,
        name: 'Презентация',
        prompt: '',
        followups: [60]
      },
      {
        id: Date.now() + Math.random() + 2,
        name: 'Закрытие',
        prompt: '',
        followups: [60]
      }
    ]);
  };

  // Показываем заглушку для "Все воронки"
  if (currentFunnel?.id === '0') {
    return (
      <OverviewProvider
        searchQuery={searchQuery}
        stageStats={stageStats}
        totalDialogs={totalDialogs}
        dialogsData={dialogs}
        loading={loading}
      >
        <TableHeader
          title='Обзор'
          funnels={
            funnels?.map((funnel) => ({
              id: funnel.id,
              name: funnel.display_name || funnel.name || 'Без названия'
            })) || []
          }
          selectedFunnel={
            currentFunnel?.id === '0' ? 'all-funnels' : currentFunnel?.id
          }
          onFunnelChange={handleFunnelChange}
          onSearch={setSearchQuery}
          onTimeFilterChange={setActiveTimeFilter}
          timeFilter={activeTimeFilter}
        />
        <PageContainer>
          <AllFunnelsPlaceholder />
        </PageContainer>
      </OverviewProvider>
    );
  }

  return (
    <OverviewProvider
      searchQuery={searchQuery}
      stageStats={stageStats}
      totalDialogs={totalDialogs}
      dialogsData={dialogs}
      loading={loading}
    >
      <TableHeader
        title='Обзор'
        funnels={
          funnels?.map((funnel) => ({
            id: funnel.id,
            name: funnel.display_name || funnel.name || 'Без названия'
          })) || []
        }
        selectedFunnel={
          currentFunnel?.id === '0' ? 'all-funnels' : currentFunnel?.id
        }
        onFunnelChange={handleFunnelChange}
        onSearch={setSearchQuery}
        onTimeFilterChange={setActiveTimeFilter}
        timeFilter={activeTimeFilter}
      />
      <PageContainer>
        <div className='grid-cols-12 gap-6 space-y-6 lg:grid lg:space-y-0'>
          {/* First row */}
          <div className='col-span-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5'>
            {conversionData.map((data, index) => (
              <Card key={index} className='@container/card w-full'>
                <CardHeader>
                  <CardDescription>
                    {data.name || `Этап ${index + 1}`} ({data.stage})
                  </CardDescription>
                  <CardTitle className='pt-4 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                    {showPercentage ? `${data.percentage}%` : data.absolute}
                  </CardTitle>
                  {/* <CardAction>
                    <Badge variant='outline' className='flex items-center'>
                      {Math.random() > 0.3 ? (
                        <IconTrendingUp className='mr-1 size-4' />
                      ) : (
                        <IconTrendingDown className='mr-1 size-4' />
                      )}
                      {Math.random() > 0.3 ? '+9%' : '-5%'}
                    </Badge>
                  </CardAction> */}
                </CardHeader>
                <CardFooter className='flex-col items-start gap-3 text-sm'>
                  <div>
                    <div className='line-clamp-1 flex gap-2 font-medium'>
                      {Math.random() > 0.2 ? (
                        <>
                          Рост в этом месяце{' '}
                          <IconTrendingUp className='size-4' />
                        </>
                      ) : (
                        <>
                          Снижение на {Math.floor(Math.random() * 20) + 5}%{' '}
                          <IconTrendingDown className='size-4' />
                        </>
                      )}
                    </div>
                    <div className='text-muted-foreground text-xs sm:text-sm'>
                      {
                        [
                          'Посетители за последние 6 месяцев',
                          'Требуется внимание к привлечению',
                          'Вовлеченность превышает цели',
                          'Соответствует прогнозам роста'
                        ][index % 4]
                      }
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleStageAgentSettings(data.name)}
                    className='flex w-full items-center gap-2'
                  >
                    <IconSettings className='h-4 w-4' />
                    Настройка агента
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {/* Блок создания нового этапа */}
            {isCreatingNewStage ? (
              <Card className='border-primary @container/card w-full border-dashed'>
                <CardHeader>
                  <CardDescription>Новый этап</CardDescription>
                  <div className='space-y-3'>
                    <Input
                      placeholder='Название этапа'
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      className='w-full'
                    />
                    <Select
                      value={newStageTransferType}
                      onValueChange={setNewStageTransferType}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Тип перевода' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='manager'>На менеджера</SelectItem>
                        <SelectItem value='agent'>На агента</SelectItem>
                        <SelectItem value='auto'>Автоматически</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardFooter className='flex items-center justify-center gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleSaveNewStage}
                    disabled={!newStageName.trim()}
                    className='h-8 w-8 p-0'
                  >
                    <IconCheck className='h-4 w-4 text-green-600' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleCancelCreatingStage}
                    className='h-8 w-8 p-0'
                  >
                    <IconX className='h-4 w-4 text-red-600' />
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card
                className='hover:border-primary @container/card w-full cursor-pointer border-dashed border-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
                onClick={handleStartCreatingStage}
              >
                <CardContent className='flex h-full min-h-[200px] items-center justify-center'>
                  <div className='hover:text-primary flex flex-col items-center gap-2 text-gray-500 transition-colors'>
                    <IconPlus className='h-8 w-8' />
                    <span className='text-sm font-medium'>Добавить этап</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Second row */}
          <div className='col-span-12 grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {area_stats}
            {pie_stats}
          </div>
        </div>

        {/* Модальное окно для добавления воронки */}
        <AddFunnelModal
          isOpen={isAddModalOpen}
          onClose={() => setAddModalOpen(false)}
          onAdd={handleAddFunnel}
          newFunnelName={newFunnelName}
          setNewFunnelName={setNewFunnelName}
        />
      </PageContainer>
    </OverviewProvider>
  );
}
