'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface GeneralSettings {
  cookieSettings: {
    strictlyNecessary1: boolean;
    functionalCookies1: boolean;
    strictlyNecessary2: boolean;
    functionalCookies2: boolean;
    strictlyNecessary3: boolean;
    functionalCookies3: boolean;
    functionalCookies4: boolean;
  };
}

interface GeneralSettingsProps {
  generalSettings: GeneralSettings;
  onSettingChange: (key: string, value: boolean) => void;
  onSave: () => void;
}

export function GeneralSettingsComponent({
  generalSettings,
  onSettingChange,
  onSave
}: GeneralSettingsProps) {
  const cookieOptions = [
    {
      key: 'contextMemory',
      title: 'Память контекста',
      description:
        'Сохраняет информацию о предыдущих действиях пользователя для обеспечения последовательного взаимодействия с сайтом.',
      enabled: true
    },
    {
      key: 'dataCollection',
      title: 'Сбор массива данных',
      description:
        'Позволяет собирать анонимные данные о поведении пользователя для анализа и улучшения сервиса.',
      enabled: false
    },
    {
      key: 'stopAgentAfterManager',
      title: 'Пауза после сообщения от менеджера',
      description:
        'Обеспечивает автоматическую остановку работы чат-агента после вмешательства менеджера.',
      enabled: true
    },
    {
      key: 'agentKnowledgeBase',
      title: 'База знаний агента',
      description:
        'Даёт агенту доступ к внутренней базе знаний для предоставления точных и полезных ответов пользователю.',
      enabled: true
    },
    {
      key: 'voiceRequests',
      title: 'Голосовые запросы и ответы',
      description:
        'Активирует возможность обработки голосовых команд и озвучивания ответов для удобства пользователей.',
      enabled: false
    }
  ];

  return (
    <Card className='h-fit'>
      {/* <CardHeader>
        <CardTitle>Настройки мультиагента</CardTitle>
        <p className='text-muted-foreground text-sm'>
          Вы можете настроить и адаптировать под свои задачи в этом меню агента
        </p>
      </CardHeader> */}
      <CardContent className='space-y-4'>
        <div className='space-y-3'>
          {cookieOptions.map((setting) => (
            <div
              key={setting.key}
              className='flex items-center justify-between gap-4'
            >
              <div className='flex-1'>
                <h4 className='text-sm font-medium'>{setting.title}</h4>
                <p className='text-muted-foreground text-xs'>
                  {setting.description}
                </p>
              </div>
              <Switch
                checked={
                  generalSettings.cookieSettings[
                    setting.key as keyof typeof generalSettings.cookieSettings
                  ]
                }
                onCheckedChange={(checked) =>
                  onSettingChange(setting.key, checked)
                }
              />
            </div>
          ))}
        </div>

        <Button onClick={onSave} className='w-full'>
          Сохранить настройки общения
        </Button>
      </CardContent>
    </Card>
  );
}
