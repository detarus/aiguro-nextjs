'use client';

import { useOrganizationSync } from '@/contexts/OrganizationSyncContext';
import { Loader2, Building } from 'lucide-react';

export function GlobalSyncLoader() {
  const { isSyncing, syncProgress } = useOrganizationSync();

  if (!isSyncing) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800'>
        <div className='flex flex-col items-center space-y-4'>
          <div className='relative'>
            <Building className='h-12 w-12 text-blue-600 dark:text-blue-400' />
            <Loader2 className='absolute -top-1 -right-1 h-6 w-6 animate-spin text-blue-600 dark:text-blue-400' />
          </div>

          <div className='space-y-2 text-center'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Синхронизация организации
            </h3>

            <p className='text-sm text-gray-500 dark:text-gray-400'>
              {syncProgress || 'Настройка организации...'}
            </p>
          </div>

          <div className='h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
            <div
              className='h-2 animate-pulse rounded-full bg-blue-600'
              style={{ width: '100%' }}
            ></div>
          </div>

          <p className='text-center text-xs text-gray-500 dark:text-gray-400'>
            Пожалуйста, подождите. Система настраивается для работы с вашей
            организацией.
          </p>
        </div>
      </div>
    </div>
  );
}
