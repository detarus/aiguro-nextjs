'use client';

import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface FunnelSettingsSidebarProps {
  funnelName?: string;
}

export function FunnelSettingsSidebar({
  funnelName = 'НОВАЯ'
}: FunnelSettingsSidebarProps) {
  const [strictlyNecessary, setStrictlyNecessary] = useState(true);
  const [functionalCookies, setFunctionalCookies] = useState(false);

  return (
    <div className='flex h-full w-64 flex-col border-r border-gray-200 bg-white p-4'>
      {/* Настройки мультиагента */}
      <div className='mb-4 flex-1'>
        <h3 className='mb-1 pb-4 text-base font-medium'>Настройки воронки</h3>
        {/* <p className='mb-8П text-xs text-gray-600 pb-8'>
          Вы можете настроить и адаптировать под свои задачи в этом меню агента
        </p> */}

        <div className='space-y-3'>
          {/* Strictly Necessary */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-sm font-medium'>Strictly Necessary</span>
              <Switch
                checked={strictlyNecessary}
                onCheckedChange={setStrictlyNecessary}
                className='data-[state=checked]:bg-gray-800'
              />
            </div>
            <p className='mb-3 text-xs text-gray-500'>
              These cookies are essential in order to use the website and use
              its features.
            </p>
          </div>

          {/* Functional Cookies */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-sm font-medium'>Functional Cookies</span>
              <Switch
                checked={functionalCookies}
                onCheckedChange={setFunctionalCookies}
                className='data-[state=checked]:bg-gray-800'
              />
            </div>
            <p className='text-xs text-gray-500'>
              These cookies allow the website to provide personalized
              functionality.
            </p>
          </div>

          {/* Дублированный блок Strictly Necessary */}

          {/* Еще один дублированный блок Strictly Necessary */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-sm font-medium'>Strictly Necessary</span>
              <Switch
                checked={true}
                className='data-[state=checked]:bg-gray-800'
              />
            </div>
            <p className='mb-3 text-xs text-gray-500'>
              These cookies are essential in order to use the website and use
              its features.
            </p>
          </div>

          {/* Еще один дублированный блок Functional Cookies */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-sm font-medium'>Functional Cookies</span>
              <Switch
                checked={false}
                className='data-[state=checked]:bg-gray-800'
              />
            </div>
            <p className='text-xs text-gray-500'>
              These cookies allow the website to provide personalized
              functionality.
            </p>
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className='mt-auto space-y-2'>
        <Button
          variant='outline'
          className='w-full justify-start py-1 text-xs'
          size='sm'
        >
          Сохранить настройки общения
        </Button>

        <Button
          variant='outline'
          className='w-full justify-start py-1 text-xs'
          size='sm'
        >
          Настроить анализ
        </Button>

        <Button
          variant='outline'
          className='w-full justify-start py-1 text-xs'
          size='sm'
        >
          Настроить FollowUp
        </Button>

        {/* Нижние кнопки */}
        <div className='mt-4 border-t border-gray-200 pt-3'>
          <div className='flex flex-col gap-1'>
            <Button
              variant='ghost'
              size='sm'
              className='py-1 text-xs text-blue-600'
            >
              🔄 Нет подключения
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='py-1 text-xs text-blue-600'
            >
              Переподключиться
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
