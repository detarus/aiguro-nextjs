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
import { IconAdjustments } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/ui/page-container';

export default function ManagementPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContainer scrollable={true}>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Управление</h1>
            <p className='text-muted-foreground'>
              Административная панель управления системой
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Пользователи</CardTitle>
                <CardDescription>
                  Управление пользователями и ролями
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                      <IconAdjustments className='text-primary h-6 w-6' />
                    </div>
                    <div>
                      <h3 className='font-medium'>5 активных пользователей</h3>
                      <p className='text-muted-foreground text-sm'>
                        2 администратора, 3 оператора
                      </p>
                    </div>
                  </div>
                  <Button size='sm'>Управление</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Отделы</CardTitle>
                <CardDescription>Управление структурой отделов</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                      <IconAdjustments className='text-primary h-6 w-6' />
                    </div>
                    <div>
                      <h3 className='font-medium'>3 отдела</h3>
                      <p className='text-muted-foreground text-sm'>
                        Продажи, Поддержка, Маркетинг
                      </p>
                    </div>
                  </div>
                  <Button size='sm'>Управление</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Автоматизация</CardTitle>
                <CardDescription>
                  Настройка автоматических процессов
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                      <IconAdjustments className='text-primary h-6 w-6' />
                    </div>
                    <div>
                      <h3 className='font-medium'>7 активных сценариев</h3>
                      <p className='text-muted-foreground text-sm'>
                        Автоматизация рутинных задач
                      </p>
                    </div>
                  </div>
                  <Button size='sm'>Управление</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Мониторинг</CardTitle>
                <CardDescription>
                  Отслеживание системных событий
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                      <IconAdjustments className='text-primary h-6 w-6' />
                    </div>
                    <div>
                      <h3 className='font-medium'>Системные логи</h3>
                      <p className='text-muted-foreground text-sm'>
                        Просмотр и анализ логов системы
                      </p>
                    </div>
                  </div>
                  <Button size='sm'>Управление</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </Suspense>
  );
}
