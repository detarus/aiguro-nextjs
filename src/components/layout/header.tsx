import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';
import { UserNav } from './user-nav';
import { ThemeSelector } from '../theme-selector';
import { ModeToggle } from './ThemeToggle/theme-toggle';
import CtaGithub from './cta-github';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  IconSettings,
  IconDotsVertical,
  IconDownload,
  IconFilter,
  IconLayoutGrid,
  IconDatabase,
  IconChevronDown,
  IconCalendar,
  IconSearch,
  IconPlus,
  IconLayoutKanban,
  IconList
} from '@tabler/icons-react';

// Базовый header для обычных страниц
export default function Header() {
  return (
    <header className='flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Breadcrumbs />
      </div>

      <div className='flex items-center gap-2 px-4'>
        <ModeToggle />
        <ThemeSelector />
      </div>
    </header>
  );
}

// Расширенный header для страниц с табличными данными
interface TableHeaderProps {
  title: string;
  funnels?: Array<{ id: string; name: string }>;
  selectedFunnel?: string;
  onFunnelChange?: (funnelId: string) => void;
  onSearch?: (query: string) => void;
  onTimeFilterChange?: (period: string) => void;
  timeFilter?: string;
  timeFilterOptions?: Array<{ value: string; label: string }>;
  actions?: {
    onExport?: () => void;
    onFilters?: () => void;
    onView?: () => void;
    onData?: () => void;
  };
  // Новые пропсы для переключения вида
  viewMode?: 'list' | 'kanban';
  onViewModeChange?: (mode: 'list' | 'kanban') => void;
  showViewToggle?: boolean; // Показывать ли переключатель вида
  disableFunnelSettings?: boolean; // Отключить кнопку настроек воронки
}

export function TableHeader({
  title,
  funnels = [],
  selectedFunnel = 'all',
  onFunnelChange,
  onSearch,
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
  disableFunnelSettings = false
}: TableHeaderProps) {
  const [activeTimeFilter, setActiveTimeFilter] = React.useState(timeFilter);

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
      <span className='hidden sm:inline'>Настройки воронки</span>
    </Button>
  );

  return (
    <header className='flex flex-col gap-3 border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900'>
      {/* Первая строка: Хлебные крошки | Настройки воронки */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <Breadcrumbs />
        </div>

        {disableFunnelSettings ? (
          funnelSettingsButton
        ) : (
          <Link href='/dashboard/management'>{funnelSettingsButton}</Link>
        )}
      </div>

      {/* Вторая строка: Заголовок | Переключение воронки | Переключение вида | Поиск | Время | Действия */}
      <div className='flex items-center justify-between gap-4'>
        {/* Левая часть: Заголовок, селекторы */}
        <div className='flex items-center gap-4'>
          <h1 className='text-xl font-semibold whitespace-nowrap text-gray-900 dark:text-gray-100'>
            {title}
          </h1>

          {/* Переключение воронки */}
          {funnels.length === 0 ? (
            <Button
              onClick={() => onFunnelChange?.('add-funnel')}
              variant='default'
              size='sm'
              className='h-8 w-full max-w-[180px] text-sm'
            >
              <IconPlus className='mr-2 h-4 w-4' />
              Создать воронку
            </Button>
          ) : (
            <Select value={selectedFunnel} onValueChange={onFunnelChange}>
              <SelectTrigger className='h-[32px] max-h-[32px] w-full max-w-xs min-w-[180px] text-sm'>
                <SelectValue className='truncate'>
                  {funnels.find((f) => f.id === selectedFunnel)?.name ||
                    'Выберите воронку'}
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
                  <span className='text-primary'>+ Создать воронку</span>
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Переключение вида */}
          {showViewToggle && (
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
          )}
        </div>

        {/* Правая часть: Поиск, фильтр времени, действия */}
        <div className='flex flex-grow items-center justify-end gap-3'>
          <div className='flex-grow'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Поиск...'
                className={cn(
                  'h-8 w-full rounded-md border border-gray-300 bg-white pr-3 pl-8 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400'
                )}
                onChange={(e) => onSearch?.(e.target.value)}
              />
              <IconSearch className='absolute top-2 left-2.5 h-3.5 w-3.5 text-gray-400 dark:text-gray-500' />
            </div>
          </div>

          {/* Фильтр времени */}
          <div className='flex items-center rounded-md border shadow-sm'>
            {timeFilterOptions.map((option) => (
              <Button
                key={option.value}
                variant='ghost'
                className={cn(
                  'h-8 rounded-none border-r px-3 text-xs font-medium last:border-r-0 sm:text-sm',
                  activeTimeFilter === option.value
                    ? 'bg-background border-b-primary text-primary hover:bg-background border-b-2'
                    : 'hover:bg-muted text-muted-foreground border-b-2 border-b-transparent'
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

          {/* Меню действий */}
          {Object.keys(actions).length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='h-8 px-2'>
                  <IconDotsVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-40'>
                <DropdownMenuItem
                  onClick={actions.onExport}
                  className='flex items-center gap-2'
                >
                  <IconDownload className='h-4 w-4' />
                  Экспорт
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={actions.onFilters}
                  className='flex items-center gap-2'
                >
                  <IconFilter className='h-4 w-4' />
                  Фильтры
                </DropdownMenuItem>
                {actions.onView && (
                  <DropdownMenuItem onClick={actions.onView}>
                    <IconLayoutGrid className='mr-2 h-4 w-4' />
                    <span>Вид</span>
                  </DropdownMenuItem>
                )}
                {actions.onData && (
                  <DropdownMenuItem onClick={actions.onData}>
                    <IconDatabase className='mr-2 h-4 w-4' />
                    <span>Данные</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
