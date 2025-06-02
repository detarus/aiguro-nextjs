'use client';

import React, { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { IconEdit } from '@tabler/icons-react';

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

  const openEditDialog = (stage: StageSettings) => {
    setEditingStage({ ...stage });
    setEditDialogOpen(true);
  };

  const saveStageEdit = () => {
    if (editingStage) {
      handleStageChange(editingStage.id, 'name', editingStage.name);
      setEditDialogOpen(false);
      setEditingStage(null);
    }
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
        {/* Левая панель - Общие настройки */}
        <div className='w-1/2 border-r border-gray-200 pr-4 dark:border-gray-700'>
          <div className='space-y-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-medium text-gray-900 dark:text-white'>
                  Общие настройки
                </h2>
                <Button className='bg-blue-500 text-white hover:bg-blue-600'>
                  Сохранить
                </Button>
              </div>

              {/* Память контекста */}
              <div className='flex items-center justify-between'>
                <Label className='text-sm font-medium'>Память контекста</Label>
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
                    className='w-20 text-center'
                  />
                  <span className='text-sm text-gray-500'>сообщений</span>
                  <Switch
                    checked={true}
                    className='data-[state=checked]:bg-green-500'
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
                    className='w-20 text-center'
                  />
                  <span className='text-sm text-gray-500'>сек</span>
                  <Switch
                    checked={true}
                    className='data-[state=checked]:bg-green-500'
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
                  className='data-[state=checked]:bg-green-500'
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
                  className='data-[state=checked]:bg-green-500'
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
                  className='data-[state=checked]:bg-green-500'
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
                  className='data-[state=checked]:bg-green-500'
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
                    className='w-24'
                  />
                  <Switch
                    checked={true}
                    className='data-[state=checked]:bg-green-500'
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
                  className='data-[state=checked]:bg-green-500'
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
                  className='data-[state=checked]:bg-green-500'
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
                    className='data-[state=checked]:bg-green-500'
                  />
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  {generalSettings.chunkSettings}
                </div>
              </div>
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
              {stages.map((stage) => (
                <div key={stage.id} className='relative'>
                  {editingStageId === stage.id ? (
                    <Input
                      defaultValue={stage.name}
                      autoFocus
                      className='h-8 min-w-[80px] text-sm'
                      onBlur={(e) => saveInlineEdit(stage.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveInlineEdit(stage.id, e.currentTarget.value);
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
                        onClick={() => selectStage(stage.id)}
                        className={`${
                          activeStageId === stage.id
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        } h-8 rounded-none border-0 px-3`}
                      >
                        {stage.name}
                      </Button>
                      <div className='h-6 w-px bg-gray-200 dark:bg-gray-700'></div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => startInlineEdit(stage.id)}
                        className='h-8 w-8 rounded-none border-0 p-0 hover:bg-gray-100 dark:hover:bg-gray-800'
                      >
                        <IconEdit className='h-3 w-3' />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <Button
                variant='outline'
                size='sm'
                onClick={addStage}
                className='border-dashed'
              >
                +
              </Button>
            </div>

            {/* Настройки активного этапа */}
            {activeStage && (
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
                    value={activeStage.prompt}
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

      {/* Диалог редактирования этапа */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Редактирование этапа</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                Название
              </Label>
              <Input
                id='name'
                value={editingStage?.name || ''}
                onChange={(e) =>
                  setEditingStage((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                className='col-span-3'
              />
            </div>
          </div>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={saveStageEdit}>Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
