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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandVk,
  IconBrandYoutube,
  IconBrandZoom,
  IconBrandSkype,
  IconBriefcase,
  IconBrandBitbucket,
  IconPlus,
  IconArrowRight
} from '@tabler/icons-react';
import { PageContainer } from '@/components/ui/page-container';

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContainer scrollable={true}>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Интеграции</h1>
            <p className='text-muted-foreground'>
              Подключение и настройка внешних сервисов и платформ
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[
              {
                title: 'Telegram',
                icon: IconBrandTelegram,
                description:
                  'Подключение Telegram-бота для автоматизации общения',
                status: 'Подключено',
                connected: true
              },
              {
                title: 'WhatsApp',
                icon: IconBrandWhatsapp,
                description: 'Интеграция с бизнес-аккаунтом WhatsApp',
                status: 'Подключено',
                connected: true
              },
              {
                title: 'Facebook',
                icon: IconBrandFacebook,
                description: 'Интеграция с Facebook Messenger и страницами',
                status: 'Не подключено',
                connected: false
              },
              {
                title: 'Instagram',
                icon: IconBrandInstagram,
                description: 'Управление сообщениями Instagram Direct',
                status: 'Не подключено',
                connected: false
              },
              {
                title: 'Twitter',
                icon: IconBrandTwitter,
                description: 'Подключение к Twitter для работы с сообщениями',
                status: 'Не подключено',
                connected: false
              },
              {
                title: 'ВКонтакте',
                icon: IconBrandVk,
                description:
                  'Интеграция с сообщениями и сообществами ВКонтакте',
                status: 'Подключено',
                connected: true
              },
              {
                title: 'YouTube',
                icon: IconBrandYoutube,
                description: 'Управление комментариями на YouTube-канале',
                status: 'Не подключено',
                connected: false
              },
              {
                title: 'Zoom',
                icon: IconBrandZoom,
                description: 'Интеграция видеоконференций Zoom',
                status: 'Не подключено',
                connected: false
              },
              {
                title: 'Skype',
                icon: IconBrandSkype,
                description: 'Подключение корпоративного Skype',
                status: 'Не подключено',
                connected: false
              },
              {
                title: 'amoCRM',
                icon: IconBriefcase,
                description: 'Синхронизация данных с amoCRM',
                status: 'Подключено',
                connected: true
              },
              {
                title: 'Bitrix24',
                icon: IconBrandBitbucket,
                description: 'Интеграция с порталом Битрикс24',
                status: 'Не подключено',
                connected: false
              }
            ].map((integration, i) => (
              <Card key={i}>
                <CardHeader className='pb-3'>
                  <div className='flex items-center gap-2'>
                    <div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full'>
                      <integration.icon className='text-primary h-5 w-5' />
                    </div>
                    <CardTitle>{integration.title}</CardTitle>
                    <Badge
                      variant={integration.connected ? 'default' : 'outline'}
                      className='ml-auto'
                    >
                      {integration.status}
                    </Badge>
                  </div>
                  <CardDescription className='pt-1.5'>
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    variant={integration.connected ? 'outline' : 'default'}
                    className='w-full'
                    size='sm'
                  >
                    {integration.connected ? 'Настройки' : 'Подключить'}
                    {integration.connected ? null : (
                      <IconArrowRight className='ml-1 h-4 w-4' />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
            <Card className='border-dashed'>
              <CardContent className='flex flex-col items-center justify-center p-6'>
                <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                  <IconPlus className='text-primary h-6 w-6' />
                </div>
                <h3 className='mt-3 font-medium'>Добавить новую интеграцию</h3>
                <p className='text-muted-foreground mt-1.5 text-center text-sm'>
                  Подключите дополнительные сервисы для расширения
                  функциональности
                </p>
                <Button className='mt-4'>Добавить интеграцию</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API и Webhooks</CardTitle>
              <CardDescription>
                Настройка интеграции через API и веб-хуки
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div>
                  <h3 className='font-medium'>
                    Webhook для входящих сообщений
                  </h3>
                  <p className='text-muted-foreground text-sm'>
                    URL для получения уведомлений о новых сообщениях
                  </p>
                </div>
                <Button variant='outline' size='sm'>
                  Настроить
                </Button>
              </div>
              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div>
                  <h3 className='font-medium'>
                    Webhook для обновления статусов
                  </h3>
                  <p className='text-muted-foreground text-sm'>
                    URL для получения уведомлений об изменении статусов
                  </p>
                </div>
                <Button variant='outline' size='sm'>
                  Настроить
                </Button>
              </div>
              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div>
                  <h3 className='font-medium'>Документация API</h3>
                  <p className='text-muted-foreground text-sm'>
                    Подробная информация по работе с API
                  </p>
                </div>
                <Button variant='outline' size='sm'>
                  Открыть
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </Suspense>
  );
}
