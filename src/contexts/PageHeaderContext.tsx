'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { usePageHeader } from '@/hooks/usePageHeader';

interface PageHeaderContextType {
  config: PageHeaderConfig | null;
  updateConfig: (config: PageHeaderConfig) => void;
  clearConfig: () => void;
  isAddFunnelModalOpen: boolean;
  openAddFunnelModal: () => void;
  closeAddFunnelModal: () => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(
  undefined
);

// Интерфейс для конфигурации заголовка страницы
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
  // Новые свойства для переключения вида
  viewMode?: 'list' | 'kanban';
  onViewModeChange?: (mode: 'list' | 'kanban') => void;
  showViewToggle?: boolean;
  disableFunnelSettings?: boolean;
}

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const headerState = usePageHeader();
  const [isAddFunnelModalOpen, setIsAddFunnelModalOpen] = useState(false);

  const openAddFunnelModal = () => setIsAddFunnelModalOpen(true);
  const closeAddFunnelModal = () => setIsAddFunnelModalOpen(false);

  return (
    <PageHeaderContext.Provider
      value={{
        ...headerState,
        isAddFunnelModalOpen,
        openAddFunnelModal,
        closeAddFunnelModal
      }}
    >
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeaderContext() {
  const context = useContext(PageHeaderContext);
  if (context === undefined) {
    throw new Error(
      'usePageHeaderContext must be used within a PageHeaderProvider'
    );
  }
  return context;
}
