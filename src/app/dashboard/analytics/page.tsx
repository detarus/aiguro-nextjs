'use client';

import { Suspense } from 'react';
import { PageSkeleton } from '@/components/page-skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown
} from '@tabler/icons-react';
import { PageContainer } from '@/components/ui/page-container';

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContainer scrollable={true}>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Аналитика</h1>
            <p className='text-muted-foreground'>
              Статистика и аналитика данных по всем направлениям
            </p>
          </div>

          <Tabs defaultValue='overview'>
            <TabsList className='grid w-full max-w-md grid-cols-3'>
              <TabsTrigger value='overview'>Обзор</TabsTrigger>
              <TabsTrigger value='sales'>Продажи</TabsTrigger>
              <TabsTrigger value='traffic'>Трафик</TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='space-y-6 pt-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                {[
                  {
                    title: 'Всего клиентов',
                    value: '2,543',
                    change: '+12.5%',
                    up: true
                  },
                  {
                    title: 'Выручка',
                    value: '₽ 845,290',
                    change: '+8.2%',
                    up: true
                  },
                  {
                    title: 'Конверсия',
                    value: '24.3%',
                    change: '-2.1%',
                    up: false
                  }
                ].map((stat, i) => (
                  <Card key={i}>
                    <CardHeader className='pb-2'>
                      <CardDescription>{stat.title}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>{stat.value}</div>
                      <div className='flex items-center pt-1 text-sm'>
                        {stat.up ? (
                          <IconTrendingUp className='mr-1 h-4 w-4 text-green-500' />
                        ) : (
                          <IconTrendingDown className='mr-1 h-4 w-4 text-red-500' />
                        )}
                        <span
                          className={
                            stat.up ? 'text-green-500' : 'text-red-500'
                          }
                        >
                          {stat.change}
                        </span>
                        <span className='text-muted-foreground ml-1'>
                          с прошлого месяца
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Трафик по каналам</CardTitle>
                  <CardDescription>
                    Распределение источников трафика за последние 30 дней
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {[
                      { name: 'Органический поиск', percent: 42, value: 1254 },
                      { name: 'Социальные сети', percent: 28, value: 845 },
                      { name: 'Email маркетинг', percent: 15, value: 458 },
                      { name: 'Реферальный', percent: 10, value: 312 },
                      { name: 'Прямой', percent: 5, value: 146 }
                    ].map((source, i) => (
                      <div key={i} className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>
                            {source.name}
                          </span>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm font-medium'>
                              {source.percent}%
                            </span>
                            <span className='text-muted-foreground text-sm'>
                              ({source.value})
                            </span>
                          </div>
                        </div>
                        <div className='bg-secondary h-2 w-full rounded-full'>
                          <div
                            className='bg-primary h-2 rounded-full'
                            style={{ width: `${source.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='sales' className='space-y-6 pt-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Продажи по периодам</CardTitle>
                  <CardDescription>
                    Динамика продаж за последние 6 месяцев
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex h-[350px] w-full items-end justify-between gap-2 py-4'>
                    {Array.from({ length: 6 }).map((_, i) => {
                      const height = 40 + Math.random() * 200;
                      return (
                        <div
                          key={i}
                          className='relative flex flex-col items-center'
                        >
                          <div
                            className='bg-primary w-16 rounded-t-md'
                            style={{ height: `${height}px` }}
                          ></div>
                          <div className='text-muted-foreground mt-2 text-sm'>
                            {['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'][i]}
                          </div>
                          <div className='absolute top-0 -translate-y-7 text-sm font-medium'>
                            ₽{Math.floor(height * 1000).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <Card>
                  <CardHeader>
                    <CardTitle>Лучшие продукты</CardTitle>
                    <CardDescription>
                      Самые продаваемые продукты за месяц
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {[
                      {
                        name: 'Консультация по SEO',
                        sales: 128,
                        revenue: '₽ 128,000'
                      },
                      {
                        name: 'Разработка сайта',
                        sales: 75,
                        revenue: '₽ 375,000'
                      },
                      {
                        name: 'Реклама в соцсетях',
                        sales: 64,
                        revenue: '₽ 96,000'
                      },
                      {
                        name: 'Email маркетинг',
                        sales: 42,
                        revenue: '₽ 84,000'
                      }
                    ].map((product, i) => (
                      <div
                        key={i}
                        className='flex items-center justify-between rounded-lg border p-3'
                      >
                        <div>
                          <div className='font-medium'>{product.name}</div>
                          <div className='text-muted-foreground text-sm'>
                            {product.sales} продаж
                          </div>
                        </div>
                        <div className='text-right font-medium'>
                          {product.revenue}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Продажи по регионам</CardTitle>
                    <CardDescription>
                      Географическое распределение продаж
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {[
                      { name: 'Москва', percent: 35, value: '₽ 295,000' },
                      {
                        name: 'Санкт-Петербург',
                        percent: 25,
                        value: '₽ 212,000'
                      },
                      { name: 'Екатеринбург', percent: 15, value: '₽ 127,000' },
                      { name: 'Новосибирск', percent: 10, value: '₽ 85,000' },
                      { name: 'Другие', percent: 15, value: '₽ 126,000' }
                    ].map((region, i) => (
                      <div key={i} className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>
                            {region.name}
                          </span>
                          <div className='text-sm font-medium'>
                            {region.percent}%
                          </div>
                        </div>
                        <div className='bg-secondary h-2 w-full rounded-full'>
                          <div
                            className='bg-primary h-2 rounded-full'
                            style={{ width: `${region.percent}%` }}
                          />
                        </div>
                        <div className='text-muted-foreground text-right text-sm'>
                          {region.value}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value='traffic' className='space-y-6 pt-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Посещаемость по дням</CardTitle>
                  <CardDescription>
                    Количество посещений сайта по дням недели
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex h-[350px] w-full items-end justify-between gap-2 py-4'>
                    {Array.from({ length: 7 }).map((_, i) => {
                      const height = 50 + Math.random() * 200;
                      return (
                        <div
                          key={i}
                          className='relative flex flex-col items-center'
                        >
                          <div
                            className='bg-primary w-16 rounded-t-md'
                            style={{ height: `${height}px` }}
                          ></div>
                          <div className='text-muted-foreground mt-2 text-sm'>
                            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i]}
                          </div>
                          <div className='absolute top-0 -translate-y-7 text-sm font-medium'>
                            {Math.floor(height * 5).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <Card>
                  <CardHeader>
                    <CardTitle>Основные страницы</CardTitle>
                    <CardDescription>
                      Самые посещаемые страницы сайта
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {[
                      { name: 'Главная страница', visits: 3254, bounce: '32%' },
                      { name: 'О компании', visits: 1845, bounce: '45%' },
                      { name: 'Услуги', visits: 1654, bounce: '38%' },
                      { name: 'Контакты', visits: 1235, bounce: '27%' },
                      { name: 'Блог', visits: 975, bounce: '42%' }
                    ].map((page, i) => (
                      <div
                        key={i}
                        className='flex items-center justify-between rounded-lg border p-3'
                      >
                        <div className='font-medium'>{page.name}</div>
                        <div className='flex items-center gap-4'>
                          <div className='text-muted-foreground text-sm'>
                            {page.visits} посещений
                          </div>
                          <div className='text-sm'>Отказы: {page.bounce}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Устройства</CardTitle>
                    <CardDescription>
                      Распределение посещений по типам устройств
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-3 gap-4'>
                      {[
                        { name: 'Мобильные', value: 58, icon: '📱' },
                        { name: 'Десктоп', value: 32, icon: '💻' },
                        { name: 'Планшеты', value: 10, icon: '📲' }
                      ].map((device, i) => (
                        <div
                          key={i}
                          className='flex flex-col items-center justify-center rounded-lg border p-6 text-center'
                        >
                          <div className='text-3xl'>{device.icon}</div>
                          <div className='mt-2 text-2xl font-bold'>
                            {device.value}%
                          </div>
                          <div className='text-muted-foreground text-sm'>
                            {device.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    </Suspense>
  );
}
