'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { useOverviewContext } from '@/contexts/OverviewContext';

export const description = 'An interactive bar chart';

// Моковые данные используются как fallback
const fallbackChartData = [
  { stage: 'Квалификация', desktop: 0, mobile: 0 },
  { stage: 'Презентация', desktop: 0, mobile: 0 },
  { stage: 'Переговоры', desktop: 0, mobile: 0 },
  { stage: 'Закрытие', desktop: 0, mobile: 0 },
  { stage: 'Отказ', desktop: 0, mobile: 0 }
];

const chartConfig = {
  views: {
    label: 'Конверсий'
  },
  desktop: {
    label: 'Диалоги',
    color: 'var(--primary)'
  },
  mobile: {
    label: 'Голосовые',
    color: 'var(--primary)'
  },
  error: {
    label: 'Ошибка',
    color: 'var(--primary)'
  }
} satisfies ChartConfig;

export function BarGraph() {
  const { searchQuery, stageStats, loading } = useOverviewContext();
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('desktop');

  // Создаем данные для графика на основе реальных данных
  const chartData = React.useMemo(() => {
    if (loading || !stageStats.length) {
      return fallbackChartData;
    }

    return stageStats.map((stat) => ({
      stage: stat.name,
      desktop: stat.count,
      mobile: Math.floor(stat.count * 0.7) // Примерное соотношение для голосовых
    }));
  }, [stageStats, loading]);

  const filteredData = React.useMemo(() => {
    if (!searchQuery) return chartData;
    return chartData.filter((item) =>
      item.stage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, chartData]);

  const total = React.useMemo(
    () => ({
      desktop: filteredData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: filteredData.reduce((acc, curr) => acc + curr.mobile, 0)
    }),
    [filteredData]
  );

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (activeChart === 'error') {
      throw new Error('Mocking Error');
    }
  }, [activeChart]);

  if (!isClient) {
    return null;
  }

  return (
    <Card className='@container/card !pt-3'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 !py-0'>
          <CardTitle>Сделки с клиентами</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>
              Всего за последнюю неделю
            </span>
            <span className='@[540px]/card:hidden'>За неделю</span>
          </CardDescription>
        </div>
        <div className='flex'>
          {['desktop', 'mobile', 'error'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            if (!chart || total[key as keyof typeof total] === 0) return null;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className='data-[active=true]:bg-primary/5 hover:bg-primary/5 relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left transition-colors duration-200 even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
                onClick={() => setActiveChart(chart)}
              >
                <span className='text-muted-foreground text-xs'>
                  {chartConfig[chart].label}
                </span>
                <span className='text-lg leading-none font-bold sm:text-3xl'>
                  {total[key as keyof typeof total]?.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart
            data={filteredData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillBar' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='0%'
                  stopColor='var(--primary)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='100%'
                  stopColor='var(--primary)'
                  stopOpacity={0.2}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='stage'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                if (typeof value === 'string') {
                  return value.slice(0, 3);
                }
                return value;
              }}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey='views'
                  labelFormatter={(value) => {
                    return value;
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill='url(#fillBar)' radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
