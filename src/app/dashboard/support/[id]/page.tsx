'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageContainer } from '@/components/ui/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  IconArrowLeft,
  IconSend,
  IconPaperclip,
  IconDownload,
  IconUser,
  IconHeadset,
  IconFile
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Типы данных
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'support';
  senderName: string;
  timestamp: Date;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

interface TicketDetail {
  id: string;
  subject: string;
  department: string;
  status: 'open' | 'in_progress' | 'waiting' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  tags: string[];
  messages: Message[];
  funnelId?: string; // ID воронки или undefined для общих обращений
  funnelName?: string; // Название воронки
}

// Статичные данные для демонстрации (расширенные с полными диалогами)
const mockTicketData: Record<string, TicketDetail> = {
  'TKT-001': {
    id: 'TKT-001',
    subject: 'Проблема с загрузкой диалогов',
    department: 'technical',
    status: 'open',
    priority: 'high',
    createdAt: new Date('2024-12-20T10:30:00'),
    updatedAt: new Date('2024-12-20T14:15:00'),
    assignedTo: 'Анна Иванова',
    tags: ['bug', 'frontend', 'dialogs'],
    funnelId: 'funnel-1',
    funnelName: 'Основная воронка',
    messages: [
      {
        id: '1',
        content:
          'Добрый день! У меня возникла проблема с загрузкой диалогов в системе. При попытке открыть раздел "Мессенджеры" страница зависает и не отвечает. Пробовал обновить браузер, но это not помогло.',
        sender: 'user',
        senderName: 'Вы',
        timestamp: new Date('2024-12-20T10:30:00')
      },
      {
        id: '2',
        content:
          'Добрый день! Спасибо за обращение. Я изучу вашу проблему. Скажите, пожалуйста, в каком браузере вы работаете и есть ли какие-то сообщения об ошибках в консоли браузера?',
        sender: 'support',
        senderName: 'Анна Иванова',
        timestamp: new Date('2024-12-20T11:45:00')
      },
      {
        id: '3',
        content:
          'Использую Google Chrome версии 120. В консоли вижу ошибку "Failed to fetch dialogs: Network Error". Также прикладываю скриншот проблемы.',
        sender: 'user',
        senderName: 'Вы',
        timestamp: new Date('2024-12-20T12:10:00'),
        attachments: [
          {
            name: 'screenshot-error.png',
            url: '#',
            type: 'image/png',
            size: 1024000
          }
        ]
      },
      {
        id: '4',
        content:
          'Спасибо за подробную информацию! Вижу проблему - это связано с недавним обновлением API. Мы уже работаем над исправлением. Ожидаемое время решения - в течение 2 часов. Я обязательно уведомлю вас, как только проблема будет устранена.',
        sender: 'support',
        senderName: 'Анна Иванова',
        timestamp: new Date('2024-12-20T14:15:00')
      }
    ]
  },
  'TKT-002': {
    id: 'TKT-002',
    subject: 'Вопрос по настройке воронки продаж',
    department: 'sales',
    status: 'in_progress',
    priority: 'medium',
    createdAt: new Date('2024-12-19T16:20:00'),
    updatedAt: new Date('2024-12-20T09:45:00'),
    assignedTo: 'Петр Сидоров',
    tags: ['sales', 'funnel', 'configuration'],
    funnelId: 'funnel-2',
    funnelName: 'Демо воронка',
    messages: [
      {
        id: '1',
        content:
          'Здравствуйте! Помогите разобраться с настройкой воронки продаж. Нужно настроить автоматические переходы между этапами и уведомления менеджерам.',
        sender: 'user',
        senderName: 'Вы',
        timestamp: new Date('2024-12-19T16:20:00')
      },
      {
        id: '2',
        content:
          'Добро пожаловать! Рад помочь с настройкой воронки. Для начала расскажите, сколько этапов планируете использовать и какие условия перехода между ними?',
        sender: 'support',
        senderName: 'Петр Сидоров',
        timestamp: new Date('2024-12-19T17:30:00')
      },
      {
        id: '3',
        content:
          'Планирую использовать 5 этапов: квалификация, презентация, переговоры, принятие решения, закрытие. Хочу, чтобы клиенты автоматически переходили на следующий этап после определенных действий.',
        sender: 'user',
        senderName: 'Вы',
        timestamp: new Date('2024-12-19T18:15:00')
      },
      {
        id: '4',
        content:
          'Отличная структура! Для настройки автоматических переходов вам нужно будет задать триггеры для каждого этапа. Например, для перехода с квалификации на презентацию можно настроить триггер на получение контактных данных клиента.',
        sender: 'support',
        senderName: 'Петр Сидоров',
        timestamp: new Date('2024-12-19T19:20:00')
      },
      {
        id: '5',
        content:
          'Понятно. А как настроить уведомления для менеджеров? Хочу, чтобы они получали уведомления, когда клиент переходит на этап "переговоры".',
        sender: 'user',
        senderName: 'Вы',
        timestamp: new Date('2024-12-20T08:30:00')
      },
      {
        id: '6',
        content:
          'Для этого в настройках этапа "переговоры" включите опцию "Уведомлять менеджера при переходе" и выберите способ уведомления: email, push-уведомления или интеграция с CRM.',
        sender: 'support',
        senderName: 'Петр Сидоров',
        timestamp: new Date('2024-12-20T09:15:00')
      },
      {
        id: '7',
        content:
          'Спасибо! Попробую настроить по вашим рекомендациям. Если возникнут проблемы, напишу.',
        sender: 'user',
        senderName: 'Вы',
        timestamp: new Date('2024-12-20T09:45:00')
      }
    ]
  },
  'TKT-003': {
    id: 'TKT-003',
    subject: 'Ошибка при создании нового этапа',
    department: 'technical',
    status: 'waiting',
    priority: 'medium',
    createdAt: new Date('2024-12-18T11:15:00'),
    updatedAt: new Date('2024-12-19T13:30:00'),
    assignedTo: 'Мария Петрова',
    tags: ['bug', 'stages', 'ui'],
    funnelId: 'funnel-1',
    funnelName: 'Основная воронка',
    messages: [
      {
        id: '1',
        content:
          'При попытке создать новый этап в воронке получаю ошибку "Validation failed". Кнопка "Сохранить" не реагирует.',
        sender: 'user',
        senderName: 'Вы',
        timestamp: new Date('2024-12-18T11:15:00')
      },
      {
        id: '2',
        content:
          'Здравствуйте! Давайте разберемся с проблемой. Скажите, какие данные вы указываете при создании этапа?',
        sender: 'support',
        senderName: 'Мария Петрова',
        timestamp: new Date('2024-12-18T12:30:00')
      },
      {
        id: '3',
        content:
          'Указываю название "Дополнительная квалификация", выбираю тип перевода "На менеджера", остальные поля оставляю по умолчанию.',
        sender: 'user',
        senderName: 'Вы',
        timestamp: new Date('2024-12-18T14:45:00')
      },
      {
        id: '4',
        content:
          'Проблема может быть в том, что этап с таким названием уже существует. Попробуйте использовать другое название или проверьте список существующих этапов.',
        sender: 'support',
        senderName: 'Мария Петрова',
        timestamp: new Date('2024-12-18T15:20:00')
      },
      {
        id: '5',
        content:
          'Попробовал разные названия - результат тот же. Прикладываю скриншот с ошибкой в консоли браузера.',
        sender: 'user',
        senderName: 'Вы',
        timestamp: new Date('2024-12-19T10:15:00'),
        attachments: [
          {
            name: 'console-error.png',
            url: '#',
            type: 'image/png',
            size: 856000
          }
        ]
      },
      {
        id: '6',
        content:
          'Спасибо за скриншот! Вижу проблему - это баг в валидации формы. Передаю задачу разработчикам. Ожидаемое время исправления - 1-2 рабочих дня.',
        sender: 'support',
        senderName: 'Мария Петрова',
        timestamp: new Date('2024-12-19T13:30:00')
      }
    ]
  },
  'TKT-004': {
    id: 'TKT-004',
    subject: 'Запрос на увеличение лимитов',
    department: 'billing',
    status: 'closed',
    priority: 'low',
    createdAt: new Date('2024-12-17T14:00:00'),
    updatedAt: new Date('2024-12-18T10:20:00'),
    assignedTo: 'Елена Сергеева',
    tags: ['billing', 'limits', 'upgrade'],
    funnelId: undefined, // Общее обращение
    funnelName: undefined,
    messages: [
      {
        id: '1',
        content:
          'Добрый день! Нужно увеличить лимит на количество диалогов в месяц. Текущий план не покрывает наши потребности.',
        sender: 'user',
        senderName: 'Вы',
        timestamp: new Date('2024-12-17T14:00:00')
      },
      {
        id: '2',
        content:
          'Здравствуйте! С удовольствием помогу с изменением тарифного плана. Сколько диалогов в месяц вам требуется?',
        sender: 'support',
        senderName: 'Елена Сергеева',
        timestamp: new Date('2024-12-17T15:30:00')
      },
      {
        id: '3',
        content:
          'Сейчас обрабатываем около 800 диалогов в месяц, но планируем расширение. Хотелось бы лимит на 1500 диалогов.',
        sender: 'user',
        senderName: 'Вы',
        timestamp: new Date('2024-12-17T16:45:00')
      },
      {
        id: '4',
        content:
          'Для таких объемов подойдет тариф "Бизнес+" с лимитом 2000 диалогов в месяц. Стоимость составит 15 000 руб/мес. Переводить на новый тариф?',
        sender: 'support',
        senderName: 'Елена Сергеева',
        timestamp: new Date('2024-12-17T17:15:00')
      },
      {
        id: '5',
        content:
          'Да, согласен. Переводите на тариф "Бизнес+". Когда изменения вступят в силу?',
        sender: 'user',
        senderName: 'Вы',
        timestamp: new Date('2024-12-18T09:20:00')
      },
      {
        id: '6',
        content:
          'Отлично! Тариф изменен, новые лимиты уже действуют. Счет на доплату отправлен на вашу почту. Спасибо за использование нашего сервиса!',
        sender: 'support',
        senderName: 'Елена Сергеева',
        timestamp: new Date('2024-12-18T10:20:00')
      }
    ]
  },
  'TKT-005': {
    id: 'TKT-005',
    subject: 'Интеграция с внешним CRM',
    department: 'technical',
    status: 'open',
    priority: 'urgent',
    createdAt: new Date('2024-12-20T08:45:00'),
    updatedAt: new Date('2024-12-20T12:10:00'),
    assignedTo: 'Алексей Козлов',
    tags: ['integration', 'crm', 'api'],
    funnelId: undefined, // Общее обращение
    funnelName: undefined,
    messages: [
      {
        id: '1',
        content:
          'Срочно нужна помощь с настройкой интеграции с нашей CRM системой (amoCRM). Клиенты не синхронизируются, хотя API ключи правильные.',
        sender: 'user',
        senderName: 'Вы',
        timestamp: new Date('2024-12-20T08:45:00')
      },
      {
        id: '2',
        content:
          'Добрый день! Понимаю важность вопроса. Проверим настройки интеграции. Можете показать, какие ошибки появляются в логах синхронизации?',
        sender: 'support',
        senderName: 'Алексей Козлов',
        timestamp: new Date('2024-12-20T09:30:00')
      },
      {
        id: '3',
        content:
          'В логах показывает "Authentication failed" каждые 5 минут. API ключ проверил несколько раз - он актуальный.',
        sender: 'user',
        senderName: 'Вы',
        timestamp: new Date('2024-12-20T10:15:00')
      },
      {
        id: '4',
        content:
          'Проблема может быть в формате токена или настройках OAuth. Давайте проведем диагностику в режиме реального времени. Можете сейчас подключиться к нашему TeamViewer?',
        sender: 'support',
        senderName: 'Алексей Козлов',
        timestamp: new Date('2024-12-20T11:20:00')
      },
      {
        id: '5',
        content: 'Да, конечно. ID для подключения: 987654321, пароль: temp123',
        sender: 'user',
        senderName: 'Вы',
        timestamp: new Date('2024-12-20T12:10:00')
      }
    ]
  }
};

const departments = {
  technical: 'Техническая поддержка',
  sales: 'Отдел продаж',
  billing: 'Биллинг',
  general: 'Общие вопросы'
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<TicketDetail | null>(
    mockTicketData[ticketId] || null
  );
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusBadge = (status: TicketDetail['status']) => {
    const statusConfig = {
      open: { label: 'Открыт', className: 'bg-blue-500 text-white' },
      in_progress: { label: 'В работе', className: 'bg-yellow-500 text-white' },
      waiting: { label: 'Ожидание', className: 'bg-orange-500 text-white' },
      closed: { label: 'Закрыт', className: 'bg-black text-white' }
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: TicketDetail['priority']) => {
    const priorityConfig = {
      low: { label: 'Низкий', color: 'bg-green-100 text-green-700' },
      medium: { label: 'Средний', color: 'bg-yellow-100 text-yellow-700' },
      high: { label: 'Высокий', color: 'bg-orange-100 text-orange-700' },
      urgent: { label: 'Срочный', color: 'bg-red-100 text-red-700' }
    };

    const config = priorityConfig[priority];
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const handleSendMessage = () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !ticket) return;

    const attachments = selectedFiles.map((file) => ({
      name: file.name,
      url: '#', // В реальной системе здесь был бы URL загруженного файла
      type: file.type,
      size: file.size
    }));

    const message: Message = {
      id: `${ticket.messages.length + 1}`,
      content: newMessage,
      sender: 'user',
      senderName: 'Вы',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    setTicket((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, message],
            updatedAt: new Date()
          }
        : null
    );

    setNewMessage('');
    setSelectedFiles([]);

    // Имитация ответа поддержки через некоторое время
    setTimeout(() => {
      const supportMessage: Message = {
        id: `${ticket.messages.length + 2}`,
        content:
          'Спасибо за ваше сообщение. Я изучу вопрос и отвечу в ближайшее время.',
        sender: 'support',
        senderName: ticket.assignedTo || 'Служба поддержки',
        timestamp: new Date()
      };

      setTicket((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, supportMessage],
              updatedAt: new Date()
            }
          : null
      );
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim() || selectedFiles.length > 0) {
        handleSendMessage();
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (!ticket) {
    return (
      <PageContainer>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-center'>
            <h2 className='mb-2 text-2xl font-bold'>Обращение не найдено</h2>
            <p className='text-muted-foreground mb-4'>
              Обращение с ID {ticketId} не существует или было удалено
            </p>
            <Button onClick={() => router.push('/dashboard/support')}>
              <IconArrowLeft className='mr-2 h-4 w-4' />
              Назад к списку
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Заголовок */}
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => router.push('/dashboard/support')}
          >
            <IconArrowLeft className='h-4 w-4' />
          </Button>
          <div className='flex-1'>
            <h1 className='text-2xl font-bold'>{ticket.subject}</h1>
            <p className='text-muted-foreground text-sm'>
              Обращение #{ticket.id}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Основной контент - Диалог */}
          <div className='lg:col-span-2'>
            <Card className='flex h-[600px] flex-col'>
              <CardHeader className='border-b'>
                <CardTitle className='text-lg'>Диалог с поддержкой</CardTitle>
                <CardDescription>
                  Переписка по обращению • Последнее обновление:{' '}
                  {format(ticket.updatedAt, 'dd MMM yyyy в HH:mm', {
                    locale: ru
                  })}
                </CardDescription>
              </CardHeader>

              {/* Сообщения */}
              <CardContent className='flex-1 space-y-4 overflow-y-auto p-4'>
                {ticket.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === 'user'
                        ? 'flex-row-reverse'
                        : 'flex-row'
                    }`}
                  >
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback>
                        {message.sender === 'user' ? (
                          <IconUser className='h-4 w-4' />
                        ) : (
                          <IconHeadset className='h-4 w-4' />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={`max-w-[80%] flex-1 ${
                        message.sender === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block rounded-lg px-4 py-2 ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className='text-sm'>{message.content}</p>

                        {message.attachments &&
                          message.attachments.length > 0 && (
                            <div className='mt-2 space-y-1'>
                              {message.attachments.map((attachment, index) => (
                                <div
                                  key={index}
                                  className={`flex items-center gap-2 rounded p-2 ${
                                    message.sender === 'user'
                                      ? 'bg-primary-foreground/10'
                                      : 'bg-background'
                                  }`}
                                >
                                  <IconPaperclip className='h-3 w-3' />
                                  <span className='flex-1 truncate text-xs'>
                                    {attachment.name}
                                  </span>
                                  <span className='text-xs opacity-70'>
                                    {formatFileSize(attachment.size)}
                                  </span>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-6 w-6 p-0'
                                  >
                                    <IconDownload className='h-3 w-3' />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>

                      <div
                        className={`text-muted-foreground mt-1 flex items-center gap-2 text-xs ${
                          message.sender === 'user'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <span>{message.senderName}</span>
                        <span>•</span>
                        <span>
                          {format(message.timestamp, 'dd MMM HH:mm', {
                            locale: ru
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Поле ввода сообщения */}
              <div className='border-t p-4'>
                {/* Отображение выбранных файлов */}
                {selectedFiles.length > 0 && (
                  <div className='mb-3 space-y-2'>
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className='bg-muted/50 flex items-center justify-between rounded-md border p-2'
                      >
                        <div className='flex items-center gap-2'>
                          <IconFile className='h-4 w-4' />
                          <span className='truncate text-sm'>{file.name}</span>
                          <span className='text-muted-foreground text-xs'>
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => removeSelectedFile(index)}
                          className='h-6 w-6 p-0'
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className='flex gap-2'>
                  <div className='relative flex-1'>
                    <Input
                      placeholder='Введите ваше сообщение...'
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className='pr-10'
                    />
                    <div className='absolute top-1/2 right-2 -translate-y-1/2'>
                      <label htmlFor='message-files' className='cursor-pointer'>
                        <input
                          id='message-files'
                          type='file'
                          multiple
                          accept='image/*,video/*,.pdf,.doc,.docx,.txt'
                          onChange={handleFileSelect}
                          className='hidden'
                        />
                        <IconPaperclip className='text-muted-foreground hover:text-foreground h-4 w-4 transition-colors' />
                      </label>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() && selectedFiles.length === 0}
                    size='sm'
                  >
                    <IconSend className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Боковая панель - Информация о тикете */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  Информация об обращении
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Статус и Приоритет */}
                <div className='border-border flex items-center justify-between border-b py-3'>
                  <div className='flex-1'>
                    <label className='text-muted-foreground mb-1 block text-sm font-medium tracking-wide uppercase'>
                      Статус
                    </label>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <div className='bg-border mx-4 w-px self-stretch'></div>
                  <div className='flex-1'>
                    <label className='text-muted-foreground mb-1 block text-sm font-medium tracking-wide uppercase'>
                      Приоритет
                    </label>
                    {getPriorityBadge(ticket.priority)}
                  </div>
                </div>

                {/* Департамент и Воронка */}
                <div className='border-border flex items-center justify-between border-b py-3'>
                  <div className='flex-1'>
                    <label className='text-muted-foreground mb-1 block text-sm font-medium tracking-wide uppercase'>
                      Департамент
                    </label>
                    <div className='text-sm font-medium'>
                      {
                        departments[
                          ticket.department as keyof typeof departments
                        ]
                      }
                    </div>
                  </div>
                  <div className='bg-border mx-4 w-px self-stretch'></div>
                  <div className='flex-1'>
                    <label className='text-muted-foreground mb-1 block text-sm font-medium tracking-wide uppercase'>
                      Воронка
                    </label>
                    {ticket.funnelName ? (
                      <Badge variant='outline' className='text-xs'>
                        {ticket.funnelName}
                      </Badge>
                    ) : (
                      <span className='text-muted-foreground text-sm'>
                        Общее
                      </span>
                    )}
                  </div>
                </div>

                {/* Даты */}
                <div className='border-border flex items-center justify-between border-b py-3'>
                  <div className='flex-1'>
                    <label className='text-muted-foreground mb-1 block text-sm font-medium tracking-wide uppercase'>
                      Создано
                    </label>
                    <div className='text-sm'>
                      {format(ticket.createdAt, 'dd MMM yyyy', { locale: ru })}
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      {format(ticket.createdAt, 'HH:mm', { locale: ru })}
                    </div>
                  </div>
                  <div className='bg-border mx-4 w-px self-stretch'></div>
                  <div className='flex-1'>
                    <label className='text-muted-foreground mb-1 block text-sm font-medium tracking-wide uppercase'>
                      Обновлено
                    </label>
                    <div className='text-sm'>
                      {format(ticket.updatedAt, 'dd MMM yyyy', { locale: ru })}
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      {format(ticket.updatedAt, 'HH:mm', { locale: ru })}
                    </div>
                  </div>
                </div>

                {/* Статистика сообщений */}
                <div className='border-border border-b py-3'>
                  <label className='text-muted-foreground mb-2 block text-sm font-medium tracking-wide uppercase'>
                    Статистика сообщений
                  </label>
                  <div className='grid grid-cols-3 gap-4 text-center'>
                    <div>
                      <div className='text-lg font-semibold'>
                        {ticket.messages.length}
                      </div>
                      <div className='text-muted-foreground text-xs'>Всего</div>
                    </div>
                    <div>
                      <div className='text-lg font-semibold text-blue-600'>
                        {
                          ticket.messages.filter((m) => m.sender === 'user')
                            .length
                        }
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        От вас
                      </div>
                    </div>
                    <div>
                      <div className='text-lg font-semibold text-green-600'>
                        {
                          ticket.messages.filter((m) => m.sender === 'support')
                            .length
                        }
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        От поддержки
                      </div>
                    </div>
                  </div>
                </div>

                {/* Теги */}
                {ticket.tags.length > 0 && (
                  <div className='py-3'>
                    <label className='text-muted-foreground mb-2 block text-sm font-medium tracking-wide uppercase'>
                      Теги
                    </label>
                    <div className='flex flex-wrap gap-1'>
                      {ticket.tags.map((tag) => (
                        <Badge key={tag} variant='outline' className='text-xs'>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
