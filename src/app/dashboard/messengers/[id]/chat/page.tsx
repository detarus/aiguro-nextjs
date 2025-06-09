'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { PageContainer } from '@/components/ui/page-container';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  IconChevronLeft,
  IconSend,
  IconPaperclip,
  IconMicrophone
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

// Mock data for the chat with sender names and stage transitions
const mockMessages = [
  {
    id: 1,
    text: 'Добрый день! Я хотел бы узнать о вашей системе.',
    sender: 'Иванов Иван',
    time: '10:15'
  },
  {
    id: 2,
    text: 'Добрый день! Конечно, я могу рассказать вам о нашей системе. Что именно вас интересует?',
    sender: 'AI-ассистент (Тип 1)',
    time: '10:18'
  },
  {
    id: 3,
    text: 'Меня интересует возможность интеграции с моим бизнесом по продаже автомобилей.',
    sender: 'Иванов Иван',
    time: '10:22'
  },
  {
    id: 4,
    text: 'Отлично! Наша система отлично подходит для автомобильного бизнеса. Мы предлагаем различные варианты интеграции.',
    sender: 'AI-ассистент (Тип 1)',
    time: '10:25'
  },
  {
    id: 5,
    text: '--- Переход на этап: Квалификация ---',
    sender: 'system',
    time: '10:30',
    isStageTransition: true
  }
];

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id;
  const [message, setMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Mock client data
  const clientData = {
    name: 'Иванов Иван',
    phone: '+7 (999) 123-45-67',
    email: 'ivan@example.com',
    stage: 'Новый',
    probability: 65,
    contactDate: '23.11.2024',
    messagesCount: 12,
    goal: 'Интеграция системы в бизнес по продаже автомобилей'
  };

  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = 0;
    }
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Here you would typically send the message to an API
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <PageContainer scrollable={true}>
      <div className='flex h-full'>
        {/* Main chat area */}
        <div className='flex h-full max-h-[calc(100vh-80px)] flex-1 flex-col'>
          <div className='flex items-center gap-2 border-b p-4'>
            <Button variant='ghost' size='icon' onClick={goBack}>
              <IconChevronLeft className='h-5 w-5' />
            </Button>
            <div className='font-semibold'>Диалог #{chatId}</div>
          </div>

          <div className='flex-1 space-y-4 overflow-auto p-4'>
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'Иванов Иван' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${msg.sender === 'Иванов Иван' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}
                >
                  <div className='mb-1 text-sm font-bold'>{msg.sender}</div>
                  <div className='text-sm'>{msg.text}</div>
                  <div className='mt-1 text-right text-xs opacity-70'>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className='border-t p-4'>
            <div className='flex gap-2'>
              <Button variant='ghost' size='icon'>
                <IconPaperclip className='h-5 w-5' />
              </Button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Введите сообщение...'
                className='flex-1'
                readOnly
              />
              <Button variant='ghost' size='icon'>
                <IconMicrophone className='h-5 w-5' />
              </Button>
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                <IconSend className='h-5 w-5' />
              </Button>
            </div>
          </div>
        </div>

        {/* Client details sidebar */}
        <div ref={sidebarRef} className='h-full w-80 overflow-auto border-l'>
          <div className='p-4'>
            <CardTitle className='mb-4 text-xl'>Информация о клиенте</CardTitle>

            <div className='space-y-4'>
              <div className='flex flex-col'>
                <span className='text-muted-foreground text-sm font-medium'>
                  Имя
                </span>
                <span>{clientData.name}</span>
              </div>

              <div className='flex flex-col'>
                <span className='text-muted-foreground text-sm font-medium'>
                  Телефон
                </span>
                <span>{clientData.phone}</span>
              </div>

              <div className='flex flex-col'>
                <span className='text-muted-foreground text-sm font-medium'>
                  Email
                </span>
                <span>{clientData.email}</span>
              </div>

              <div className='border-t pt-4'>
                <CardTitle className='mb-4 text-lg'>Данные о сделке</CardTitle>

                <div className='space-y-4'>
                  <div className='flex flex-col'>
                    <span className='text-muted-foreground text-sm font-medium'>
                      Дата обращения
                    </span>
                    <span>{clientData.contactDate}</span>
                  </div>

                  <div className='flex flex-col'>
                    <span className='text-muted-foreground text-sm font-medium'>
                      Количество сообщений
                    </span>
                    <span>{clientData.messagesCount}</span>
                  </div>

                  <div className='flex flex-col'>
                    <span className='text-muted-foreground text-sm font-medium'>
                      Текущий этап
                    </span>
                    <span>{clientData.stage}</span>
                  </div>

                  <div className='flex flex-col'>
                    <span className='text-muted-foreground text-sm font-medium'>
                      Цель клиента
                    </span>
                    <span>{clientData.goal}</span>
                  </div>

                  <div className='flex flex-col'>
                    <span className='text-muted-foreground text-sm font-medium'>
                      Вероятность закрытия
                    </span>
                    <div className='mt-1 flex items-center gap-2'>
                      <Progress
                        value={clientData.probability}
                        className='flex-1'
                      />
                      <span>{clientData.probability}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
