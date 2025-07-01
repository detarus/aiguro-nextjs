'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/hooks/useFunnels';
import { usePageHeaderContext } from '@/contexts/PageHeaderContext';
import Header, { TableHeader } from './header';

interface PageConfig {
  title: string;
  showViewToggle: boolean;
  timeFilterOptions: Array<{ value: string; label: string }>;
  disableFunnelSettings?: boolean;
}

// Список страниц, которые должны использовать TableHeader
const TABLE_HEADER_PAGES = [
  '/dashboard/clients',
  '/dashboard/deals',
  '/dashboard/messengers',
  '/dashboard/management/ai-assistants',
  '/dashboard/management',
  '/dashboard/integrations',
  '/dashboard/debug',
  '/dashboard/support'
];

// Список страниц, которые НЕ должны показывать шапку (у них своя кастомная шапка)
const NO_HEADER_PAGES = ['/dashboard/overview'];

export default function ConditionalHeader() {
  const pathname = usePathname();
  const { organization } = useOrganization();
  const {
    currentFunnel,
    funnels,
    selectFunnel,
    refreshFunnels,
    setNewFunnelAsSelected
  } = useFunnels(organization?.publicMetadata?.id_backend as string);
  const { config, openAddFunnelModal } = usePageHeaderContext();

  // Состояние для фильтра времени
  const [timeFilter, setTimeFilter] = React.useState('week');

  // Проверяем, нужно ли скрыть шапку для страниц с кастомной шапкой
  const shouldHideHeader = NO_HEADER_PAGES.some((page) =>
    pathname.startsWith(page)
  );

  // Если это страница без шапки - не рендерим ничего
  if (shouldHideHeader) {
    return null;
  }

  // Проверяем, нужно ли использовать TableHeader для текущей страницы
  const shouldUseTableHeader = TABLE_HEADER_PAGES.some((page) =>
    pathname.startsWith(page)
  );

  // Если это обычная страница - возвращаем базовую шапку
  if (!shouldUseTableHeader) {
    return <Header />;
  }

  // Определяем конфигурацию для каждой страницы
  const getPageConfig = (): PageConfig => {
    if (pathname.startsWith('/dashboard/clients')) {
      return {
        title: 'Клиенты',
        showViewToggle: false,
        timeFilterOptions: [
          { value: 'week', label: 'За неделю' },
          { value: 'month', label: 'За месяц' },
          { value: 'year', label: 'За год' }
        ]
      };
    }

    if (pathname.startsWith('/dashboard/deals')) {
      return {
        title: 'Сделки',
        showViewToggle: true,
        timeFilterOptions: [
          { value: 'week', label: 'За неделю' },
          { value: 'month', label: 'За месяц' },
          { value: 'year', label: 'За год' }
        ]
      };
    }

    if (pathname.startsWith('/dashboard/messengers')) {
      return {
        title: 'Диалоги',
        showViewToggle: false,
        timeFilterOptions: [
          { value: 'week', label: 'За неделю' },
          { value: 'month', label: 'За месяц' },
          { value: 'year', label: 'За год' }
        ]
      };
    }

    if (pathname.startsWith('/dashboard/management/ai-assistants')) {
      return {
        title: 'AI-ассистенты',
        showViewToggle: false,
        timeFilterOptions: [
          { value: 'week', label: 'За неделю' },
          { value: 'month', label: 'За месяц' },
          { value: 'year', label: 'За год' }
        ]
      };
    }

    if (pathname === '/dashboard/management') {
      return {
        title: 'Управление',
        showViewToggle: false,
        disableFunnelSettings: true,
        timeFilterOptions: [
          { value: 'week', label: 'За неделю' },
          { value: 'month', label: 'За месяц' },
          { value: 'year', label: 'За год' }
        ]
      };
    }

    if (pathname.startsWith('/dashboard/integrations')) {
      return {
        title: 'Интеграции',
        showViewToggle: false,
        timeFilterOptions: [
          { value: 'week', label: 'За неделю' },
          { value: 'month', label: 'За месяц' },
          { value: 'year', label: 'За год' }
        ]
      };
    }

    if (pathname.startsWith('/dashboard/debug')) {
      return {
        title: 'Дебаг',
        showViewToggle: false,
        timeFilterOptions: []
      };
    }

    if (pathname.startsWith('/dashboard/support')) {
      return {
        title: 'Поддержка',
        showViewToggle: false,
        timeFilterOptions: [
          { value: 'week', label: 'За неделю' },
          { value: 'month', label: 'За месяц' },
          { value: 'year', label: 'За год' }
        ]
      };
    }

    return {
      title: 'Страница',
      showViewToggle: false,
      timeFilterOptions: [
        { value: 'week', label: 'За неделю' },
        { value: 'month', label: 'За месяц' },
        { value: 'year', label: 'За год' }
      ]
    };
  };

  const pageConfig = getPageConfig();

  // Обработчик изменения воронки
  const handleFunnelChange = (funnelId: string) => {
    if (funnelId === 'add-funnel') {
      // Если есть кастомный обработчик из страницы, используем его
      if (config?.onFunnelChange) {
        config.onFunnelChange(funnelId);
      } else {
        // Открываем модальное окно создания воронки
        openAddFunnelModal();
      }
    } else if (funnelId === 'all-funnels') {
      // Обработка выбора "Все воронки" (если нужно)
      console.log('All funnels selected');
    } else {
      const selectedFunnel = funnels?.find((f) => f.id === funnelId);
      if (selectedFunnel) {
        selectFunnel(selectedFunnel);

        // Перезагружаем страницу после смены воронки
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }

      // Также вызываем кастомный обработчик если он есть
      if (config?.onFunnelChange) {
        config.onFunnelChange(funnelId);
      }
    }
  };

  // Формируем список воронок без дублирования
  const funnelsList =
    funnels?.length === 0
      ? []
      : [
          ...(funnels?.map((funnel) => ({
            id: funnel.id,
            name: funnel.display_name || funnel.name || 'Без названия'
          })) || [])
        ];

  // Обработчик изменения фильтра времени
  const handleTimeFilterChange = (period: string) => {
    setTimeFilter(period);
    if (config?.onTimeFilterChange) {
      config.onTimeFilterChange(period);
    } else {
      console.log('Time filter:', period);
    }
  };

  return (
    <TableHeader
      title={config?.title || pageConfig.title}
      funnels={funnelsList}
      selectedFunnel={currentFunnel?.id}
      onFunnelChange={handleFunnelChange}
      onSearch={config?.onSearch || ((query) => console.log('Search:', query))}
      searchValue={config?.searchValue || ''}
      onTimeFilterChange={handleTimeFilterChange}
      timeFilter={timeFilter}
      timeFilterOptions={
        config?.timeFilterOptions || pageConfig.timeFilterOptions
      }
      actions={
        config?.actions || {
          onExport: () => console.log('Export'),
          onFilters: () => console.log('Filters'),
          onView: () => console.log('View'),
          onData: () => console.log('Data')
        }
      }
      viewMode={config?.viewMode || 'list'}
      onViewModeChange={
        config?.onViewModeChange || ((mode) => console.log('View mode:', mode))
      }
      showViewToggle={
        config?.showViewToggle !== undefined
          ? config.showViewToggle
          : pageConfig.showViewToggle
      }
      disableFunnelSettings={
        config?.disableFunnelSettings || pageConfig.disableFunnelSettings
      }
    />
  );
}
