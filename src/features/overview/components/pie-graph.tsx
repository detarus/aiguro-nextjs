'use client';

import * as React from 'react';
import { IconTrendingUp, IconArrowRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { useOverviewContext } from '@/contexts/OverviewContext';

// Fallback данные
const fallbackChartData = [
  { browser: 'chrome', visitors: 0, fill: 'var(--primary)' },
  { browser: 'safari', visitors: 0, fill: 'var(--primary-light)' },
  { browser: 'firefox', visitors: 0, fill: 'var(--primary-lighter)' },
  { browser: 'edge', visitors: 0, fill: 'var(--primary-dark)' },
  { browser: 'other', visitors: 0, fill: 'var(--primary-darker)' }
];

const chartConfig = {
  visitors: {
    label: 'Конверсий'
  },
  chrome: {
    label: 'Знакомство',
    color: 'var(--primary)'
  },
  safari: {
    label: 'Квалификация',
    color: 'var(--primary)'
  },
  firefox: {
    label: 'Презентаци',
    color: 'var(--primary)'
  },
  edge: {
    label: 'Закрытие',
    color: 'var(--primary)'
  },
  other: {
    label: 'Отказ',
    color: 'var(--primary-dark)'
  }
} satisfies ChartConfig;

export function PieGraph() {
  const router = useRouter();
  const { stageStats, totalDialogs, loading } = useOverviewContext();

  const handleNavigateToDialogs = () => {
    router.push('/dashboard/messengers');
  };

  // Создаем данные для графика на основе реальных данных
  const chartData = React.useMemo(() => {
    if (loading || !stageStats.length) {
      return fallbackChartData;
    }

    const browserKeys = ['chrome', 'safari', 'firefox', 'edge', 'other'];
    const fillColors = [
      'var(--primary)',
      'var(--primary-light)',
      'var(--primary-lighter)',
      'var(--primary-dark)',
      'var(--primary-darker)'
    ];

    return stageStats.slice(0, 5).map((stat, index) => ({
      browser: browserKeys[index] || 'other',
      visitors: stat.count,
      fill: fillColors[index] || 'var(--primary-darker)'
    }));
  }, [stageStats, loading]);

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, [chartData]);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Всего диалогов</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Общее число диалогов по сделкам за неделю
          </span>
          <span className='@[540px]/card:hidden'>Число диалогов</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[180px]'
        >
          <PieChart>
            <defs>
              {['chrome', 'safari', 'firefox', 'edge', 'other'].map(
                (browser, index) => (
                  <linearGradient
                    key={browser}
                    id={`fill${browser}`}
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop
                      offset='0%'
                      stopColor='var(--primary)'
                      stopOpacity={1 - index * 0.15}
                    />
                    <stop
                      offset='100%'
                      stopColor='var(--primary)'
                      stopOpacity={0.8 - index * 0.15}
                    />
                  </linearGradient>
                )
              )}
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData.map((item) => ({
                ...item,
                fill: `url(#fill${item.browser})`
              }))}
              dataKey='visitors'
              nameKey='browser'
              innerRadius={60}
              strokeWidth={2}
              stroke='var(--background)'
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Диалогов
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-3 text-sm'>
        <div className='flex w-full items-start justify-between gap-2'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 leading-none font-medium'>
              Общий рост превышает{' '}
              {((chartData[0].visitors / totalVisitors) * 100).toFixed(1)}%{' '}
              <IconTrendingUp className='h-4 w-4' />
            </div>
            <div className='text-muted-foreground leading-none'>
              Основано на данных 11 Мая - 15 Мая 2025
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={handleNavigateToDialogs}
            className='flex items-center gap-2'
          >
            К диалогам
            <IconArrowRight className='h-4 w-4' />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
