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
      key: 'strictlyNecessary1',
      title: 'Strictly Necessary',
      description:
        'These cookies are essential in order to use the website and use its features.',
      enabled: true
    },
    {
      key: 'functionalCookies1',
      title: 'Functional Cookies',
      description:
        'These cookies allow the website to provide personalized functionality.',
      enabled: false
    },
    {
      key: 'strictlyNecessary2',
      title: 'Strictly Necessary',
      description:
        'These cookies are essential in order to use the website and use its features.',
      enabled: true
    },
    {
      key: 'functionalCookies2',
      title: 'Functional Cookies',
      description:
        'These cookies allow the website to provide personalized functionality.',
      enabled: false
    },
    {
      key: 'strictlyNecessary3',
      title: 'Strictly Necessary',
      description:
        'These cookies are essential in order to use the website and use its features.',
      enabled: true
    },
    {
      key: 'functionalCookies3',
      title: 'Functional Cookies',
      description:
        'These cookies allow the website to provide personalized functionality.',
      enabled: false
    },
    {
      key: 'functionalCookies4',
      title: 'Functional Cookies',
      description:
        'These cookies allow the website to provide personalized functionality.',
      enabled: false
    }
  ];

  return (
    <Card className='h-fit'>
      <CardHeader>
        <CardTitle>Настройки мультиагента</CardTitle>
        <p className='text-muted-foreground text-sm'>
          Вы можете настроить и адаптировать под свои задачи в этом меню агента
        </p>
      </CardHeader>
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
