'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OverviewContextType {
  searchQuery: string;
}

const OverviewContext = createContext<OverviewContextType | undefined>(
  undefined
);

export function OverviewProvider({
  children,
  searchQuery
}: {
  children: ReactNode;
  searchQuery: string;
}) {
  return (
    <OverviewContext.Provider value={{ searchQuery }}>
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
