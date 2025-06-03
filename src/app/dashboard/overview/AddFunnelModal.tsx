import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrganization } from '@clerk/nextjs';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';

interface AddFunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newFunnel?: any) => void;
  newFunnelName: string;
  setNewFunnelName: (v: string) => void;
  stages: any[];
  setStages: (v: any) => void;
  showFollowup: Record<number, boolean>;
  setShowFollowup: (v: any) => void;
  handleStageChange: (id: number, field: string, value: string) => void;
  handleAddStage: () => void;
  handleRemoveStage: (id: number) => void;
  handleAddFollowup: (id: number) => void;
  handleRemoveFollowup: (id: number, idx: number) => void;
  handleFollowupChange: (id: number, idx: number, value: number) => void;
}

const AddFunnelModal: React.FC<AddFunnelModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  newFunnelName,
  setNewFunnelName,
  stages,
  setStages,
  showFollowup,
  setShowFollowup,
  handleStageChange,
  handleAddStage,
  handleRemoveStage,
  handleAddFollowup,
  handleRemoveFollowup,
  handleFollowupChange
}) => {
  const [error, setError] = useState<string | null>(null);
  const [stageErrors, setStageErrors] = useState<
    Record<number, { name?: boolean; followups?: boolean }>
  >({});
  const [funnelNameError, setFunnelNameError] = useState(false);
  const [success, setSuccess] = useState(false);
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(false);

  // Получаем backend ID организации из метаданных Clerk
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  React.useEffect(() => {
    if (isOpen) {
      const openMap: Record<number, boolean> = {};
      stages.forEach((stage: any) => {
        openMap[stage.id] = true;
      });
      setShowFollowup(openMap);
      setError(null);
      setStageErrors({});
      setFunnelNameError(false);
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen, stages, setShowFollowup]);

  const validate = () => {
    let valid = true;
    const newStageErrors: Record<
      number,
      { name?: boolean; followups?: boolean }
    > = {};
    setError(null);
    setFunnelNameError(false);
    setSuccess(false);

    if (!newFunnelName.trim()) {
      setFunnelNameError(true);
      valid = false;
    }

    stages.forEach((stage) => {
      let stageErr: { name?: boolean; followups?: boolean } = {};
      if (!stage.name || !stage.name.trim()) {
        stageErr.name = true;
        valid = false;
      }
      // Проверка на совпадающие интервалы
      const followups = stage.followups.map((f: number) => Number(f));
      const hasDuplicates = followups.length !== new Set(followups).size;
      if (hasDuplicates) {
        stageErr.followups = true;
        valid = false;
      }
      if (stageErr.name || stageErr.followups) {
        newStageErrors[stage.id] = stageErr;
      }
    });
    setStageErrors(newStageErrors);
    if (!valid) {
      setError('Проверьте корректность заполнения полей');
    }
    return valid;
  };

  const handleAddClick = async () => {
    if (!validate()) return;

    // Получаем токен из Clerk cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Clerk token available:', !!token);
    console.log('Backend organization ID:', backendOrgId);

    if (!backendOrgId) {
      setError(
        'Не выбрана организация или отсутствует backend ID в метаданных'
      );
      return;
    }

    if (!token) {
      setError('Отсутствует токен аутентификации');
      return;
    }

    setLoading(true);
    // Формируем тело запроса согласно требуемой структуре API
    const funnelPayload = {
      display_name: newFunnelName.trim(),
      stages: stages.map((stage) => ({
        name: stage.name.trim(),
        assistant_code_name: stage.name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_'),
        followups: stage.followups.map((delay: number) => ({
          delay_minutes: Number(delay),
          assistant_code_name: 'follow_up'
        }))
      }))
    };

    console.log(
      'Creating funnel with payload:',
      JSON.stringify(funnelPayload, null, 2)
    );
    console.log('Using organization ID:', backendOrgId);

    try {
      const res = await fetch(`/api/organization/${backendOrgId}/funnel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(funnelPayload)
      });

      console.log('API response status:', res.status);
      console.log(
        'API response headers:',
        Object.fromEntries(res.headers.entries())
      );

      if (!res.ok) {
        let errorMessage = `HTTP ${res.status} ${res.statusText}`;

        try {
          const errorData = await res.json();
          console.error('API error response:', errorData);

          // Извлекаем детальное сообщение об ошибке
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else {
            errorMessage = `${errorMessage}\nОтвет сервера: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          // Если не удается распарсить JSON, пытаемся получить текст
          try {
            const errorText = await res.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nОтвет сервера: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nНе удалось прочитать ответ сервера`;
          }
        }

        throw new Error(errorMessage);
      }

      const newFunnel = await res.json();
      console.log('Successfully created funnel:', newFunnel);

      if (newFunnel && newFunnel.id) {
        localStorage.setItem('currentFunnel', String(newFunnel.id));
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onAdd(newFunnel);
      }, 1000);
    } catch (e: any) {
      console.error('Error creating funnel:', e);
      // Показываем конкретную ошибку вместо общего сообщения
      setError(e.message || 'Неизвестная ошибка при создании воронки');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-background w-full max-w-2xl rounded-xl p-8 shadow-2xl'>
        <h3 className='text-foreground mb-2 text-2xl font-bold'>
          Добавить воронку
        </h3>
        <div className='text-muted-foreground mb-6'>
          Укажите название воронки и добавьте этапы. Для каждого этапа заполните
          название и интервалы follow-up (до 3, в минутах).
        </div>

        {/* Информация о текущей организации - СКРЫТО */}
        {/* 
        <div className='mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-700 dark:bg-blue-900/20'>
          <h4 className='mb-2 font-medium text-blue-800 dark:text-blue-200'>
            Информация об организации:
          </h4>
          <div className='space-y-1 text-blue-700 dark:text-blue-300'>
            <p><strong>Название:</strong> {organization?.name || 'Не указано'}</p>
            <p><strong>Clerk ID:</strong> {organization?.id || 'Не указан'}</p>
            <p><strong>Backend ID:</strong> {backendOrgId || 'Отсутствует в метаданных'}</p>
            <p><strong>Токен доступен:</strong> {getClerkTokenFromClientCookie() ? 'Да' : 'Нет'}</p>
          </div>
        </div>
        */}

        <Input
          value={newFunnelName}
          onChange={(e) => setNewFunnelName(e.target.value)}
          placeholder='Название воронки'
          className={`text-foreground bg-background mb-6 h-12 text-lg ${funnelNameError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        <div className='flex max-h-[50vh] flex-row flex-nowrap gap-6 overflow-x-auto pb-2'>
          <AnimatePresence initial={false}>
            {stages.map((stage: any, idx: number) => {
              const isAccordionOpen = !!showFollowup[stage.id];
              const stageErr = stageErrors[stage.id] || {};
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className={`bg-background relative flex max-w-[340px] min-w-[340px] flex-col gap-4 rounded-xl border border-gray-200 p-6 shadow dark:border-gray-700 ${isAccordionOpen ? 'max-h-[320px] overflow-y-auto' : ''}`}
                >
                  <div className='mb-2 flex items-center justify-between'>
                    <span className='text-foreground text-lg font-semibold'>
                      Этап {idx + 1}
                    </span>
                    <div className='flex gap-1'>
                      {stages.length > 1 && (
                        <Button
                          size='icon'
                          variant='ghost'
                          onClick={() => handleRemoveStage(stage.id)}
                          title='Удалить этап'
                          className='text-xl'
                        >
                          ×
                        </Button>
                      )}
                      <Button
                        size='icon'
                        variant='outline'
                        onClick={() => {
                          const newStage = {
                            id: Date.now() + Math.random(),
                            name: '',
                            followups: [60]
                          };
                          const idxInArr = stages.findIndex(
                            (s: any) => s.id === stage.id
                          );
                          setStages((prev: any) => [
                            ...prev.slice(0, idxInArr + 1),
                            newStage,
                            ...prev.slice(idxInArr + 1)
                          ]);
                        }}
                        title='Добавить этап'
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <label className='text-foreground text-sm font-medium'>
                      Название этапа
                    </label>
                    <Input
                      value={stage.name}
                      onChange={(e) =>
                        handleStageChange(stage.id, 'name', e.target.value)
                      }
                      placeholder='Название этапа'
                      className={`text-foreground bg-background h-10 text-base ${stageErr.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                  </div>
                  {/* Аккордеон для follow-up */}
                  <div>
                    <div
                      className='text-primary mb-2 flex cursor-pointer items-center gap-1 text-xs font-medium select-none'
                      onClick={() =>
                        setShowFollowup((s: any) => ({
                          ...s,
                          [stage.id]: !s[stage.id]
                        }))
                      }
                    >
                      <span>
                        {isAccordionOpen
                          ? 'Скрыть Follow-up (в мин)'
                          : 'Настроить Follow-up (в мин)'}
                      </span>
                      <span
                        className={`transition-transform ${isAccordionOpen ? 'rotate-90' : ''}`}
                      >
                        ▶
                      </span>
                    </div>
                    {isAccordionOpen && (
                      <div>
                        <div className='flex flex-wrap items-center gap-2'>
                          <div
                            className={`bg-muted flex flex-row flex-wrap gap-0 rounded border px-1 py-1 ${stageErr.followups ? 'border-red-500' : ''}`}
                          >
                            {stage.followups
                              .slice(0, 3)
                              .map((f: any, j: number) => (
                                <div key={j} className='flex items-center'>
                                  <Input
                                    type='number'
                                    min={1}
                                    max={300}
                                    value={f}
                                    onChange={(e) =>
                                      handleFollowupChange(
                                        stage.id,
                                        j,
                                        Math.max(
                                          1,
                                          Math.min(300, Number(e.target.value))
                                        )
                                      )
                                    }
                                    className={`text-foreground bg-background h-8 w-14 rounded-none border-none text-sm focus:ring-0`}
                                  />
                                  {stage.followups.length > 1 && (
                                    <Button
                                      size='icon'
                                      variant='ghost'
                                      onClick={() =>
                                        handleRemoveFollowup(stage.id, j)
                                      }
                                      title='Удалить интервал'
                                      className='rounded-none border-l px-0 text-base'
                                    >
                                      -
                                    </Button>
                                  )}
                                </div>
                              ))}
                          </div>
                          {stage.followups.length < 3 && (
                            <Button
                              size='icon'
                              variant='outline'
                              onClick={() => handleAddFollowup(stage.id)}
                              title='Добавить интервал'
                              className='px-1 text-base'
                            >
                              +
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {error && (
          <div className='mt-4 rounded bg-red-100 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка:</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>{error}</pre>
          </div>
        )}
        {success && (
          <div className='mt-4 rounded bg-green-100 p-3 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех:</strong> Воронка успешно создана!
          </div>
        )}
        <div className='mt-8 flex gap-2'>
          <Button
            onClick={handleAddClick}
            className='btn btn-primary bg-primary hover:bg-primary/90 px-6 py-2 text-base text-white'
            disabled={loading}
          >
            Добавить
          </Button>
          <Button
            onClick={onClose}
            className='btn btn-secondary border-input bg-background text-foreground hover:bg-muted border px-6 py-2 text-base'
            variant='outline'
            disabled={loading}
          >
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddFunnelModal;
