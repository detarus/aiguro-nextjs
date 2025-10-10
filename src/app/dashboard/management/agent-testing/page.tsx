'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { IconArrowLeft, IconSend } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Интерфейс сообщения чата
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: number;
}

// Интерфейс диалога
interface ChatDialog {
  id: string;
  messages: ChatMessage[];
}

// Интерфейс для агентов
interface Agent {
  id: string;
  name: string;
  description: string;
}

export default function AgentTestingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentParam = searchParams.get('agent');

  // Список доступных агентов
  const agents: Agent[] = [
    {
      id: 'ai-assistants',
      name: 'AI-ассистенты',
      description: 'Мультиагент, отвечающий за этапы воронки'
    },
    {
      id: 'follow-up',
      name: 'Фоллоу Ап (анализ)',
      description: 'Системный агент, отвечающий за напоминания клиентам'
    },
    {
      id: 'follow-up-messages',
      name: 'Фоллоу Ап (сообы)',
      description: 'Агент, отвечающий за напоминания клиентам'
    },
    {
      id: 'analysis',
      name: 'Анализ',
      description: 'Агент, отвечающий за аналитику данных'
    }
  ];

  // Состояния
  const [selectedAgent, setSelectedAgent] = useState<string>(
    agentParam || 'ai-assistants'
  );
  const [dialogs, setDialogs] = useState<ChatDialog[]>([
    {
      id: 'default-dialog',
      messages: []
    }
  ]);
  const [_activeDialogId] = useState<string>('default-dialog');
  const [userMessage, setUserMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Состояния для настроек агента
  const [contextMemory, setContextMemory] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);
  const [managerPause, setManagerPause] = useState(true);

  // Обработчик возврата назад
  const handleBack = () => {
    router.push('/dashboard/management');
  };

  // Обработчик выбора агента
  const handleAgentChange = (value: string) => {
    setSelectedAgent(value);

    // Обновляем URL с новым параметром агента
    const url = new URL(window.location.href);
    url.searchParams.set('agent', value);
    window.history.pushState({}, '', url);

    // Очищаем сообщения при смене агента
    setDialogs([
      {
        id: 'default-dialog',
        messages: []
      }
    ]);
  };

  // Отправить сообщение
  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    // Добавляем сообщение пользователя
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: userMessage,
      sender: 'user',
      timestamp: Date.now()
    };

    // Обновляем диалоги с новым сообщением пользователя
    setDialogs((prevDialogs) =>
      prevDialogs.map((dialog) =>
        dialog.id === _activeDialogId
          ? { ...dialog, messages: [...dialog.messages, newUserMessage] }
          : dialog
      )
    );

    // Сохраняем сообщение пользователя
    const userMessageText = userMessage;

    // Очищаем поле ввода
    setUserMessage('');

    // Устанавливаем состояние загрузки
    setLoading(true);

    // Имитация ответа ассистента
    setTimeout(() => {
      // Получаем имя выбранного агента
      let responseText = '';

      switch (selectedAgent) {
        case 'ai-assistants':
          responseText = `Я AI-ассистент этапов воронки. Ваш запрос: "${userMessageText}" обрабатывается. Чем я могу вам помочь?`;
          break;
        case 'follow-up':
          responseText = `Я агент Follow Up (анализ). Анализирую ваш запрос: "${userMessageText}". Какие данные вам нужно проанализировать?`;
          break;
        case 'follow-up-messages':
          responseText = `Я агент Follow Up (сообщения). Ваш запрос: "${userMessageText}" принят. Какой тип сообщения вы хотите отправить клиенту?`;
          break;
        case 'analysis':
          responseText = `Я аналитический агент. Анализирую данные по запросу: "${userMessageText}". Какие метрики вас интересуют?`;
          break;
        default:
          responseText = `Получен ваш запрос: "${userMessageText}". Как я могу вам помочь?`;
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        text: responseText,
        sender: 'assistant',
        timestamp: Date.now()
      };

      setDialogs((prevDialogs) =>
        prevDialogs.map((dialog) =>
          dialog.id === _activeDialogId
            ? { ...dialog, messages: [...dialog.messages, assistantMessage] }
            : dialog
        )
      );

      // Снимаем состояние загрузки
      setLoading(false);
    }, 1500);
  };

  // Обработчик нажатия Enter для отправки сообщения
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Получение активного диалога
  const activeDialog = dialogs.find(
    (dialog) => dialog.id === _activeDialogId
  ) ||
    dialogs[0] || { id: '', messages: [] };

  // Установка выбранного агента из URL при загрузке страницы
  useEffect(() => {
    if (agentParam && agents.some((agent) => agent.id === agentParam)) {
      setSelectedAgent(agentParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentParam]);

  // Сохранить настройки
  const handleSaveSettings = () => {
    // Здесь будет логика сохранения настроек
    console.log('Настройки сохранены');
  };

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Заголовок с кнопкой назад */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleBack}
              className='mr-2'
            >
              <IconArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h1 className='text-2xl font-bold'>Тестирование агента</h1>
              <p className='text-muted-foreground'>
                Проверка работы AI-агента в диалоговом режиме
              </p>
            </div>
          </div>
        </div>

        {/* Основной контент с боковым сайдбаром */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
          {/* Боковой сайдбар с настройками */}
          <div className='space-y-6 md:col-span-1'>
            {/* Выбор агента */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle>Настройки тестирования</CardTitle>
                <CardDescription className='pt-2'>
                  Основные параметры формата тестирования
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Выбор агента */}
                <div className='space-y-2'>
                  <Label htmlFor='agent-select'>Выбор агента</Label>
                  <Select
                    value={selectedAgent}
                    onValueChange={handleAgentChange}
                  >
                    <SelectTrigger id='agent-select' className='w-full'>
                      <SelectValue placeholder='Выберите агента' />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Опции агента */}
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Label
                        htmlFor='context-memory'
                        className='text-base font-medium'
                      >
                        Тестировать Follow Up
                      </Label>
                      <p className='text-muted-foreground text-sm'>
                        Автоматический пропуск времени сообщений
                      </p>
                    </div>
                    <Switch
                      id='context-memory'
                      checked={contextMemory}
                      onCheckedChange={setContextMemory}
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <Label
                        htmlFor='data-collection'
                        className='text-base font-medium'
                      >
                        Общая аналитика
                      </Label>
                      <p className='text-muted-foreground text-sm'>
                        Используем общий анализ для тестирования или же анализ
                        Follow Up
                      </p>
                    </div>
                    <Switch
                      id='data-collection'
                      checked={dataCollection}
                      onCheckedChange={setDataCollection}
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <Label
                        htmlFor='manager-pause'
                        className='text-base font-medium'
                      >
                        Анализ в формате JSON
                      </Label>
                      <p className='text-muted-foreground text-sm'>
                        Выводить результаты не текстом, а объектом JSON
                      </p>
                    </div>
                    <Switch
                      id='manager-pause'
                      checked={managerPause}
                      onCheckedChange={setManagerPause}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveSettings}
                  className='mt-4 w-full bg-gray-600 hover:bg-gray-700'
                >
                  Сохранить настройки
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Основная область чата */}
          <div className='md:col-span-3'>
            {/* Интерфейс чата */}
            <Card className='flex flex-col'>
              <CardHeader className='pb-3'>
                <CardTitle>Чат с агентом</CardTitle>
              </CardHeader>
              <CardContent className='flex-1'>
                <Tabs defaultValue='testing' className='w-full'>
                  {/* <TabsList className='mb-4'>
                    <TabsTrigger value='setup' disabled>
                      Настройка
                    </TabsTrigger>
                    <TabsTrigger value='testing'>Тестирование</TabsTrigger>
                  </TabsList> */}
                  <TabsContent value='testing' className='space-y-4'>
                    <div className='flex h-[468px] flex-col'>
                      {/* Область сообщений */}
                      <div className='mb-4 flex-1 overflow-y-auto rounded-md border bg-gray-50 p-4'>
                        {activeDialog.messages.length === 0 ? (
                          <div className='flex h-full flex-col items-center justify-center text-center text-gray-400'>
                            <p>Здесь будут отображаться сообщения диалога.</p>
                            <p>
                              Напишите сообщение, чтобы начать тестирование
                              ассистента.
                            </p>
                          </div>
                        ) : (
                          <div className='space-y-4'>
                            {activeDialog.messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${
                                  message.sender === 'user'
                                    ? 'justify-end'
                                    : 'justify-start'
                                }`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-lg p-3 ${
                                    message.sender === 'user'
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-200 text-gray-800'
                                  }`}
                                >
                                  <div className='flex items-start gap-2'>
                                    {message.sender === 'assistant' && (
                                      <Avatar className='h-8 w-8'>
                                        <div className='flex h-full w-full items-center justify-center rounded-full bg-gray-300'>
                                          A
                                        </div>
                                      </Avatar>
                                    )}
                                    <div>
                                      <p className='whitespace-pre-wrap'>
                                        {message.text}
                                      </p>
                                      <p className='mt-1 text-xs opacity-70'>
                                        {new Date(
                                          message.timestamp
                                        ).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Поле ввода сообщения */}
                      <div className='flex gap-2'>
                        <input
                          type='text'
                          value={userMessage}
                          onChange={(e) => setUserMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder='Введите сообщение от лица клиента...'
                          className='flex-1 rounded-md border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={loading || !userMessage.trim()}
                          className='flex h-12 w-12 items-center justify-center rounded-full p-0'
                        >
                          <IconSend className='h-5 w-5' />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
