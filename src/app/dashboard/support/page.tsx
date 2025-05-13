'use client';

import { SimplePageTemplate } from '@/components/simple-page-template';
import {
  IconHeadset,
  IconMessages,
  IconPhone,
  IconMail,
  IconBrandTelegram
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function SupportPage() {
  return (
    <SimplePageTemplate
      title='Поддержка'
      description='Связь с технической поддержкой и помощь в решении вопросов'
      icon={IconHeadset}
      sections={[
        {
          title: 'Создать обращение',
          description: 'Отправьте запрос в службу поддержки',
          content: (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Input placeholder='Тема обращения' />
              </div>
              <div className='space-y-2'>
                <Textarea
                  placeholder='Опишите ваш вопрос или проблему подробно...'
                  className='min-h-[120px]'
                />
              </div>
              <div>
                <Button className='w-full'>Отправить запрос</Button>
              </div>
            </div>
          )
        },
        {
          title: 'Каналы связи',
          description: 'Способы связаться с технической поддержкой',
          content: (
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              {[
                {
                  icon: IconPhone,
                  title: 'Телефон',
                  content: '+7 (800) 123-45-67',
                  badge: '24/7'
                },
                {
                  icon: IconMail,
                  title: 'Email',
                  content: 'support@guroai.ru',
                  badge: '24 часа'
                },
                {
                  icon: IconMessages,
                  title: 'Чат',
                  content: 'Онлайн чат на сайте',
                  badge: 'Онлайн'
                },
                {
                  icon: IconBrandTelegram,
                  title: 'Telegram',
                  content: '@guroai_support',
                  badge: 'Быстро'
                }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className='flex items-start rounded-lg border p-3'
                  >
                    <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                      <Icon className='text-primary h-5 w-5' />
                    </div>
                    <div className='ml-3 flex-1'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-medium'>{item.title}</h3>
                        <Badge variant='outline'>{item.badge}</Badge>
                      </div>
                      <p className='text-muted-foreground text-sm'>
                        {item.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        },
        {
          title: 'Частые вопросы',
          description: 'Ответы на распространенные вопросы',
          content: (
            <div className='space-y-3'>
              {[
                'Как подключить мессенджер к системе?',
                'Как настроить автоматические ответы?',
                'Как создать шаблон сообщения?',
                'Как интегрировать с внешней CRM?',
                'Как получить доступ к API?'
              ].map((question, i) => (
                <div key={i} className='rounded-lg border p-3'>
                  <h3 className='font-medium'>{question}</h3>
                  <div className='mt-2 flex justify-end'>
                    <Button variant='ghost' size='sm'>
                      Посмотреть ответ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        },
        {
          title: 'Последние обращения',
          description: 'История ваших запросов в поддержку',
          content: (
            <div className='space-y-3'>
              {[
                {
                  id: '#4372',
                  date: '15.05.2023',
                  topic: 'Проблема с подключением WhatsApp',
                  status: 'Решено'
                },
                {
                  id: '#4290',
                  date: '03.05.2023',
                  topic: 'Настройка рассылки',
                  status: 'Закрыто'
                },
                {
                  id: '#4125',
                  date: '27.04.2023',
                  topic: 'Вопрос по биллингу',
                  status: 'Закрыто'
                },
                {
                  id: '#3998',
                  date: '15.04.2023',
                  topic: 'Интеграция с 1С',
                  status: 'Закрыто'
                }
              ].map((ticket, i) => (
                <div
                  key={i}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='font-mono font-medium'>{ticket.id}</span>
                      <span className='text-muted-foreground text-sm'>
                        {ticket.date}
                      </span>
                    </div>
                    <p className='text-sm'>{ticket.topic}</p>
                  </div>
                  <Badge
                    variant={
                      ticket.status === 'Решено' ? 'default' : 'secondary'
                    }
                  >
                    {ticket.status}
                  </Badge>
                </div>
              ))}
            </div>
          )
        }
      ]}
    />
  );
}
