import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOrganization } from '@clerk/nextjs';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { IconPlus, IconTrash, IconEdit, IconCheck } from '@tabler/icons-react';

interface Stage {
  id: number;
  name: string;
  assistant_code_name: string;
}

interface AddFunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newFunnel?: any) => void;
  newFunnelName: string;
  setNewFunnelName: (v: string) => void;
}

const DEFAULT_FUNNEL_PARAMS = {
  mergeToArray: 0,
  breakSize: 0,
  breakWait: 0,
  contextMemorySize: 0,
  useCompanyKnowledgeBase: true,
  useFunnelKnowledgeBase: true,
  autoPause: 0,
  autoPauseFull: false,
  autoAnswer: 'К сожалению, мы сейчас не можем вам ответить, напишите позже',
  antiSpam: 0,
  acceptFile: false,
  acceptAudio: false,
  workSchedule: false,
  workStart: 0,
  workEnd: 0
};

const AddFunnelModal: React.FC<AddFunnelModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  newFunnelName,
  setNewFunnelName
}) => {
  const [error, setError] = useState<string | null>(null);
  const [funnelNameError, setFunnelNameError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newFunnel, setNewFunnel] = useState<any>(null);
  const [stages, setStages] = useState<Stage[]>([
    { id: 1, name: 'Квалификация', assistant_code_name: 'qualification' },
    { id: 2, name: 'Презентация', assistant_code_name: 'presentation' },
    { id: 3, name: 'Закрытие', assistant_code_name: 'closing' }
  ]);

  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  React.useEffect(() => {
    if (isOpen) {
      setError(null);
      setFunnelNameError(false);
      setSuccess(false);
      setLoading(false);
      // Сброс этапов к значениям по умолчанию при открытии модального окна
      setStages([
        { id: 1, name: 'Квалификация', assistant_code_name: 'qualification' },
        { id: 2, name: 'Презентация', assistant_code_name: 'presentation' },
        { id: 3, name: 'Закрытие', assistant_code_name: 'closing' }
      ]);
    }
  }, [isOpen]);

  const validate = () => {
    let valid = true;
    setError(null);
    setFunnelNameError(false);
    setSuccess(false);
    if (!newFunnelName.trim()) {
      setFunnelNameError(true);
      valid = false;
    }
    if (!valid) {
      setError('Проверьте корректность заполнения полей');
    }
    return valid;
  };

  const handleAddClick = async () => {
    if (!validate()) return;
    const token = getClerkTokenFromClientCookie();
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

    const funnelPayload = {
      display_name: newFunnelName.trim(),
      stages: [], // Всегда отправляем пустой массив
      ...DEFAULT_FUNNEL_PARAMS
    };

    try {
      const res = await fetch(`/api/organization/${backendOrgId}/funnel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(funnelPayload)
      });
      if (!res.ok) {
        let errorMessage = `HTTP ${res.status} ${res.statusText}`;
        try {
          const errorData = await res.json();
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
      if (newFunnel && newFunnel.id) {
        localStorage.setItem('currentFunnel', String(newFunnel.id));
      }
      setNewFunnel(newFunnel);
      setSuccess(true);
      // Убираем onAdd отсюда - он будет вызван в handleDone
    } catch (e: any) {
      setError(e.message || 'Неизвестная ошибка при создании воронки');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setSuccess(false);
    // Вызываем onAdd здесь, чтобы передать новую воронку
    if (newFunnel) {
      onAdd(newFunnel);
    }
    onClose();
  };

  if (!isOpen) return null;

  // Экран успеха
  if (success) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
        <div className='bg-background w-full max-w-md rounded-xl p-8 text-center shadow-2xl'>
          <div className='mb-6 flex justify-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900'>
              <IconCheck className='h-8 w-8 text-green-600 dark:text-green-300' />
            </div>
          </div>
          <h3 className='text-foreground mb-2 text-2xl font-bold'>
            Воронка успешно создана!
          </h3>
          <p className='text-muted-foreground mb-8'>
            Воронка &quot;{newFunnelName}&quot; была успешно добавлена в
            систему.
          </p>
          <Button
            onClick={handleDone}
            className='btn btn-primary bg-primary hover:bg-primary/90 px-8 py-3 text-base text-white'
          >
            Готово
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-background max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl p-8 shadow-2xl'>
        <h3 className='text-foreground mb-2 text-2xl font-bold'>
          Добавить воронку
        </h3>
        <div className='text-muted-foreground mb-6'>
          Укажите название воронки и настройте этапы.
        </div>

        {/* Название воронки */}
        <div className='mb-6'>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Название воронки
          </label>
          <Input
            value={newFunnelName}
            onChange={(e) => setNewFunnelName(e.target.value)}
            placeholder='Название воронки'
            className={`text-foreground bg-background h-12 text-lg ${funnelNameError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            disabled={loading}
          />
        </div>

        {/* Управление этапами */}
        <div className='mb-6'>
          <div className='mb-4 flex items-center justify-between'>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Этапы воронки (только для просмотра)
            </label>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled
              className='flex cursor-not-allowed items-center gap-2 opacity-50'
            >
              <IconPlus className='h-4 w-4' />
              Добавить этап
            </Button>
          </div>

          <div className='space-y-3'>
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className='flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800'
              >
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-300'>
                  {index + 1}
                </div>

                <div className='flex-1'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                      {stage.name}
                    </span>
                    <div className='flex items-center gap-1'>
                      <Button
                        size='sm'
                        variant='ghost'
                        disabled
                        className='h-8 w-8 cursor-not-allowed p-0 opacity-50'
                      >
                        <IconEdit className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        disabled
                        className='h-8 w-8 cursor-not-allowed p-0 text-red-600 opacity-50 hover:text-red-700'
                      >
                        <IconTrash className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className='mt-4 rounded bg-red-100 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка:</strong>
            <ErrorDetails error={error} />
          </div>
        )}

        <div className='mt-8 flex gap-2'>
          <Button
            onClick={handleAddClick}
            className='btn btn-primary bg-primary hover:bg-primary/90 px-6 py-2 text-base text-white'
            disabled={loading}
          >
            {loading ? (
              <div className='flex items-center gap-2'>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                Создание...
              </div>
            ) : (
              'Добавить'
            )}
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

function ErrorDetails({ error }: { error: any }) {
  if (!error) return null;
  let parsed: any = error;
  if (typeof error === 'string') {
    try {
      parsed = JSON.parse(error);
    } catch {
      return <div>{error}</div>;
    }
  }
  if (typeof parsed === 'object' && parsed !== null) {
    return (
      <pre className='text-xs whitespace-pre-wrap'>
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  }
  return <div>{String(error)}</div>;
}

export default AddFunnelModal;
