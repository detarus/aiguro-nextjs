'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageSkeleton } from '@/components/page-skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { IconPhoneCall } from '@tabler/icons-react';
import { PageContainer } from '@/components/ui/page-container';

export default function VoicePage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabParam === 'outgoing' ? 'outgoing' : 'incoming'
  );

  // Update the tab when URL parameters change
  useEffect(() => {
    if (tabParam === 'outgoing' || tabParam === 'incoming') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContainer scrollable={true}>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Голосовые вызовы
            </h1>
            <p className='text-muted-foreground'>
              Управление входящими и исходящими голосовыми вызовами
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='grid w-full max-w-md grid-cols-2'>
              <TabsTrigger value='incoming'>Входящие</TabsTrigger>
              <TabsTrigger value='outgoing'>Исходящие</TabsTrigger>
            </TabsList>
            <TabsContent value='incoming' className='space-y-6 pt-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Входящие вызовы</CardTitle>
                  <CardDescription>
                    История и управление входящими вызовами
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className='flex items-start gap-4 rounded-lg border p-4'
                      >
                        <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                          <IconPhoneCall className='text-primary h-5 w-5' />
                        </div>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-medium'>
                              +7 (999) 123-45-6{i}
                            </h3>
                            <Badge
                              variant={i % 2 === 0 ? 'default' : 'destructive'}
                            >
                              {i % 2 === 0 ? 'Отвечен' : 'Пропущен'}
                            </Badge>
                            <span className='text-muted-foreground text-xs'>
                              {new Date().toLocaleTimeString()}
                            </span>
                          </div>
                          <p className='text-muted-foreground text-sm'>
                            Длительность: {i * 2 + 1}:3{i} мин
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Статистика вызовов</CardTitle>
                  <CardDescription>
                    Общая статистика по входящим вызовам
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>78</div>
                      <div className='text-muted-foreground text-sm'>
                        Всего за сегодня
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>92%</div>
                      <div className='text-muted-foreground text-sm'>
                        Отвечено
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>4.8 мин</div>
                      <div className='text-muted-foreground text-sm'>
                        Средняя длительность
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='outgoing' className='space-y-6 pt-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Исходящие вызовы</CardTitle>
                  <CardDescription>
                    История и управление исходящими вызовами
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className='flex items-start gap-4 rounded-lg border p-4'
                      >
                        <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                          <IconPhoneCall className='text-primary h-5 w-5' />
                        </div>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-medium'>
                              +7 (888) 765-43-2{i}
                            </h3>
                            <Badge variant={i !== 2 ? 'default' : 'secondary'}>
                              {i !== 2 ? 'Отвечен' : 'Не в сети'}
                            </Badge>
                            <span className='text-muted-foreground text-xs'>
                              {new Date().toLocaleDateString()}{' '}
                              {new Date().toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className='text-muted-foreground text-sm'>
                            {i !== 2
                              ? `Длительность: ${i * 3 + 2}:1${i} мин`
                              : 'Клиент не ответил'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Эффективность обзвона</CardTitle>
                  <CardDescription>
                    Статистика по исходящим вызовам
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>42</div>
                      <div className='text-muted-foreground text-sm'>
                        Всего за сегодня
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>76%</div>
                      <div className='text-muted-foreground text-sm'>
                        Успешных
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>12</div>
                      <div className='text-muted-foreground text-sm'>
                        Конверсий
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    </Suspense>
  );
}
