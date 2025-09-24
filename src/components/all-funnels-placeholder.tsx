'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Users, MessageSquare, TrendingUp } from 'lucide-react';

interface AllFunnelsPlaceholderProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function AllFunnelsPlaceholder({
  title = 'Здесь будут отображены данные сразу по всем воронкам',
  description = 'Выберите конкретную воронку для просмотра детальной информации',
  icon
}: AllFunnelsPlaceholderProps) {
  const defaultIcon = (
    <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20'>
      <BarChart3 className='h-8 w-8 text-blue-600 dark:text-blue-400' />
    </div>
  );

  return (
    <div className='flex min-h-[400px] items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardContent className='flex flex-col items-center justify-center p-8 text-center'>
          {icon || defaultIcon}
          <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
            {title}
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Специализированные заглушки для разных типов страниц
export function AllFunnelsClientsPlaceholder() {
  return (
    <AllFunnelsPlaceholder
      icon={
        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
          <Users className='h-8 w-8 text-green-600 dark:text-green-400' />
        </div>
      }
      title='Клиенты всех воронок'
      description='Выберите конкретную воронку для просмотра клиентов'
    />
  );
}

export function AllFunnelsDealsPlaceholder() {
  return (
    <AllFunnelsPlaceholder
      icon={
        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20'>
          <TrendingUp className='h-8 w-8 text-purple-600 dark:text-purple-400' />
        </div>
      }
      title='Сделки всех воронок'
      description='Выберите конкретную воронку для просмотра сделок'
    />
  );
}

export function AllFunnelsDialogsPlaceholder() {
  return (
    <AllFunnelsPlaceholder
      icon={
        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20'>
          <MessageSquare className='h-8 w-8 text-orange-600 dark:text-orange-400' />
        </div>
      }
      title='Диалоги всех воронок'
      description='Выберите конкретную воронку для просмотра диалогов'
    />
  );
}
