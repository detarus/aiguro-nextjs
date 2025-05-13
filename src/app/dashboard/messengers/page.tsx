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
import { IconMessage } from '@tabler/icons-react';
import { PageContainer } from '@/components/ui/page-container';

export default function MessengersPage() {
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
            <h1 className='text-3xl font-bold tracking-tight'>Мессенджеры</h1>
            <p className='text-muted-foreground'>
              Управление сообщениями из различных мессенджеров
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
                  <CardTitle>Входящие сообщения</CardTitle>
                  <CardDescription>
                    Управление всеми входящими сообщениями
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className='flex items-start gap-4 rounded-lg border p-4'
                      >
                        <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                          <IconMessage className='text-primary h-5 w-5' />
                        </div>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-medium'>Клиент #{i}</h3>
                            <Badge variant='outline'>WhatsApp</Badge>
                            <span className='text-muted-foreground text-xs'>
                              {new Date().toLocaleTimeString()}
                            </span>
                          </div>
                          <p className='text-muted-foreground text-sm'>
                            Здравствуйте, у меня возник вопрос по поводу ваших
                            услуг...
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Статистика обращений</CardTitle>
                  <CardDescription>
                    Статистика по входящим сообщениям
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>124</div>
                      <div className='text-muted-foreground text-sm'>
                        Всего за сегодня
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>98%</div>
                      <div className='text-muted-foreground text-sm'>
                        Отвечено
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>3.2 мин</div>
                      <div className='text-muted-foreground text-sm'>
                        Среднее время ответа
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='outgoing' className='space-y-6 pt-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Исходящие сообщения</CardTitle>
                  <CardDescription>
                    Управление всеми исходящими сообщениями
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
                          <IconMessage className='text-primary h-5 w-5' />
                        </div>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-medium'>Рассылка #{i}</h3>
                            <Badge variant='outline'>Telegram</Badge>
                            <span className='text-muted-foreground text-xs'>
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>
                          <p className='text-muted-foreground text-sm'>
                            Уважаемые клиенты! Сообщаем о новых услугах в нашей
                            компании...
                          </p>
                          <div className='flex gap-2 text-xs'>
                            <span>Отправлено: 145</span>
                            <span>Доставлено: 142</span>
                            <span>Прочитано: 98</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Статистика рассылок</CardTitle>
                  <CardDescription>
                    Эффективность исходящих сообщений
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>14</div>
                      <div className='text-muted-foreground text-sm'>
                        Активных кампаний
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>1,245</div>
                      <div className='text-muted-foreground text-sm'>
                        Отправлено за месяц
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>18%</div>
                      <div className='text-muted-foreground text-sm'>
                        Средний отклик
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
