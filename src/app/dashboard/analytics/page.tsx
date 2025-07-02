'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import {
  IconCalendar,
  IconTrendingUp,
  IconReport,
  IconDownload,
  IconRefresh,
  IconEye,
  IconClock
} from '@tabler/icons-react';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/hooks/useFunnels';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

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
  const { currentFunnel } = useFunnels(backendOrgId);

  // Состояния
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Моковые данные для демонстрации
  const [budgetMetrics] = useState<MetricData[]>([
    { label: 'Общий бюджет', value: '₽450,000', change: 12.5, trend: 'up' },
    { label: 'Потрачено', value: '₽287,500', change: 8.3, trend: 'up' },
    { label: 'Остаток', value: '₽162,500', change: -5.2, trend: 'down' },
    {
      label: 'CPL (стоимость лида)',
      value: '₽1,250',
      change: -3.1,
      trend: 'down'
    }
  ]);

  const [conversionMetrics] = useState<MetricData[]>([
    { label: 'Общий CR', value: '18.5%', change: 2.1, trend: 'up' },
    {
      label: 'Лиды → Квалифицированные',
      value: '45.2%',
      change: 1.8,
      trend: 'up'
    },
    {
      label: 'Квалифицированные → Продажи',
      value: '32.7%',
      change: -1.2,
      trend: 'down'
    },
    { label: 'Средний чек', value: '₽12,500', change: 5.5, trend: 'up' }
  ]);

  const [funnelStages] = useState<FunnelStageData[]>([
    {
      stage: 'Привлечение',
      conversions: 1250,
      totalLeads: 1250,
      conversionRate: 100,
      avgTimeToConvert: '0m'
    },
    {
      stage: 'Квалификация',
      conversions: 565,
      totalLeads: 1250,
      conversionRate: 45.2,
      avgTimeToConvert: '15m'
    },
    {
      stage: 'Презентация',
      conversions: 312,
      totalLeads: 565,
      conversionRate: 55.2,
      avgTimeToConvert: '2.5h'
    },
    {
      stage: 'Закрытие',
      conversions: 102,
      totalLeads: 312,
      conversionRate: 32.7,
      avgTimeToConvert: '18h'
    }
  ]);

  const [realtimeAnalytics] = useState<SmartAnalyticsData>({
    messagesProcessed: 1247,
    lastUpdate: 'только что',
    insights: [
      'Увеличение активности в вечернее время (18:00-21:00)',
      'Высокий отклик на предложения со скидкой 15%',
      'Снижение конверсии на этапе презентации на 3.2%'
    ],
    predictions: [
      'Ожидается увеличение лидов на 12% в ближайшие 3 дня',
      'Прогнозируемая конверсия на следующей неделе: 19.8%',
      'Рекомендуется увеличить бюджет на 8% для максимизации результата'
    ],
    recommendations: [
      'Оптимизировать скрипты презентации для увеличения CR',
      'Добавить автоматические follow-up сообщения через 2 часа',
      'Внедрить персонализацию на основе времени активности клиента'
    ]
  });

  const [periodAnalytics] = useState<SmartAnalyticsData>({
    messagesProcessed: 15680,
    lastUpdate: '2 часа назад',
    insights: [
      'Лучшие дни недели для конверсии: вторник и четверг',
      'Среднее время ответа клиентов: 4.2 минуты',
      'Пиковая активность: 10:00-12:00 и 19:00-21:00'
    ],
    predictions: [
      'Месячная цель по лидам будет превышена на 15%',
      'Ожидаемый рост конверсии к концу месяца: +8.5%',
      'Прогноз выручки на следующий месяц: ₽2,850,000'
    ],
    recommendations: [
      'Перераспределить рекламный бюджет на лучшие дни недели',
      'Настроить автоматические напоминания в пиковые часы',
      'Создать специальные предложения для вечернего времени'
    ]
  });

  // Функции
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    setIsLoading(true);
    // Имитация загрузки данных
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setLastUpdated(new Date());
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handleGenerateReport = () => {
    // Логика генерации отчета
    console.log('Генерация отчета за период:', selectedPeriod);
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '→';
  };

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Заголовок и управление */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>Аналитика</h1>
            <p className='text-muted-foreground'>
              Детальная аналитика воронки и Smart-анализ в реальном времени
            </p>
          </div>

          <div className='flex flex-col gap-2 md:flex-row md:items-center'>
            {/* Выбор периода */}
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className='w-[180px]'>
                <IconCalendar className='mr-2 h-4 w-4' />
                <SelectValue placeholder='Выберите период' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='1d'>Последний день</SelectItem>
                <SelectItem value='7d'>Последние 7 дней</SelectItem>
                <SelectItem value='30d'>Последние 30 дней</SelectItem>
                <SelectItem value='90d'>Последние 90 дней</SelectItem>
                <SelectItem value='custom'>Настраиваемый период</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant='outline'
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <IconRefresh
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Обновить
            </Button>

            <Button onClick={handleGenerateReport}>
              <IconReport className='mr-2 h-4 w-4' />
              Отчеты
            </Button>
          </div>
        </div>

        {/* Метка последнего обновления */}
        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
          <IconClock className='h-4 w-4' />
          Последнее обновление: {lastUpdated.toLocaleTimeString('ru-RU')}
        </div>

        {/* Основные блоки в две колонки */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Блок калькуляции */}
          <Card className='h-fit'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconTrendingUp className='h-5 w-5' />
                Калькуляция данных воронки
              </CardTitle>
              <CardDescription>
                Ключевые показатели эффективности по выбранному периоду
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Бюджетные метрики */}
              <div>
                <h3 className='mb-4 text-lg font-semibold'>Бюджет и затраты</h3>
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
                  Конверсии и продажи
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
                      <h3 className='text-lg font-semibold'>
                        Анализ в реальном времени
                      </h3>
                      <p className='text-muted-foreground text-sm'>
                        Обновляется после каждого нового сообщения
                      </p>
                    </div>
                    <Badge variant='default'>
                      {realtimeAnalytics.messagesProcessed} сообщений обработано
                    </Badge>
                  </div>

                  <div className='grid grid-cols-1 gap-4'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-base'>Инсайты</CardTitle>
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
                        <CardTitle className='text-base'>Прогнозы</CardTitle>
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
                      <h3 className='text-lg font-semibold'>
                        Анализ по периодам
                      </h3>
                      <p className='text-muted-foreground text-sm'>
                        Глубокий анализ отдельным агентом по выбранному периоду
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
              Анализ этапов воронки
            </CardTitle>
            <CardDescription>
              Детальная статистика по каждому этапу воронки продаж
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {funnelStages.map((stage, index) => (
                <Card key={index}>
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
                          Конверсии
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
    </PageContainer>
  );
}
