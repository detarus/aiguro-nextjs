'use client';

import React from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  IconSettings,
  IconX,
  IconDownload,
  IconFilter,
  IconLayoutGrid,
  IconDatabase,
  IconSearch,
  IconPlus,
  IconLayoutKanban,
  IconList,
  IconMenu
} from '@tabler/icons-react';
import Link from 'next/link';

interface MobileHeaderPopupProps {
  title: string;
  funnels?: Array<{ id: string; name: string }>;
  selectedFunnel?: string;
  onFunnelChange?: (funnelId: string) => void;
  onSearch?: (query: string) => void;
  searchValue?: string;
  onTimeFilterChange?: (period: string) => void;
  timeFilter?: string;
  timeFilterOptions?: Array<{ value: string; label: string }>;
  actions?: {
    onExport?: () => void;
    onFilters?: () => void;
    onView?: () => void;
    onData?: () => void;
  };
  viewMode?: 'list' | 'kanban';
  onViewModeChange?: (mode: 'list' | 'kanban') => void;
  showViewToggle?: boolean;
  disableFunnelSettings?: boolean;
  settingsUrl?: string;
  triggerIcon?: React.ReactNode;
}

export function MobileHeaderPopup({
  title,
  funnels = [],
  selectedFunnel = 'all',
  onFunnelChange,
  onSearch,
  searchValue = '',
  onTimeFilterChange,
  timeFilter = 'week',
  timeFilterOptions = [
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
    { value: 'period', label: 'Период' }
  ],
  actions = {},
  viewMode = 'list',
  onViewModeChange,
  showViewToggle = false,
  disableFunnelSettings = false,
  settingsUrl = '/dashboard/management',
  triggerIcon
}: MobileHeaderPopupProps) {
  const [activeTimeFilter, setActiveTimeFilter] = React.useState(timeFilter);
  const [isOpen, setIsOpen] = React.useState(false);

  // Синхронизируем внутреннее состояние с внешним пропом
  React.useEffect(() => {
    setActiveTimeFilter(timeFilter);
  }, [timeFilter]);

  const funnelSettingsButton = (
    <Button
      variant='ghost'
      size='sm'
      disabled={disableFunnelSettings}
      className='flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
    >
      <IconSettings className='h-4 w-4' />
      <span>Настройки воронки</span>
    </Button>
  );

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant='outline'
        size='sm'
        className='h-8 w-8 p-0'
        onClick={() => setIsOpen(true)}
      >
        {triggerIcon || <IconMenu className='h-4 w-4' />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 transition-opacity duration-200'
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Filter Popup */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-full bg-transparent transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setIsOpen(false)}
      >
        {/* Filter content */}
        <div className='flex h-full w-full flex-col'>
          {/* Main content container with rounded border */}
          <div className='m-4 max-h-[80vh] overflow-y-auto rounded-[25px] border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-[#2D2D2D]'>
            {/* Header */}
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                {title}
              </h2>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0'
                onClick={() => setIsOpen(false)}
              >
                <IconX className='h-4 w-4' />
              </Button>
            </div>

            <div className='flex flex-col gap-6'>
              {/* Настройки воронки */}
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  Воронка
                </h3>
                {disableFunnelSettings ? (
                  funnelSettingsButton
                ) : (
                  <div className='space-y-2'>
                    <Link href={settingsUrl} className='block'>
                      {funnelSettingsButton}
                    </Link>
                    {funnels.length === 0 ? (
                      <Button
                        onClick={() => onFunnelChange?.('add-funnel')}
                        variant='default'
                        size='sm'
                        className='w-full text-sm'
                      >
                        <IconPlus className='mr-2 h-4 w-4' />
                        Создать воронку
                      </Button>
                    ) : (
                      <Select
                        value={selectedFunnel}
                        onValueChange={onFunnelChange}
                      >
                        <SelectTrigger className='w-full text-sm'>
                          <SelectValue className='truncate'>
                            {selectedFunnel === 'all-funnels'
                              ? 'Все воронки'
                              : funnels.find((f) => f.id === selectedFunnel)
                                  ?.name || 'Выберите воронку'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem key='all-funnels' value='all-funnels'>
                            Все воронки
                          </SelectItem>
                          {funnels
                            .filter((f) => f.id !== 'create')
                            .map((funnel) => (
                              <SelectItem key={funnel.id} value={funnel.id}>
                                {funnel.name}
                              </SelectItem>
                            ))}
                          <SelectItem value='add-funnel'>
                            <span className='text-primary'>
                              + Создать воронку
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </div>

              {/* Поиск */}
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  Поиск
                </h3>
                <div className='relative'>
                  <input
                    type='text'
                    value={searchValue}
                    placeholder='Поиск...'
                    className={cn(
                      'h-8 w-full rounded-md border border-gray-300 bg-white pr-3 pl-8 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400'
                    )}
                    onChange={(e) => onSearch?.(e.target.value)}
                  />
                  <IconSearch className='absolute top-2 left-2.5 h-3.5 w-3.5 text-gray-400 dark:text-gray-500' />
                </div>
              </div>

              {/* Переключение вида */}
              {showViewToggle && (
                <div className='space-y-3'>
                  <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                    Вид
                  </h3>
                  <div className='flex items-center rounded-md border shadow-sm'>
                    <Button
                      variant='ghost'
                      className={cn(
                        'h-8 w-8 rounded-l-md rounded-r-none border-r p-0',
                        viewMode === 'kanban'
                          ? 'border-b-primary hover:bg-background bg-background text-primary border-b-2'
                          : 'text-muted-foreground hover:bg-muted border-b-2 border-b-transparent'
                      )}
                      onClick={() => onViewModeChange?.('kanban')}
                    >
                      <IconLayoutKanban className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      className={cn(
                        'h-8 w-8 rounded-l-none rounded-r-md p-0',
                        viewMode === 'list'
                          ? 'border-b-primary hover:bg-background bg-background text-primary border-b-2'
                          : 'text-muted-foreground hover:bg-muted border-b-2 border-b-transparent'
                      )}
                      onClick={() => onViewModeChange?.('list')}
                    >
                      <IconList className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}

              {/* Фильтр времени */}
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  Период
                </h3>
                <div className='flex flex-col gap-2'>
                  {timeFilterOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant='ghost'
                      className={cn(
                        'h-8 justify-start px-3 text-xs font-medium sm:text-sm',
                        activeTimeFilter === option.value
                          ? 'bg-background border-b-primary text-primary hover:bg-background border-b-2'
                          : 'hover:bg-muted text-muted-foreground'
                      )}
                      onClick={() => {
                        setActiveTimeFilter(option.value);
                        onTimeFilterChange?.(option.value);
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Действия */}
              {Object.keys(actions).length > 0 && (
                <div className='space-y-3'>
                  <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                    Действия
                  </h3>
                  <div className='space-y-2'>
                    {actions.onExport && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='w-full justify-start'
                        onClick={actions.onExport}
                      >
                        <IconDownload className='mr-2 h-4 w-4' />
                        Экспорт
                      </Button>
                    )}
                    {actions.onFilters && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='w-full justify-start'
                        onClick={actions.onFilters}
                      >
                        <IconFilter className='mr-2 h-4 w-4' />
                        Фильтры
                      </Button>
                    )}
                    {actions.onView && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='w-full justify-start'
                        onClick={actions.onView}
                      >
                        <IconLayoutGrid className='mr-2 h-4 w-4' />
                        Вид
                      </Button>
                    )}
                    {actions.onData && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='w-full justify-start'
                        onClick={actions.onData}
                      >
                        <IconDatabase className='mr-2 h-4 w-4' />
                        Данные
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
