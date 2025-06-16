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
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/hooks/useFunnels';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';

// Define interface for Dialog
interface Dialog {
  id?: string;
  uuid: string;
  thread_id: string;
  client_id?: number;
  funnel_id?: string | number;
  created_at: string;
  updated_at?: string;
  status?: string;
  messages_count?: number;
  last_message?: string;
  close_ratio: number;
  manager: string | null;
  ai?: boolean;
  unsubscribed?: boolean;
  client?: {
    id: number;
    name: string;
    phone: string;
    email: string;
    manager: string | null;
    status: string;
    close_ratio?: number;
    messages_count?: number;
  };
}

// Define interface for messages
interface Message {
  id: string | number;
  text: string;
  sender: string;
  role: 'user' | 'assistant' | 'manager' | 'system';
  time: string;
  isStageTransition?: boolean;
}

// Update the mock data to include a role
const mockMessages: Message[] = [
  {
    id: 1,
    text: 'Добрый день! Я хотел бы узнать о вашей системе.',
    sender: 'Иванов Иван',
    role: 'user',
    time: '10:15'
  },
  {
    id: 2,
    text: 'Добрый день! Конечно, я могу рассказать вам о нашей системе. Что именно вас интересует?',
    sender: 'AI-ассистент (Тип 1)',
    role: 'assistant',
    time: '10:18'
  },
  {
    id: 3,
    text: 'Меня интересует возможность интеграции с моим бизнесом по продаже автомобилей.',
    sender: 'Иванов Иван',
    role: 'user',
    time: '10:22'
  },
  {
    id: 4,
    text: 'Отлично! Наша система отлично подходит для автомобильного бизнеса. Мы предлагаем различные варианты интеграции.',
    sender: 'AI-ассистент (Тип 1)',
    role: 'assistant',
    time: '10:25'
  },
  {
    id: 5,
    text: '--- Переход на этап: Квалификация ---',
    sender: 'system',
    role: 'system',
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
  const [messages, setMessages] = useState(mockMessages);
  const [isSending, setIsSending] = useState(false);
  const [dialogData, setDialogData] = useState<Dialog | null>(null);
  const [loading, setLoading] = useState(true);

  // Get organization and funnel data
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;
  const { currentFunnel } = useFunnels(backendOrgId);

  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = 0;
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Функция для загрузки данных о диалоге
  const fetchDialogData = async () => {
    if (!backendOrgId || !currentFunnel?.id || !chatId) {
      console.error('Missing required data to fetch dialog');
      return;
    }

    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) {
        console.error('No token available');
        return;
      }

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}/dialog/${chatId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch dialog:', response.status);
        return;
      }

      const data = await response.json();
      console.log('Retrieved dialog:', data);
      setDialogData(data);
    } catch (error) {
      console.error('Error fetching dialog:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add function to fetch dialog messages
  const fetchDialogMessages = async () => {
    if (!backendOrgId || !currentFunnel?.id || !chatId) {
      console.error('Missing required data to fetch messages');
      return;
    }

    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) {
        console.error('No token available to fetch messages');
        return;
      }

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}/dialog/${chatId}/messages`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch messages:', response.status);
        return;
      }

      const data = await response.json();
      console.log('Retrieved messages:', data);

      // Transform API messages to our format
      const transformedMessages = data.map((msg: any, index: number) => {
        const originalRole = msg.role || msg.sender || 'assistant';
        let role: 'user' | 'assistant' | 'manager' | 'system';

        // Map roles correctly
        if (originalRole === 'user' || originalRole === 'client') {
          role = 'user';
        } else if (originalRole === 'manager') {
          role = 'manager';
        } else if (originalRole === 'system') {
          role = 'system';
        } else {
          role = 'assistant';
        }

        // Get correct sender display name
        let sender;
        if (role === 'user') {
          sender = 'Клиент';
        } else if (role === 'manager') {
          sender = 'Менеджер';
        } else if (role === 'system') {
          sender = 'System';
        } else {
          sender = 'AI-ассистент';
        }

        console.log(
          `Message ${index}: role=${originalRole} -> ${role}, sender=${sender}`
        );

        return {
          id: msg.id || `msg_${index}`,
          text: msg.text || msg.content || 'Сообщение без текста',
          role: role,
          sender: sender,
          time:
            msg.time ||
            new Date(
              msg.timestamp || msg.created_at || Date.now()
            ).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit'
            })
        } as Message;
      });

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Attempt to fetch real messages on component mount
  useEffect(() => {
    if (backendOrgId && currentFunnel?.id && chatId) {
      fetchDialogData();
      fetchDialogMessages();
    }
  }, [backendOrgId, currentFunnel?.id, chatId]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      setIsSending(true);

      const tokenFromCookie = getClerkTokenFromClientCookie();
      if (!tokenFromCookie || !backendOrgId || !currentFunnel?.id || !chatId) {
        console.error('Missing required data to send message');
        setIsSending(false);
        return;
      }

      try {
        console.log('Sending message as manager to dialog:', chatId);

        // Explicitly set the role and payload
        const messagePayload = {
          text: message,
          role: 'manager'
        };
        console.log('Message payload:', messagePayload);

        // Add message to UI immediately for better UX
        const tempMessage: Message = {
          id: `temp_${Date.now()}`,
          text: message,
          sender: 'Менеджер',
          role: 'manager',
          time: new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          })
        };
        console.log('Adding message with role:', tempMessage.role);
        setMessages([...messages, tempMessage]);

        const response = await fetch(
          `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}/dialog/${chatId}/message`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenFromCookie}`
            },
            body: JSON.stringify(messagePayload)
          }
        );

        if (!response.ok) {
          console.error(`Error sending message: HTTP ${response.status}`);
          // Keep the message in UI but mark it as failed (in a real app)
        } else {
          const data = await response.json();
          console.log('Message sent successfully:', data);

          // Fetch fresh messages after successful send
          await fetchDialogMessages();
        }
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setMessage('');
        setIsSending(false);
      }
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
            <div className='text-muted-foreground ml-auto text-sm'>
              {backendOrgId && currentFunnel?.id
                ? 'Connected'
                : 'Not connected to API'}
            </div>
          </div>

          <div className='flex-1 space-y-4 overflow-auto p-4'>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-start' : msg.role === 'system' ? 'justify-center' : 'justify-end'}`}
              >
                {msg.role === 'system' ? (
                  <div className='max-w-[90%] rounded-lg bg-gray-100 p-2 text-center text-xs text-gray-500 dark:bg-gray-800/50 dark:text-gray-400'>
                    {msg.text}
                  </div>
                ) : (
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-muted'
                        : msg.role === 'manager'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                          : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <div className='mb-1 text-sm font-bold'>
                      {msg.role === 'manager' ? 'Менеджер' : msg.sender}
                    </div>
                    <div className='text-sm'>{msg.text}</div>
                    <div className='mt-1 text-right text-xs opacity-70'>
                      {msg.time}
                    </div>
                  </div>
                )}
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
                disabled={isSending || !backendOrgId || !currentFunnel?.id}
              />
              <Button variant='ghost' size='icon'>
                <IconMicrophone className='h-5 w-5' />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={
                  !message.trim() ||
                  isSending ||
                  !backendOrgId ||
                  !currentFunnel?.id
                }
              >
                <IconSend className='h-5 w-5' />
              </Button>
            </div>
          </div>
        </div>

        {/* Client details sidebar */}
        <div ref={sidebarRef} className='h-full w-80 overflow-auto border-l'>
          <div className='p-4'>
            <CardTitle className='mb-4 text-xl'>Информация о клиенте</CardTitle>

            {loading ? (
              <div className='space-y-4 py-4'>
                <div className='w-full'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div className='text-sm font-medium'>
                      Загрузка данных...
                    </div>
                    <span className='text-xs font-normal'>
                      Пожалуйста, подождите
                    </span>
                  </div>
                  <div className='bg-muted h-2 w-full overflow-hidden rounded-full'>
                    <div className='animate-progress-indeterminate bg-primary h-full rounded-full'></div>
                  </div>
                </div>
              </div>
            ) : !dialogData ? (
              <div className='py-8 text-center'>
                <div className='text-muted-foreground'>
                  Ошибка загрузки данных
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={fetchDialogData}
                  className='mt-2'
                >
                  Повторить
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Имя
                  </span>
                  <span>{dialogData.client?.name || 'Не указано'}</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Телефон
                  </span>
                  <span>{dialogData.client?.phone || 'Не указано'}</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Email
                  </span>
                  <span>{dialogData.client?.email || 'Не указано'}</span>
                </div>

                <div className='border-t pt-4'>
                  <CardTitle className='mb-4 text-lg'>
                    Данные о диалоге
                  </CardTitle>

                  <div className='space-y-4'>
                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        ID диалога
                      </span>
                      <span className='text-xs'>{dialogData.uuid}</span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Дата создания
                      </span>
                      <span>
                        {new Date(dialogData.created_at).toLocaleString(
                          'ru-RU'
                        )}
                      </span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Количество сообщений
                      </span>
                      <span>
                        {dialogData.messages_count || messages.length || 0}
                      </span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Менеджер
                      </span>
                      <span>
                        {dialogData.manager ||
                          dialogData.client?.manager ||
                          'Не назначен'}
                      </span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        AI-ассистент
                      </span>
                      <span>{dialogData.ai ? 'Включен' : 'Выключен'}</span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Вероятность закрытия
                      </span>
                      <div className='mt-1 flex items-center gap-2'>
                        <Progress
                          value={dialogData.close_ratio}
                          className='flex-1'
                        />
                        <span>{dialogData.close_ratio}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
