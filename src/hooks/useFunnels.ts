import { useCallback, useEffect, useState } from 'react';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';

export interface Funnel {
  id: string;
  name?: string;
  display_name?: string;
  stages?: Array<{
    name: string;
    assistant_code_name?: string;
    prompt?: string;
    followups?: number[];
  }>;
  // Добавьте другие поля, если они есть в ответе API
}

const FUNNELS_KEY = 'funnels';
const CURRENT_FUNNEL_KEY = 'currentFunnel';

export function useFunnels(orgId: string | null | undefined) {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [currentFunnel, setCurrentFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка из localStorage при инициализации
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedFunnels = localStorage.getItem(FUNNELS_KEY);
    const storedCurrent = localStorage.getItem(CURRENT_FUNNEL_KEY);
    if (storedFunnels) setFunnels(JSON.parse(storedFunnels));
    if (storedCurrent) setCurrentFunnel(JSON.parse(storedCurrent));
  }, []);

  // Функция для получения воронок через новый API endpoint
  const fetchFunnels = useCallback(async (organizationId: string) => {
    const token = getClerkTokenFromClientCookie();
    if (!token) {
      throw new Error('No token available in __session cookie');
    }

    console.log('Fetching funnels for organization:', organizationId);

    const response = await fetch(
      `/api/organization/${organizationId}/funnels`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }, []);

  // Получение воронок при смене orgId
  useEffect(() => {
    if (!orgId) {
      // Очищаем данные при отсутствии организации
      setFunnels([]);
      setCurrentFunnel(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(FUNNELS_KEY);
        localStorage.removeItem(CURRENT_FUNNEL_KEY);
      }
      return;
    }

    setLoading(true);
    setError(null);

    fetchFunnels(orgId)
      .then((data) => {
        setFunnels(data);
        localStorage.setItem(FUNNELS_KEY, JSON.stringify(data));

        // Проверяем, есть ли уже выбранная воронка в localStorage и она валидна
        const storedCurrent = localStorage.getItem(CURRENT_FUNNEL_KEY);
        let funnelToSet = null;

        if (storedCurrent) {
          try {
            const parsed = JSON.parse(storedCurrent);
            if (parsed?.id && data.some((f: any) => f.id === parsed.id)) {
              funnelToSet = data.find((f: any) => f.id === parsed.id);
            }
          } catch {}
        }

        // Если нет валидной сохранённой воронки, устанавливаем первую и сохраняем в localStorage
        if (!funnelToSet && data.length > 0) {
          funnelToSet = data[0];
        }

        if (funnelToSet) {
          setCurrentFunnel(funnelToSet);
          localStorage.setItem(CURRENT_FUNNEL_KEY, JSON.stringify(funnelToSet));
        } else {
          setCurrentFunnel(null);
          localStorage.removeItem(CURRENT_FUNNEL_KEY);
        }
      })
      .catch((e) => {
        console.error('Error fetching funnels:', e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [orgId, fetchFunnels]);

  // Смена текущей воронки
  const selectFunnel = useCallback((funnel: Funnel) => {
    setCurrentFunnel(funnel);
    localStorage.setItem(CURRENT_FUNNEL_KEY, JSON.stringify(funnel));
    console.log('Selected funnel:', funnel);
  }, []);

  // Обновление списка воронок
  const refreshFunnels = useCallback(() => {
    if (!orgId) return;

    setLoading(true);
    setError(null);

    fetchFunnels(orgId)
      .then((data) => {
        setFunnels(data);
        localStorage.setItem(FUNNELS_KEY, JSON.stringify(data));

        // Если текущая воронка больше не существует, выбираем первую доступную
        if (
          currentFunnel &&
          !data.some((f: any) => f.id === currentFunnel.id)
        ) {
          if (data.length > 0) {
            const newFunnel = data[0];
            setCurrentFunnel(newFunnel);
            localStorage.setItem(CURRENT_FUNNEL_KEY, JSON.stringify(newFunnel));
          } else {
            setCurrentFunnel(null);
            localStorage.removeItem(CURRENT_FUNNEL_KEY);
          }
        }
      })
      .catch((e) => {
        console.error('Error refreshing funnels:', e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [orgId, currentFunnel, fetchFunnels]);

  // Функция для установки новосозданной воронки как выбранной
  const setNewFunnelAsSelected = useCallback((newFunnel: Funnel) => {
    // Добавляем новую воронку в список
    setFunnels((prevFunnels) => {
      const updatedFunnels = [...prevFunnels, newFunnel];
      localStorage.setItem(FUNNELS_KEY, JSON.stringify(updatedFunnels));
      return updatedFunnels;
    });

    // Устанавливаем её как выбранную
    setCurrentFunnel(newFunnel);
    localStorage.setItem(CURRENT_FUNNEL_KEY, JSON.stringify(newFunnel));
    console.log('Set new funnel as selected:', newFunnel);
  }, []);

  return {
    funnels,
    currentFunnel,
    selectFunnel,
    refreshFunnels,
    setNewFunnelAsSelected,
    loading,
    error
  };
}
