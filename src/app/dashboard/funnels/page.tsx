'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { IconSearch, IconRefresh } from '@tabler/icons-react';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';

// Интерфейс для воронки из API
interface ApiFunnel {
  id: string;
  name?: string;
  display_name?: string;
  is_active?: boolean;
  created_at?: string;
  conversion?: number;
  stages?: Array<{
    name: string;
    assistant_code_name?: string;
    prompt?: string;
    followups?: number[];
  }>;
}

export default function FunnelsPage() {
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  const [funnels, setFunnels] = useState<ApiFunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Ключи для localStorage
  const getFunnelsCacheKey = () => `funnels_${backendOrgId}`;
  const getLastUpdatedKey = () => `funnels_last_updated_${backendOrgId}`;

  // Функция проверки валидности кэша (10 минут)
  const isCacheValid = () => {
    const lastUpdatedStr = localStorage.getItem(getLastUpdatedKey());
    if (!lastUpdatedStr) return false;

    const lastUpdatedTime = new Date(lastUpdatedStr);
    const now = new Date();
    const diffMinutes =
      (now.getTime() - lastUpdatedTime.getTime()) / (1000 * 60);

    return diffMinutes < 10;
  };

  // Функция загрузки из localStorage
  const loadFromCache = () => {
    if (!backendOrgId) return null;

    try {
      const cachedData = localStorage.getItem(getFunnelsCacheKey());
      const lastUpdatedStr = localStorage.getItem(getLastUpdatedKey());

      if (cachedData && lastUpdatedStr && isCacheValid()) {
        const data = JSON.parse(cachedData);
        setLastUpdated(new Date(lastUpdatedStr));
        console.log('Loaded funnels from cache:', data);
        return data;
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
    }

    return null;
  };

  // Функция сохранения в localStorage
  const saveToCache = (data: ApiFunnel[]) => {
    if (!backendOrgId) return;

    try {
      const now = new Date();
      localStorage.setItem(getFunnelsCacheKey(), JSON.stringify(data));
      localStorage.setItem(getLastUpdatedKey(), now.toISOString());
      setLastUpdated(now);
      console.log('Saved funnels to cache:', data);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  // Функция обработки данных воронок (активация по умолчанию и конверсия 50%)
  const processFunnelsData = (rawFunnels: ApiFunnel[]): ApiFunnel[] => {
    return rawFunnels.map((funnel) => ({
      ...funnel,
      is_active: funnel.is_active !== undefined ? funnel.is_active : true, // Активируем по умолчанию
      conversion: 50 // Устанавливаем конверсию 50%
    }));
  };

  // Функция загрузки воронок
  const fetchFunnels = useCallback(
    async (isRefresh = false) => {
      if (!backendOrgId) return;

      // Пытаемся загрузить из кэша если это не принудительное обновление
      if (!isRefresh) {
        const cachedData = loadFromCache();
        if (cachedData) {
          setFunnels(cachedData);
          setLoading(false);
          return;
        }
      }

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const token = getClerkTokenFromClientCookie();
        if (!token) {
          throw new Error('No token available in __session cookie');
        }

        console.log('Fetching funnels for organization:', backendOrgId);

        const response = await fetch(
          `/api/organization/${backendOrgId}/funnels`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const rawData = await response.json();
        console.log('Successfully fetched funnels from API:', rawData);

        // Обрабатываем данные (активация по умолчанию, конверсия 50%)
        const processedData = processFunnelsData(rawData);
        console.log('Processed funnels data:', processedData);

        setFunnels(processedData);
        saveToCache(processedData);
      } catch (error: any) {
        console.error('Error fetching funnels:', error);
        setError(error.message || 'Неизвестная ошибка');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [backendOrgId]
  );

  // Загрузка при изменении организации
  useEffect(() => {
    if (backendOrgId) {
      fetchFunnels();
    }
  }, [backendOrgId, fetchFunnels]);

  // Автоматическое обновление каждые 10 минут
  useEffect(() => {
    if (!backendOrgId) return;

    const interval = setInterval(
      () => {
        console.log('Auto-refreshing funnels data...');
        fetchFunnels(true);
      },
      10 * 60 * 1000
    ); // 10 минут

    return () => clearInterval(interval);
  }, [backendOrgId, fetchFunnels]);

  // Функция обновления данных
  const handleRefresh = () => {
    fetchFunnels(true);
  };

  // Функция переключения активности воронки
  const toggleFunnelActive = (funnelId: string, isActive: boolean) => {
    const updatedFunnels = funnels.map((funnel) =>
      funnel.id === funnelId ? { ...funnel, is_active: isActive } : funnel
    );

    setFunnels(updatedFunnels);
    saveToCache(updatedFunnels);

    console.log(
      `Funnel ${funnelId} set to ${isActive ? 'active' : 'inactive'}`
    );
  };

  // Функция фильтрации воронок по поисковому запросу
  const filteredFunnels = funnels.filter((funnel) => {
    const name = funnel.display_name || funnel.name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Функция форматирования даты
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Неизвестно';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    } catch {
      return 'Неизвестно';
    }
  };

  // Функция для получения названия этапа по индексу
  const getStageTooltip = (
    stages: Array<{ name: string }> | undefined,
    stageIndex: number
  ) => {
    if (!stages || !stages[stageIndex]) return `Этап ${stageIndex + 1}`;
    return stages[stageIndex].name || `Этап ${stageIndex + 1}`;
  };

  // Функция рендеринга состава (этапов)
  const renderComposition = (funnel: ApiFunnel) => {
    const stages = funnel.stages || [];
    const maxStages = 4; // Показываем максимум 4 этапа

    return (
      <div className='flex gap-2'>
        {Array.from({ length: maxStages }, (_, index) => {
          const hasStage = index < stages.length;
          const colors = [
            'bg-blue-400',
            'bg-amber-400',
            'bg-red-400',
            'bg-green-400'
          ];
          const grayColor = 'bg-gray-200 dark:bg-gray-600';

          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='flex items-center'>
                    <div
                      className={`${
                        hasStage ? colors[index] : grayColor
                      } flex h-5 w-5 cursor-help items-center justify-center rounded-full text-xs font-medium text-white`}
                    >
                      {hasStage ? index + 1 : 0}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getStageTooltip(stages, index)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>Воронки</h1>
          </div>
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <IconRefresh className='text-muted-foreground mx-auto mb-4 h-8 w-8 animate-spin' />
              <p className='text-muted-foreground'>Загружаем воронки...</p>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>Воронки</h1>
          </div>
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <p className='mb-4 text-red-500'>Ошибка загрузки: {error}</p>
              <Button onClick={() => fetchFunnels()}>Попробовать снова</Button>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>Воронки</h1>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='flex items-center gap-2'
            >
              <IconRefresh
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              {isRefreshing ? 'Обновление...' : 'Обновить'}
            </Button>
            <Button
              variant='outline'
              className='text-primary border-primary hover:bg-primary/10'
            >
              Инструкция
            </Button>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <div className='relative w-full sm:w-auto'>
            <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
            <Input
              placeholder='Поиск...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='h-9 pl-9'
            />
          </div>
          <Input
            type='date'
            placeholder='Начальная Дата'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className='h-9 w-full sm:w-auto'
          />
          <Input
            type='date'
            placeholder='Конечная Дата'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className='h-9 w-full sm:w-auto'
          />
        </div>

        {filteredFunnels.length === 0 ? (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <p className='text-muted-foreground mb-4'>
                {funnels.length === 0
                  ? 'Воронки не найдены'
                  : 'Нет воронок по вашему запросу'}
              </p>
              {searchTerm && (
                <Button variant='outline' onClick={() => setSearchTerm('')}>
                  Очистить поиск
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='hover:bg-transparent'>
                  <TableHead className='w-[70px]'>Состояние</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Дата Создания</TableHead>
                  <TableHead>Канал</TableHead>
                  <TableHead>Состав</TableHead>
                  <TableHead>Конверсия</TableHead>
                  <TableHead>Цель</TableHead>
                  <TableHead>Ответственный</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFunnels.map((funnel) => (
                  <TableRow key={funnel.id}>
                    <TableCell>
                      <Switch
                        checked={funnel.is_active ?? false}
                        onCheckedChange={(checked) =>
                          toggleFunnelActive(funnel.id, checked)
                        }
                      />
                    </TableCell>
                    <TableCell className='font-medium'>
                      {funnel.display_name || funnel.name || 'Неизвестно'}
                    </TableCell>
                    <TableCell>{formatDate(funnel.created_at)}</TableCell>
                    <TableCell>Telegram</TableCell>
                    <TableCell>{renderComposition(funnel)}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <div className='h-1.5 w-24 rounded-full bg-gray-100 dark:bg-gray-600'>
                          <div
                            className='h-1.5 rounded-full bg-green-400'
                            style={{ width: `${funnel.conversion || 0}%` }}
                          ></div>
                        </div>
                        <span className='text-sm'>
                          {funnel.conversion || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>Неизвестно</TableCell>
                    <TableCell>Неизвестно</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Панель управления - внизу */}
        <div className='bg-muted/50 mt-4 flex items-center justify-between rounded-lg border p-3'>
          <div className='flex items-center gap-4'>
            <div className='text-sm'>
              <span className='font-medium'>Воронок загружено:</span>{' '}
              {funnels.length}
            </div>
            <div className='text-sm'>
              <span className='font-medium'>Активных:</span>{' '}
              {funnels.filter((f) => f.is_active).length}
            </div>
            {lastUpdated && (
              <div className='text-muted-foreground text-sm'>
                Обновлено: {lastUpdated.toLocaleTimeString('ru-RU')}
              </div>
            )}
            {isRefreshing && (
              <div className='text-sm text-blue-600'>Обновление данных...</div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
