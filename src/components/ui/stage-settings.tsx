'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { IconRefresh } from '@tabler/icons-react';

interface Stage {
  name: string;
  assistant_code_name?: string;
  prompt?: string;
  followups?: number[];
}

interface StageSettingsProps {
  stage: Stage;
  stageIndex: number;
}

export function StageSettings({
  stage,
  stageIndex // eslint-disable-line @typescript-eslint/no-unused-vars
}: StageSettingsProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'testing'>(
    'settings'
  );
  const [prompt, setPrompt] = useState(
    stage.prompt ||
      `Ты — менеджер стоматологической клиники.
Пользователь находится на этапе «${stage.name}».
Общайся с ним вежливо, на "Вы", как менеджер-консультант. Общение должно быть кратким и последовательным: по одному вопросу или мысли за сообщение.

Твоя задача — выяснить текущее состояние клиента, чтобы перейти к следующему этапу «Презентация».

Ты крутой`
  );
  const [temperature, setTemperature] = useState([0.56]);
  const [maxLength, setMaxLength] = useState([256]);
  const [followUpEnabled, setFollowUpEnabled] = useState(true);
  const [followUpCount, setFollowUpCount] = useState('2');
  const [followUpTime, setFollowUpTime] = useState('20 мин');
  const [handoffTarget, setHandoffTarget] = useState('Менеджеру');

  // Убираем stages, так как табы теперь в боковом блоке

  return (
    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
      {/* Колонка - Проверка агента */}
      <Card className='h-fit'>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base'>Проверка агента</CardTitle>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Промпт агента/Тестирование */}
          <div>
            <div className='mb-4 flex gap-2'>
              <Button
                variant={activeTab === 'settings' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('settings')}
                className={activeTab === 'settings' ? 'bg-gray-800' : ''}
              >
                Настройка
              </Button>
              <Button
                variant={activeTab === 'testing' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('testing')}
                className={activeTab === 'testing' ? 'bg-gray-800' : ''}
              >
                Тестирование
              </Button>
            </div>

            {activeTab === 'settings' && (
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className='min-h-[120px] resize-none text-sm'
                placeholder='Введите промпт для агента...'
              />
            )}

            {activeTab === 'testing' && (
              <div className='min-h-[120px] rounded-md bg-gray-50 p-3 text-sm text-gray-500'>
                Здесь будет интерфейс тестирования агента
              </div>
            )}
          </div>

          <div className='flex gap-2'>
            <Button className='flex-1 bg-gray-800 hover:bg-gray-700'>
              Обновить промпт
            </Button>
            <Button variant='outline' size='icon'>
              <IconRefresh className='h-4 w-4' />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Колонка - Форматы работы */}
      <Card className='h-fit'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base'>Форматы работы</CardTitle>

          {/* Роли */}
          <div className='mt-2 flex gap-2'>
            <Badge variant='default' className='bg-gray-800 text-xs'>
              Агент
            </Badge>
            <Badge variant='outline' className='text-xs'>
              Помощник
            </Badge>
            <Badge variant='outline' className='text-xs'>
              Менеджер
            </Badge>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Модель AI */}
          <div>
            <label className='mb-2 block text-sm font-medium'>Модель AI</label>
            <Select defaultValue='gpt-4.1-mini'>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='gpt-4.1-mini'>GPT-4.1 mini</SelectItem>
                <SelectItem value='gpt-4'>GPT-4</SelectItem>
                <SelectItem value='gpt-3.5'>GPT-3.5 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Температура */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <label className='text-sm font-medium'>Температура</label>
              <span className='text-sm text-gray-500'>{temperature[0]}</span>
            </div>
            <Slider
              value={temperature}
              onValueChange={setTemperature}
              max={1}
              min={0}
              step={0.01}
              className='w-full'
            />
          </div>

          {/* Макс. длина сообщения */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <label className='text-sm font-medium'>
                Макс. длина сообщения
              </label>
              <span className='text-sm text-gray-500'>{maxLength[0]}</span>
            </div>
            <Slider
              value={maxLength}
              onValueChange={setMaxLength}
              max={1000}
              min={50}
              step={1}
              className='w-full'
            />
          </div>

          {/* Фоллоу-ап */}
          <div>
            <div className='mb-3 flex items-center justify-between'>
              <label className='text-sm font-medium'>Фоллоу-ап</label>
              <Switch
                checked={followUpEnabled}
                onCheckedChange={setFollowUpEnabled}
              />
            </div>

            {followUpEnabled && (
              <div className='flex gap-3'>
                <Select value={followUpCount} onValueChange={setFollowUpCount}>
                  <SelectTrigger className='w-20'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1'>1</SelectItem>
                    <SelectItem value='2'>2</SelectItem>
                    <SelectItem value='3'>3</SelectItem>
                    <SelectItem value='5'>5</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={followUpTime} onValueChange={setFollowUpTime}>
                  <SelectTrigger className='flex-1'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='5 мин'>5 мин</SelectItem>
                    <SelectItem value='10 мин'>10 мин</SelectItem>
                    <SelectItem value='20 мин'>20 мин</SelectItem>
                    <SelectItem value='30 мин'>30 мин</SelectItem>
                    <SelectItem value='1 час'>1 час</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Передача */}
          <div>
            <label className='mb-2 block text-sm font-medium'>Передача</label>
            <Select value={handoffTarget} onValueChange={setHandoffTarget}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Менеджеру'>Менеджеру</SelectItem>
                <SelectItem value='Агенту'>Агенту</SelectItem>
                <SelectItem value='Системе'>Системе</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className='w-full bg-gray-800 hover:bg-gray-700' size='sm'>
            Сохранить
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
