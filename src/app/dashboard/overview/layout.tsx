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

  // Добавление новой воронки (локально, для примера)
  const handleAddFunnel = () => {
    if (newFunnelName.trim()) {
      const newFunnel = {
        id: Date.now().toString(),
        name: newFunnelName.trim()
      };
      const updatedFunnels = [newFunnel, ...funnels];
      localStorage.setItem('funnels', JSON.stringify(updatedFunnels));
      localStorage.setItem('currentFunnel', JSON.stringify(newFunnel));
      setNewFunnelName('');
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
            <div className='rounded bg-white p-4 shadow'>
              <Input
                value={newFunnelName}
                onChange={(e) => setNewFunnelName(e.target.value)}
                placeholder='Название воронки'
                className='mb-2 w-full border p-2'
              />
              <div className='flex gap-2'>
                <button onClick={handleAddFunnel} className='btn btn-primary'>
                  Добавить
                </button>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className='btn btn-secondary'
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
