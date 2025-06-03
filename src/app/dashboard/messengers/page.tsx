'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageSkeleton } from '@/components/page-skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  IconMessage,
  IconDotsVertical,
  IconPhone,
  IconUser,
  IconClock
} from '@tabler/icons-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Импортируем данные клиентов
const clients = [
  {
    id: 1,
    name: 'Мария Иванова',
    email: 'maria@example.com',
    phone: '+7 (901) 123-45-67',
    assignedTo: 'Александр Петров',
    stage: 'Новый',
    created: '01 июня 2023',
    lastActivity: '15 минут назад',
    status: 'Активный'
  },
  {
    id: 2,
    name: 'Иван Смирнов',
    email: 'ivan@example.com',
    phone: '+7 (902) 234-56-78',
    assignedTo: 'Ольга Сидорова',
    stage: 'Квалификация',
    created: '15 мая 2023',
    lastActivity: '2 часа назад',
    status: 'Активный'
  },
  {
    id: 3,
    name: 'Анна Петрова',
    email: 'anna@example.com',
    phone: '+7 (903) 345-67-89',
    assignedTo: 'Михаил Кузнецов',
    stage: 'Новый',
    created: '10 апреля 2023',
    lastActivity: '1 день назад',
    status: 'Неактивный'
  },
  {
    id: 4,
    name: 'Дмитрий Козлов',
    email: 'dmitry@example.com',
    phone: '+7 (904) 456-78-90',
    assignedTo: 'Елена Морозова',
    stage: 'Закрыто',
    created: '05 марта 2023',
    lastActivity: '5 дней назад',
    status: 'Активный'
  },
  {
    id: 5,
    name: 'Елена Новикова',
    email: 'elena@example.com',
    phone: '+7 (905) 567-89-01',
    assignedTo: 'Андрей Соколов',
    stage: 'Новый',
    created: '20 февраля 2023',
    lastActivity: '10 дней назад',
    status: 'Активный'
  }
];

// Создаем диалоги на основе данных клиентов
const mockDialogs = clients.map((client, index) => {
  const dialogTexts = [
    {
      lastMessage: 'Спасибо за информацию о ваших услугах!',
      unreadCount: 2,
      messages: [
        {
          id: 1,
          text: 'Добрый день! Интересует ваша CRM система.',
          sender: 'client',
          time: '10:15'
        },
        {
          id: 2,
          text: 'Здравствуйте! Конечно, расскажу подробнее. Что именно интересует?',
          sender: 'ai',
          time: '10:18'
        },
        {
          id: 3,
          text: 'Нужно управлять клиентской базой и автоматизировать продажи.',
          sender: 'client',
          time: '10:22'
        },
        {
          id: 4,
          text: 'Отлично! Наша система идеально подходит для этих задач. Можем настроить под ваш бизнес.',
          sender: 'ai',
          time: '10:25'
        },
        {
          id: 5,
          text: 'Спасибо за информацию о ваших услугах!',
          sender: 'client',
          time: '10:30'
        }
      ]
    },
    {
      lastMessage: 'Когда можно провести демонстрацию?',
      unreadCount: 0,
      messages: [
        {
          id: 1,
          text: 'Здравствуйте! Хочу узнать больше о ваших решениях.',
          sender: 'client',
          time: '14:00'
        },
        {
          id: 2,
          text: 'Добро пожаловать! С удовольствием расскажу о наших продуктах.',
          sender: 'ai',
          time: '14:03'
        },
        {
          id: 3,
          text: 'Меня интересует автоматизация бизнес-процессов.',
          sender: 'client',
          time: '14:10'
        },
        {
          id: 4,
          text: 'У нас есть отличные решения для этого. Предлагаю провести демонстрацию.',
          sender: 'ai',
          time: '14:15'
        },
        {
          id: 5,
          text: 'Когда можно провести демонстрацию?',
          sender: 'client',
          time: '14:45'
        }
      ]
    },
    {
      lastMessage: 'Хорошо, жду коммерческое предложение',
      unreadCount: 1,
      messages: [
        {
          id: 1,
          text: 'Добрый день! Ищу решение для управления продажами.',
          sender: 'client',
          time: '11:30'
        },
        {
          id: 2,
          text: 'Здравствуйте! Наша платформа отлично подходит для этого.',
          sender: 'ai',
          time: '11:35'
        },
        {
          id: 3,
          text: 'Какие возможности включает базовый пакет?',
          sender: 'client',
          time: '11:40'
        },
        {
          id: 4,
          text: 'Базовый пакет включает CRM, аналитику и интеграции. Могу выслать КП.',
          sender: 'ai',
          time: '11:45'
        },
        {
          id: 5,
          text: 'Хорошо, жду коммерческое предложение',
          sender: 'client',
          time: '13:20'
        }
      ]
    },
    {
      lastMessage: 'Добрый день! Как дела с интеграцией?',
      unreadCount: 0,
      messages: [
        {
          id: 1,
          text: 'Привет! Как продвигается настройка системы?',
          sender: 'client',
          time: '09:00'
        },
        {
          id: 2,
          text: 'Добрый день! Настройка почти завершена, осталось подключить API.',
          sender: 'ai',
          time: '09:15'
        },
        {
          id: 3,
          text: 'Отлично! Когда можно будет тестировать?',
          sender: 'client',
          time: '09:30'
        },
        {
          id: 4,
          text: 'Думаю, к концу недели все будет готово для тестирования.',
          sender: 'ai',
          time: '09:45'
        },
        {
          id: 5,
          text: 'Добрый день! Как дела с интеграцией?',
          sender: 'client',
          time: '12:15'
        }
      ]
    },
    {
      lastMessage: 'Интересует внедрение вашей системы',
      unreadCount: 3,
      messages: [
        {
          id: 1,
          text: 'Здравствуйте! Рассматриваем варианты CRM для компании.',
          sender: 'client',
          time: '16:00'
        },
        {
          id: 2,
          text: 'Отлично! Расскажите больше о вашем бизнесе и потребностях.',
          sender: 'ai',
          time: '16:05'
        },
        {
          id: 3,
          text: 'У нас средний бизнес, нужно управлять 200+ клиентами.',
          sender: 'client',
          time: '16:15'
        },
        {
          id: 4,
          text: 'Наше решение отлично масштабируется. Есть специальные тарифы для среднего бизнеса.',
          sender: 'ai',
          time: '16:20'
        },
        {
          id: 5,
          text: 'Интересует внедрение вашей системы',
          sender: 'client',
          time: '11:30'
        }
      ]
    }
  ];

  const dialogData = dialogTexts[index] || dialogTexts[0];

  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    lastMessage: dialogData.lastMessage,
    time: new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    unreadCount: dialogData.unreadCount,
    status: client.status,
    messages: dialogData.messages
  };
});

function DialogsView() {
  const [selectedDialogId, setSelectedDialogId] = useState<number>(1);
  const [newMessage, setNewMessage] = useState('');

  const selectedDialog = mockDialogs.find((d) => d.id === selectedDialogId);
  const selectedClient = clients.find((c) => c.id === selectedDialogId);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  // Функция для получения прогресса на основе этапа
  const getStageProgress = (stage: string) => {
    const stageProgressMap: Record<string, number> = {
      Новый: 25,
      Квалификация: 50,
      Переговоры: 75,
      Закрыто: 100
    };
    return stageProgressMap[stage] || 25;
  };

  return (
    <div className='w-full'>
      <div className='flex h-[calc(100vh-200px)] overflow-hidden rounded-lg border'>
        {/* Left panel - Dialogs list */}
        <div className='flex w-1/4 flex-col border-r'>
          <div className='border-b p-4'>
            <h3 className='text-lg font-semibold'>Диалоги</h3>
          </div>
          <div className='flex-1 overflow-auto'>
            {mockDialogs.map((dialog) => (
              <div
                key={dialog.id}
                onClick={() => setSelectedDialogId(dialog.id)}
                className={`hover:bg-muted/50 cursor-pointer border-b p-4 transition-colors ${
                  selectedDialogId === dialog.id ? 'bg-muted' : ''
                }`}
              >
                <div className='flex items-start gap-3'>
                  <Avatar className='h-10 w-10'>
                    <AvatarFallback className='bg-primary/10 text-primary text-sm'>
                      {getInitials(dialog.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0 flex-1'>
                    <div className='mb-1 flex items-center justify-between'>
                      <h4 className='truncate text-sm font-medium'>
                        {dialog.name}
                      </h4>
                      <span className='text-muted-foreground text-xs'>
                        {dialog.time}
                      </span>
                    </div>
                    <div className='mb-1 flex items-center gap-2'>
                      <IconPhone className='text-muted-foreground h-3 w-3' />
                      <span className='text-muted-foreground text-xs'>
                        {dialog.phone}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <p className='text-muted-foreground truncate text-xs'>
                        {dialog.lastMessage}
                      </p>
                      {dialog.unreadCount > 0 && (
                        <Badge
                          variant='default'
                          className='flex h-5 min-w-5 items-center justify-center text-xs'
                        >
                          {dialog.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle panel - Chat */}
        <div className='flex flex-1 flex-col'>
          {selectedDialog ? (
            <>
              {/* Chat header */}
              <div className='border-b p-4'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback className='bg-primary/10 text-primary text-sm'>
                      {getInitials(selectedDialog.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className='font-medium'>{selectedDialog.name}</h4>
                    <p className='text-muted-foreground text-sm'>
                      {selectedDialog.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className='flex-1 space-y-4 overflow-auto p-4'>
                {selectedDialog.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'client' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === 'client'
                          ? 'bg-muted'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <div className='text-sm'>{message.text}</div>
                      <div className='mt-1 text-right text-xs opacity-70'>
                        {message.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message input */}
              <div className='border-t p-4'>
                <div className='flex gap-2'>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder='Введите сообщение...'
                    className='flex-1'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Отправить
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className='flex flex-1 items-center justify-center'>
              <p className='text-muted-foreground'>
                Выберите диалог для просмотра сообщений
              </p>
            </div>
          )}
        </div>

        {/* Right panel - Client Details */}
        {selectedDialog && selectedClient && (
          <div className='flex w-80 flex-col border-l'>
            <div className='border-b p-4'>
              <h3 className='text-lg font-semibold'>Информация о клиенте</h3>
            </div>
            <div className='flex-1 overflow-auto p-4'>
              <div className='space-y-4'>
                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Имя
                  </span>
                  <span>{selectedClient.name}</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Телефон
                  </span>
                  <span>{selectedClient.phone}</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Email
                  </span>
                  <span>{selectedClient.email}</span>
                </div>

                <div className='border-t pt-4'>
                  <h4 className='mb-4 text-lg font-semibold'>
                    Данные о сделке
                  </h4>

                  <div className='space-y-4'>
                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Дата создания
                      </span>
                      <span>{selectedClient.created}</span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Количество сообщений
                      </span>
                      <span>{selectedDialog.messages?.length || 0}</span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Текущий этап
                      </span>
                      <span>{selectedClient.stage}</span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Ответственный
                      </span>
                      <span>{selectedClient.assignedTo}</span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground mb-2 text-sm font-medium'>
                        Статус
                      </span>
                      <Badge
                        variant={
                          selectedClient.status === 'Активный'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {selectedClient.status}
                      </Badge>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Вероятность закрытия
                      </span>
                      <div className='mt-1 flex items-center gap-2'>
                        <Progress
                          value={getStageProgress(selectedClient.stage)}
                          className='flex-1'
                        />
                        <span>{getStageProgress(selectedClient.stage)}%</span>
                      </div>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-sm font-medium'>
                        Последняя активность
                      </span>
                      <span>{selectedClient.lastActivity}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessengersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabParam === 'incoming'
      ? 'incoming'
      : tabParam === 'outgoing'
        ? 'outgoing'
        : 'dialogs'
  );
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [editMode, setEditMode] = useState<Set<number>>(new Set());
  const [requests, setRequests] = useState<Record<number, string>>({
    1: 'хочет интегрировать CRM систему в свой бизнес',
    2: 'интересуется автоматизацией бизнес-процессов',
    3: 'ищет решение для управления продажами',
    4: 'нужна помощь с настройкой интеграции',
    5: 'рассматривает внедрение системы для среднего бизнеса'
  });
  const [stages, setStages] = useState<Record<number, string>>({
    1: 'Знакомство',
    2: 'Квалификация',
    3: 'Презентация',
    4: 'Закрытие',
    5: 'Знакомство'
  });

  const toggleRowSelection = (id: number) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const deleteRow = (id: number) => {
    const row = document.getElementById(`row-${id}`);
    if (row) {
      row.style.transition = 'opacity 0.5s ease-out';
      row.style.opacity = '0';
      setTimeout(() => {
        row.style.display = 'none';
        setShowDeleteMessage(true);
        setTimeout(() => {
          setShowDeleteMessage(false);
        }, 3000);
      }, 500);
    }
  };

  const deleteSelectedRows = () => {
    selectedRows.forEach((id: number) => {
      deleteRow(id);
    });
    setSelectedRows(new Set());
  };

  const toggleEditMode = (id: number) => {
    setEditMode((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleRequestChange = (id: number, value: string) => {
    setRequests((prev) => ({ ...prev, [id]: value }));
  };

  const handleStageChange = (id: number, value: string) => {
    setStages((prev) => ({ ...prev, [id]: value }));
  };

  const navigateToChat = (id: number) => {
    router.push(`/dashboard/messengers/${id}/chat`);
  };

  // Update the tab when URL parameters change
  useEffect(() => {
    if (
      tabParam === 'dialogs' ||
      tabParam === 'incoming' ||
      tabParam === 'outgoing'
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <div className='p-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className='w-full space-y-4'>
            {/* Заголовок, табы и кнопка экспорта в одной строке */}
            <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                <h1 className='text-xl font-semibold sm:text-2xl'>
                  Мессенджеры
                </h1>

                <TabsList className='flex gap-4'>
                  <TabsTrigger value='dialogs'>Диалоги</TabsTrigger>
                  <TabsTrigger value='incoming'>Список</TabsTrigger>
                  <TabsTrigger value='outgoing'>Рассылки</TabsTrigger>
                </TabsList>
              </div>

              <Button variant='outline'>Экспорт</Button>
            </div>

            {/* Контент табов */}
            <TabsContent value='dialogs' className='mt-0 space-y-6'>
              <DialogsView />
            </TabsContent>

            <TabsContent value='incoming' className='mt-0 space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Диалоги с клиентами</CardTitle>
                  <CardDescription>
                    Управление всеми входящими сообщениями
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='overflow-hidden rounded-md border'>
                    <div className='overflow-x-auto'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className='w-[40px]'>
                              <Checkbox
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedRows(new Set([1, 2, 3, 4, 5]));
                                  } else {
                                    setSelectedRows(new Set());
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead className='max-w-[100px] text-xs'>
                              Дата и время
                            </TableHead>
                            <TableHead className='max-w-[100px] text-xs'>
                              Посл. Событие
                            </TableHead>
                            <TableHead className='max-w-[80px] text-xs'>
                              Канал
                            </TableHead>
                            <TableHead className='max-w-[120px] text-xs'>
                              Контакт
                            </TableHead>
                            <TableHead className='max-w-[200px] text-xs break-words'>
                              Запрос
                            </TableHead>
                            <TableHead className='max-w-[100px] text-xs'>
                              Вероятность
                            </TableHead>
                            <TableHead className='max-w-[60px] text-xs'>
                              AI/M
                            </TableHead>
                            <TableHead className='max-w-[200px] text-xs break-words'>
                              Этап воронки
                            </TableHead>
                            <TableHead className='text-right'>
                              Действия
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <TableRow key={i} id={`row-${i}`} className='group'>
                              <TableCell className='w-[40px]'>
                                <Checkbox
                                  checked={selectedRows.has(i)}
                                  onCheckedChange={() => toggleRowSelection(i)}
                                />
                              </TableCell>
                              <TableCell className='max-w-[100px] text-xs'>
                                23-11-2024 15:11
                              </TableCell>
                              <TableCell className='max-w-[100px] text-xs'>
                                23-11-2024 15:11
                              </TableCell>
                              <TableCell className='max-w-[80px] text-xs'>
                                WhatsApp
                              </TableCell>
                              <TableCell className='max-w-[120px] text-xs'>
                                +79999999999
                              </TableCell>
                              <TableCell className='max-w-[200px] text-xs break-words'>
                                {editMode.has(i) ? (
                                  <textarea
                                    value={requests[i]}
                                    onChange={(e) =>
                                      handleRequestChange(i, e.target.value)
                                    }
                                    className='w-full rounded border p-1'
                                  />
                                ) : (
                                  requests[i]
                                )}
                              </TableCell>
                              <TableCell className='max-w-[100px] text-xs'>
                                <div className='flex items-center'>
                                  <Progress value={65} />
                                  <span className='ml-2'>{65}%</span>
                                </div>
                              </TableCell>
                              <TableCell className='max-w-[60px] text-xs'>
                                <Switch defaultChecked />
                              </TableCell>
                              <TableCell className='max-w-[200px] text-xs break-words'>
                                {editMode.has(i) ? (
                                  <select
                                    value={stages[i]}
                                    onChange={(e) =>
                                      handleStageChange(i, e.target.value)
                                    }
                                    className='w-full rounded border p-1'
                                  >
                                    <option value='Знакомство'>
                                      Знакомство
                                    </option>
                                    <option value='Квалификация'>
                                      Квалификация
                                    </option>
                                    <option value='Презентация'>
                                      Презентация
                                    </option>
                                    <option value='Закрытие'>Закрытие</option>
                                  </select>
                                ) : (
                                  stages[i]
                                )}
                              </TableCell>
                              <TableCell className='text-right'>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='opacity-0 group-hover:opacity-100 sm:opacity-100'
                                    >
                                      <IconDotsVertical className='h-4 w-4' />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align='end'>
                                    <DropdownMenuItem
                                      onClick={() => navigateToChat(i)}
                                    >
                                      Посмотреть
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => toggleEditMode(i)}
                                    >
                                      {editMode.has(i)
                                        ? 'Сохранить'
                                        : 'Редактировать'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => deleteRow(i)}
                                    >
                                      Удалить
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Статистика обращений</CardTitle>
                  <CardDescription>
                    Статистика по входящим сообщениям
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>124</div>
                      <div className='text-muted-foreground text-sm'>
                        Всего за сегодня
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>98%</div>
                      <div className='text-muted-foreground text-sm'>
                        Отвечено
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>3.2 мин</div>
                      <div className='text-muted-foreground text-sm'>
                        Среднее время ответа
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='outgoing' className='mt-0 space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Рассылки</CardTitle>
                  <CardDescription>
                    Управление всеми исходящими сообщениями
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className='flex items-start gap-4 rounded-lg border p-4'
                      >
                        <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                          <IconMessage className='text-primary h-5 w-5' />
                        </div>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-medium'>Рассылка #{i}</h3>
                            <Badge variant='outline'>Telegram</Badge>
                            <span className='text-muted-foreground text-xs'>
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>
                          <p className='text-muted-foreground text-sm'>
                            Уважаемые клиенты! Сообщаем о новых услугах в нашей
                            компании...
                          </p>
                          <div className='flex gap-2 text-xs'>
                            <span>Отправлено: 145</span>
                            <span>Доставлено: 142</span>
                            <span>Прочитано: 98</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Статистика рассылок</CardTitle>
                  <CardDescription>
                    Эффективность исходящих сообщений
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>14</div>
                      <div className='text-muted-foreground text-sm'>
                        Активных кампаний
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>1,245</div>
                      <div className='text-muted-foreground text-sm'>
                        Отправлено за месяц
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>18%</div>
                      <div className='text-muted-foreground text-sm'>
                        Средний отклик
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
        {selectedRows.size > 0 && (
          <div className='fixed right-4 bottom-4'>
            <Button variant='destructive' onClick={deleteSelectedRows}>
              Удалить выбранные
            </Button>
          </div>
        )}
        {showDeleteMessage && (
          <div className='fixed right-4 bottom-16 rounded bg-green-500 p-2 text-white'>
            Элементы были удалены
          </div>
        )}
      </div>
    </Suspense>
  );
}
