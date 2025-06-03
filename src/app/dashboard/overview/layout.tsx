'use client';

import React, { useState, useEffect } from 'react';
import { useOrganization } from '@clerk/nextjs';
import PageContainer from '@/components/layout/page-container';
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
import { OrganizationDebug } from '@/components/organization-debug';
import { UserDebug } from '@/components/user-debug';
import { OrganizationApiDebug } from '@/components/organization-api-debug';
import { FunnelDebug } from '@/components/funnel-debug';
import { TokenDebug } from '@/components/token-debug';
import { MessengerConnectionsDebug } from '@/components/messenger-connections-debug';
import { AssistantsDebug } from '@/components/assistants-debug';
import { DialogsDebug } from '@/components/dialogs-debug';

export default function OverViewLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [activeTimeFilter, setActiveTimeFilter] = useState('week');
  const [showPercentage, setShowPercentage] = useState(false);

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

  // По умолчанию два этапа с уникальными id
  const [stages, setStages] = useState([
    { id: Date.now() + Math.random(), name: '', prompt: '', followups: [60] },
    {
      id: Date.now() + Math.random() + 1,
      name: '',
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
        { absolute: 1250, percentage: 82, stage: '1/4', name: 'Этап 1' },
        { absolute: 1024, percentage: 66, stage: '2/4', name: 'Этап 2' },
        { absolute: 678, percentage: 42, stage: '3/4', name: 'Этап 3' },
        { absolute: 45, percentage: 70, stage: '4/4', name: 'Этап 4' }
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
      { id: Date.now() + Math.random(), name: '', prompt: '', followups: [60] },
      {
        id: Date.now() + Math.random() + 1,
        name: '',
        prompt: '',
        followups: [60]
      }
    ]);
  };

  return (
    <PageContainer>
      <div className='flex w-full max-w-full flex-1 flex-col space-y-4'>
        {/* Заголовок и селект воронки */}
        <div className='flex w-full flex-col items-start justify-between gap-3 pt-2 pb-2 sm:flex-row sm:items-center'>
          <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center'>
            <h2 className='text-lg font-semibold text-gray-800 sm:text-xl dark:text-white'>
              Дашборд
            </h2>
            {/* Условное отображение: кнопка если воронок нет, селект если есть */}
            {funnels.length === 0 ? (
              <Button
                onClick={() => setAddModalOpen(true)}
                variant='default'
                size='sm'
                className='h-8 w-full max-w-[180px] text-sm'
              >
                <IconPlus className='mr-2 h-4 w-4' />
                Добавить воронку
              </Button>
            ) : (
              <Select
                value={currentFunnel?.id}
                onValueChange={handleFunnelChange}
              >
                <SelectTrigger className='h-8 w-full max-w-[180px] text-sm'>
                  <SelectValue className='truncate'>
                    {currentFunnel?.display_name ||
                      currentFunnel?.name ||
                      'Выберите воронку'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {funnels.map((funnel) => (
                    <SelectItem key={funnel.id} value={funnel.id}>
                      {funnel.display_name || funnel.name}
                    </SelectItem>
                  ))}
                  <SelectItem value='add-funnel'>
                    <span className='text-primary'>+ Добавить воронку</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Переключатель процентов и фильтр времени */}
          <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center'>
            <div className='flex items-center space-x-2'>
              <Label
                htmlFor='show-percentage'
                className='text-sm whitespace-nowrap'
              >
                Проценты
              </Label>
              <Switch
                id='show-percentage'
                checked={showPercentage}
                onCheckedChange={setShowPercentage}
              />
            </div>

            {/* Десктопный вид фильтров (скрыт на мобильном) */}
            <div className='hidden items-center overflow-hidden rounded-md border shadow-sm sm:flex'>
              {timeFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant='ghost'
                  className={cn(
                    'h-8 rounded-none border-r px-3 text-xs font-medium last:border-r-0 sm:text-sm',
                    activeTimeFilter === filter.id
                      ? 'bg-background border-b-primary text-primary hover:bg-background border-b-2'
                      : 'hover:bg-muted text-muted-foreground border-b-2 border-b-transparent'
                  )}
                  onClick={() => setActiveTimeFilter(filter.id)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Мобильный вид фильтров (Select вместо кнопок) */}
            <div className='w-full sm:hidden'>
              <Select
                value={activeTimeFilter}
                onValueChange={setActiveTimeFilter}
              >
                <SelectTrigger className='h-8 w-full text-sm'>
                  <SelectValue className='truncate'>
                    {timeFilters.find((f) => f.id === activeTimeFilter)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {timeFilters.map((filter) => (
                    <SelectItem key={filter.id} value={filter.id}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Карточки конверсии */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
          {conversionData.map(
            (
              data: {
                absolute: number;
                percentage: number;
                stage: string;
                name?: string;
                assistant_code_name?: string;
              },
              index: number
            ) => (
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
            )
          )}

          {/* Пятая карточка с плюсом */}
          <Card
            className='hover:bg-muted/50 flex cursor-pointer items-center justify-center transition-colors'
            onClick={() => alert('Добавление новой карточки')}
          >
            <IconPlus className='text-muted-foreground size-8 sm:size-12' />
          </Card>
        </div>

        {/* Отладочные блоки */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <OrganizationDebug />
          <UserDebug />
          <OrganizationApiDebug />
          <FunnelDebug />
          <TokenDebug />
          <MessengerConnectionsDebug />
          <AssistantsDebug />
          <DialogsDebug />
        </div>

        {/* Модалка для добавления воронки */}
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
      </div>
    </PageContainer>
  );
}
