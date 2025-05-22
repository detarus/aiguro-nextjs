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
import Link from 'next/link';

export default function ManagementPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContainer scrollable={true}>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Управление воронкой
            </h1>
            <p className='text-muted-foreground'>
              Административная панель управления системой
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* <Card>
              <CardHeader>
                <CardTitle>Организация</CardTitle>
                <CardDescription>
                  Управление пользователями и их ролями в компании
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
                  <Button size='sm'>Перейти</Button>
                </div>
              </CardContent>
            </Card> */}

            <Card>
              <CardHeader>
                <CardTitle>Интеграции</CardTitle>
                <CardDescription>
                  Подключение и отключение месенджеров
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                      <IconAdjustments className='text-primary h-6 w-6' />
                    </div>
                    <div>
                      <h3 className='font-medium'>3 активных подключения</h3>
                      <p className='text-muted-foreground text-sm'>
                        Продажи, Поддержка, Маркетинг
                      </p>
                    </div>
                  </div>
                  <Link href='/dashboard/management/integrations'>
                    <Button size='sm'>Перейти</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle>Воронки</CardTitle>
                <CardDescription>
                  Настройка, активация и удаление воронок
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                      <IconAdjustments className='text-primary h-6 w-6' />
                    </div>
                    <div>
                      <h3 className='font-medium'>7 активных воронок</h3>
                      <p className='text-muted-foreground text-sm'>
                        Несколько воронок ожидают изменений
                      </p>
                    </div>
                  </div>
                  <Button size='sm'>Перейти</Button>
                </div>
              </CardContent>
            </Card> */}

            <Card>
              <CardHeader>
                <CardTitle>AI-ассистенты</CardTitle>
                <CardDescription>
                  Настройка и доработка ассистентов
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                      <IconAdjustments className='text-primary h-6 w-6' />
                    </div>
                    <div>
                      <h3 className='font-medium'>11 ассистентов</h3>
                      <p className='text-muted-foreground text-sm'>
                        Просмотр и редактирование
                      </p>
                    </div>
                  </div>
                  <Link href='/dashboard/management/ai-assistants/'>
                    <Button size='sm'>Перейти</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </Suspense>
  );
}
