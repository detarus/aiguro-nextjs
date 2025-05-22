import { useCallback, useEffect, useState } from 'react';

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

  // Получение воронок при смене orgId
  useEffect(() => {
    if (!orgId) return;
    // Очищаем старые воронки при смене компании

    // if (typeof window !== 'undefined') {
    //   localStorage.removeItem(FUNNELS_KEY);
    //   localStorage.removeItem(CURRENT_FUNNEL_KEY);
    // }
    // setFunnels([]);
    // setCurrentFunnel(null);
    setLoading(true);
    setError(null);
    fetch(`/api/funnels?orgId=${orgId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Ошибка загрузки воронок');
        return res.json();
      })
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
          setCurrentFunnel(funnelToSet);
          localStorage.setItem(CURRENT_FUNNEL_KEY, JSON.stringify(funnelToSet));
        } else if (funnelToSet) {
          setCurrentFunnel(funnelToSet);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orgId]);

  // Смена текущей воронки
  const selectFunnel = useCallback((funnel: Funnel) => {
    setCurrentFunnel(funnel);
    localStorage.setItem(CURRENT_FUNNEL_KEY, JSON.stringify(funnel));
  }, []);

  return { funnels, currentFunnel, selectFunnel, loading, error };
}
