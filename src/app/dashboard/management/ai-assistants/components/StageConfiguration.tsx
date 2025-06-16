'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  IconRotateClockwise,
  IconPlus,
  IconSend,
  IconTrash
} from '@tabler/icons-react';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: number;
}

interface ChatDialog {
  id: string;
  messages: ChatMessage[];
}

interface StageSettings {
  id: number;
  name: string;
  prompt: string;
  isActive: boolean;
  aiSettings: any;
}

interface StageConfigurationProps {
  stages: StageSettings[];
  currentFunnelData: any;
  activeStageId: number;
  activeSettingsTab: 'setup' | 'test';
  instructions: string;
  saving: boolean;
  successMessage: string | null;
  error: string | null;
  onStageChange: (stageId: number) => void;
  onTabChange: (tab: 'setup' | 'test') => void;
  onInstructionsChange: (value: string) => void;
  onSubmitInstructions: () => void;
  onReloadPrompt: () => void;
}

export function StageConfiguration({
  stages,
  currentFunnelData,
  activeStageId,
  activeSettingsTab,
  instructions,
  saving,
  successMessage,
  error,
  onStageChange,
  onTabChange,
  onInstructionsChange,
  onSubmitInstructions,
  onReloadPrompt
}: StageConfigurationProps) {
  // Состояние для управления диалогами
  const [dialogs, setDialogs] = useState<ChatDialog[]>([]);
  const [activeDialogId, setActiveDialogId] = useState<string>('');
  const [userMessage, setUserMessage] = useState<string>('');

  // Загрузка диалогов из localStorage при монтировании компонента или изменении этапа
  useEffect(() => {
    const loadDialogs = () => {
      try {
        const savedDialogsKey = `ai-assistants-dialogs-stage-${activeStageId}`;
        const savedDialogsJson = localStorage.getItem(savedDialogsKey);

        if (savedDialogsJson) {
          const savedDialogs = JSON.parse(savedDialogsJson);
          setDialogs(savedDialogs.dialogs);
          setActiveDialogId(
            savedDialogs.activeDialogId || savedDialogs.dialogs[0]?.id || ''
          );
        } else {
          // Если для этого этапа нет сохраненных диалогов, создаем пустой диалог
          const newDialogId = `stage-${activeStageId}-dialog-${Date.now()}`;
          const newDialog: ChatDialog = {
            id: newDialogId,
            messages: []
          };
          setDialogs([newDialog]);
          setActiveDialogId(newDialogId);
        }
      } catch (error) {
        console.error('Ошибка при загрузке диалогов из localStorage:', error);
        // В случае ошибки создаем пустой диалог
        const newDialogId = `stage-${activeStageId}-dialog-${Date.now()}`;
        const newDialog: ChatDialog = {
          id: newDialogId,
          messages: []
        };
        setDialogs([newDialog]);
        setActiveDialogId(newDialogId);
      }
    };

    loadDialogs();
  }, [activeStageId]);

  // Сохранение диалогов в localStorage при их изменении
  useEffect(() => {
    const saveDialogs = () => {
      try {
        const savedDialogsKey = `ai-assistants-dialogs-stage-${activeStageId}`;
        localStorage.setItem(
          savedDialogsKey,
          JSON.stringify({
            dialogs,
            activeDialogId,
            timestamp: Date.now()
          })
        );
      } catch (error) {
        console.error('Ошибка при сохранении диалогов в localStorage:', error);
      }
    };

    if (dialogs.length > 0) {
      saveDialogs();
    }
  }, [dialogs, activeDialogId, activeStageId]);

  // Получить активный диалог
  const activeDialog = dialogs.find((dialog) => dialog.id === activeDialogId) ||
    dialogs[0] || { id: '', messages: [] };

  // Создать новый диалог
  const createNewDialog = () => {
    const newDialogId = `stage-${activeStageId}-dialog-${Date.now()}`;
    const newDialog: ChatDialog = {
      id: newDialogId,
      messages: [] // Пустой диалог без начальных сообщений
    };

    setDialogs([...dialogs, newDialog]);
    setActiveDialogId(newDialogId);
  };

  // Удалить текущий диалог
  const deleteCurrentDialog = () => {
    // Проверяем, что есть хотя бы один диалог помимо текущего
    if (dialogs.length <= 1) {
      // Если это единственный диалог, просто очищаем его сообщения
      setDialogs([{ id: activeDialogId, messages: [] }]);
      return;
    }

    // Находим индекс текущего диалога
    const currentIndex = dialogs.findIndex(
      (dialog) => dialog.id === activeDialogId
    );

    // Удаляем текущий диалог
    const newDialogs = dialogs.filter((dialog) => dialog.id !== activeDialogId);

    // Определяем, какой диалог станет активным после удаления
    let newActiveIndex = 0;
    if (currentIndex > 0) {
      // Если удаляемый диалог не первый, активируем предыдущий
      newActiveIndex = currentIndex - 1;
    }

    // Устанавливаем новый список диалогов и новый активный диалог
    setDialogs(newDialogs);
    setActiveDialogId(newDialogs[newActiveIndex].id);
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
        dialog.id === activeDialogId
          ? { ...dialog, messages: [...dialog.messages, newUserMessage] }
          : dialog
      )
    );

    // Сохраняем сообщение пользователя
    const userMessageText = userMessage;

    // Очищаем поле ввода
    setUserMessage('');

    // Получаем ответ от ассистента
    try {
      // Здесь должен быть запрос к API для получения ответа от ассистента
      // Пример запроса:
      /*
      const response = await fetch('/api/organization/[id]/funnel/[funnelId]/assistant/[codeName]', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessageText,
          dialogId: activeDialogId,
          stageId: activeStageId
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Добавляем ответ ассистента в диалог
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          text: data.message,
          sender: 'assistant',
          timestamp: Date.now()
        };
        
        setDialogs(prevDialogs => 
          prevDialogs.map(dialog => 
            dialog.id === activeDialogId 
              ? { ...dialog, messages: [...dialog.messages, assistantMessage] }
              : dialog
          )
        );
      }
      */

      // Временное решение - имитация ответа ассистента через 1 секунду
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          text: `Это автоматический ответ на ваше сообщение: "${userMessageText}"`,
          sender: 'assistant',
          timestamp: Date.now()
        };

        setDialogs((prevDialogs) =>
          prevDialogs.map((dialog) =>
            dialog.id === activeDialogId
              ? { ...dialog, messages: [...dialog.messages, assistantMessage] }
              : dialog
          )
        );
      }, 1000);
    } catch (error) {
      console.error('Ошибка при получении ответа от ассистента:', error);
    }
  };

  // Обработчик нажатия Enter для отправки сообщения
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Stage Tabs */}
      <Card className='h-fit'>
        <CardHeader>
          <CardTitle>Настройка мультиагента по этапам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2'>
            {currentFunnelData?.stages?.map((stage: any, index: number) => (
              <Button
                key={stage.name || index}
                variant={activeStageId === index + 1 ? 'default' : 'outline'}
                size='sm'
                onClick={() => onStageChange(index + 1)}
              >
                {stage.name || `Этап ${index + 1}`}
              </Button>
            )) ||
              stages.map((stage) => (
                <Button
                  key={stage.id}
                  variant={activeStageId === stage.id ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => onStageChange(stage.id)}
                >
                  {stage.name}
                </Button>
              ))}
            <Button variant='outline' size='sm' disabled>
              +
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings and Testing Tabs */}
      <Card className='h-fit'>
        <CardHeader>
          <CardTitle>Настройка промптов и тестирование этапа</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeSettingsTab}
            onValueChange={(value) => onTabChange(value as 'setup' | 'test')}
          >
            <TabsList className='w-full'>
              <TabsTrigger value='setup' className='flex-1'>
                Настройка
              </TabsTrigger>
              <TabsTrigger value='test' className='flex-1'>
                Тестирование
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Agent Prompt - Updated with new chat interface design */}
      <Card className='h-fit'>
        {activeSettingsTab !== 'test' && (
          <CardHeader>
            <CardTitle>Промпт агента</CardTitle>
          </CardHeader>
        )}
        <CardContent className='p-0'>
          {/* Chat interface - only shown when in testing mode */}
          {activeSettingsTab === 'test' && (
            <div className='flex h-[250px] flex-col'>
              {/* Chat Header */}
              <div className='flex items-center justify-between border-b pb-4'>
                <div className='flex items-center gap-4'>
                  <div className='flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200'>
                    <img
                      src='/placeholder-avatar.png'
                      alt='AI Assistant'
                      className='h-full w-full object-cover'
                      onError={(e) => {
                        e.currentTarget.src =
                          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>';
                      }}
                    />
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium'>Тестирование</span>
                    <span className='text-muted-foreground text-sm'>
                      {dialogs.length > 1 && (
                        <select
                          className='cursor-pointer border-none bg-transparent text-sm outline-none'
                          value={activeDialogId}
                          onChange={(e) => setActiveDialogId(e.target.value)}
                        >
                          {dialogs.map((dialog, index) => (
                            <option key={dialog.id} value={dialog.id}>
                              Диалог {index + 1}{' '}
                              {dialog.messages.length > 0
                                ? `(${dialog.messages.length} сообщ.)`
                                : '(пустой)'}
                            </option>
                          ))}
                        </select>
                      )}
                      {dialogs.length <= 1 && `Агент этапа ${activeStageId}`}
                    </span>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button
                    size='icon'
                    variant='destructive'
                    className='h-8 w-8 rounded-full'
                    onClick={deleteCurrentDialog}
                    title='Удалить текущий диалог'
                    disabled={
                      dialogs.length === 1 && activeDialog.messages.length === 0
                    }
                  >
                    <IconTrash className='h-3.5 w-3.5' />
                  </Button>
                  <Button
                    size='icon'
                    className='h-8 w-8 rounded-full'
                    onClick={createNewDialog}
                    title='Создать новый диалог'
                  >
                    <IconPlus className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className='flex min-h-[130px] flex-col gap-2.5 overflow-y-auto py-4'>
                {activeDialog.messages.length > 0 ? (
                  activeDialog.messages.map((message) => (
                    <div key={message.id} className='flex flex-col gap-2.5'>
                      <div
                        className={`${
                          message.sender === 'assistant'
                            ? 'self-start bg-gray-100'
                            : 'self-end bg-zinc-900 text-white'
                        } max-w-[70%] rounded-lg p-3`}
                      >
                        <p className='text-sm'>{message.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <p className='text-center text-sm text-gray-400'>
                      Здесь будут отображаться сообщения диалога.
                      <br />
                      Напишите сообщение, чтобы начать тестирование ассистента.
                    </p>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className='mt-auto border-t pt-4'>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    placeholder='Введите сообщение от лица клиента...'
                    className='flex-1 rounded-md border border-gray-200 px-4 py-2 text-sm'
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <Button
                    size='icon'
                    variant='default'
                    className='h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700'
                    onClick={sendMessage}
                  >
                    <IconSend className='h-5 w-5 text-white' />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Agent Prompt Editor - only shown when in setup mode */}
          {activeSettingsTab === 'setup' && (
            <div>
              <Textarea
                value={instructions}
                onChange={(e) => onInstructionsChange(e.target.value)}
                placeholder='Fix the grammar.'
                className='h-[150px] w-full resize-none'
              />

              {/* Success and Error Messages */}
              {successMessage && !successMessage.includes('AI настройки') && (
                <div className='mt-4 rounded-md border border-green-200 bg-green-50 p-3'>
                  <div className='flex'>
                    <div className='text-sm text-green-700'>
                      {successMessage}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className='mt-4 rounded-md border border-red-200 bg-red-50 p-3'>
                  <div className='flex'>
                    <div className='text-sm text-red-700'>{error}</div>
                  </div>
                </div>
              )}

              <div className='mt-4 flex gap-2'>
                <Button
                  onClick={onSubmitInstructions}
                  disabled={saving}
                  className='flex-1'
                >
                  {saving ? 'Сохранение...' : 'Обновить промпт'}
                </Button>
                <Button variant='outline' size='icon' onClick={onReloadPrompt}>
                  <IconRotateClockwise className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
