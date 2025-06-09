'use client';

import React, { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { IconEdit } from '@tabler/icons-react';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/hooks/useFunnels';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';

interface GeneralSettings {
  contextMemory: number;
  batchCollection: number;
  agentPause: boolean;
  pauseOnFirstSend: boolean;
  resumeAfterPause: boolean;
  spamProtection: boolean;
  workZone: string;
  voiceQuestions: boolean;
  knowledgeBase: boolean;
  chunkEnabled: boolean;
  chunkSettings: string;
}

interface StageSettings {
  id: number;
  name: string;
  prompt: string;
  testArea: string;
  isActive: boolean;
  model: string;
  followUp: {
    option1: string;
    option2: string;
    enabled: boolean;
  };
  transfer: string;
}

export default function AIAssistantsPage() {
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;
  const { currentFunnel } = useFunnels(backendOrgId);

  // Состояние для загрузки данных текущей воронки
  const [currentFunnelData, setCurrentFunnelData] = useState<any>(null);
  const [currentFunnelLoading, setCurrentFunnelLoading] = useState(false);
  const [currentFunnelError, setCurrentFunnelError] = useState<string | null>(
    null
  );

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    contextMemory: 50,
    batchCollection: 5,
    agentPause: true,
    pauseOnFirstSend: true,
    resumeAfterPause: true,
    spamProtection: true,
    workZone: 'Moscow',
    voiceQuestions: true,
    knowledgeBase: true,
    chunkEnabled: true,
    chunkSettings: '300 символов\nчерез 2 сек'
  });

  const [stages, setStages] = useState<StageSettings[]>([
    {
      id: 1,
      name: 'Этап 1',
      prompt: '',
      testArea: '',
      isActive: true,
      model: 'gpt-4.1 mini',
      followUp: {
        option1: '1 - 0 ч 20 мин',
        option2: '2 - 2 ч 40 мин',
        enabled: true
      },
      transfer: '2'
    },
    {
      id: 2,
      name: 'Этап 2',
      prompt: '',
      testArea: '',
      isActive: false,
      model: 'gpt-4.1 mini',
      followUp: {
        option1: '1 - 0 ч 20 мин',
        option2: '2 - 2 ч 40 мин',
        enabled: true
      },
      transfer: 'manager'
    }
  ]);

  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<StageSettings | null>(null);
  const [editingStageId, setEditingStageId] = useState<number | null>(null);

  const handleGeneralSettingChange = (
    key: keyof GeneralSettings,
    value: any
  ) => {
    setGeneralSettings((prev) => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const handleStageChange = (
    id: number,
    field: keyof StageSettings,
    value: any
  ) => {
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === id ? { ...stage, [field]: value } : stage
      )
    );
    setUnsavedChanges(true);
  };

  const addStage = () => {
    const newStage: StageSettings = {
      id: stages.length + 1,
      name: `Этап ${stages.length + 1}`,
      prompt: '',
      testArea: '',
      isActive: false,
      model: 'gpt-4.1 mini',
      followUp: {
        option1: '1 - 0 ч 20 мин',
        option2: '2 - 2 ч 40 мин',
        enabled: true
      },
      transfer: 'manager'
    };
    setStages((prev) => [...prev, newStage]);
    setUnsavedChanges(true);
  };

  const selectStage = (stageId: number) => {
    setActiveStageId(stageId);
  };

  const saveSettings = () => {
    console.log('Saving settings:', { generalSettings, stages });
    setUnsavedChanges(false);
  };

  const activeStage = stages.find((stage) => stage.id === activeStageId);

  // Получаем список этапов для передачи (исключая текущий)
  const getTransferOptions = (currentStageId: number) => {
    return stages.filter((stage) => stage.id !== currentStageId);
  };

  const startInlineEdit = (stageId: number) => {
    setEditingStageId(stageId);
  };

  const saveInlineEdit = (stageId: number, newName: string) => {
    if (newName.trim()) {
      handleStageChange(stageId, 'name', newName.trim());
    }
    setEditingStageId(null);
  };

  const cancelInlineEdit = () => {
    setEditingStageId(null);
  };

  // Функция для загрузки данных текущей воронки (аналогично Get Current Funnel)
  const fetchCurrentFunnelData = async () => {
    if (!backendOrgId || !currentFunnel?.id) return;

    const token = getClerkTokenFromClientCookie();
    if (!token) {
      setCurrentFunnelError('No token available in __session cookie');
      return;
    }

    setCurrentFunnelLoading(true);
    setCurrentFunnelError(null);

    try {
      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Ignore parsing errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setCurrentFunnelData(data);
    } catch (error: any) {
      setCurrentFunnelError(error.message || 'Unknown error occurred');
    } finally {
      setCurrentFunnelLoading(false);
    }
  };

  // Загружаем данные воронки при изменении currentFunnel
  React.useEffect(() => {
    if (currentFunnel?.id) {
      fetchCurrentFunnelData();
    } else {
      setCurrentFunnelData(null);
      setCurrentFunnelError(null);
    }
  }, [currentFunnel?.id, backendOrgId]);

  // Синхронизируем локальные этапы с данными из API
  React.useEffect(() => {
    if (currentFunnelData?.stages) {
      const apiStages = currentFunnelData.stages.map(
        (stage: any, index: number) => ({
          id: index + 1,
          name: stage.name || `Этап ${index + 1}`,
          prompt: stage.prompt || '',
          testArea: '',
          isActive: index === 0,
          model: 'gpt-4.1 mini',
          followUp: {
            option1: '1 - 0 ч 20 мин',
            option2: '2 - 2 ч 40 мин',
            enabled: true
          },
          transfer:
            index === currentFunnelData.stages.length - 1
              ? 'manager'
              : (index + 2).toString()
        })
      );
      setStages(apiStages);

      // Устанавливаем первый этап как активный, если нет активного
      if (!activeStageId && apiStages.length > 0) {
        setActiveStageId(1);
      }
    }
  }, [currentFunnelData]);

  return (
    <PageContainer>
      {/* Заголовок страницы - отдельная строка */}
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
          Системные настройки для мультиагента
        </h1>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm'>
            Дообучение
          </Button>
          <Button
            className='bg-green-500 text-white hover:bg-green-600'
            onClick={saveSettings}
            disabled={!unsavedChanges}
          >
            Завершить настройку
          </Button>
        </div>
      </div>

      {/* Основной контент */}
      <div className='flex h-full'>
        {/* Левая панель - Общие настройки (НЕАКТИВНА) */}
        <div className='w-1/2 border-r border-gray-200 pr-4 dark:border-gray-700'>
          <div className='space-y-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-medium text-gray-900 dark:text-white'>
                  Общие настройки
                </h2>
              </div>
              {/* Уведомление о недоступности */}
              <div className='mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm dark:border-yellow-700 dark:bg-yellow-900/20'>
                <p className='font-medium text-yellow-800 dark:text-yellow-200'>
                  📢 Функционал будет доступен в ближайших версиях
                </p>
                <p className='mt-1 text-yellow-700 dark:text-yellow-300'>
                  Системные настройки находятся в разработке и скоро будут
                  добавлены.
                </p>
              </div>
              {/* Контейнер с полупрозрачностью для всех настроек */}
              <div className='space-y-4 opacity-50'>
                {/* Память контекста */}
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>
                    Память контекста
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      type='number'
                      value={generalSettings.contextMemory}
                      onChange={(e) =>
                        handleGeneralSettingChange(
                          'contextMemory',
                          parseInt(e.target.value)
                        )
                      }
                      className='w-20 cursor-not-allowed text-center opacity-50'
                      disabled={true}
                      title='Функционал будет доступен в ближайших версиях'
                      style={{ cursor: 'not-allowed' }}
                    />
                    <span className='text-sm text-gray-500'>сообщений</span>
                    <Switch
                      checked={true}
                      className='cursor-not-allowed data-[state=checked]:bg-green-500'
                      disabled={true}
                      style={{ cursor: 'not-allowed' }}
                      title='Функционал будет доступен в ближайших версиях'
                    />
                  </div>
                </div>

                {/* Сбор массива */}
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>Сбор массива</Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      type='number'
                      value={generalSettings.batchCollection}
                      onChange={(e) =>
                        handleGeneralSettingChange(
                          'batchCollection',
                          parseInt(e.target.value)
                        )
                      }
                      className='w-20 cursor-not-allowed text-center opacity-50'
                      disabled={true}
                      title='Функционал будет доступен в ближайших версиях'
                      style={{ cursor: 'not-allowed' }}
                    />
                    <span className='text-sm text-gray-500'>сек</span>
                    <Switch
                      checked={true}
                      className='cursor-not-allowed data-[state=checked]:bg-green-500'
                      disabled={true}
                      style={{ cursor: 'not-allowed' }}
                      title='Функционал будет доступен в ближайших версиях'
                    />
                  </div>
                </div>

                {/* Остановка агента при вмешательстве оператора */}
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>
                    Остановка агента при вмешательстве оператора
                  </Label>
                  <Switch
                    checked={generalSettings.agentPause}
                    onCheckedChange={(checked) =>
                      handleGeneralSettingChange('agentPause', checked)
                    }
                    className='cursor-not-allowed data-[state=checked]:bg-green-500'
                    disabled={true}
                    style={{ cursor: 'not-allowed' }}
                    title='Функционал будет доступен в ближайших версиях'
                  />
                </div>

                {/* Не ставить на паузу при первой отправке */}
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>
                    Не ставить на паузу при первой отправке (для рассылок)
                  </Label>
                  <Switch
                    checked={generalSettings.pauseOnFirstSend}
                    onCheckedChange={(checked) =>
                      handleGeneralSettingChange('pauseOnFirstSend', checked)
                    }
                    className='cursor-not-allowed data-[state=checked]:bg-green-500'
                    disabled={true}
                    style={{ cursor: 'not-allowed' }}
                    title='Функционал будет доступен в ближайших версиях'
                  />
                </div>

                {/* Возобновить после паузы через */}
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>
                    Возобновить после паузы через
                  </Label>
                  <Switch
                    checked={generalSettings.resumeAfterPause}
                    onCheckedChange={(checked) =>
                      handleGeneralSettingChange('resumeAfterPause', checked)
                    }
                    className='cursor-not-allowed data-[state=checked]:bg-green-500'
                    disabled={true}
                    style={{ cursor: 'not-allowed' }}
                    title='Функционал будет доступен в ближайших версиях'
                  />
                </div>

                {/* Защита от спама по достижению N сообщений */}
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>
                    Защита от спама по достижению N сообщений
                  </Label>
                  <Switch
                    checked={generalSettings.spamProtection}
                    onCheckedChange={(checked) =>
                      handleGeneralSettingChange('spamProtection', checked)
                    }
                    className='cursor-not-allowed data-[state=checked]:bg-green-500'
                    disabled={true}
                    style={{ cursor: 'not-allowed' }}
                    title='Функционал будет доступен в ближайших версиях'
                  />
                </div>

                {/* Зона работы агента */}
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>
                    Зона работы агента
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      value={generalSettings.workZone}
                      onChange={(e) =>
                        handleGeneralSettingChange('workZone', e.target.value)
                      }
                      className='w-24 cursor-not-allowed opacity-50'
                      disabled={true}
                      title='Функционал будет доступен в ближайших версиях'
                      style={{ cursor: 'not-allowed' }}
                    />
                    <Switch
                      checked={true}
                      className='cursor-not-allowed data-[state=checked]:bg-green-500'
                      disabled={true}
                      style={{ cursor: 'not-allowed' }}
                      title='Функционал будет доступен в ближайших версиях'
                    />
                  </div>
                </div>

                {/* Голосовые запросы и ответы */}
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>
                    Голосовые запросы и ответы
                  </Label>
                  <Switch
                    checked={generalSettings.voiceQuestions}
                    onCheckedChange={(checked) =>
                      handleGeneralSettingChange('voiceQuestions', checked)
                    }
                    className='cursor-not-allowed data-[state=checked]:bg-green-500'
                    disabled={true}
                    style={{ cursor: 'not-allowed' }}
                    title='Функционал будет доступен в ближайших версиях'
                  />
                </div>

                {/* База знаний агента */}
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>
                    База знаний агента
                  </Label>
                  <Switch
                    checked={generalSettings.knowledgeBase}
                    onCheckedChange={(checked) =>
                      handleGeneralSettingChange('knowledgeBase', checked)
                    }
                    className='cursor-not-allowed data-[state=checked]:bg-green-500'
                    disabled={true}
                    style={{ cursor: 'not-allowed' }}
                    title='Функционал будет доступен в ближайших версиях'
                  />
                </div>

                {/* Chunk секция */}
                <div className='mt-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-800'>
                  <div className='mb-4 flex items-center justify-between'>
                    <Label className='text-sm font-medium'>Chunk</Label>
                    <Switch
                      checked={generalSettings.chunkEnabled}
                      onCheckedChange={(checked) =>
                        handleGeneralSettingChange('chunkEnabled', checked)
                      }
                      className='cursor-not-allowed data-[state=checked]:bg-green-500'
                      disabled={true}
                      style={{ cursor: 'not-allowed' }}
                      title='Функционал будет доступен в ближайших версиях'
                    />
                  </div>
                  <div className='text-sm text-gray-600 dark:text-gray-400'>
                    {generalSettings.chunkSettings}
                  </div>
                </div>
              </div>{' '}
              {/* Закрываем полупрозрачный контейнер */}
            </div>
          </div>
        </div>

        {/* Правая панель - Настройка расширенные мультиагента */}
        <div className='w-1/2 pl-4'>
          <div className='flex h-full flex-col space-y-4'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Настройка расширенные мультиагента
            </h2>

            {/* Этапы */}
            <div className='flex flex-wrap gap-2'>
              {currentFunnelData?.stages?.map((stage: any, index: number) => (
                <div key={stage.name || index} className='relative'>
                  {editingStageId === index + 1 ? (
                    <Input
                      defaultValue={stage.name}
                      autoFocus
                      className='h-8 min-w-[80px] text-sm'
                      onBlur={(e) => saveInlineEdit(index + 1, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveInlineEdit(index + 1, e.currentTarget.value);
                        }
                        if (e.key === 'Escape') {
                          cancelInlineEdit();
                        }
                      }}
                    />
                  ) : (
                    <div className='flex items-center overflow-hidden rounded-md border'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => selectStage(index + 1)}
                        className={`${
                          activeStageId === index + 1
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        } h-8 rounded-none border-0 px-3`}
                      >
                        {stage.name || `Этап ${index + 1}`}
                      </Button>
                      <div className='h-6 w-px bg-gray-200 dark:bg-gray-700'></div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => startInlineEdit(index + 1)}
                        className='h-8 w-8 rounded-none border-0 p-0 hover:bg-gray-100 dark:hover:bg-gray-800'
                      >
                        <IconEdit className='h-3 w-3' />
                      </Button>
                    </div>
                  )}
                </div>
              )) || (
                // Показываем сообщение если нет этапов
                <div className='flex w-full items-center justify-center py-4 text-sm text-gray-500 dark:text-gray-400'>
                  {currentFunnelLoading
                    ? 'Загрузка этапов...'
                    : 'Нет этапов в воронке'}
                </div>
              )}
              {currentFunnelData?.stages?.length > 0 && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={addStage}
                  className='border-dashed'
                >
                  +
                </Button>
              )}
            </div>

            {/* Настройки активного этапа */}
            {activeStage && currentFunnelData?.stages && (
              <div className='flex flex-1 flex-col space-y-4'>
                {/* Упрощенная строка с настройками */}
                <div className='grid grid-cols-3 gap-4'>
                  {/* Модель */}
                  <div className='space-y-1'>
                    <Label className='text-xs text-gray-500'>Модель</Label>
                    <Select
                      value={activeStage.model}
                      onValueChange={(value) =>
                        handleStageChange(activeStage.id, 'model', value)
                      }
                    >
                      <SelectTrigger className='h-8 text-sm'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='gpt-4.1 mini'>
                          gpt-4.1 mini
                        </SelectItem>
                        <SelectItem value='gpt-4'>gpt-4</SelectItem>
                        <SelectItem value='gpt-3.5'>gpt-3.5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Follow up */}
                  <div className='space-y-1'>
                    <Label className='text-xs text-gray-500'>Follow up</Label>
                    <div className='flex items-center gap-1'>
                      <Select defaultValue='20min'>
                        <SelectTrigger className='h-8 flex-1 text-sm'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='20min'>20 мин</SelectItem>
                          <SelectItem value='1h'>1 час</SelectItem>
                          <SelectItem value='2h'>2 часа</SelectItem>
                        </SelectContent>
                      </Select>
                      <Switch
                        checked={activeStage.followUp.enabled}
                        onCheckedChange={(checked) =>
                          handleStageChange(activeStage.id, 'followUp', {
                            ...activeStage.followUp,
                            enabled: checked
                          })
                        }
                        className='scale-75 data-[state=checked]:bg-green-500'
                      />
                    </div>
                  </div>

                  {/* Передача */}
                  <div className='space-y-1'>
                    <Label className='text-xs text-gray-500'>Передача</Label>
                    <Select
                      value={activeStage.transfer}
                      onValueChange={(value) =>
                        handleStageChange(activeStage.id, 'transfer', value)
                      }
                    >
                      <SelectTrigger className='h-8 text-sm'>
                        <SelectValue placeholder='Выберите этап' />
                      </SelectTrigger>
                      <SelectContent>
                        {getTransferOptions(activeStage.id).map((stage) => (
                          <SelectItem
                            key={stage.id}
                            value={stage.id.toString()}
                          >
                            {stage.name}
                          </SelectItem>
                        ))}
                        <SelectItem value='manager'>Менеджеру</SelectItem>
                        <SelectItem value='none'>Не передавать</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Промпт для AI подагента */}
                <div className='flex flex-1 flex-col'>
                  <Label className='mb-2 text-sm font-medium'>
                    Промпт для AI подагента {activeStage.id}
                  </Label>
                  <Textarea
                    value={
                      currentFunnelData.stages?.[activeStageId - 1]?.prompt ||
                      activeStage.prompt
                    }
                    onChange={(e) =>
                      handleStageChange(
                        activeStage.id,
                        'prompt',
                        e.target.value
                      )
                    }
                    placeholder='Введите промпт для AI ассистента...'
                    className='max-h-[100px] min-h-[100px] flex-1 resize-none'
                  />
                </div>

                {/* Тестовая площадка этапа */}
                <div className='flex flex-1 flex-col'>
                  <Label className='mb-2 text-sm font-medium'>
                    Тестовая площадка этапа
                  </Label>
                  <Textarea
                    value={activeStage.testArea}
                    onChange={(e) =>
                      handleStageChange(
                        activeStage.id,
                        'testArea',
                        e.target.value
                      )
                    }
                    placeholder='Тестовая площадка для этапа...'
                    className='max-h-[75px] min-h-[75px] flex-1 resize-none bg-gray-50 dark:bg-gray-800'
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
