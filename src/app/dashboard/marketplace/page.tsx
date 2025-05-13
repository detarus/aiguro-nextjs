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
import { Input } from '@/components/ui/input';
import {
  IconSearch,
  IconAdjustments,
  IconStarFilled,
  IconShoppingCart,
  IconEye,
  IconHeart
} from '@tabler/icons-react';
import { PageContainer } from '@/components/ui/page-container';

export default function MarketplacePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContainer scrollable={true}>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Маркетплейс Услуг
            </h1>
            <p className='text-muted-foreground'>
              Каталог готовых услуг и решений для вашего бизнеса
            </p>
          </div>

          <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
            <div className='relative max-w-lg flex-1'>
              <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
              <Input
                type='search'
                placeholder='Поиск услуг...'
                className='w-full pl-8'
              />
            </div>
            <div className='flex gap-2'>
              <Button variant='outline'>
                <IconAdjustments className='mr-2 h-4 w-4' />
                Фильтры
              </Button>
              <Button variant='outline'>Категории</Button>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[
              {
                title: 'Чат-бот для обслуживания клиентов',
                description:
                  'Автоматизация ответов на типовые вопросы клиентов в мессенджерах',
                price: '15 000 ₽',
                category: 'Автоматизация',
                rating: 4.8,
                reviews: 124,
                image: '/images/services/chatbot.jpg'
              },
              {
                title: 'Настройка CRM-системы',
                description:
                  'Полная настройка и интеграция CRM-системы с вашими бизнес-процессами',
                price: '45 000 ₽',
                category: 'CRM',
                rating: 4.9,
                reviews: 87,
                image: '/images/services/crm.jpg'
              },
              {
                title: 'Разработка скриптов продаж',
                description:
                  'Профессиональные скрипты для повышения конверсии звонков и сообщений',
                price: '12 000 ₽',
                category: 'Продажи',
                rating: 4.7,
                reviews: 56,
                image: '/images/services/scripts.jpg'
              },
              {
                title: 'Интеграция с платежными системами',
                description:
                  'Подключение популярных платежных шлюзов и настройка автоматических платежей',
                price: '25 000 ₽',
                category: 'Интеграции',
                rating: 4.6,
                reviews: 42,
                image: '/images/services/payment.jpg'
              },
              {
                title: 'Аудит и оптимизация бизнес-процессов',
                description:
                  'Анализ текущих процессов и рекомендации по оптимизации работы',
                price: '50 000 ₽',
                category: 'Консалтинг',
                rating: 4.9,
                reviews: 31,
                image: '/images/services/audit.jpg'
              },
              {
                title: 'Настройка воронки продаж',
                description:
                  'Построение эффективной воронки продаж от первого контакта до сделки',
                price: '35 000 ₽',
                category: 'Продажи',
                rating: 4.8,
                reviews: 64,
                image: '/images/services/funnel.jpg'
              },
              {
                title: 'Разработка автоматических отчетов',
                description:
                  'Создание системы автоматической генерации и рассылки отчетов',
                price: '20 000 ₽',
                category: 'Аналитика',
                rating: 4.7,
                reviews: 29,
                image: '/images/services/reports.jpg'
              },
              {
                title: 'Настройка IP-телефонии',
                description:
                  'Интеграция телефонии с CRM и настройка колл-трекинга',
                price: '30 000 ₽',
                category: 'Телефония',
                rating: 4.6,
                reviews: 38,
                image: '/images/services/voip.jpg'
              },
              {
                title: 'Обучение персонала',
                description:
                  'Тренинги для сотрудников по работе с клиентами и системой',
                price: '40 000 ₽',
                category: 'Обучение',
                rating: 4.9,
                reviews: 47,
                image: '/images/services/training.jpg'
              }
            ].map((service, i) => (
              <Card key={i} className='flex flex-col'>
                <div className='bg-muted relative aspect-video w-full'>
                  <div className='absolute top-2 left-2'>
                    <Badge
                      variant='default'
                      className='bg-primary/90 hover:bg-primary/90'
                    >
                      {service.category}
                    </Badge>
                  </div>
                  <div className='absolute top-2 right-2 flex gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='bg-background/80 hover:bg-background/90 h-8 w-8'
                    >
                      <IconHeart className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='bg-background/80 hover:bg-background/90 h-8 w-8'
                    >
                      <IconEye className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
                <CardHeader className='pb-2'>
                  <CardTitle className='line-clamp-1'>
                    {service.title}
                  </CardTitle>
                  <CardDescription className='line-clamp-2'>
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className='flex-1'>
                  <div className='mb-2 flex items-center gap-1'>
                    <IconStarFilled className='h-4 w-4 text-yellow-500' />
                    <span className='text-sm font-medium'>
                      {service.rating}
                    </span>
                    <span className='text-muted-foreground text-sm'>
                      ({service.reviews} отзывов)
                    </span>
                  </div>
                  <div className='text-xl font-bold'>{service.price}</div>
                </CardContent>
                <CardFooter className='pt-0'>
                  <Button className='w-full gap-2'>
                    <IconShoppingCart className='h-4 w-4' />
                    Заказать
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Разместить свою услугу</CardTitle>
              <CardDescription>
                Предложите свои решения для клиентов платформы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground mb-4'>
                Вы можете разместить свои услуги на маркетплейсе и получать
                новых клиентов. Мы предлагаем различные варианты размещения и
                продвижения.
              </p>
              <Button>Стать поставщиком услуг</Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </Suspense>
  );
}
