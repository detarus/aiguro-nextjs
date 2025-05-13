'use client';

import { Suspense } from 'react';
import { PageSkeleton } from '@/components/page-skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  IconBuildingStore,
  IconPlus,
  IconSearch,
  IconFilter
} from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { PageContainer } from '@/components/ui/page-container';

export default function CRMPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContainer scrollable={true}>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>CRM</h1>
            <p className='text-muted-foreground'>
              Управление взаимоотношениями с клиентами
            </p>
          </div>

          <div className='flex items-center justify-between'>
            <div className='relative max-w-sm flex-1'>
              <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
              <Input
                type='search'
                placeholder='Поиск контактов...'
                className='w-full pl-8'
              />
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm'>
                <IconFilter className='mr-2 h-4 w-4' />
                Фильтры
              </Button>
              <Button size='sm'>
                <IconPlus className='mr-2 h-4 w-4' />
                Новый контакт
              </Button>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle>Сделки</CardTitle>
                <CardDescription>Активные и завершенные сделки</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-4'>
                  {['Новая', 'В процессе', 'Завершена', 'Отменена'].map(
                    (status, i) => (
                      <div
                        key={status}
                        className='flex items-center justify-between rounded-lg border p-3'
                      >
                        <div className='flex items-center gap-2'>
                          <div
                            className={`h-2 w-2 rounded-full ${
                              i === 0
                                ? 'bg-blue-500'
                                : i === 1
                                  ? 'bg-yellow-500'
                                  : i === 2
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                            }`}
                          />
                          <span>{status}</span>
                        </div>
                        <Badge variant='outline'>{12 - i * 3}</Badge>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant='outline' className='w-full'>
                  Все сделки
                </Button>
              </CardFooter>
            </Card>

            <Card className='md:col-span-2'>
              <CardHeader>
                <CardTitle>Последние контакты</CardTitle>
                <CardDescription>
                  Недавно добавленные или обновленные контакты
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className='flex items-start justify-between rounded-lg border p-3'
                  >
                    <div className='flex items-start gap-3'>
                      <Avatar>
                        <AvatarImage
                          src={`https://api.slingacademy.com/public/sample-users/${i + 1}.png`}
                        />
                        <AvatarFallback>
                          {['ИП', 'АО', 'ООО', 'ЗАО', 'ИК'][i][0]}
                          {['К', 'С', 'Т', 'М', 'Д'][i][0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className='font-medium'>
                          {
                            [
                              'ИП Иванов',
                              'АО "Сигма"',
                              'ООО "ТехСтрой"',
                              'ЗАО "МегаПром"',
                              'ИК "Дельта"'
                            ][i]
                          }
                        </h3>
                        <p className='text-muted-foreground text-sm'>
                          {
                            [
                              '+7 (123) 456-7890',
                              '+7 (234) 567-8901',
                              '+7 (345) 678-9012',
                              '+7 (456) 789-0123',
                              '+7 (567) 890-1234'
                            ][i]
                          }
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <Badge
                        variant={
                          i === 0
                            ? 'default'
                            : i === 1
                              ? 'secondary'
                              : i === 2
                                ? 'outline'
                                : i === 3
                                  ? 'destructive'
                                  : 'outline'
                        }
                      >
                        {
                          [
                            'Новый',
                            'Активный',
                            'Постоянный',
                            'Неактивный',
                            'Потенциальный'
                          ][i]
                        }
                      </Badge>
                      <p className='text-muted-foreground mt-1 text-xs'>
                        Последнее обновление:{' '}
                        {new Date(
                          Date.now() - i * 86400000
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant='outline' className='w-full'>
                  Все контакты
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Воронка продаж</CardTitle>
              <CardDescription>
                Статистика конверсии по этапам продаж
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {[
                  'Первый контакт',
                  'Квалификация',
                  'Презентация',
                  'Предложение',
                  'Закрытие'
                ].map((stage, i) => (
                  <div key={stage} className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>{stage}</span>
                      <span className='text-muted-foreground text-sm'>
                        {100 - i * 15}%
                      </span>
                    </div>
                    <div className='bg-secondary h-2 w-full rounded-full'>
                      <div
                        className='bg-primary h-2 rounded-full'
                        style={{ width: `${100 - i * 15}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </Suspense>
  );
}
