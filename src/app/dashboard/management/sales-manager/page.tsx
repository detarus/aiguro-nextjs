'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/hooks/useFunnels';
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

// Интерфейсы
interface SalesManagerSettings {
  autoAssignment: boolean;
  notificationsEnabled: boolean;
  performanceThreshold: number;
  salesTargets: {
    monthly: number;
    quarterly: number;
  };
  teamMembers: string[];
}

export default function SalesManagerPage() {
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;
  const { currentFunnel } = useFunnels(backendOrgId);
  const router = useRouter();

  // Состояния
  const [settings, setSettings] = useState<SalesManagerSettings>({
    autoAssignment: true,
    notificationsEnabled: true,
    performanceThreshold: 75,
    salesTargets: {
      monthly: 500000,
      quarterly: 1500000
    },
    teamMembers: ['Иван Петров', 'Мария Иванова', 'Алексей Сидоров']
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'team' | 'targets' | 'settings'>(
    'team'
  );

  // Обработчик возврата назад
  const handleBack = () => {
    router.push('/dashboard/management');
  };

  // Обработчик изменения целей продаж
  const handleTargetChange = (
    field: keyof typeof settings.salesTargets,
    value: number
  ) => {
    setSettings((prev) => ({
      ...prev,
      salesTargets: {
        ...prev.salesTargets,
        [field]: value
      }
    }));
  };

  // Обработчик изменения основных настроек
  const handleSettingChange = (
    field: keyof SalesManagerSettings,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
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
              <h1 className='text-2xl font-bold'>Управление РОП</h1>
              <p className='text-muted-foreground'>
                Инструменты руководителя отдела продаж
              </p>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <Card>
          <CardHeader>
            <CardTitle>Настройки РОП</CardTitle>
            <CardDescription>
              Управление командой и показателями эффективности
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as 'team' | 'targets' | 'settings')
              }
              className='space-y-4'
            >
              <TabsList>
                <TabsTrigger value='team'>Команда</TabsTrigger>
                <TabsTrigger value='targets'>Цели продаж</TabsTrigger>
                <TabsTrigger value='settings'>Настройки</TabsTrigger>
              </TabsList>

              <TabsContent value='team' className='space-y-4'>
                <div className='space-y-4'>
                  {/* Список участников команды */}
                  {settings.teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between rounded-lg border p-4'
                    >
                      <div>
                        <h3 className='font-medium'>{member}</h3>
                        <p className='text-muted-foreground text-sm'>
                          Менеджер по продажам
                        </p>
                      </div>
                      <Button variant='outline'>Профиль</Button>
                    </div>
                  ))}

                  {/* Добавление нового участника */}
                  <div className='rounded-lg border border-dashed p-4 text-center'>
                    <h3 className='font-medium'>Добавить нового сотрудника</h3>
                    <p className='text-muted-foreground mt-1 text-sm'>
                      Добавьте нового менеджера в команду
                    </p>
                    <Button variant='outline' className='mt-2'>
                      Добавить
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='targets' className='space-y-4'>
                <div className='space-y-4'>
                  <p className='text-muted-foreground'>
                    Настройте цели продаж для команды и отдельных сотрудников
                  </p>

                  {/* Месячные цели */}
                  <div className='space-y-2'>
                    <Label htmlFor='monthly-target'>
                      Цель продаж на месяц (₽)
                    </Label>
                    <Input
                      id='monthly-target'
                      type='number'
                      value={settings.salesTargets.monthly}
                      onChange={(e) =>
                        handleTargetChange('monthly', parseInt(e.target.value))
                      }
                      min={1}
                    />
                    <p className='text-muted-foreground text-xs'>
                      Общая сумма продаж, которую команда должна достичь за
                      месяц
                    </p>
                  </div>

                  <Separator />

                  {/* Квартальные цели */}
                  <div className='space-y-2'>
                    <Label htmlFor='quarterly-target'>
                      Цель продаж на квартал (₽)
                    </Label>
                    <Input
                      id='quarterly-target'
                      type='number'
                      value={settings.salesTargets.quarterly}
                      onChange={(e) =>
                        handleTargetChange(
                          'quarterly',
                          parseInt(e.target.value)
                        )
                      }
                      min={1}
                    />
                    <p className='text-muted-foreground text-xs'>
                      Общая сумма продаж, которую команда должна достичь за
                      квартал
                    </p>
                  </div>

                  <Separator />

                  {/* Порог эффективности */}
                  <div className='space-y-2'>
                    <Label htmlFor='performance-threshold'>
                      Порог эффективности (%)
                    </Label>
                    <Input
                      id='performance-threshold'
                      type='number'
                      value={settings.performanceThreshold}
                      onChange={(e) =>
                        handleSettingChange(
                          'performanceThreshold',
                          parseInt(e.target.value)
                        )
                      }
                      min={1}
                      max={100}
                    />
                    <p className='text-muted-foreground text-xs'>
                      Минимальный процент целей, который должен выполнять
                      менеджер
                    </p>
                  </div>

                  {/* Кнопка сохранения */}
                  <div className='flex justify-end pt-4'>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Сохранение...' : 'Сохранить цели'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='settings' className='space-y-4'>
                <div className='space-y-4'>
                  {/* Автоматическое распределение */}
                  <div className='flex items-center justify-between'>
                    <div>
                      <Label
                        htmlFor='auto-assignment'
                        className='text-base font-medium'
                      >
                        Автоматическое распределение
                      </Label>
                      <p className='text-muted-foreground text-sm'>
                        Автоматически распределять клиентов между менеджерами
                      </p>
                    </div>
                    <Switch
                      id='auto-assignment'
                      checked={settings.autoAssignment}
                      onCheckedChange={(value) =>
                        handleSettingChange('autoAssignment', value)
                      }
                    />
                  </div>

                  <Separator />

                  {/* Уведомления */}
                  <div className='flex items-center justify-between'>
                    <div>
                      <Label
                        htmlFor='notifications'
                        className='text-base font-medium'
                      >
                        Уведомления
                      </Label>
                      <p className='text-muted-foreground text-sm'>
                        Получать уведомления о важных событиях
                      </p>
                    </div>
                    <Switch
                      id='notifications'
                      checked={settings.notificationsEnabled}
                      onCheckedChange={(value) =>
                        handleSettingChange('notificationsEnabled', value)
                      }
                    />
                  </div>

                  {/* Кнопка сохранения */}
                  <div className='flex justify-end pt-4'>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Сохранение...' : 'Сохранить настройки'}
                    </Button>
                  </div>

                  {/* Сообщения об ошибках и успехе */}
                  {error && (
                    <div className='bg-destructive/10 text-destructive mt-4 rounded-md px-4 py-2'>
                      {error}
                    </div>
                  )}
                  {successMessage && (
                    <div className='bg-success/10 text-success mt-4 rounded-md px-4 py-2'>
                      {successMessage}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
