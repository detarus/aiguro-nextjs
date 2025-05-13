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
import React, { useState } from 'react';
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
  const [selectedFunnel, setSelectedFunnel] = useState('funnel1');
  const [showPercentage, setShowPercentage] = useState(false);

  // Данные для карточек конверсии
  const conversionData = [
    { absolute: 1250, percentage: 82, stage: '1/4' },
    { absolute: 1024, percentage: 66, stage: '2/4' },
    { absolute: 678, percentage: 42, stage: '3/4' },
    { absolute: 45, percentage: 70, stage: '4/4' }
  ];

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex flex-col items-center justify-between gap-4 pt-2 pb-2 sm:flex-row'>
          <div className='flex items-center gap-4 self-start'>
            <h2 className='ml-1 text-xl font-semibold text-gray-800'>
              Дашборд
            </h2>
            <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
              <SelectTrigger className='h-8 w-[180px] text-sm'>
                <SelectValue>
                  {selectedFunnel === 'funnel1' ? 'Воронка 1' : 'Воронка 2'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='funnel1'>Воронка 1</SelectItem>
                <SelectItem value='funnel2'>Воронка 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex items-center space-x-2'>
              <Label htmlFor='show-percentage' className='text-sm'>
                Проценты
              </Label>
              <Switch
                id='show-percentage'
                checked={showPercentage}
                onCheckedChange={setShowPercentage}
              />
            </div>
            <div className='flex items-center overflow-hidden rounded-md border shadow-sm'>
              {[
                { id: 'today', label: 'Сегодня' },
                { id: 'week', label: 'За неделю' },
                { id: 'month', label: 'За месяц' },
                { id: 'quarter', label: 'За квартал' },
                { id: 'period', label: 'За период' }
              ].map((filter) => (
                <Button
                  key={filter.id}
                  variant='ghost'
                  className={cn(
                    'h-8 rounded-none border-r px-4 text-sm font-medium last:border-r-0',
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
          </div>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-3 lg:grid-cols-5'>
          {conversionData.map((data, index) => (
            <Card key={index} className='@container/card'>
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
                  <Badge variant='outline'>
                    <IconTrendingUp />
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
                <div className='text-muted-foreground'>
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
            <IconPlus className='text-muted-foreground size-12' />
          </Card>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3'>
            {/* sales arallel routes */}
            {sales}
          </div>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
