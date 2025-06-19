'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/hooks/useFunnels';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function FollowUpMessagesPage() {
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;
  const { currentFunnel } = useFunnels(backendOrgId);
  const router = useRouter();

  // Состояние для промпта
  const [prompt, setPrompt] = useState<string>(
    'Вы - ассистент по отправке сообщений клиентам. Ваша задача - формировать текстовые сообщения для follow-up. Используйте разный тон и стиль в зависимости от типа напоминания. Обязательно персонализируйте сообщение, используя имя клиента и название продукта.'
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Обработчик возврата назад
  const handleBack = () => {
    router.push('/dashboard/management');
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

      setSuccessMessage('Промпт успешно сохранен!');
    } catch (err) {
      setError('Произошла ошибка при сохранении промпта');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    // В реальной реализации здесь будет запрос к API для получения данных
    console.log('Загрузка данных follow-up сообщений...');
  }, [backendOrgId, currentFunnel?.id]);

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
                Настройка Follow Up (сообщения)
              </h1>
              <p className='text-muted-foreground'>
                Управление автоматическими сообщениями для клиентов
              </p>
            </div>
          </div>
        </div>

        {/* Настройка промпта */}
        <Card>
          <CardHeader>
            <CardTitle>Настройка промпта</CardTitle>
            <CardDescription>
              Настройка промпта для генерации сообщений
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex flex-col'>
                <Label htmlFor='prompt-editor' className='mb-2 block'>
                  Настройка промпта для генерации сообщений
                </Label>
                <Textarea
                  id='prompt-editor'
                  value={prompt}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  placeholder='Введите промпт для генерации follow-up сообщений...'
                  className='h-[250px] w-full resize-none'
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
      </div>
    </PageContainer>
  );
}
