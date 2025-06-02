'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconCopy,
  IconEye,
  IconEyeOff,
  IconRefresh
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';

export function TokenDebug() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [showFullToken, setShowFullToken] = useState(false);

  const fetchClerkToken = () => {
    setIsLoadingToken(true);
    try {
      const clerkToken = getClerkTokenFromClientCookie();
      setToken(clerkToken);
      console.log(
        'Clerk token from cookie:',
        clerkToken ? 'Found' : 'Not found'
      );
    } catch (error) {
      console.error('Error fetching Clerk token:', error);
      setToken(null);
    } finally {
      setIsLoadingToken(false);
    }
  };

  useEffect(() => {
    fetchClerkToken();
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Токен скопирован в буфер обмена');
    } catch (err) {
      toast.error('Ошибка копирования токена');
    }
  };

  const formatToken = (token: string) => {
    if (!token) return 'Токен отсутствует';

    if (showFullToken) {
      return token;
    }

    // Показываем первые 20 и последние 10 символов
    if (token.length > 30) {
      return `${token.substring(0, 20)}...${token.substring(token.length - 10)}`;
    }

    return token;
  };

  const getTokenStatus = () => {
    if (isLoadingToken) return { status: 'loading', color: 'bg-yellow-500' };
    if (!token) return { status: 'missing', color: 'bg-red-500' };
    return { status: 'active', color: 'bg-green-500' };
  };

  const tokenStatus = getTokenStatus();

  return (
    <Card className='border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold text-yellow-800 dark:text-yellow-200'>
            Clerk Token (from Cookie)
          </CardTitle>
          <div className='flex items-center gap-2'>
            <div className={`h-2 w-2 rounded-full ${tokenStatus.color}`} />
            <Badge
              variant='outline'
              className='border-yellow-300 text-yellow-700 dark:border-yellow-600 dark:text-yellow-300'
            >
              {tokenStatus.status === 'loading' && 'Загрузка...'}
              {tokenStatus.status === 'missing' && 'Отсутствует'}
              {tokenStatus.status === 'active' && 'Активен'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-yellow-700 dark:text-yellow-300'>
              Значение токена (__session cookie):
            </span>
            <div className='flex gap-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowFullToken(!showFullToken)}
                className='h-6 w-6 p-0 text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-800'
              >
                {showFullToken ? (
                  <IconEyeOff className='h-3 w-3' />
                ) : (
                  <IconEye className='h-3 w-3' />
                )}
              </Button>
              {token && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => copyToClipboard(token)}
                  className='h-6 w-6 p-0 text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-800'
                >
                  <IconCopy className='h-3 w-3' />
                </Button>
              )}
              <Button
                variant='ghost'
                size='sm'
                onClick={fetchClerkToken}
                disabled={isLoadingToken}
                className='h-6 w-6 p-0 text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-800'
              >
                <IconRefresh
                  className={`h-3 w-3 ${isLoadingToken ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </div>
          <div className='rounded-md bg-yellow-100 p-3 font-mono text-xs text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200'>
            {formatToken(token || '')}
          </div>
        </div>

        {token && (
          <div className='space-y-2'>
            <span className='text-sm font-medium text-yellow-700 dark:text-yellow-300'>
              Информация о токене:
            </span>
            <div className='space-y-1 text-xs text-yellow-600 dark:text-yellow-400'>
              <div>Длина: {token.length} символов</div>
              <div>Тип: Clerk Session Token</div>
              <div>Источник: __session cookie</div>
              <div>
                Статус:{' '}
                {tokenStatus.status === 'active'
                  ? 'Действителен'
                  : 'Недействителен'}
              </div>
            </div>
          </div>
        )}

        {!token && !isLoadingToken && (
          <div className='text-center'>
            <Button
              onClick={fetchClerkToken}
              className='bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600'
            >
              Получить токен из cookie
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
