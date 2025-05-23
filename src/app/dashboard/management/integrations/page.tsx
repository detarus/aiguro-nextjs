'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconChevronLeft,
  IconSettings,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandInstagram,
  IconBrandFacebook
} from '@tabler/icons-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

// Mock data for integration services
const integrationServices = [
  {
    id: 'telegram',
    name: 'Telegram',
    status: 'active',
    icon: IconBrandTelegram,
    clickable: true,
    description: 'Интеграция с мессенджером Telegram'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    status: 'active',
    icon: IconBrandWhatsapp,
    clickable: true,
    description: 'Интеграция с мессенджером WhatsApp'
  },
  {
    id: 'amocrm',
    name: 'AmoCRM',
    status: 'inactive',
    icon: IconSettings,
    clickable: true,
    description: 'Интеграция с CRM системой AmoCRM'
  },
  {
    id: 'bitrix',
    name: 'Bitrix24',
    status: 'inactive',
    icon: IconSettings,
    clickable: false,
    description: 'Интеграция с CRM системой Bitrix24'
  },
  {
    id: 'avito',
    name: 'AVITO',
    status: 'inactive',
    icon: IconSettings,
    clickable: false,
    description: 'Интеграция с площадкой AVITO'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    status: 'inactive',
    icon: IconBrandInstagram,
    clickable: false,
    description: 'Интеграция с Instagram'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    status: 'inactive',
    icon: IconBrandFacebook,
    clickable: false,
    description: 'Интеграция с Facebook Messenger'
  },
  {
    id: 'slack',
    name: 'Slack',
    status: 'inactive',
    icon: IconSettings,
    clickable: false,
    description: 'Интеграция со Slack'
  },
  {
    id: 'viber',
    name: 'Viber',
    status: 'inactive',
    icon: IconSettings,
    clickable: false,
    description: 'Интеграция с Viber'
  },
  {
    id: 'wildberries',
    name: 'WildBerries',
    status: 'inactive',
    icon: IconSettings,
    clickable: false,
    description: 'Интеграция с маркетплейсом WildBerries'
  }
];

// Integration details templates
const integrationDetails = {
  telegram: {
    id: 'telegram-detail',
    name: 'Telegram',
    fields: [
      { id: 1, label: 'Аккаунт 1', value: '+79999999999', editable: true },
      { id: 2, label: 'Аккаунт 2', value: '@username', editable: true },
      { id: 3, label: 'Аккаунт 3', value: '@tareev_site', editable: true },
      { id: 4, label: 'Аккаунт 4', value: '+79999999999', editable: true },
      { id: 5, label: 'Аккаунт 5', value: 'user1@example.com', editable: true }
    ]
  },
  whatsapp: {
    id: 'whatsapp-detail',
    name: 'WhatsApp',
    fields: [
      { id: 6, label: 'Аккаунт 1', value: '+79995599999', editable: true },
      { id: 7, label: 'Аккаунт 2', value: '+79999999943', editable: true },
      { id: 8, label: 'Аккаунт 3', value: '@whatsapp_account', editable: true },
      { id: 9, label: 'Аккаунт 4', value: '+79999999999', editable: true }
    ]
  },
  amocrm: {
    id: 'amocrm-detail',
    name: 'AmoCRM',
    fields: [
      { id: 10, label: 'API ключ', value: 'your-api-key-here', editable: true },
      { id: 11, label: 'Поддомен', value: 'yourcompany', editable: true },
      {
        id: 12,
        label: 'Пользователь',
        value: 'admin@company.com',
        editable: true
      },
      {
        id: 13,
        label: 'Секретный ключ',
        value: 'secret-key-here',
        editable: true
      }
    ]
  },
  bitrix: {
    id: 'bitrix-detail',
    name: 'Bitrix24',
    fields: []
  },
  avito: {
    id: 'avito-detail',
    name: 'AVITO',
    fields: []
  },
  instagram: {
    id: 'instagram-detail',
    name: 'Instagram',
    fields: []
  },
  facebook: {
    id: 'facebook-detail',
    name: 'Facebook',
    fields: []
  },
  slack: {
    id: 'slack-detail',
    name: 'Slack',
    fields: []
  },
  viber: {
    id: 'viber-detail',
    name: 'Viber',
    fields: []
  },
  wildberries: {
    id: 'wildberries-detail',
    name: 'WildBerries',
    fields: []
  }
};

function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(
    null
  );
  const [integrationData, setIntegrationData] = useState(integrationDetails);
  const [integrationStatuses, setIntegrationStatuses] = useState<
    Record<string, boolean>
  >(() => {
    const initialStatuses: Record<string, boolean> = {};
    integrationServices.forEach((service) => {
      initialStatuses[service.id] = service.status === 'active';
    });
    return initialStatuses;
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleIntegrationClick = (integrationId: string) => {
    const integration = integrationServices.find((i) => i.id === integrationId);
    if (integration && integration.clickable) {
      setSelectedIntegration(integrationId);
      setIsDialogOpen(true);
    }
  };

  const handleStatusToggle = (integrationId: string, newStatus: boolean) => {
    setIntegrationStatuses((prev) => ({
      ...prev,
      [integrationId]: newStatus
    }));
  };

  // Обработчик для предотвращения открытия диалога при клике на переключатель
  const handleSwitchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleFieldChange = (
    integrationId: string,
    fieldId: number,
    newValue: string
  ) => {
    setIntegrationData((prev) => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId as keyof typeof prev],
        fields:
          prev[integrationId as keyof typeof prev]?.fields.map((field) =>
            field.id === fieldId ? { ...field, value: newValue } : field
          ) || []
      }
    }));
  };

  const addNewAccount = (integrationId: string) => {
    const currentIntegration =
      integrationData[integrationId as keyof typeof integrationData];
    if (currentIntegration) {
      const newFieldId =
        Math.max(...currentIntegration.fields.map((f) => f.id)) + 1;
      setIntegrationData((prev) => ({
        ...prev,
        [integrationId]: {
          ...prev[integrationId as keyof typeof prev],
          fields: [
            ...currentIntegration.fields,
            {
              id: newFieldId,
              label: `Аккаунт ${currentIntegration.fields.length + 1}`,
              value: '',
              editable: true
            }
          ]
        }
      }));
    }
  };

  const removeAccount = (integrationId: string, fieldId: number) => {
    setIntegrationData((prev) => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId as keyof typeof prev],
        fields:
          prev[integrationId as keyof typeof prev]?.fields.filter(
            (field) => field.id !== fieldId
          ) || []
      }
    }));
  };

  const currentIntegrationData = selectedIntegration
    ? integrationData[selectedIntegration as keyof typeof integrationData]
    : null;

  const getFirstThreeAccounts = (integrationId: string) => {
    const data = integrationData[integrationId as keyof typeof integrationData];
    return data ? data.fields.slice(0, 3) : [];
  };

  return (
    <PageContainer>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>Интеграции</h1>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {integrationServices.map((service) => {
            const IconComponent = service.icon;
            const isActive = integrationStatuses[service.id];
            const firstThreeAccounts = getFirstThreeAccounts(service.id);

            return (
              <Card
                key={service.id}
                className={cn(
                  'min-h-[280px] cursor-pointer transition-all hover:shadow-md',
                  service.clickable
                    ? 'hover:border-primary'
                    : 'cursor-not-allowed opacity-60',
                  isActive
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : ''
                )}
                onClick={() => handleIntegrationClick(service.id)}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <IconComponent size={24} className='text-primary' />
                      <CardTitle className='text-lg'>{service.name}</CardTitle>
                    </div>
                    <Badge
                      variant={isActive ? 'default' : 'secondary'}
                      className={isActive ? 'bg-green-500' : ''}
                    >
                      {isActive ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </div>

                  {/* Переключатель активности для кликабельных интеграций */}
                  {service.clickable && (
                    <div className='mt-3 flex items-center space-x-2'>
                      <Label
                        htmlFor={`switch-${service.id}`}
                        className='text-sm font-medium'
                      >
                        Активность:
                      </Label>
                      <Switch
                        id={`switch-${service.id}`}
                        checked={isActive}
                        onCheckedChange={(checked) =>
                          handleStatusToggle(service.id, checked)
                        }
                        onClick={handleSwitchClick}
                      />
                    </div>
                  )}
                </CardHeader>

                <CardContent className='space-y-3'>
                  <p className='text-muted-foreground text-sm'>
                    {service.description}
                  </p>

                  {/* Отображение первых трех аккаунтов для активных интеграций */}
                  {isActive &&
                    service.clickable &&
                    firstThreeAccounts.length > 0 && (
                      <div className='space-y-2'>
                        <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                          Подключенные аккаунты:
                        </div>
                        <div className='space-y-1'>
                          {firstThreeAccounts.map((account, index) => (
                            <div
                              key={account.id}
                              className='flex items-center justify-between rounded bg-gray-50 p-2 text-xs dark:bg-gray-800'
                            >
                              <span className='font-medium text-gray-600 dark:text-gray-400'>
                                {account.label}:
                              </span>
                              <span className='max-w-[120px] truncate text-gray-800 dark:text-gray-200'>
                                {account.value || 'Не указан'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {service.clickable && (
                    <div className='flex justify-end pt-2'>
                      <Button variant='outline' size='sm'>
                        <IconSettings size={16} className='mr-2' />
                        Настроить
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Integration Configuration Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                {selectedIntegration && (
                  <>
                    {React.createElement(
                      integrationServices.find(
                        (s) => s.id === selectedIntegration
                      )?.icon || IconSettings,
                      { size: 24 }
                    )}
                    Настройка интеграции: {currentIntegrationData?.name}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                Настройте аккаунты для интеграции. Вы можете добавлять,
                редактировать и удалять аккаунты.
              </DialogDescription>
            </DialogHeader>

            {currentIntegrationData && (
              <div className='space-y-4'>
                {currentIntegrationData.fields.map((field) => (
                  <div key={field.id} className='flex items-center gap-2'>
                    <div className='flex-1'>
                      <Label
                        htmlFor={`field-${field.id}`}
                        className='text-sm font-medium'
                      >
                        {field.label}
                      </Label>
                      <div className='mt-1 flex gap-2'>
                        <Input
                          id={`field-${field.id}`}
                          value={field.value}
                          onChange={(e) =>
                            selectedIntegration &&
                            handleFieldChange(
                              selectedIntegration,
                              field.id,
                              e.target.value
                            )
                          }
                          placeholder={`Введите ${field.label.toLowerCase()}`}
                          disabled={!field.editable}
                        />
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            selectedIntegration &&
                            removeAccount(selectedIntegration, field.id)
                          }
                          className='px-3'
                        >
                          <IconTrash size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className='flex gap-2 border-t pt-4'>
                  <Button
                    variant='outline'
                    onClick={() =>
                      selectedIntegration && addNewAccount(selectedIntegration)
                    }
                    className='flex-1'
                  >
                    <IconPlus size={16} className='mr-2' />
                    Добавить аккаунт
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Сохранить
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

export default IntegrationsPage;
