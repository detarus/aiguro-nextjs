'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import { useOrganization } from '@clerk/nextjs';

interface ApiFunnel {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FunnelsContextType {
  funnels: ApiFunnel[];
  currentFunnel: ApiFunnel | null;
  loading: boolean;
  error: string | null;
  selectFunnel: (funnelId: string) => void;
  refreshFunnels: () => Promise<void>;
  setNewFunnelAsSelected: (funnel: ApiFunnel) => void;
}

const FunnelsContext = createContext<FunnelsContextType | undefined>(undefined);

export function FunnelsProvider({ children }: { children: React.ReactNode }) {
  const { organization } = useOrganization();
  const [funnels, setFunnels] = useState<ApiFunnel[]>([]);
  const [currentFunnel, setCurrentFunnel] = useState<ApiFunnel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  const fetchFunnels = useCallback(async () => {
    if (!backendOrgId) {
      setFunnels([]);
      setCurrentFunnel(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/organization/${backendOrgId}/funnels`);
      if (!response.ok) {
        throw new Error('Failed to fetch funnels');
      }
      const data = await response.json();
      setFunnels(data);

      // Сохраняем список воронок в localStorage
      localStorage.setItem('funnels', JSON.stringify(data));

      // Если нет текущей воронки, выбираем первую активную
      if (!currentFunnel && data.length > 0) {
        const activeFunnel = data.find((f: ApiFunnel) => f.is_active);
        if (activeFunnel) {
          const funnelWithStages = {
            ...activeFunnel,
            stages: [
              { name: 'qualification', assistant_code_name: 'qualification' },
              { name: 'presentation', assistant_code_name: 'presentation' },
              { name: 'closing', assistant_code_name: 'closing' }
            ]
          };
          setCurrentFunnel(funnelWithStages);
          localStorage.setItem(
            'currentFunnel',
            JSON.stringify(funnelWithStages)
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch funnels');
      console.error('Error fetching funnels:', err);
    } finally {
      setLoading(false);
    }
  }, [backendOrgId, currentFunnel]);

  const selectFunnel = useCallback(
    (funnelId: string) => {
      console.log('selectFunnel called with ID:', funnelId);
      console.log('Available funnels:', funnels);

      const funnel = funnels.find((f) => f.id === funnelId);
      console.log('Found funnel:', funnel);

      if (funnel) {
        // Добавляем stages для совместимости
        const funnelWithStages = {
          ...funnel,
          stages: [
            { name: 'qualification', assistant_code_name: 'qualification' },
            { name: 'presentation', assistant_code_name: 'presentation' },
            { name: 'closing', assistant_code_name: 'closing' }
          ]
        };
        console.log('Setting currentFunnel with stages:', funnelWithStages);
        setCurrentFunnel(funnelWithStages);
        localStorage.setItem('currentFunnel', JSON.stringify(funnelWithStages));
      } else {
        console.error('Funnel not found with ID:', funnelId);
      }
    },
    [funnels]
  );

  const refreshFunnels = useCallback(async () => {
    await fetchFunnels();
  }, [fetchFunnels]);

  const setNewFunnelAsSelected = useCallback((funnel: ApiFunnel) => {
    // Добавляем stages для совместимости
    const funnelWithStages = {
      ...funnel,
      stages: [
        { name: 'qualification', assistant_code_name: 'qualification' },
        { name: 'presentation', assistant_code_name: 'presentation' },
        { name: 'closing', assistant_code_name: 'closing' }
      ]
    };
    setCurrentFunnel(funnelWithStages);
    localStorage.setItem('currentFunnel', JSON.stringify(funnelWithStages));
    setFunnels((prev) => {
      const exists = prev.find((f) => f.id === funnel.id);
      if (!exists) {
        const newFunnels = [...prev, funnel];
        localStorage.setItem('funnels', JSON.stringify(newFunnels));
        return newFunnels;
      }
      return prev;
    });
  }, []);

  // Загружаем funnels при изменении backendOrgId
  useEffect(() => {
    fetchFunnels();
  }, [fetchFunnels]);

  // Восстанавливаем выбранную воронку из localStorage при загрузке
  useEffect(() => {
    if (funnels.length > 0 && !currentFunnel) {
      const savedCurrentFunnel = localStorage.getItem('currentFunnel');
      if (savedCurrentFunnel) {
        try {
          const parsedFunnel = JSON.parse(savedCurrentFunnel);
          // Проверяем, что воронка все еще существует в списке
          const funnelExists = funnels.find((f) => f.id === parsedFunnel.id);
          if (funnelExists) {
            setCurrentFunnel(parsedFunnel);
          } else {
            // Если сохраненная воронка не найдена, выбираем первую активную
            const activeFunnel = funnels.find((f) => f.is_active);
            if (activeFunnel) {
              const funnelWithStages = {
                ...activeFunnel,
                stages: [
                  {
                    name: 'qualification',
                    assistant_code_name: 'qualification'
                  },
                  { name: 'presentation', assistant_code_name: 'presentation' },
                  { name: 'closing', assistant_code_name: 'closing' }
                ]
              };
              setCurrentFunnel(funnelWithStages);
              localStorage.setItem(
                'currentFunnel',
                JSON.stringify(funnelWithStages)
              );
            }
          }
        } catch (error) {
          console.error('Error parsing saved currentFunnel:', error);
          // Если ошибка парсинга, выбираем первую активную воронку
          const activeFunnel = funnels.find((f) => f.is_active);
          if (activeFunnel) {
            const funnelWithStages = {
              ...activeFunnel,
              stages: [
                { name: 'qualification', assistant_code_name: 'qualification' },
                { name: 'presentation', assistant_code_name: 'presentation' },
                { name: 'closing', assistant_code_name: 'closing' }
              ]
            };
            setCurrentFunnel(funnelWithStages);
            localStorage.setItem(
              'currentFunnel',
              JSON.stringify(funnelWithStages)
            );
          }
        }
      }
    }
  }, [funnels, currentFunnel]);

  const value: FunnelsContextType = {
    funnels,
    currentFunnel,
    loading,
    error,
    selectFunnel,
    refreshFunnels,
    setNewFunnelAsSelected
  };

  return (
    <FunnelsContext.Provider value={value}>{children}</FunnelsContext.Provider>
  );
}

export function useFunnels() {
  const context = useContext(FunnelsContext);
  if (context === undefined) {
    throw new Error('useFunnels must be used within a FunnelsProvider');
  }
  return context;
}
