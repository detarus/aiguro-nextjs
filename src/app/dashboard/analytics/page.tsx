'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { IconTrendingUp, IconDownload, IconEye } from '@tabler/icons-react';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/contexts/FunnelsContext';
import { usePageHeaderContext } from '@/contexts/PageHeaderContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Area } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

// Интерфейсы для данных
interface MetricData {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

interface FunnelStageData {
  stage: string;
  conversions: number;
  totalLeads: number;
  conversionRate: number;
  avgTimeToConvert: string;
}

interface SmartAnalyticsData {
  messagesProcessed: number;
  lastUpdate: string;
  insights: string[];
  predictions: string[];
  recommendations: string[];
}

export default function AnalyticsPage() {
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;
  useFunnels(); // Подключаем хук для работы с воронками
  const { updateConfig } = usePageHeaderContext();

  // Состояния
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Моковые данные для демонстрации
  // Данные для воронки "Онлайн-образование"
  const [budgetMetrics] = useState<MetricData[]>([
    { label: 'Рекламный бюджет', value: '₽680,000', change: 18.7, trend: 'up' },
    { label: 'Потрачено', value: '₽425,600', change: 12.4, trend: 'up' },
    { label: 'Остаток', value: '₽254,400', change: -7.8, trend: 'down' },
    {
      label: 'Стоимость подписчика',
      value: '₽890',
      change: -4.2,
      trend: 'down'
    }
  ]);

  const [conversionMetrics] = useState<MetricData[]>([
    { label: 'Общий CR', value: '24.8%', change: 3.6, trend: 'up' },
    {
      label: 'Подписка → Пробный урок',
      value: '52.3%',
      change: 2.9,
      trend: 'up'
    },
    {
      label: 'Пробный урок → Оплата',
      value: '38.4%',
      change: -0.8,
      trend: 'down'
    },
    { label: 'Средний чек', value: '₽18,900', change: 8.2, trend: 'up' }
  ]);

  // Этапы воронки для онлайн-образования
  const [funnelStages] = useState<FunnelStageData[]>([
    {
      stage: 'Знакомство',
      conversions: 2850,
      totalLeads: 2850,
      conversionRate: 100,
      avgTimeToConvert: '0m'
    },
    {
      stage: 'Квалификация',
      conversions: 1490,
      totalLeads: 2850,
      conversionRate: 52.3,
      avgTimeToConvert: '45m'
    },
    {
      stage: 'Презентация',
      conversions: 1194,
      totalLeads: 1490,
      conversionRate: 80.1,
      avgTimeToConvert: '1д'
    },
    {
      stage: 'Закрытие',
      conversions: 458,
      totalLeads: 1194,
      conversionRate: 38.4,
      avgTimeToConvert: '3д'
    }
  ]);

  // Состояние для модального окна детальной статистики
  const [selectedStage, setSelectedStage] = useState<FunnelStageData | null>(
    null
  );
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);

  const [realtimeAnalytics] = useState<SmartAnalyticsData>({
    messagesProcessed: 1247,
    lastUpdate: 'только что',
    insights: [
      'Увеличение активности в вечернее время (18:00-21:00)',
      'Высокий отклик на предложения со скидкой 15%',
      'Снижение конверсии на этапе презентации на 3.2%',
      'Увеличение среднего чека на 11% за счет предложений со скидкой'
    ],
    predictions: [
      'Ожидается увеличение лидов на 12% в ближайшие 3 дня',
      'Прогнозируемая конверсия на следующей неделе: 19.8%',
      'Рекомендуется увеличить бюджет на 8% для максимизации результата',
      'Прогноз выручки на следующий месяц: ₽2,850,000'
    ],
    recommendations: [
      'Оптимизировать скрипты презентации для увеличения CR',
      'Добавить автоматические follow-up сообщения через 2 часа',
      'Внедрить персонализацию на основе времени активности клиента',
      'Увеличить средний чек на 10% за счет предложений со скидкой'
    ]
  });

  const [periodAnalytics] = useState<SmartAnalyticsData>({
    messagesProcessed: 15680,
    lastUpdate: '2 часа назад',
    insights: [
      'Лучшие дни недели для конверсии: вторник и четверг',
      'Среднее время ответа клиентов: 4.2 минуты',
      'Среднее LTV клиентов: 12000 рублей',
      'Пиковая активность: 10:00-12:00 и 19:00-21:00'
    ],
    predictions: [
      'Месячная цель по лидам будет превышена на 15%',
      'Ожидаемый рост конверсии к концу месяца: +8.5%',
      'Ожидаемый рост LTV клиентов: +10%',
      'Прогноз выручки на следующий месяц: ₽2,850,000'
    ],
    recommendations: [
      'Перераспределить рекламный бюджет на лучшие дни недели',
      'Настроить автоматические напоминания в пиковые часы',
      'Создать специальные предложения для вечернего времени',
      'Увеличить средний чек на 10% за счет предложений со скидкой'
    ]
  });

  // Данные для большого горизонтального графика
  const [analyticsChartData] = useState([
    { date: '1 нояб', leads: 245, conversions: 89, sales: 32, revenue: 480000 },
    {
      date: '2 нояб',
      leads: 312,
      conversions: 156,
      sales: 58,
      revenue: 725000
    },
    { date: '3 нояб', leads: 178, conversions: 67, sales: 23, revenue: 345000 },
    {
      date: '4 нояб',
      leads: 489,
      conversions: 234,
      sales: 89,
      revenue: 1235000
    },
    {
      date: '5 нояб',
      leads: 356,
      conversions: 189,
      sales: 76,
      revenue: 950000
    },
    {
      date: '6 нояб',
      leads: 421,
      conversions: 198,
      sales: 82,
      revenue: 1025000
    },
    {
      date: '7 нояб',
      leads: 298,
      conversions: 145,
      sales: 61,
      revenue: 762500
    },
    {
      date: '8 нояб',
      leads: 534,
      conversions: 267,
      sales: 105,
      revenue: 1312500
    },
    {
      date: '9 нояб',
      leads: 387,
      conversions: 201,
      sales: 89,
      revenue: 1112500
    },
    {
      date: '10 нояб',
      leads: 456,
      conversions: 234,
      sales: 98,
      revenue: 1225000
    },
    {
      date: '11 нояб',
      leads: 623,
      conversions: 324,
      sales: 134,
      revenue: 1675000
    },
    {
      date: '12 нояб',
      leads: 512,
      conversions: 289,
      sales: 121,
      revenue: 1512500
    },
    {
      date: '13 нояб',
      leads: 445,
      conversions: 223,
      sales: 94,
      revenue: 1175000
    },
    {
      date: '14 нояб',
      leads: 678,
      conversions: 367,
      sales: 156,
      revenue: 1950000
    }
  ]);

  const [activeMetric, setActiveMetric] = useState<
    'leads' | 'conversions' | 'sales' | 'revenue'
  >('leads');

  // Конфигурация для графика
  const chartConfig = {
    leads: {
      label: ' Лиды',
      color: '#3b82f6' // Синий
    },
    conversions: {
      label: 'Конверсии',
      color: '#10b981' // Зеленый
    },
    sales: {
      label: 'Продажи',
      color: '#f59e0b' // Оранжевый
    },
    revenue: {
      label: 'Доход',
      color: '#8b5cf6' // Фиолетовый
    }
  } satisfies ChartConfig;

  // Обработчики для TableHeader
  const handleTimeFilterChange = (period: string) => {
    setSelectedPeriod(period);
    setIsLoading(true);
    // Имитация загрузки данных
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handleSearch = (query: string) => {
    // Логика поиска
    console.log('Поиск:', query);
  };

  // Функции
  const handleGenerateReport = () => {
    // Логика генерации отчета
    console.log('Генерация отчета');
  };

  // Обработчик клика по этапу воронки
  const handleStageClick = (stage: FunnelStageData) => {
    setSelectedStage(stage);
    setIsStageModalOpen(true);
  };

  // Настройка конфигурации для TableHeader
  useEffect(() => {
    updateConfig({
      onTimeFilterChange: handleTimeFilterChange,
      onSearch: handleSearch,
      actions: {
        onExport: handleGenerateReport,
        onFilters: handleRefresh,
        onView: () => console.log('View'),
        onData: () => console.log('Data')
      }
    });
  }, [updateConfig]);

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '→';
  };

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Большой горизонтальный график с ключевыми метриками */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <IconTrendingUp className='h-5 w-5' />
                  Динамика ключевых показателей
                </CardTitle>
                <CardDescription>
                  Отслеживание эффективности воронки в реальном времени за
                  последние 14 дней
                </CardDescription>
              </div>

              {/* Переключатели метрик */}
              <div className='flex gap-2'>
                {(
                  Object.keys(chartConfig) as Array<keyof typeof chartConfig>
                ).map((key) => {
                  const total = analyticsChartData.reduce((acc, curr) => {
                    if (key === 'revenue') {
                      return acc + curr[key] / 1000; // Конвертируем в тысячи для отображения
                    }
                    return acc + curr[key];
                  }, 0);

                  return (
                    <Button
                      key={key}
                      variant={activeMetric === key ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setActiveMetric(key)}
                      className='relative flex h-auto flex-col gap-1 py-2'
                    >
                      <div
                        className='absolute top-2 left-2 h-2 w-2 rounded-full'
                        style={{ backgroundColor: chartConfig[key].color }}
                      />
                      <span className='pl-2 text-xs font-medium'>
                        {chartConfig[key].label}
                      </span>
                      <span className='text-lg font-bold'>
                        {key === 'revenue'
                          ? `₽${(total * 1000).toLocaleString()}`
                          : total.toLocaleString()}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className='h-[250px] w-full'>
              <LineChart
                data={analyticsChartData}
                margin={{
                  top: 20,
                  left: 12,
                  right: 12,
                  bottom: 20
                }}
              >
                <defs>
                  <linearGradient
                    id={`gradient-${activeMetric}`}
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop
                      offset='5%'
                      stopColor={chartConfig[activeMetric].color}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset='95%'
                      stopColor={chartConfig[activeMetric].color}
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                  stroke='#e2e8f0'
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey='date'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (activeMetric === 'revenue') {
                      return `₽${(value / 1000).toFixed(0)}k`;
                    }
                    return value.toString();
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className='w-[200px]'
                      formatter={(value, name) => {
                        const metricKey = name as keyof typeof chartConfig;
                        if (name === 'revenue') {
                          return [
                            `₽${Number(value).toLocaleString()}`,
                            chartConfig[metricKey]?.label
                          ];
                        }
                        return [
                          Number(value).toLocaleString(),
                          chartConfig[metricKey]?.label
                        ];
                      }}
                    />
                  }
                />
                <Area
                  type='monotone'
                  dataKey={activeMetric}
                  stroke='transparent'
                  fill={`url(#gradient-${activeMetric})`}
                  isAnimationActive={true}
                  animationDuration={800}
                />
                <Line
                  type='monotone'
                  dataKey={activeMetric}
                  stroke={chartConfig[activeMetric].color}
                  strokeWidth={4}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeDasharray=''
                  connectNulls={false}
                  isAnimationActive={true}
                  animationDuration={800}
                  dot={{
                    fill: chartConfig[activeMetric].color,
                    strokeWidth: 2,
                    stroke: chartConfig[activeMetric].color,
                    r: 6
                  }}
                  activeDot={{
                    r: 10,
                    stroke: chartConfig[activeMetric].color,
                    strokeWidth: 3,
                    fill: 'white'
                  }}
                />
              </LineChart>
            </ChartContainer>

            {/* Статистика под графиком */}
            <div className='mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-green-600'>+12.8%</p>
                <p className='text-muted-foreground text-sm'>Рост за период</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold'>6,034</p>
                <p className='text-muted-foreground text-sm'>Всего лидов</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold'>2,969</p>
                <p className='text-muted-foreground text-sm'>Конверсий</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold'>₽14.5M</p>
                <p className='text-muted-foreground text-sm'>Общий доход</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Основные блоки в две колонки */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Блок калькуляции */}
          <Card className='h-fit'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconTrendingUp className='h-5 w-5' />
                Воронка продаж
              </CardTitle>
              <CardDescription>
                Ключевые показатели эффективности процесса продаж
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Бюджетные метрики */}
              <div>
                <h3 className='mb-4 text-lg font-semibold'>
                  Реклама и привлечение
                </h3>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {budgetMetrics.map((metric, index) => (
                    <Card key={index}>
                      <CardContent className='p-4'>
                        <div className='flex items-center justify-between'>
                          <p className='text-muted-foreground text-sm'>
                            {metric.label}
                          </p>
                          {metric.change && (
                            <Badge
                              variant={
                                metric.trend === 'up' ? 'default' : 'secondary'
                              }
                            >
                              {getTrendIcon(metric.trend)}{' '}
                              {Math.abs(metric.change)}%
                            </Badge>
                          )}
                        </div>
                        <p className='text-2xl font-bold'>{metric.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Метрики конверсии */}
              <div>
                <h3 className='mb-4 text-lg font-semibold'>
                  Обучение и монетизация
                </h3>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {conversionMetrics.map((metric, index) => (
                    <Card key={index}>
                      <CardContent className='p-4'>
                        <div className='flex items-center justify-between'>
                          <p className='text-muted-foreground text-sm'>
                            {metric.label}
                          </p>
                          {metric.change && (
                            <Badge
                              variant={
                                metric.trend === 'up' ? 'default' : 'secondary'
                              }
                            >
                              {getTrendIcon(metric.trend)}{' '}
                              {Math.abs(metric.change)}%
                            </Badge>
                          )}
                        </div>
                        <p className='text-2xl font-bold'>{metric.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart-аналитика */}
          <Card className='h-fit'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconEye className='h-5 w-5' />
                Smart-аналитика
              </CardTitle>
              <CardDescription>
                Искусственный интеллект анализирует данные и предоставляет
                инсайты
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue='realtime' className='w-full'>
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='realtime'>В реальном времени</TabsTrigger>
                  <TabsTrigger value='periodic'>Временные периоды</TabsTrigger>
                </TabsList>

                <TabsContent value='realtime' className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='pt-4 text-lg font-semibold'>
                        Анализ в реальном времени
                      </h3>
                      <p className='text-muted-foreground text-sm'>
                        Обновляется после каждого нового сообщения
                      </p>
                    </div>
                    <Badge variant='default'>
                      {realtimeAnalytics.messagesProcessed} заявок обработано
                    </Badge>
                  </div>

                  <div className='grid grid-cols-1 gap-4'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-base'>
                          Важные моменты
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-2'>
                          {realtimeAnalytics.insights.map((insight, index) => (
                            <li key={index} className='text-sm'>
                              • {insight}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='text-base'>Ожидания</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-2'>
                          {realtimeAnalytics.predictions.map(
                            (prediction, index) => (
                              <li key={index} className='text-sm'>
                                • {prediction}
                              </li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='text-base'>
                          Рекомендации
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-2'>
                          {realtimeAnalytics.recommendations.map(
                            (recommendation, index) => (
                              <li key={index} className='text-sm'>
                                • {recommendation}
                              </li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value='periodic' className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='pt-4 text-lg font-semibold'>
                        Анализ по периодам
                      </h3>
                      <p className='text-muted-foreground text-sm'>
                        Глубокий анализ по выбранному периоду
                      </p>
                    </div>
                    <Badge variant='secondary'>
                      Обновлено: {periodAnalytics.lastUpdate}
                    </Badge>
                  </div>

                  <div className='grid grid-cols-1 gap-4'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-base'>Инсайты</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-2'>
                          {periodAnalytics.insights.map((insight, index) => (
                            <li key={index} className='text-sm'>
                              • {insight}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='text-base'>Прогнозы</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-2'>
                          {periodAnalytics.predictions.map(
                            (prediction, index) => (
                              <li key={index} className='text-sm'>
                                • {prediction}
                              </li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='text-base'>
                          Рекомендации
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-2'>
                          {periodAnalytics.recommendations.map(
                            (recommendation, index) => (
                              <li key={index} className='text-sm'>
                                • {recommendation}
                              </li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Анализ этапов воронки - отдельный блок на всю ширину */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconTrendingUp className='h-5 w-5' />
              Анализ этапов воронки продаж
            </CardTitle>
            <CardDescription>
              Кликните на любой этап для просмотра детальной аналитики и
              рекомендаций
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {funnelStages.map((stage, index) => (
                <Card
                  key={index}
                  className='hover:bg-primary/5 hover:border-primary/30 cursor-pointer border-2 transition-all duration-200 hover:shadow-lg'
                  onClick={() => handleStageClick(stage)}
                >
                  <CardContent className='p-4'>
                    <div className='mb-2 flex items-center justify-between'>
                      <h4 className='font-medium'>{stage.stage}</h4>
                      <Badge variant='outline'>
                        {stage.conversionRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className='space-y-3'>
                      <div>
                        <p className='text-muted-foreground text-sm'>
                          Участников
                        </p>
                        <p className='text-lg font-semibold'>
                          {stage.conversions.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground text-sm'>
                          Среднее время
                        </p>
                        <p className='text-lg font-semibold'>
                          {stage.avgTimeToConvert}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground text-sm'>
                          Прогресс
                        </p>
                        <Progress
                          value={stage.conversionRate}
                          className='mt-1'
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Дополнительные действия */}
        <div className='flex justify-center'>
          <Button variant='outline' size='lg' onClick={handleGenerateReport}>
            <IconDownload className='mr-2 h-4 w-4' />
            Скачать подробный отчет
          </Button>
        </div>
      </div>

      {/* Модальное окно с детальной статистикой этапа */}
      <Dialog open={isStageModalOpen} onOpenChange={setIsStageModalOpen}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <IconTrendingUp className='h-5 w-5' />
              Детальная аналитика: {selectedStage?.stage}
            </DialogTitle>
            <DialogDescription>
              Подробная статистика и рекомендации по этапу воронки
            </DialogDescription>
          </DialogHeader>

          {selectedStage && (
            <div className='space-y-6'>
              {/* Основные метрики */}
              <div className='grid grid-cols-2 gap-4 lg:grid-cols-5'>
                <Card>
                  <CardContent className='p-4 text-center'>
                    <p className='text-2xl font-bold text-blue-600'>
                      {selectedStage.conversions.toLocaleString()}
                    </p>
                    <p className='text-muted-foreground text-sm'>
                      Всего участников
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4 text-center'>
                    <p className='text-2xl font-bold text-green-600'>
                      {selectedStage.conversionRate.toFixed(1)}%
                    </p>
                    <p className='text-muted-foreground text-sm'>
                      Коэффициент конверсии
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4 text-center'>
                    <p className='text-2xl font-bold text-orange-600'>
                      {selectedStage.avgTimeToConvert}
                    </p>
                    <p className='text-muted-foreground text-sm'>
                      Среднее время
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4 text-center'>
                    <p className='text-2xl font-bold text-purple-600'>
                      {(
                        selectedStage.totalLeads - selectedStage.conversions
                      ).toLocaleString()}
                    </p>
                    <p className='text-muted-foreground text-sm'>Потери</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4 text-center'>
                    <p className='text-2xl font-bold text-pink-600'>
                      ₽{(selectedStage.conversions * 850).toLocaleString()}
                    </p>
                    <p className='text-muted-foreground text-sm'>
                      Стоимость этапа
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Расширенная статистика */}
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>
                      Временная статистика
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Утро (6:00-12:00)</span>
                      <span className='font-semibold'>
                        {Math.floor(
                          selectedStage.conversions * 0.28
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm'>День (12:00-18:00)</span>
                      <span className='font-semibold'>
                        {Math.floor(
                          selectedStage.conversions * 0.35
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Вечер (18:00-24:00)</span>
                      <span className='font-semibold'>
                        {Math.floor(
                          selectedStage.conversions * 0.37
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='text-muted-foreground mt-2 text-xs'>
                      Пик активности:{' '}
                      {selectedStage.stage === 'Знакомство'
                        ? '19:00-21:00'
                        : selectedStage.stage === 'Квалификация'
                          ? '10:00-12:00'
                          : selectedStage.stage === 'Презентация'
                            ? '14:00-16:00'
                            : '20:00-22:00'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>География</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Москва</span>
                      <span className='font-semibold'>
                        {Math.floor(
                          selectedStage.conversions * 0.32
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Санкт-Петербург</span>
                      <span className='font-semibold'>
                        {Math.floor(
                          selectedStage.conversions * 0.18
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Регионы</span>
                      <span className='font-semibold'>
                        {Math.floor(
                          selectedStage.conversions * 0.5
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='text-muted-foreground mt-2 text-xs'>
                      Лучший CR в:{' '}
                      {selectedStage.stage === 'Знакомство'
                        ? 'Новосибирске (28.4%)'
                        : selectedStage.stage === 'Квалификация'
                          ? 'Казани (31.2%)'
                          : selectedStage.stage === 'Презентация'
                            ? 'Екатеринбурге (29.8%)'
                            : 'Краснодаре (33.1%)'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>Устройства</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Мобильные</span>
                      <span className='font-semibold'>
                        {Math.floor(
                          selectedStage.conversions * 0.67
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Десктоп</span>
                      <span className='font-semibold'>
                        {Math.floor(
                          selectedStage.conversions * 0.28
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Планшеты</span>
                      <span className='font-semibold'>
                        {Math.floor(
                          selectedStage.conversions * 0.05
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='text-muted-foreground mt-2 text-xs'>
                      Лучший CR:{' '}
                      {selectedStage.conversions > 1000
                        ? 'Десктоп (34.2%)'
                        : 'Мобильные (22.8%)'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Детальный анализ */}
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>
                      Аналитика поведения
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className='space-y-2 text-sm'>
                      {selectedStage.stage === 'Знакомство' && (
                        <>
                          <li>
                            • Основные источники: Яндекс Директ (42%), Google
                            Ads (28%), соцсети (30%)
                          </li>
                          <li>
                            • Средняя стоимость клика: ₽45 (Яндекс), ₽62
                            (Google)
                          </li>
                          <li>
                            • Лучшие ключевые слова: &quot;купить онлайн&quot;,
                            &quot;заказать доставку&quot;
                          </li>
                          <li>• Конверсия landing page: 18.4%</li>
                          <li>• Среднее время на сайте: 2 мин 34 сек</li>
                          <li>• Отказы: 67% (норма для холодного трафика)</li>
                        </>
                      )}
                      {selectedStage.stage === 'Квалификация' && (
                        <>
                          <li>
                            • Средняя длительность разговора: 8 мин 15 сек
                          </li>
                          <li>• 78% проходят базовую квалификацию</li>
                          <li>
                            • Основные возражения: цена (43%), сроки (28%),
                            доверие (19%)
                          </li>
                          <li>
                            • Эффективность скриптов: A/B тест показал +12% CR
                          </li>
                          <li>
                            • Лучшее время звонков: 10:00-12:00, 14:00-16:00
                          </li>
                          <li>
                            • Повторные звонки увеличивают конверсию на 23%
                          </li>
                        </>
                      )}
                      {selectedStage.stage === 'Презентация' && (
                        <>
                          <li>
                            • Средняя продолжительность презентации: 45 минут
                          </li>
                          <li>• Успешность онлайн vs офлайн: 42% vs 58%</li>
                          <li>
                            • Ключевые слайды: проблема (65% внимания), решение
                            (78%)
                          </li>
                          <li>• Интерактивность повышает конверсию на 15%</li>
                          <li>
                            • Оптимальное время: вторник-четверг, 14:00-17:00
                          </li>
                          <li>• Процент до конца презентации: 89%</li>
                        </>
                      )}
                      {selectedStage.stage === 'Закрытие' && (
                        <>
                          <li>• Среднее количество касаний до сделки: 5.8</li>
                          <li>
                            • Основные факторы закрытия: скидка (34%), срочность
                            (28%)
                          </li>
                          <li>• Время принятия решения: 2.3 дня в среднем</li>
                          <li>• Follow-up эффективность: +31% через 24 часа</li>
                          <li>
                            • Способы оплаты: карта (67%), рассрочка (23%), нал
                            (10%)
                          </li>
                          <li>• Средний чек: ₽18,750 (рост на 12% за месяц)</li>
                        </>
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>
                      Рекомендации по улучшению
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className='space-y-2 text-sm'>
                      {selectedStage.stage === 'Знакомство' && (
                        <>
                          <li>
                            🎯 Увеличить бюджет на Яндекс Директ (+25%) - лучший
                            ROAS
                          </li>
                          <li>
                            📱 Оптимизировать мобильную версию landing page
                          </li>
                          <li>
                            🔄 Настроить ретаргетинг для посетителей 30+ сек
                          </li>
                          <li>📊 A/B тестировать заголовки: +15% конверсии</li>
                          <li>⚡ Ускорить загрузку страницы до 2 сек</li>
                          <li>💬 Добавить онлайн-чат для горячих лидов</li>
                        </>
                      )}
                      {selectedStage.stage === 'Квалификация' && (
                        <>
                          <li>📞 Внедрить автозвонки в течение 5 минут</li>
                          <li>🎓 Обучить менеджеров работе с возражениями</li>
                          <li>
                            📋 Использовать CRM-скрипты для стандартизации
                          </li>
                          <li>⏰ Настроить callback в удобное время клиента</li>
                          <li>📈 Увеличить количество попыток до 5-7</li>
                          <li>
                            🎵 Добавить hold-музыку и информацию о компании
                          </li>
                        </>
                      )}
                      {selectedStage.stage === 'Презентация' && (
                        <>
                          <li>🖥️ Перевести больше презентаций в онлайн</li>
                          <li>
                            🎯 Фокус на проблемах клиента в первые 10 минут
                          </li>
                          <li>📊 Добавить интерактивные калькуляторы ROI</li>
                          <li>🎥 Подготовить видео-кейсы успешных проектов</li>
                          <li>📋 Создать чек-лист для идеальной презентации</li>
                          <li>⏱️ Сократить презентацию до 35 минут</li>
                        </>
                      )}
                      {selectedStage.stage === 'Закрытие' && (
                        <>
                          <li>
                            ⚡ Внедрить технику срочности (ограниченное
                            предложение)
                          </li>
                          <li>
                            💳 Добавить больше способов оплаты (PayPal, СБП)
                          </li>
                          <li>📞 Настроить follow-up цепочку на 7 дней</li>
                          <li>
                            🎁 Предложить бонусы при закрытии в день презентации
                          </li>
                          <li>📊 Внедрить CRM-аналитику по этапам сделки</li>
                          <li>
                            🤝 Обучить менеджеров техникам закрытия сделок
                          </li>
                        </>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Прогресс по времени */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>
                    Динамика за последние 7 дней
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-7 gap-2'>
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (6 - i));
                      const dayConversions = Math.floor(
                        selectedStage.conversions / 7 + Math.random() * 50 - 25
                      );
                      const dayRate = Math.floor(
                        selectedStage.conversionRate + Math.random() * 10 - 5
                      );

                      return (
                        <div
                          key={i}
                          className='rounded bg-gray-50 p-2 text-center'
                        >
                          <p className='text-muted-foreground text-xs'>
                            {date.toLocaleDateString('ru', {
                              weekday: 'short'
                            })}
                          </p>
                          <p className='font-semibold'>{dayConversions}</p>
                          <p className='text-xs text-green-600'>{dayRate}%</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Дополнительная аналитика */}
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>
                      Финансовые показатели
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Выручка этапа</span>
                      <span className='font-semibold text-green-600'>
                        ₽{(selectedStage.conversions * 1200).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Затраты на этап</span>
                      <span className='font-semibold text-red-600'>
                        ₽{(selectedStage.conversions * 320).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Маржинальность</span>
                      <span className='font-semibold text-blue-600'>73.3%</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm'>ROI этапа</span>
                      <span className='font-semibold text-purple-600'>
                        275%
                      </span>
                    </div>
                    <div className='text-muted-foreground mt-2 rounded bg-blue-50 p-2 text-xs'>
                      💡 Прогноз: при текущих трендах ожидается рост ROI на 12%
                      к концу месяца
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>Качество лидов</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Горячие лиды</span>
                      <span className='font-semibold text-red-500'>
                        {Math.floor(
                          selectedStage.conversions * 0.23
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Теплые лиды</span>
                      <span className='font-semibold text-orange-500'>
                        {Math.floor(
                          selectedStage.conversions * 0.45
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Холодные лиды</span>
                      <span className='font-semibold text-blue-500'>
                        {Math.floor(
                          selectedStage.conversions * 0.32
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Средний LTV</span>
                      <span className='font-semibold text-green-600'>
                        ₽
                        {(
                          18750 + Math.floor(Math.random() * 5000)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='text-muted-foreground mt-2 rounded bg-green-50 p-2 text-xs'>
                      📈 Качество лидов улучшилось на 18% по сравнению с прошлым
                      месяцем
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Прогнозы и целевые показатели */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>
                    Прогнозы и цели на месяц
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
                    <div className='rounded-lg bg-blue-50 p-4 text-center'>
                      <p className='text-lg font-bold text-blue-600'>
                        {Math.floor(
                          selectedStage.conversions * 1.15
                        ).toLocaleString()}
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        Прогноз участников
                      </p>
                      <p className='text-xs text-green-600'>+15% к текущему</p>
                    </div>
                    <div className='rounded-lg bg-green-50 p-4 text-center'>
                      <p className='text-lg font-bold text-green-600'>
                        {(selectedStage.conversionRate + 2.3).toFixed(1)}%
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        Целевая конверсия
                      </p>
                      <p className='text-xs text-blue-600'>+2.3% к текущей</p>
                    </div>
                    <div className='rounded-lg bg-purple-50 p-4 text-center'>
                      <p className='text-lg font-bold text-purple-600'>
                        ₽
                        {Math.floor(
                          (selectedStage.conversions * 1200 * 1.22) / 1000
                        ).toLocaleString()}
                        k
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        Прогноз выручки
                      </p>
                      <p className='text-xs text-green-600'>+22% к текущей</p>
                    </div>
                    <div className='rounded-lg bg-orange-50 p-4 text-center'>
                      <p className='text-lg font-bold text-orange-600'>
                        {Math.floor(85 + Math.random() * 10)}%
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        Вероятность цели
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        Основано на тренде
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
