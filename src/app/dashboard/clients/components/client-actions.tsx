'use client';

import { Button } from '@/components/ui/button';
import {
  IconPlus,
  IconDownload,
  IconUpload,
  IconTrash
} from '@tabler/icons-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useContext } from 'react';
import { ClientSelectionContext } from '../context/client-selection-context';

export function ClientActions() {
  const { selectedClients } = useContext(ClientSelectionContext);
  const hasSelectedClients = selectedClients.size > 0;

  return (
    <div className='flex flex-col items-center justify-start gap-2 sm:flex-row sm:gap-3'>
      {/* <Button className='w-full sm:w-auto' size='sm'>
        <IconPlus className='mr-2 h-4 w-4' />
        Добавить клиента
      </Button> */}

      <div className='flex gap-2'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant='outline'
                  size='sm'
                  className='hidden sm:flex'
                  disabled={!hasSelectedClients}
                >
                  <IconDownload className='mr-2 h-4 w-4' />
                  Экспорт
                </Button>
              </div>
            </TooltipTrigger>
            {!hasSelectedClients && (
              <TooltipContent>
                <p>Для экспорта выберите 1 или более клиентов</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* <Button variant='outline' size='sm' className='hidden sm:flex'>
          <IconUpload className='mr-2 h-4 w-4' />
          Импорт
        </Button> */}

        {/* <Button
          variant='outline'
          size='sm'
          className='text-destructive hover:text-destructive'
        >
          <IconTrash className='h-4 w-4 sm:mr-2' />
          <span className='hidden sm:inline'>Удалить</span>
        </Button> */}
      </div>
    </div>
  );
}
