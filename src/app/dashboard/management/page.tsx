'use client';

import { Suspense, useEffect, useState } from 'react';
import { PageSkeleton } from '@/components/page-skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { IconAdjustments } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/ui/page-container';
import Link from 'next/link';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/hooks/useFunnels';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';

export default function ManagementPage() {
  const { organization } = useOrganization();
  const { currentFunnel } = useFunnels(
    organization?.publicMetadata?.id_backend as string
  );

  const [assistantsCount, setAssistantsCount] = useState<number | null>(null);
  const [assistantsLoading, setAssistantsLoading] = useState(false);

  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  // Функция для загрузки количества ассистентов по этапам из воронки
  const fetchAssistantsCount = async () => {
    if (!backendOrgId || !currentFunnel?.id) {
      return;
    }

    const token = getClerkTokenFromClientCookie();
    if (!token) {
      return;
    }

    setAssistantsLoading(true);

    try {
      // Получаем данные воронки, которая содержит этапы
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

      if (response.ok) {
        const funnelData = await response.json();
        console.log('Funnel data:', funnelData);

        // Подсчитываем количество этапов с ассистентами
        if (funnelData.stages && Array.isArray(funnelData.stages)) {
          const stagesWithAssistants = funnelData.stages.filter(
            (stage: any) =>
              stage.assistant_code_name &&
              stage.assistant_code_name.trim() !== ''
          );
          setAssistantsCount(stagesWithAssistants.length);
        } else {
          setAssistantsCount(0);
        }
      } else {
        console.error('Failed to fetch funnel data:', response.status);
        setAssistantsCount(0);
      }
    } catch (error) {
      console.error('Error fetching funnel data:', error);
      setAssistantsCount(0);
    } finally {
      setAssistantsLoading(false);
    }
  };

  // Загружаем данные при монтировании и изменении организации/воронки
  useEffect(() => {
    if (organization && currentFunnel) {
      fetchAssistantsCount();
    }
  }, [backendOrgId, currentFunnel?.id]);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContainer scrollable={true}>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Управление воронкой
            </h1>
            <p className='text-muted-foreground'>
              Административная панель управления системой
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* <Card>
              <CardHeader>
                <CardTitle>Организация</CardTitle>
                <CardDescription>
                  Управление пользователями и их ролями в компании
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                      <IconAdjustments className='text-primary h-6 w-6' />
                    </div>
                    <div>
                      <h3 className='font-medium'>5 активных пользователей</h3>
                      <p className='text-muted-foreground text-sm'>
                        2 администратора, 3 оператора
                      </p>
                    </div>
                  </div>
                  <Button size='sm'>Перейти</Button>
                </div>
              </CardContent>
            </Card> */}

            {/* <Card>
              <CardHeader>
                <CardTitle>Воронки</CardTitle>
                <CardDescription>
                  Настройка, активация и удаление воронок
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                      <IconAdjustments className='text-primary h-6 w-6' />
                    </div>
                    <div>
                      <h3 className='font-medium'>7 активных воронок</h3>
                      <p className='text-muted-foreground text-sm'>
                        Несколько воронок ожидают изменений
                      </p>
                    </div>
                  </div>
                  <Button size='sm'>Перейти</Button>
                </div>
              </CardContent>
            </Card> */}

            <Card>
              <CardHeader>
                <CardTitle>AI-ассистенты</CardTitle>
                <CardDescription>
                  Настройка и доработка ассистентов
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                      <IconAdjustments className='text-primary h-6 w-6' />
                    </div>
                    <div>
                      <h3 className='font-medium'>
                        {assistantsLoading
                          ? 'Загрузка...'
                          : assistantsCount !== null
                            ? `${assistantsCount} ${assistantsCount === 1 ? 'ассистент' : assistantsCount >= 2 && assistantsCount <= 4 ? 'ассистента' : 'ассистентов'} этапов`
                            : 'Ассистенты этапов не найдены'}
                      </h3>
                      <p className='text-muted-foreground text-sm'>
                        Просмотр и редактирование
                      </p>
                    </div>
                  </div>
                  <Link href='/dashboard/management/ai-assistants/'>
                    <Button size='sm'>Перейти</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </Suspense>
  );
}
