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
import { IconKey, IconCopy, IconRefresh, IconTrash } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageContainer } from '@/components/ui/page-container';

export default function ApiKeysPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContainer scrollable={true}>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>API Keys</h1>
            <p className='text-muted-foreground'>
              Управление ключами API для интеграции с внешними сервисами
            </p>
          </div>

          <div className='flex justify-end'>
            <Button>Создать новый ключ</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Активные ключи API</CardTitle>
              <CardDescription>
                Список ваших ключей API и токенов доступа
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {[
                  {
                    name: 'Основной API ключ',
                    created: '15.05.2023',
                    expires: 'Никогда',
                    status: 'Активный'
                  },
                  {
                    name: 'Тестовый ключ разработки',
                    created: '02.06.2023',
                    expires: '02.06.2024',
                    status: 'Активный'
                  },
                  {
                    name: 'Интеграция с CRM',
                    created: '10.07.2023',
                    expires: '10.07.2024',
                    status: 'Активный'
                  },
                  {
                    name: 'Резервный ключ',
                    created: '22.08.2023',
                    expires: 'Никогда',
                    status: 'Неактивный'
                  }
                ].map((key, i) => (
                  <div
                    key={i}
                    className='flex flex-col space-y-3 rounded-lg border p-4 sm:flex-row sm:space-y-0 sm:space-x-4'
                  >
                    <div className='flex items-center justify-center'>
                      <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                        <IconKey className='text-primary h-5 w-5' />
                      </div>
                    </div>
                    <div className='flex-1 space-y-1'>
                      <div className='flex items-center'>
                        <h3 className='font-medium'>{key.name}</h3>
                        <Badge
                          variant={
                            key.status === 'Активный' ? 'default' : 'secondary'
                          }
                          className='ml-2'
                        >
                          {key.status}
                        </Badge>
                      </div>
                      <div className='text-muted-foreground text-sm'>
                        {i === 0 ? (
                          <span>
                            sk_live_********************************************
                          </span>
                        ) : i === 1 ? (
                          <span>
                            sk_test_*******************************************
                          </span>
                        ) : i === 2 ? (
                          <span>
                            int_crm_*******************************************
                          </span>
                        ) : (
                          <span>
                            sk_backup_****************************************
                          </span>
                        )}
                      </div>
                      <div className='text-muted-foreground flex gap-4 text-xs'>
                        <span>Создан: {key.created}</span>
                        <span>Истекает: {key.expires}</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button variant='outline' size='icon'>
                        <IconCopy className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='icon'>
                        <IconRefresh className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='icon'>
                        <IconTrash className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Документация API</CardTitle>
              <CardDescription>
                Руководство по использованию API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-base'>Начало работы</CardTitle>
                  </CardHeader>
                  <CardContent className='text-sm'>
                    <p>Базовая информация для начала работы с API</p>
                    <Button variant='link' className='px-0'>
                      Узнать больше
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-base'>Справочник API</CardTitle>
                  </CardHeader>
                  <CardContent className='text-sm'>
                    <p>Полная документация по всем эндпоинтам</p>
                    <Button variant='link' className='px-0'>
                      Узнать больше
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-base'>Примеры кода</CardTitle>
                  </CardHeader>
                  <CardContent className='text-sm'>
                    <p>Готовые примеры интеграций на разных языках</p>
                    <Button variant='link' className='px-0'>
                      Узнать больше
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </Suspense>
  );
}
