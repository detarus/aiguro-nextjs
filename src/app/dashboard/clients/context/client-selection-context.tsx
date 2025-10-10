'use client';

import { createContext, useState, ReactNode } from 'react';

interface ClientSelectionContextType {
  selectedClients: Set<number>;
  setSelectedClients: (clients: Set<number>) => void;
  toggleClientSelection: (id: number) => void;
  clearSelection: () => void;
}

export const ClientSelectionContext = createContext<ClientSelectionContextType>(
  {
    selectedClients: new Set(),
    setSelectedClients: () => {},
    toggleClientSelection: () => {},
    clearSelection: () => {}
  }
);

interface ClientSelectionProviderProps {
  children: ReactNode;
}

export function ClientSelectionProvider({
  children
}: ClientSelectionProviderProps) {
  const [selectedClients, setSelectedClients] = useState<Set<number>>(
    new Set()
  );

  const toggleClientSelection = (id: number) => {
    setSelectedClients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedClients(new Set());
  };

  return (
    <ClientSelectionContext.Provider
      value={{
        selectedClients,
        setSelectedClients,
        toggleClientSelection,
        clearSelection
      }}
    >
      {children}
    </ClientSelectionContext.Provider>
  );
}
