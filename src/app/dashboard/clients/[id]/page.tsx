'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { PageContainer } from '@/components/ui/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { IconChevronLeft } from '@tabler/icons-react';

// Mock data for active dialogues and client statistics
const mockDialogues = [
  {
    id: 1,
    title: 'Диалог с Ивановым Иваном',
    lastMessage: 'Последнее сообщение...',
    date: '23-11-2024',
    stage: 'Квалификация',
    probability: 65
  },
  {
    id: 2,
    title: 'Диалог с Петровым Петром',
    lastMessage: 'Последнее сообщение...',
    date: '22-11-2024',
    stage: 'Презентация',
    probability: 80
  }
];

const clientStatistics = {
  totalMessages: 120,
  activeDialogues: 5,
  lastContact: '23.11.2024',
  conversionRate: 75
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id;
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = 0;
    }
  }, []);

  const goBack = () => {
    router.back();
  };

  const navigateToChat = (id: number) => {
    router.push(`/dashboard/messengers/${id}/chat`);
  };

  return (
    <PageContainer scrollable={true}>
      <div className='flex h-full'>
        {/* Main area for active dialogues */}
        <div className='flex h-full max-h-[calc(100vh-80px)] flex-1 flex-col'>
          <div className='flex items-center gap-2 border-b p-4'>
            <Button variant='ghost' size='icon' onClick={goBack}>
              <IconChevronLeft className='h-5 w-5' />
            </Button>
            <div className='font-semibold'>Клиент #{clientId}</div>
          </div>

          <div className='flex-1 space-y-4 overflow-auto p-4'>
            {mockDialogues.map((dialogue) => (
              <div
                key={dialogue.id}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div>
                  <div className='font-bold'>{dialogue.title}</div>
                  <div className='text-muted-foreground text-sm'>
                    {dialogue.lastMessage}
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    Этап: {dialogue.stage}
                  </div>
                  <div className='mt-1 flex items-center gap-2'>
                    <span className='text-muted-foreground text-sm'>
                      Вероятность закрытия:
                    </span>
                    <Progress value={dialogue.probability} className='flex-1' />
                    <span>{dialogue.probability}%</span>
                  </div>
                </div>
                <div className='text-muted-foreground text-xs'>
                  {dialogue.date}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => navigateToChat(dialogue.id)}
                >
                  Перейти к диалогу
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Client details sidebar */}
        <div ref={sidebarRef} className='h-full w-80 overflow-auto border-l'>
          <div className='p-4'>
            <CardTitle className='mb-4 text-xl'>Информация о клиенте</CardTitle>

            <div className='space-y-4'>
              <div className='flex flex-col'>
                <span className='text-muted-foreground text-sm font-medium'>
                  Последний контакт
                </span>
                <span>{clientStatistics.lastContact}</span>
              </div>

              <div className='flex flex-col'>
                <span className='text-muted-foreground text-sm font-medium'>
                  Всего сообщений
                </span>
                <span>{clientStatistics.totalMessages}</span>
              </div>

              <div className='flex flex-col'>
                <span className='text-muted-foreground text-sm font-medium'>
                  Активные диалоги
                </span>
                <span>{clientStatistics.activeDialogues}</span>
              </div>

              <div className='flex flex-col'>
                <span className='text-muted-foreground text-sm font-medium'>
                  Конверсия
                </span>
                <div className='mt-1 flex items-center gap-2'>
                  <Progress
                    value={clientStatistics.conversionRate}
                    className='flex-1'
                  />
                  <span>{clientStatistics.conversionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
