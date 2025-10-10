'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface StageStats {
  name: string;
  count: number;
  assistant_code_name?: string;
}

interface OverviewContextType {
  searchQuery: string;
  stageStats: StageStats[];
  totalDialogs: number;
  dialogsData: any[];
  loading: boolean;
}

const OverviewContext = createContext<OverviewContextType | undefined>(
  undefined
);

export function OverviewProvider({
  children,
  searchQuery,
  stageStats = [],
  totalDialogs = 0,
  dialogsData = [],
  loading = false
}: {
  children: ReactNode;
  searchQuery: string;
  stageStats?: StageStats[];
  totalDialogs?: number;
  dialogsData?: any[];
  loading?: boolean;
}) {
  return (
    <OverviewContext.Provider
      value={{
        searchQuery,
        stageStats,
        totalDialogs,
        dialogsData,
        loading
      }}
    >
      {children}
    </OverviewContext.Provider>
  );
}

export function useOverviewContext() {
  const context = useContext(OverviewContext);
  if (context === undefined) {
    throw new Error(
      'useOverviewContext must be used within an OverviewProvider'
    );
  }
  return context;
}
