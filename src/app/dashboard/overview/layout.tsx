'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import {
  IconTrendingDown,
  IconTrendingUp,
  IconPlus
} from '@tabler/icons-react';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useFunnels } from '@/hooks/useFunnels';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const [activeTimeFilter, setActiveTimeFilter] = useState('week');
  const [showPercentage, setShowPercentage] = useState(false);

  const {
    token,
    loginAndFetchToken,
    fetchOrganizations,
    isLoadingToken,
    isLoadingOrganizations,
    error: authError,
    selectedOrganizationId
  } = useAuth();

  const { funnels, currentFunnel, selectFunnel } = useFunnels(
    selectedOrganizationId
  );
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
    loginAndFetchToken();
  }, [loginAndFetchToken]);

  useEffect(() => {
    if (token) {
      fetchOrganizations();
    }
  }, [token, fetchOrganizations]);

  useEffect(() => {
    if (funnels && funnels.length > 0) {
      console.log('Текущий список воронок компании:', funnels);
    } else {
      console.log('Воронки не найдены для текущей компании.');
    }
  }, [funnels, currentFunnel]);

  // Данные для карточек конверсии
  const conversionData = [
    { absolute: 1250, percentage: 82, stage: '1/4' },
    { absolute: 1024, percentage: 66, stage: '2/4' },
    { absolute: 678, percentage: 42, stage: '3/4' },
    { absolute: 45, percentage: 70, stage: '4/4' }
  ];

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
  const handleStageChange = (
    id: number,
    field: 'name' | 'prompt',
    value: string
  ) => {
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

  // --- Добавление новой воронки с этапами ---
  const handleAddFunnel = () => {
    if (newFunnelName.trim() && stages.every((s) => s.name.trim())) {
      const newFunnel = {
        id: Date.now().toString(),
        name: newFunnelName.trim(),
        display_name: newFunnelName.trim(),
        stages: stages.map((s) => ({
          name: s.name.trim(),
          prompt: s.prompt,
          followups: s.followups
        }))
      };
      const updatedFunnels = [newFunnel, ...funnels];
      localStorage.setItem('funnels', JSON.stringify(updatedFunnels));
      localStorage.setItem('currentFunnel', JSON.stringify(newFunnel));
      setNewFunnelName('');
      setStages([
        {
          id: Date.now() + Math.random(),
          name: '',
          prompt: '',
          followups: [60]
        }
      ]);
      setAddModalOpen(false);
      window.location.reload();
    }
  };

  return (
    <PageContainer>
      <div className='flex w-full max-w-full flex-1 flex-col space-y-4'>
        {/* Заголовок и селект воронки */}
        <div className='flex w-full flex-col items-start justify-between gap-3 pt-2 pb-2 sm:flex-row sm:items-center'>
          <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center'>
            <h2 className='text-lg font-semibold text-gray-800 sm:text-xl'>
              Дашборд
            </h2>
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
          {conversionData.map((data, index) => (
            <Card key={index} className='@container/card w-full'>
              <CardHeader>
                <CardDescription>
                  {index === 0 && <>Первый контакт </>}
                  {index === 1 && <>Квалификация </>}
                  {index === 2 && <>Презентация </>}
                  {index === 3 && <>Закрытие </>}({data.stage})
                </CardDescription>
                <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  {showPercentage ? `${data.percentage}%` : data.absolute}
                </CardTitle>
                <CardAction>
                  <Badge variant='outline' className='flex items-center'>
                    {index === 1 ? (
                      <IconTrendingDown className='mr-1 size-4' />
                    ) : (
                      <IconTrendingUp className='mr-1 size-4' />
                    )}
                    {index === 1 ? '-5%' : '+9%'}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                <div className='line-clamp-1 flex gap-2 font-medium'>
                  {index === 0 && (
                    <>
                      Рост в этом месяце <IconTrendingUp className='size-4' />
                    </>
                  )}
                  {index === 1 && (
                    <>
                      Снижение на 20% <IconTrendingDown className='size-4' />
                    </>
                  )}
                  {index === 2 && (
                    <>
                      Высокий уровень <IconTrendingUp className='size-4' />
                    </>
                  )}
                  {index === 3 && (
                    <>
                      Стабильный рост <IconTrendingUp className='size-4' />
                    </>
                  )}
                </div>
                <div className='text-muted-foreground text-xs sm:text-sm'>
                  {index === 0 && 'Посетители за последние 6 месяцев'}
                  {index === 1 && 'Требуется внимание к привлечению'}
                  {index === 2 && 'Вовлеченность превышает цели'}
                  {index === 3 && 'Соответствует прогнозам роста'}
                </div>
              </CardFooter>
            </Card>
          ))}

          {/* Пятая карточка с плюсом */}
          <Card
            className='hover:bg-muted/50 flex cursor-pointer items-center justify-center transition-colors'
            onClick={() => alert('Добавление новой карточки')}
          >
            <IconPlus className='text-muted-foreground size-8 sm:size-12' />
          </Card>
        </div>

        {/* Графики и статистика */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-1 overflow-x-auto md:col-span-2 lg:col-span-4'>
            {bar_stats}
          </div>
          <div className='col-span-1 overflow-x-auto md:col-span-2 lg:col-span-3'>
            {sales}
          </div>
          <div className='col-span-1 overflow-x-auto md:col-span-2 lg:col-span-4'>
            {area_stats}
          </div>
          <div className='col-span-1 overflow-x-auto md:col-span-2 lg:col-span-3'>
            {pie_stats}
          </div>
        </div>

        {/* Модалка для добавления воронки */}
        {isAddModalOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
            <div className='bg-background w-full max-w-2xl rounded-xl p-8 shadow-2xl'>
              <h3 className='text-foreground mb-2 text-2xl font-bold'>
                Добавить воронку
              </h3>
              <div className='text-muted-foreground mb-6'>
                Укажите название воронки и добавьте этапы. Для каждого этапа
                заполните название, промпт для ассистента и интервалы follow-up
                (до 3, в минутах).
              </div>
              <Input
                value={newFunnelName}
                onChange={(e) => setNewFunnelName(e.target.value)}
                placeholder='Название воронки'
                className='text-foreground bg-background mb-6 h-12 text-lg'
              />
              <div className='flex max-h-[50vh] flex-row flex-nowrap gap-6 overflow-x-auto pb-2'>
                <AnimatePresence initial={false}>
                  {stages.map((stage, idx) => {
                    const isAccordionOpen = !!showFollowup[stage.id];
                    return (
                      <motion.div
                        key={stage.id}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.25 }}
                        className={`bg-background relative flex max-w-[340px] min-w-[340px] flex-col gap-4 rounded-xl border border-gray-200 p-6 shadow dark:border-gray-700 ${isAccordionOpen ? 'max-h-[320px] overflow-y-auto' : ''}`}
                      >
                        <div className='mb-2 flex items-center justify-between'>
                          <span className='text-foreground text-lg font-semibold'>
                            Этап {idx + 1}
                          </span>
                          <div className='flex gap-1'>
                            {stages.length > 1 && (
                              <Button
                                size='icon'
                                variant='ghost'
                                onClick={() => handleRemoveStage(stage.id)}
                                title='Удалить этап'
                                className='text-xl'
                              >
                                ×
                              </Button>
                            )}
                            <Button
                              size='icon'
                              variant='outline'
                              onClick={() => {
                                const newStage = {
                                  id: Date.now() + Math.random(),
                                  name: '',
                                  prompt: '',
                                  followups: [60]
                                };
                                const idxInArr = stages.findIndex(
                                  (s) => s.id === stage.id
                                );
                                setStages((prev) => [
                                  ...prev.slice(0, idxInArr + 1),
                                  newStage,
                                  ...prev.slice(idxInArr + 1)
                                ]);
                              }}
                              title='Добавить этап'
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                          <label className='text-foreground text-sm font-medium'>
                            Название этапа
                          </label>
                          <Input
                            value={stage.name}
                            onChange={(e) =>
                              handleStageChange(
                                stage.id,
                                'name',
                                e.target.value
                              )
                            }
                            placeholder='Название этапа'
                            className='text-foreground bg-background h-10 text-base'
                          />
                        </div>
                        <div className='flex flex-col gap-2'>
                          <label className='text-foreground text-sm font-medium'>
                            Промпт для ассистента
                          </label>
                          <textarea
                            value={stage.prompt}
                            onChange={(e) =>
                              handleStageChange(
                                stage.id,
                                'prompt',
                                e.target.value
                              )
                            }
                            placeholder='Промпт для ассистента'
                            className='text-foreground bg-background min-h-[70px] w-full rounded border p-2 text-base'
                          />
                        </div>
                        {/* Аккордеон для follow-up */}
                        <div>
                          <div
                            className='text-primary mb-2 flex cursor-pointer items-center gap-1 text-xs font-medium select-none'
                            onClick={() =>
                              setShowFollowup((s) => ({
                                ...s,
                                [stage.id]: !s[stage.id]
                              }))
                            }
                          >
                            <span>
                              {isAccordionOpen
                                ? 'Скрыть Follow-up (в мин)'
                                : 'Настроить Follow-up (в мин)'}
                            </span>
                            <span
                              className={`transition-transform ${isAccordionOpen ? 'rotate-90' : ''}`}
                            >
                              ▶
                            </span>
                          </div>
                          {isAccordionOpen && (
                            <div>
                              <div className='flex flex-wrap items-center gap-2'>
                                <div className='bg-muted flex flex-row flex-wrap gap-0 rounded border px-1 py-1'>
                                  {stage.followups.slice(0, 3).map((f, j) => (
                                    <div key={j} className='flex items-center'>
                                      <Input
                                        type='number'
                                        min={1}
                                        max={300}
                                        value={f}
                                        onChange={(e) =>
                                          handleFollowupChange(
                                            stage.id,
                                            j,
                                            Math.max(
                                              1,
                                              Math.min(
                                                300,
                                                Number(e.target.value)
                                              )
                                            )
                                          )
                                        }
                                        className='text-foreground bg-background h-8 w-14 rounded-none border-none text-sm focus:ring-0'
                                      />
                                      {stage.followups.length > 1 && (
                                        <Button
                                          size='icon'
                                          variant='ghost'
                                          onClick={() =>
                                            handleRemoveFollowup(stage.id, j)
                                          }
                                          title='Удалить интервал'
                                          className='rounded-none border-l px-0 text-base'
                                        >
                                          -
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                {stage.followups.length < 3 && (
                                  <Button
                                    size='icon'
                                    variant='outline'
                                    onClick={() => handleAddFollowup(stage.id)}
                                    title='Добавить интервал'
                                    className='px-1 text-base'
                                  >
                                    +
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              <div className='mt-8 flex gap-2'>
                <Button
                  onClick={handleAddFunnel}
                  className='btn btn-primary px-6 py-2 text-base'
                >
                  Добавить
                </Button>
                <Button
                  onClick={() => setAddModalOpen(false)}
                  className='btn btn-secondary px-6 py-2 text-base'
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
