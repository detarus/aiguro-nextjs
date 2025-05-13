'use client';

import { SimplePageTemplate } from '@/components/simple-page-template';
import {
  IconBookUpload,
  IconSearch,
  IconFileText,
  IconHelpCircle
} from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function KnowledgeBasePage() {
  return (
    <SimplePageTemplate
      title='База знаний'
      description='Справочные материалы и инструкции по использованию системы'
      icon={IconBookUpload}
      sections={[
        {
          title: 'Поиск по базе знаний',
          description: 'Найдите нужные материалы',
          content: (
            <div className='space-y-4'>
              <div className='relative'>
                <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                <Input
                  type='search'
                  placeholder='Поиск в базе знаний...'
                  className='w-full pl-8'
                />
              </div>
              <div className='text-muted-foreground text-sm'>
                Популярные запросы: настройка интеграций, работа с шаблонами,
                API подключение
              </div>
            </div>
          )
        },
        {
          title: 'Категории',
          description: 'Основные разделы базы знаний',
          content: (
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              {[
                { title: 'Начало работы', count: 12 },
                { title: 'Интеграции', count: 8 },
                { title: 'Мессенджеры', count: 15 },
                { title: 'API', count: 7 },
                { title: 'Управление', count: 10 },
                { title: 'Аналитика', count: 6 }
              ].map((category, i) => (
                <div
                  key={i}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div className='flex items-center gap-2'>
                    <IconFileText className='text-primary h-4 w-4' />
                    <span>{category.title}</span>
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    {category.count} статей
                  </div>
                </div>
              ))}
            </div>
          )
        },
        {
          title: 'Популярные статьи',
          description: 'Самые просматриваемые материалы',
          content: (
            <div className='space-y-3'>
              {[
                'Начало работы с платформой',
                'Подключение WhatsApp к системе',
                'Интеграция с CRM-системами',
                'Настройка автоматических ответов',
                'Аналитика и отчеты'
              ].map((article, i) => (
                <div
                  key={i}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div className='flex items-center gap-2'>
                    <IconFileText className='text-primary h-4 w-4' />
                    <span>{article}</span>
                  </div>
                  <Button variant='ghost' size='sm'>
                    Читать
                  </Button>
                </div>
              ))}
            </div>
          )
        },
        {
          title: 'Нужна помощь?',
          description: 'Не нашли ответ на свой вопрос?',
          content: (
            <div className='flex flex-col items-center justify-center space-y-4 text-center'>
              <IconHelpCircle className='text-primary h-12 w-12' />
              <h3 className='font-medium'>Свяжитесь с нашей поддержкой</h3>
              <p className='text-muted-foreground text-sm'>
                Наши специалисты готовы помочь вам с любыми вопросами
              </p>
              <Button className='mt-2'>Обратиться в поддержку</Button>
            </div>
          )
        }
      ]}
    />
  );
}
