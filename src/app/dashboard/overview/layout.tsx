'use client';

import React, { useState, useEffect } from 'react';
import { useOrganization } from '@clerk/nextjs';
import PageContainer from '@/components/layout/page-container';
import { TableHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
  IconPlus
} from '@tabler/icons-react';
import { useFunnels } from '@/hooks/useFunnels';
import AddFunnelModal from './AddFunnelModal';
import { OverviewProvider } from '@/contexts/OverviewContext';

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

  const { organization } = useOrganization();

  // Получаем backend ID организации из метаданных Clerk
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  const {
    funnels,
    currentFunnel,
    selectFunnel,
    refreshFunnels,
    setNewFunnelAsSelected
  } = useFunnels(backendOrgId);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newFunnelName, setNewFunnelName] = useState('');

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

  // Данные для карточек конверсии
  const conversionData = React.useMemo(() => {
    if (!currentFunnel?.stages || currentFunnel.stages.length === 0) {
      return [
        { absolute: 1250, percentage: 82, stage: '1/3', name: 'Квалификация' },
        { absolute: 1024, percentage: 66, stage: '2/3', name: 'Презентация' },
        { absolute: 678, percentage: 42, stage: '3/3', name: 'Закрытие' }
      ];
    }

    // Создаем карточки по этапам из текущей воронки
    return currentFunnel.stages.map(
      (
        stage: { name: string; assistant_code_name?: string },
        index: number
      ) => {
        // Генерируем случайные числа для сохранения логики демонстрации
        const absolute = Math.floor(Math.random() * 1500) + 50;
        const percentage = Math.floor(Math.random() * 80) + 20;

        return {
          absolute,
          percentage,
          stage: `${index + 1}/${currentFunnel.stages?.length}`,
          name: stage.name,
          assistant_code_name: stage.assistant_code_name
        };
      }
    );
  }, [currentFunnel]);

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
      selectFunnel(funnel);
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

  return (
    <OverviewProvider searchQuery={searchQuery}>
      <TableHeader
        title='Обзор'
        funnels={
          funnels?.map((funnel) => ({
            id: funnel.id,
            name: funnel.display_name || funnel.name || 'Без названия'
          })) || []
        }
        selectedFunnel={currentFunnel?.id}
        onFunnelChange={handleFunnelChange}
        onSearch={setSearchQuery}
        onTimeFilterChange={setActiveTimeFilter}
        timeFilter={activeTimeFilter}
      />
      <PageContainer>
        <div className='grid-cols-12 gap-6 space-y-6 py-6 lg:grid lg:space-y-0'>
          {/* First row */}
          <div className='col-span-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4'>
            {conversionData.map((data, index) => (
              <Card key={index} className='@container/card w-full'>
                <CardHeader>
                  <CardDescription>
                    {data.name || `Этап ${index + 1}`} ({data.stage})
                  </CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                    {showPercentage ? `${data.percentage}%` : data.absolute}
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline' className='flex items-center'>
                      {Math.random() > 0.3 ? (
                        <IconTrendingUp className='mr-1 size-4' />
                      ) : (
                        <IconTrendingDown className='mr-1 size-4' />
                      )}
                      {Math.random() > 0.3 ? '+9%' : '-5%'}
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium'>
                    {Math.random() > 0.2 ? (
                      <>
                        Рост в этом месяце <IconTrendingUp className='size-4' />
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
                </CardFooter>
              </Card>
            ))}
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
          stages={stages}
          setStages={setStages}
          showFollowup={showFollowup}
          setShowFollowup={setShowFollowup}
          handleStageChange={handleStageChange}
          handleAddStage={handleAddStage}
          handleRemoveStage={handleRemoveStage}
          handleAddFollowup={handleAddFollowup}
          handleRemoveFollowup={handleRemoveFollowup}
          handleFollowupChange={handleFollowupChange}
        />
      </PageContainer>
    </OverviewProvider>
  );
}
