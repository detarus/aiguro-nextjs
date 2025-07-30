'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import {
  IconArrowLeft,
  IconTrash,
  IconEdit,
  IconPlus,
  IconSend,
  IconRotateClockwise
} from '@tabler/icons-react';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/contexts/FunnelsContext';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

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

// Тип параметра
type ParameterType = 'Текстовый' | 'Числовой' | 'Список' | 'Дата';

// Интерфейс для параметра
interface Parameter {
  id: string;
  name: string;
  type: ParameterType;
  instruction: string;
  possibleValues?: string[];
  useBehaviorScenarios?: boolean;
}

// Интерфейсы
interface FollowUpSettings {
  parameters: Parameter[];
  prompt: string;
  generalSettings: {
    enabled: boolean;
    count: number;
    delay: number;
    channel: string;
  };
}

export default function FollowUpPage() {
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;
  const { currentFunnel } = useFunnels();
  const router = useRouter();

  // Состояния
  const [settings, setSettings] = useState<FollowUpSettings>({
    parameters: [
      {
        id: '1',
        name: 'client_name',
        type: 'Текстовый',
        instruction: 'Имя клиента',
        possibleValues: [],
        useBehaviorScenarios: false
      },
      {
        id: '2',
        name: 'client_phone',
        type: 'Текстовый',
        instruction: 'Телефон клиента',
        possibleValues: [],
        useBehaviorScenarios: false
      },
      {
        id: '3',
        name: 'last_message',
        type: 'Текстовый',
        instruction: 'Последнее сообщение клиента',
        possibleValues: [],
        useBehaviorScenarios: false
      },
      {
        id: '4',
        name: 'follow_up_type',
        type: 'Список',
        instruction: 'Тип напоминания',
        possibleValues: ['Первичное', 'Повторное', 'Финальное'],
        useBehaviorScenarios: true
      }
    ],
    prompt:
      'Вы - ассистент по отправке follow-up сообщений. Ваша задача - напоминать клиентам о предыдущих обращениях и поддерживать их интерес. Будьте вежливы и ненавязчивы.',
    generalSettings: {
      enabled: true,
      count: 2,
      delay: 24,
      channel: 'Telegram'
    }
  });

  // Состояния для нового параметра
  const [newParameter, setNewParameter] = useState<Omit<Parameter, 'id'>>({
    name: '',
    type: 'Текстовый',
    instruction: '',
    possibleValues: [],
    useBehaviorScenarios: false
  });

  // Состояние для нового возможного значения
  const [newValue, setNewValue] = useState<string>('');

  // Состояния для промпта и диалога
  const [prompt, setPrompt] = useState<string>(
    'Вы - ассистент по отправке follow-up сообщений. Ваша задача - напоминать клиентам о предыдущих обращениях и поддерживать их интерес. Будьте вежливы и ненавязчивы.'
  );
  const [dialogs, setDialogs] = useState<ChatDialog[]>([
    {
      id: 'default-dialog',
      messages: []
    }
  ]);
  const [activeDialogId, setActiveDialogId] =
    useState<string>('default-dialog');
  const [userMessage, setUserMessage] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'prompt' | 'parameters'>('prompt');

  // Обработчик возврата назад
  const handleBack = () => {
    router.push('/dashboard/management');
  };

  // Обработчик изменения общих настроек
  const handleGeneralSettingChange = (
    field: keyof typeof settings.generalSettings,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      generalSettings: {
        ...prev.generalSettings,
        [field]: value
      }
    }));
  };

  // Обработчик добавления нового параметра
  const handleAddParameter = () => {
    if (!newParameter.name || !newParameter.instruction) {
      setError('Заполните все обязательные поля');
      return;
    }

    const id = Date.now().toString();

    setSettings((prev) => ({
      ...prev,
      parameters: [...prev.parameters, { ...newParameter, id }]
    }));

    // Сброс формы
    setNewParameter({
      name: '',
      type: 'Текстовый',
      instruction: '',
      possibleValues: [],
      useBehaviorScenarios: false
    });

    setNewValue('');
    setSuccessMessage('Параметр успешно добавлен');
  };

  // Обработчик удаления параметра
  const handleDeleteParameter = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      parameters: prev.parameters.filter((param) => param.id !== id)
    }));
    setSuccessMessage('Параметр удален');
  };

  // Обработчик добавления возможного значения
  const handleAddPossibleValue = () => {
    if (!newValue) return;

    setNewParameter((prev) => ({
      ...prev,
      possibleValues: [...(prev.possibleValues || []), newValue]
    }));

    setNewValue('');
  };

  // Обработчик удаления возможного значения
  const handleRemovePossibleValue = (value: string) => {
    setNewParameter((prev) => ({
      ...prev,
      possibleValues: (prev.possibleValues || []).filter((v) => v !== value)
    }));
  };

  // Обработчик изменения промпта
  const handlePromptChange = (value: string) => {
    setPrompt(value);
  };

  // Обработчик сохранения промпта
  const handleSavePrompt = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Здесь будет код для сохранения настроек на сервере
      // Имитация задержки сети
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSettings((prev) => ({
        ...prev,
        prompt
      }));

      setSuccessMessage('Промпт успешно сохранен!');
    } catch (err) {
      setError('Произошла ошибка при сохранении промпта');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Обработчик сохранения настроек
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Здесь будет код для сохранения настроек на сервере
      // Имитация задержки сети
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccessMessage('Настройки успешно сохранены');
    } catch (err) {
      setError('Произошла ошибка при сохранении настроек');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Создать новый диалог
  const createNewDialog = () => {
    const newDialogId = `dialog-${Date.now()}`;
    const newDialog: ChatDialog = {
      id: newDialogId,
      messages: []
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

    // Имитация ответа ассистента
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        text: `Это автоматический ответ на ваш follow-up запрос: "${userMessageText}"`,
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
  };

  // Обработчик нажатия Enter для отправки сообщения
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Получение активного диалога
  const activeDialog = dialogs.find((dialog) => dialog.id === activeDialogId) ||
    dialogs[0] || { id: '', messages: [] };

  // Загрузка данных при монтировании
  useEffect(() => {
    // В реальной реализации здесь будет запрос к API для получения данных
    console.log('Загрузка данных follow-up...');

    // Загрузка сохраненных диалогов из localStorage
    try {
      const savedDialogsKey = 'follow-up-dialogs';
      const savedDialogsJson = localStorage.getItem(savedDialogsKey);

      if (savedDialogsJson) {
        const savedData = JSON.parse(savedDialogsJson);
        setDialogs(savedData.dialogs);
        setActiveDialogId(
          savedData.activeDialogId ||
            savedData.dialogs[0]?.id ||
            'default-dialog'
        );
      }
    } catch (error) {
      console.error('Ошибка при загрузке диалогов:', error);
    }
  }, [backendOrgId, currentFunnel?.id]);

  // Сохранение диалогов в localStorage
  useEffect(() => {
    if (dialogs.length > 0) {
      try {
        const savedDialogsKey = 'follow-up-dialogs';
        localStorage.setItem(
          savedDialogsKey,
          JSON.stringify({
            dialogs,
            activeDialogId,
            timestamp: Date.now()
          })
        );
      } catch (error) {
        console.error('Ошибка при сохранении диалогов:', error);
      }
    }
  }, [dialogs, activeDialogId]);

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
              <h1 className='text-2xl font-bold'>
                Настройка Follow Up (анализ)
              </h1>
              <p className='text-muted-foreground'>
                Управление автоматическими действиями по анализу
              </p>
            </div>
          </div>
        </div>

        {/* Основные настройки */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Общие настройки</CardTitle>
            <CardDescription>
              Базовые настройки для follow-up анализа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-followup" className="text-base font-medium">
                    Включить Follow Up
                  </Label>
                  <p className="text-muted-foreground text-sm">
                    Активировать автоматические последующие действия
                  </p>
                </div>
                <Switch
                  id="enable-followup"
                  checked={settings.generalSettings.enabled}
                  onCheckedChange={(value) => handleGeneralSettingChange('enabled', value)}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="followup-count">Количество попыток</Label>
                  <Input
                    id="followup-count"
                    type="number"
                    value={settings.generalSettings.count}
                    onChange={(e) => handleGeneralSettingChange('count', parseInt(e.target.value))}
                    min={1}
                    max={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followup-delay">Интервал (часы)</Label>
                  <Input
                    id="followup-delay"
                    type="number"
                    value={settings.generalSettings.delay}
                    onChange={(e) => handleGeneralSettingChange('delay', parseInt(e.target.value))}
                    min={1}
                    max={72}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel">Канал связи</Label>
                  <Select
                    value={settings.generalSettings.channel}
                    onValueChange={(value) => handleGeneralSettingChange('channel', value)}
                  >
                    <SelectTrigger id="channel">
                      <SelectValue placeholder="Выберите канал связи" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Каналы</SelectLabel>
                        <SelectItem value="Telegram">Telegram</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Сохранение...' : 'Сохранить настройки'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Промпт и параметры */}
        <Card>
          <CardHeader>
            <CardTitle>Расширенные настройки</CardTitle>
            <CardDescription>
              Настройка промпта и параметров для анализа follow-up сообщений
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as 'prompt' | 'parameters')
              }
              className='space-y-4'
            >
              <TabsList>
                <TabsTrigger value='prompt'>Промпт</TabsTrigger>
                <TabsTrigger value='parameters'>Параметры</TabsTrigger>
              </TabsList>

              {/* Раздел с промптом */}
              <TabsContent value='prompt' className='space-y-4'>
                <Card className='h-fit'>
                  <CardContent className='p-0'>
                    <div className='flex flex-col'>
                      {/* Редактор промпта */}
                      <div className='border-b p-4'>
                        <Label htmlFor='prompt-editor' className='mb-2 block'>
                          Настройка промпта для follow-up анализа
                        </Label>
                        <Textarea
                          id='prompt-editor'
                          value={prompt}
                          onChange={(e) => handlePromptChange(e.target.value)}
                          placeholder='Введите промпт для follow-up ассистента...'
                          className='h-[150px] w-full resize-none'
                        />
                        <div className='mt-4 flex justify-end'>
                          <Button onClick={handleSavePrompt} disabled={saving}>
                            {saving ? 'Сохранение...' : 'Сохранить промпт'}
                          </Button>
                        </div>

                        {/* Сообщения об успехе/ошибке сохранения промпта */}
                        {successMessage && (
                          <div className='mt-4 rounded-md bg-green-100 px-4 py-2 text-green-800'>
                            {successMessage}
                          </div>
                        )}
                        {error && (
                          <div className='bg-destructive/10 text-destructive mt-4 rounded-md px-4 py-2'>
                            {error}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Раздел с параметрами */}
              <TabsContent value='parameters' className='space-y-4'>
                <div className='space-y-6'>
                  <p className='text-muted-foreground'>
                    Настройте параметры для follow-up сообщений
                  </p>

                  {/* Список существующих параметров */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Параметры функции</h3>
                    {settings.parameters.map((param) => (
                      <div
                        key={param.id}
                        className='space-y-4 rounded-lg border p-4'
                      >
                        <div className='flex justify-between'>
                          <div className='space-y-1'>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium'>{param.name}</span>
                              <Badge variant='outline'>{param.type}</Badge>
                            </div>
                            <p className='text-muted-foreground text-sm'>
                              {param.instruction}
                            </p>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleDeleteParameter(param.id)}
                            >
                              <IconTrash className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>

                        {param.possibleValues &&
                          param.possibleValues.length > 0 && (
                            <div className='space-y-2'>
                              <Label>Возможные значения:</Label>
                              <div className='flex flex-wrap gap-2'>
                                {param.possibleValues.map((value, i) => (
                                  <Badge
                                    key={i}
                                    variant='secondary'
                                    className='py-1'
                                  >
                                    {value}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                        {param.useBehaviorScenarios && (
                          <div className='flex items-center gap-2'>
                            <Checkbox
                              id={`scenario-${param.id}`}
                              checked={true}
                              disabled
                            />
                            <Label
                              htmlFor={`scenario-${param.id}`}
                              className='text-sm'
                            >
                              Сценарии поведения для различных значений
                            </Label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Форма добавления нового параметра */}
                  <div className='space-y-4 rounded-lg border p-4'>
                    <h3 className='text-lg font-medium'>
                      Добавить новый параметр
                    </h3>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
                      <div className='space-y-2'>
                        <Label htmlFor='param-name'>Имя параметра</Label>
                        <Input
                          id='param-name'
                          value={newParameter.name}
                          onChange={(e) =>
                            setNewParameter({
                              ...newParameter,
                              name: e.target.value
                            })
                          }
                        />
                      </div>

                      <div className='col-span-2 space-y-2'>
                        <Label htmlFor='param-instruction'>
                          Инструкция для параметра
                        </Label>
                        <Input
                          id='param-instruction'
                          value={newParameter.instruction}
                          onChange={(e) =>
                            setNewParameter({
                              ...newParameter,
                              instruction: e.target.value
                            })
                          }
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='param-type'>Тип параметра</Label>
                        <Select
                          value={newParameter.type}
                          onValueChange={(value) =>
                            setNewParameter({
                              ...newParameter,
                              type: value as ParameterType
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Выберите тип' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Текстовый'>Текстовый</SelectItem>
                            <SelectItem value='Числовой'>Числовой</SelectItem>
                            <SelectItem value='Список'>Список</SelectItem>
                            <SelectItem value='Дата'>Дата</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='add-param-button'>&nbsp;</Label>
                        <Button
                          id='add-param-button'
                          onClick={handleAddParameter}
                          className='w-full'
                        >
                          Добавить параметр
                        </Button>
                      </div>
                    </div>

                    {/* Сообщения об ошибках и успехе */}
                    {error && (
                      <div className='bg-destructive/10 text-destructive rounded-md px-4 py-2'>
                        {error}
                      </div>
                    )}
                    {successMessage && (
                      <div className='rounded-md bg-green-100 px-4 py-2 text-green-800'>
                        {successMessage}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
