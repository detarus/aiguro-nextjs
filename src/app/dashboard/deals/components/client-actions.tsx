'use client';

import { Button } from '@/components/ui/button';
import {
  IconPlus,
  IconDownload,
  IconUpload,
  IconTrash
} from '@tabler/icons-react';

export function ClientActions() {
  return (
    <div className='flex flex-col items-center justify-start gap-2 sm:flex-row sm:gap-3'>
      <Button className='w-full sm:w-auto' size='sm'>
        <IconPlus className='mr-2 h-4 w-4' />
        Добавить диалог
      </Button>

      <div className='flex gap-2'>
        <Button variant='outline' size='sm' className='hidden sm:flex'>
          <IconDownload className='mr-2 h-4 w-4' />
          Экспорт
        </Button>

        <Button variant='outline' size='sm' className='hidden sm:flex'>
          <IconUpload className='mr-2 h-4 w-4' />
          Импорт
        </Button>

        <Button
          variant='outline'
          size='sm'
          className='text-destructive hover:text-destructive'
        >
          <IconTrash className='h-4 w-4 sm:mr-2' />
          <span className='hidden sm:inline'>Удалить</span>
        </Button>
      </div>
    </div>
  );
}
