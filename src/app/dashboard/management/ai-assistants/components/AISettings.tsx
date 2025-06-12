'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface AISettings {
  mode: 'complete' | 'insert' | 'edit';
  model: string;
  temperature: number;
  maxLength: number;
  topP: number;
  preset: string;
  followUp: {
    enabled: boolean;
    count: number;
    delay: number;
  };
  transfer: string;
}

interface StageSettings {
  id: number;
  name: string;
  prompt: string;
  isActive: boolean;
  aiSettings: AISettings;
}

interface AISettingsProps {
  activeStage: StageSettings | undefined;
  stages: StageSettings[];
  currentFunnelData: any;
  successMessage: string | null;
  onAISettingChange: (field: keyof AISettings, value: any) => void;
  onFollowUpChange: (field: string, value: any) => void;
  onSave: () => void;
}

export function AISettingsComponent({
  activeStage,
  stages,
  currentFunnelData,
  successMessage,
  onAISettingChange,
  onFollowUpChange,
  onSave
}: AISettingsProps) {
  // Создаем список опций для передачи
  const transferOptions = [{ value: 'Менеджеру', label: 'Менеджеру' }];

  // Добавляем этапы из текущей воронки
  if (currentFunnelData?.stages) {
    currentFunnelData.stages.forEach((stage: any, index: number) => {
      transferOptions.push({
        value: `Этап ${index + 1}`,
        label: stage.name || `Этап ${index + 1}`
      });
    });
  } else {
    // Fallback на локальные этапы
    stages.forEach((stage) => {
      transferOptions.push({
        value: `Этап ${stage.id}`,
        label: stage.name
      });
    });
  }

  return (
    <Card className='h-fit'>
      <CardContent className='space-y-6 px-6 py-6'>
        {/* Mode Toggle */}
        <div className='space-y-2'>
          <Label className='text-sm font-medium'>Mode</Label>
          <Tabs
            value={activeStage?.aiSettings.mode || 'edit'}
            onValueChange={(value) => onAISettingChange('mode', value)}
          >
            <TabsList className='bg-muted w-full'>
              <TabsTrigger value='complete' className='flex-1 text-xs'>
                Complete
              </TabsTrigger>
              <TabsTrigger value='insert' className='flex-1 text-xs'>
                Insert
              </TabsTrigger>
              <TabsTrigger value='edit' className='flex-1 text-xs'>
                Edit
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Model Selection */}
        <div className='space-y-2'>
          <Label className='text-sm font-medium'>Model</Label>
          <Select
            value={activeStage?.aiSettings.model || 'GPT-4.1 mini'}
            onValueChange={(value) => onAISettingChange('model', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='GPT-4.1 mini'>GPT-4.1 mini</SelectItem>
              <SelectItem value='GPT-4'>GPT-4</SelectItem>
              <SelectItem value='GPT-3.5 Turbo'>GPT-3.5 Turbo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Temperature */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label className='text-sm font-medium'>Temperature</Label>
            <span className='text-muted-foreground text-sm'>
              {activeStage?.aiSettings.temperature || 0.56}
            </span>
          </div>
          <Slider
            value={[activeStage?.aiSettings.temperature || 0.56]}
            onValueChange={([value]) => onAISettingChange('temperature', value)}
            max={1}
            min={0}
            step={0.01}
            className='w-full'
          />
        </div>

        {/* Maximum Length */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label className='text-sm font-medium'>Maximum Length</Label>
            <span className='text-muted-foreground text-sm'>
              {activeStage?.aiSettings.maxLength || 256}
            </span>
          </div>
          <Slider
            value={[activeStage?.aiSettings.maxLength || 256]}
            onValueChange={([value]) => onAISettingChange('maxLength', value)}
            max={4000}
            min={1}
            step={1}
            className='w-full'
          />
        </div>

        {/* Top P */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label className='text-sm font-medium'>Top P</Label>
            <span className='text-muted-foreground text-sm'>
              {activeStage?.aiSettings.topP || 0.9}
            </span>
          </div>
          <Slider
            value={[activeStage?.aiSettings.topP || 0.9]}
            onValueChange={([value]) => onAISettingChange('topP', value)}
            max={1}
            min={0}
            step={0.01}
            className='w-full'
          />
        </div>

        {/* Preset Selection */}
        <div className='space-y-2'>
          <Label className='text-sm font-medium'>Выбрать пресет</Label>
          <Select
            value={activeStage?.aiSettings.preset || 'Пресет 1'}
            onValueChange={(value) => onAISettingChange('preset', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Пресет 1'>Пресет 1</SelectItem>
              <SelectItem value='Пресет 2'>Пресет 2</SelectItem>
              <SelectItem value='Пресет 3'>Пресет 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Follow up */}
        <div className='space-y-3'>
          <Label className='text-sm font-medium'>Follow up</Label>
          <div className='flex items-center gap-2'>
            <Switch
              checked={activeStage?.aiSettings.followUp.enabled || false}
              onCheckedChange={(checked) =>
                onFollowUpChange('enabled', checked)
              }
            />
            <div className='flex flex-1 gap-2'>
              <Select
                value={String(activeStage?.aiSettings.followUp.count || 2)}
                onValueChange={(value) =>
                  onFollowUpChange('count', Number(value))
                }
              >
                <SelectTrigger className='w-16'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='1'>1</SelectItem>
                  <SelectItem value='2'>2</SelectItem>
                  <SelectItem value='3'>3</SelectItem>
                  <SelectItem value='4'>4</SelectItem>
                  <SelectItem value='5'>5</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={`${activeStage?.aiSettings.followUp.delay || 20} мин`}
                onValueChange={(value) =>
                  onFollowUpChange('delay', Number(value.replace(' мин', '')))
                }
              >
                <SelectTrigger className='flex-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='10 мин'>10 мин</SelectItem>
                  <SelectItem value='20 мин'>20 мин</SelectItem>
                  <SelectItem value='30 мин'>30 мин</SelectItem>
                  <SelectItem value='60 мин'>60 мин</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Transfer */}
        <div className='space-y-2'>
          <Label className='text-sm font-medium'>Передача</Label>
          <Select
            value={activeStage?.aiSettings.transfer || 'Менеджеру'}
            onValueChange={(value) => onAISettingChange('transfer', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {transferOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Success Message for AI Settings */}
        {successMessage && successMessage.includes('AI настройки') && (
          <div className='rounded-md border border-green-200 bg-green-50 p-3'>
            <div className='flex'>
              <div className='text-sm text-green-700'>{successMessage}</div>
            </div>
          </div>
        )}

        <Button onClick={onSave} className='w-full'>
          Сохранить
        </Button>
      </CardContent>
    </Card>
  );
}
