import { useState, useCallback } from 'react';

export interface PageHeaderConfig {
  title?: string;
  onSearch?: (query: string) => void;
  onTimeFilterChange?: (period: string) => void;
  timeFilterOptions?: Array<{ value: string; label: string }>;
  onFunnelChange?: (funnelId: string) => void;
  actions?: {
    onExport?: () => void;
    onFilters?: () => void;
    onView?: () => void;
    onData?: () => void;
  };
  viewMode?: 'list' | 'kanban';
  onViewModeChange?: (mode: 'list' | 'kanban') => void;
  showViewToggle?: boolean;
}

export function usePageHeader() {
  const [config, setConfig] = useState<PageHeaderConfig | null>(null);

  const updateConfig = useCallback((newConfig: PageHeaderConfig) => {
    setConfig((prevConfig) => {
      // eslint-disable-line @typescript-eslint/no-unused-vars
      // Если передается объект с undefined значениями, это означает очистку
      const hasUndefinedValues = Object.values(newConfig).some(
        (value) => value === undefined
      );
      if (hasUndefinedValues) {
        // Очищаем конфигурацию
        return null;
      }
      // Иначе обновляем конфигурацию
      return newConfig;
    });
  }, []);

  const clearConfig = useCallback(() => {
    setConfig(null);
  }, []);

  return {
    config,
    updateConfig,
    clearConfig
  };
}
