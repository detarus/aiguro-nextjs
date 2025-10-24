'use client';

import { useFunnels } from '@/contexts/FunnelsContext';
import { useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, List, Trash2, Plus, Edit } from 'lucide-react';
import { CreateFunnelModal } from '@/components/modal/create-funnel-modal';

export function FunnelDebug() {
  const { organization } = useOrganization();
  const { funnels, currentFunnel, refreshFunnels } = useFunnels();

  // Состояние для модального окна создания воронки
  const [isCreateFunnelModalOpen, setIsCreateFunnelModalOpen] = useState(false);

  // Состояние для отображения localStorage значений
  const [localStorageFunnel, setLocalStorageFunnel] = useState<any>(null);
  const [localStorageFunnels, setLocalStorageFunnels] = useState<any[]>([]);

  // Состояние для кнопки "Get All Funnels"
  const [allFunnelsData, setAllFunnelsData] = useState<any>(null);
  const [allFunnelsLoading, setAllFunnelsLoading] = useState(false);
  const [allFunnelsError, setAllFunnelsError] = useState<string | null>(null);
  const [allFunnelsSuccessMessage, setAllFunnelsSuccessMessage] = useState<
    string | null
  >(null);

  // Состояние для кнопки "Get Current Funnel"
  const [currentFunnelData, setCurrentFunnelData] = useState<any>(null);
  const [currentFunnelLoading, setCurrentFunnelLoading] = useState(false);
  const [currentFunnelError, setCurrentFunnelError] = useState<string | null>(
    null
  );
  const [currentFunnelSuccessMessage, setCurrentFunnelSuccessMessage] =
    useState<string | null>(null);

  // Состояние для кнопки "Delete Current Funnel"
  const [deleteFunnelData, setDeleteFunnelData] = useState<any>(null);
  const [deleteFunnelLoading, setDeleteFunnelLoading] = useState(false);
  const [deleteFunnelError, setDeleteFunnelError] = useState<string | null>(
    null
  );
  const [deleteFunnelSuccessMessage, setDeleteFunnelSuccessMessage] = useState<
    string | null
  >(null);

  // Состояние для кнопки "Update Current Funnel"
  const [updateFunnelData, setUpdateFunnelData] = useState<any>(null);
  const [updateFunnelLoading, setUpdateFunnelLoading] = useState(false);
  const [updateFunnelError, setUpdateFunnelError] = useState<string | null>(
    null
  );
  const [updateFunnelSuccessMessage, setUpdateFunnelSuccessMessage] = useState<
    string | null
  >(null);

  // Состояние для модального окна обновления воронки
  const [isUpdateFunnelModalOpen, setIsUpdateFunnelModalOpen] = useState(false);

  // Состояние для формы обновления воронки
  const [updateFormData, setUpdateFormData] = useState({
    display_name: '',
    mergeToArray: 0,
    breakSize: 0,
    breakWait: 0,
    contextMemorySize: 10,
    useCompanyKnowledgeBase: true,
    useFunnelKnowledgeBase: true,
    autoPause: 0,
    autoPauseFull: false,
    autoAnswer: '',
    antiSpam: 0,
    acceptFile: false,
    acceptAudio: false,
    workSchedule: false,
    workStart: 9,
    workEnd: 18,
    role_instruction: ''
  });

  // Получаем backend ID организации из метаданных Clerk
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  // Функция для обновления localStorage значений
  const updateLocalStorageData = () => {
    if (typeof window !== 'undefined') {
      // Используем currentFunnel из контекста, если он есть, иначе из localStorage
      if (currentFunnel) {
        setLocalStorageFunnel(currentFunnel);
      } else {
        const storedFunnel = localStorage.getItem('currentFunnel');
        if (storedFunnel) {
          try {
            setLocalStorageFunnel(JSON.parse(storedFunnel));
          } catch {
            setLocalStorageFunnel(null);
          }
        } else {
          setLocalStorageFunnel(null);
        }
      }

      // Обновляем список воронок
      const storedFunnels = localStorage.getItem('funnels');
      if (storedFunnels) {
        try {
          setLocalStorageFunnels(JSON.parse(storedFunnels));
        } catch {
          setLocalStorageFunnels([]);
        }
      } else {
        setLocalStorageFunnels([]);
      }
    }
  };

  // Функция для обновления localStorage с новыми данными воронки
  const updateLocalStorageWithNewFunnelData = (newFunnelData: any) => {
    if (typeof window !== 'undefined' && newFunnelData) {
      // Обновляем текущую воронку в localStorage
      localStorage.setItem('currentFunnel', JSON.stringify(newFunnelData));
      setLocalStorageFunnel(newFunnelData);

      // Обновляем воронку в списке воронок
      const storedFunnels = localStorage.getItem('funnels');
      if (storedFunnels) {
        try {
          const funnels = JSON.parse(storedFunnels);
          const updatedFunnels = funnels.map((funnel: any) =>
            funnel.id === newFunnelData.id ? newFunnelData : funnel
          );
          localStorage.setItem('funnels', JSON.stringify(updatedFunnels));
          setLocalStorageFunnels(updatedFunnels);
        } catch {
          console.error('Error updating funnels in localStorage');
        }
      }
    }
  };

  // Отслеживаем изменения funnels и currentFunnel из хука (для синхронизации)
  useEffect(() => {
    console.log('FunnelDebug: funnels from hook changed:', funnels);
    console.log('FunnelDebug: currentFunnel from hook changed:', currentFunnel);
    updateLocalStorageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnels, currentFunnel]);

  // Обновляем localStorage значения при монтировании компонента
  useEffect(() => {
    updateLocalStorageData();

    // Добавляем слушатель для изменений localStorage
    const handleStorageChange = () => {
      updateLocalStorageData();
    };

    window.addEventListener('storage', handleStorageChange);

    // Также проверяем localStorage каждые 500ms для отслеживания изменений в том же окне
    const interval = setInterval(updateLocalStorageData, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Очищаем данные при смене организации
  useEffect(() => {
    setAllFunnelsData(null);
    setAllFunnelsError(null);
    setAllFunnelsSuccessMessage(null);
    setCurrentFunnelData(null);
    setCurrentFunnelError(null);
    setCurrentFunnelSuccessMessage(null);
    setDeleteFunnelData(null);
    setDeleteFunnelError(null);
    setDeleteFunnelSuccessMessage(null);
    setUpdateFunnelData(null);
    setUpdateFunnelError(null);
    setUpdateFunnelSuccessMessage(null);
  }, [backendOrgId]);

  // Очищаем данные текущей воронки при её смене
  useEffect(() => {
    setCurrentFunnelData(null);
    setCurrentFunnelError(null);
    setCurrentFunnelSuccessMessage(null);
    setDeleteFunnelData(null);
    setDeleteFunnelError(null);
    setDeleteFunnelSuccessMessage(null);
    setUpdateFunnelData(null);
    setUpdateFunnelError(null);
    setUpdateFunnelSuccessMessage(null);
  }, [localStorageFunnel?.id]);

  // Обновляем форму при изменении currentFunnelData
  useEffect(() => {
    if (currentFunnelData && isUpdateFunnelModalOpen) {
      setUpdateFormData({
        display_name: currentFunnelData.display_name || '',
        mergeToArray: currentFunnelData.mergeToArray || 0,
        breakSize: currentFunnelData.breakSize || 0,
        breakWait: currentFunnelData.breakWait || 0,
        contextMemorySize: currentFunnelData.contextMemorySize || 10,
        useCompanyKnowledgeBase:
          currentFunnelData.useCompanyKnowledgeBase || true,
        useFunnelKnowledgeBase:
          currentFunnelData.useFunnelKnowledgeBase || true,
        autoPause: currentFunnelData.autoPause || 0,
        autoPauseFull: currentFunnelData.autoPauseFull || false,
        autoAnswer: currentFunnelData.autoAnswer || '',
        antiSpam: currentFunnelData.antiSpam || 0,
        acceptFile: currentFunnelData.acceptFile || false,
        acceptAudio: currentFunnelData.acceptAudio || false,
        workSchedule: currentFunnelData.workSchedule || false,
        workStart: currentFunnelData.workStart || 9,
        workEnd: currentFunnelData.workEnd || 18,
        role_instruction: currentFunnelData.role_instruction || ''
      });
    }
  }, [currentFunnelData, isUpdateFunnelModalOpen]);

  // Обработчик успешного создания воронки
  const handleFunnelCreated = () => {
    // Обновляем данные localStorage
    updateLocalStorageData();
    // Можно также обновить список воронок из контекста
    console.log('Funnel created successfully, updating data...');
  };

  const handleFetchAllFunnels = async () => {
    console.log('Get All Funnels button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setAllFunnelsError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setAllFunnelsError('No backend organization ID found in metadata');
      return;
    }

    setAllFunnelsLoading(true);
    setAllFunnelsError(null);
    setAllFunnelsSuccessMessage(null);

    try {
      console.log(
        'Making request to /api/organization/' + backendOrgId + '/funnels'
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnels`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully fetched all funnels:', data);
      setAllFunnelsData(data);
      setAllFunnelsSuccessMessage(
        'Запрос успешно отправлен и данные получены!'
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setAllFunnelsSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error fetching all funnels:', error);
      setAllFunnelsError(error.message || 'Unknown error occurred');
    } finally {
      setAllFunnelsLoading(false);
    }
  };

  const handleFetchCurrentFunnel = async () => {
    console.log('Get Current Funnel button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setCurrentFunnelError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setCurrentFunnelError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setCurrentFunnelError('No current funnel selected');
      return;
    }

    setCurrentFunnelLoading(true);
    setCurrentFunnelError(null);
    setCurrentFunnelSuccessMessage(null);

    try {
      console.log(
        'Making request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully fetched current funnel:', data);
      setCurrentFunnelData(data);
      setCurrentFunnelSuccessMessage(
        'Запрос успешно отправлен и данные получены!'
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setCurrentFunnelSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error fetching current funnel:', error);
      setCurrentFunnelError(error.message || 'Unknown error occurred');
    } finally {
      setCurrentFunnelLoading(false);
    }
  };

  const handleDeleteCurrentFunnel = async () => {
    console.log('Delete Current Funnel button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setDeleteFunnelError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setDeleteFunnelError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setDeleteFunnelError('No current funnel selected');
      return;
    }

    // Подтверждение удаления
    const confirmDelete = window.confirm(
      `Вы уверены, что хотите удалить воронку "${localStorageFunnel?.display_name || localStorageFunnel?.name}" с ID: ${localStorageFunnel.id}?\n\nЭто действие необратимо!`
    );

    if (!confirmDelete) {
      console.log('Delete operation cancelled by user');
      return;
    }

    setDeleteFunnelLoading(true);
    setDeleteFunnelError(null);
    setDeleteFunnelSuccessMessage(null);

    try {
      console.log(
        'Making DELETE request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully deleted current funnel:', data);
      setDeleteFunnelData(data);
      setDeleteFunnelSuccessMessage(
        'Запрос успешно отправлен и воронка удалена!'
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setDeleteFunnelSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting current funnel:', error);
      setDeleteFunnelError(error.message || 'Unknown error occurred');
    } finally {
      setDeleteFunnelLoading(false);
    }
  };

  // Обработчики для обновления воронки
  const handleOpenUpdateFunnelModal = async () => {
    // Сначала загружаем данные текущей воронки, если они не загружены
    if (
      !currentFunnelData &&
      localStorageFunnel?.id &&
      localStorageFunnel.id !== '0'
    ) {
      console.log('Loading current funnel data before opening update modal...');

      // Получаем токен из cookie
      const token = getClerkTokenFromClientCookie();
      if (!token) {
        setUpdateFunnelError('No token available in __session cookie');
        return;
      }

      if (!backendOrgId) {
        setUpdateFunnelError('No backend organization ID found in metadata');
        return;
      }

      setCurrentFunnelLoading(true);
      setCurrentFunnelError(null);
      setCurrentFunnelSuccessMessage(null);

      try {
        console.log(
          'Making request to /api/organization/' +
            backendOrgId +
            '/funnel/' +
            localStorageFunnel.id
        );

        const response = await fetch(
          `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log('Response status:', response.status);

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status} ${response.statusText}`;

          try {
            const errorData = await response.json();
            console.error('API error response:', errorData);

            if (errorData.error) {
              errorMessage = errorData.error;
            } else {
              errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
            }
          } catch (parseError) {
            try {
              const errorText = await response.text();
              if (errorText) {
                errorMessage = `${errorMessage}\nServer response: ${errorText}`;
              }
            } catch (textError) {
              errorMessage = `${errorMessage}\nUnable to read server response`;
            }
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Successfully fetched current funnel for update:', data);
        setCurrentFunnelData(data);

        // Теперь заполняем форму данными
        setUpdateFormData({
          display_name: data.display_name || '',
          mergeToArray: data.mergeToArray || 0,
          breakSize: data.breakSize || 0,
          breakWait: data.breakWait || 0,
          contextMemorySize: data.contextMemorySize || 10,
          useCompanyKnowledgeBase: data.useCompanyKnowledgeBase || true,
          useFunnelKnowledgeBase: data.useFunnelKnowledgeBase || true,
          autoPause: data.autoPause || 0,
          autoPauseFull: data.autoPauseFull || false,
          autoAnswer: data.autoAnswer || '',
          antiSpam: data.antiSpam || 0,
          acceptFile: data.acceptFile || false,
          acceptAudio: data.acceptAudio || false,
          workSchedule: data.workSchedule || false,
          workStart: data.workStart || 9,
          workEnd: data.workEnd || 18,
          role_instruction: data.role_instruction || ''
        });

        setIsUpdateFunnelModalOpen(true);
        setUpdateFunnelError(null);
        setUpdateFunnelSuccessMessage(null);
      } catch (error: any) {
        console.error('Error fetching current funnel for update:', error);
        setUpdateFunnelError(error.message || 'Failed to load funnel data');
      } finally {
        setCurrentFunnelLoading(false);
      }
    } else {
      // Данные уже загружены, заполняем форму
      if (currentFunnelData) {
        setUpdateFormData({
          display_name: currentFunnelData.display_name || '',
          mergeToArray: currentFunnelData.mergeToArray || 0,
          breakSize: currentFunnelData.breakSize || 0,
          breakWait: currentFunnelData.breakWait || 0,
          contextMemorySize: currentFunnelData.contextMemorySize || 10,
          useCompanyKnowledgeBase:
            currentFunnelData.useCompanyKnowledgeBase || true,
          useFunnelKnowledgeBase:
            currentFunnelData.useFunnelKnowledgeBase || true,
          autoPause: currentFunnelData.autoPause || 0,
          autoPauseFull: currentFunnelData.autoPauseFull || false,
          autoAnswer: currentFunnelData.autoAnswer || '',
          antiSpam: currentFunnelData.antiSpam || 0,
          acceptFile: currentFunnelData.acceptFile || false,
          acceptAudio: currentFunnelData.acceptAudio || false,
          workSchedule: currentFunnelData.workSchedule || false,
          workStart: currentFunnelData.workStart || 9,
          workEnd: currentFunnelData.workEnd || 18,
          role_instruction: currentFunnelData.role_instruction || ''
        });
      } else {
        // Используем значения по умолчанию
        setUpdateFormData({
          display_name:
            localStorageFunnel?.display_name || localStorageFunnel?.name || '',
          mergeToArray: 0,
          breakSize: 0,
          breakWait: 0,
          contextMemorySize: 10,
          useCompanyKnowledgeBase: true,
          useFunnelKnowledgeBase: true,
          autoPause: 0,
          autoPauseFull: false,
          autoAnswer:
            'К сожалению, мы сейчас не можем вам ответить, напишите позже',
          antiSpam: 0,
          acceptFile: false,
          acceptAudio: false,
          workSchedule: false,
          workStart: 9,
          workEnd: 18,
          role_instruction:
            'Ты - продавец интернет-магазина. Помогаешь клиентам выбрать товары и оформлять заказы.'
        });
      }

      setIsUpdateFunnelModalOpen(true);
      setUpdateFunnelError(null);
      setUpdateFunnelSuccessMessage(null);
    }
  };

  const handleCloseUpdateFunnelModal = () => {
    setIsUpdateFunnelModalOpen(false);
    setUpdateFunnelError(null);
    setUpdateFunnelSuccessMessage(null);
  };

  const handleUpdateFunnel = async () => {
    console.log('Update Current Funnel button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setUpdateFunnelError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setUpdateFunnelError('No backend organization ID found in metadata');
      return;
    }

    if (!localStorageFunnel?.id) {
      setUpdateFunnelError('No current funnel selected');
      return;
    }

    setUpdateFunnelLoading(true);
    setUpdateFunnelError(null);
    setUpdateFunnelSuccessMessage(null);

    try {
      console.log(
        'Making PUT request to /api/organization/' +
          backendOrgId +
          '/funnel/' +
          localStorageFunnel.id
      );

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${localStorageFunnel.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updateFormData)
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}\nServer response: ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}\nServer response: ${errorText}`;
            }
          } catch (textError) {
            errorMessage = `${errorMessage}\nUnable to read server response`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Successfully updated current funnel:', data);
      setUpdateFunnelData(data);

      // Обновляем данные текущей воронки
      setCurrentFunnelData(data);

      // Обновляем localStorage с новыми данными воронки
      updateLocalStorageWithNewFunnelData(data);

      // Обновляем контекст воронок
      await refreshFunnels();

      setUpdateFunnelSuccessMessage(
        'Запрос успешно отправлен и воронка обновлена!'
      );

      // Закрываем модальное окно
      setIsUpdateFunnelModalOpen(false);

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setUpdateFunnelSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error updating current funnel:', error);
      setUpdateFunnelError(error.message || 'Unknown error occurred');
    } finally {
      setUpdateFunnelLoading(false);
    }
  };

  return (
    <div className='rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/20'>
      <h3 className='mb-2 font-semibold text-orange-800 dark:text-orange-200'>
        Funnel API Debug Info
      </h3>
      <div className='space-y-2 text-sm'>
        <p>
          <strong>Local Funnels Count:</strong>{' '}
          {localStorageFunnels?.length || 0}
        </p>
        <p>
          <strong>Current Funnel:</strong>{' '}
          {localStorageFunnel?.display_name ||
            localStorageFunnel?.name ||
            'None'}
        </p>
        <p>
          <strong>Current Funnel ID:</strong> {localStorageFunnel?.id || 'None'}
        </p>
        <p>
          <strong>Backend Org ID:</strong> {backendOrgId || 'None'}
        </p>
        <p>
          <strong>Has Token:</strong>{' '}
          {getClerkTokenFromClientCookie() ? 'Yes' : 'No'}
        </p>

        {/* Кнопки для API запросов */}
        <div className='mt-4 space-y-2'>
          <Button
            onClick={() => setIsCreateFunnelModalOpen(true)}
            disabled={!backendOrgId}
            variant='outline'
            size='sm'
            className='w-full justify-start text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-300'
          >
            <Plus className='mr-2 h-4 w-4' />
            Create Funnel
          </Button>

          <Button
            onClick={handleFetchAllFunnels}
            disabled={allFunnelsLoading || !backendOrgId}
            variant='outline'
            size='sm'
            className='w-full justify-start'
          >
            <List className='mr-2 h-4 w-4' />
            {allFunnelsLoading ? 'Loading...' : 'Get All Funnels'}
          </Button>

          {localStorageFunnel?.id !== '0' && (
            <Button
              onClick={handleFetchCurrentFunnel}
              disabled={
                currentFunnelLoading || !backendOrgId || !localStorageFunnel?.id
              }
              variant='outline'
              size='sm'
              className='w-full justify-start'
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              {currentFunnelLoading ? 'Loading...' : 'Get Current Funnel'}
            </Button>
          )}

          {localStorageFunnel?.id !== '0' && (
            <Button
              onClick={handleOpenUpdateFunnelModal}
              disabled={
                updateFunnelLoading ||
                currentFunnelLoading ||
                !backendOrgId ||
                !localStorageFunnel?.id
              }
              variant='outline'
              size='sm'
              className='w-full justify-start text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300'
            >
              <Edit className='mr-2 h-4 w-4' />
              {updateFunnelLoading
                ? 'Updating...'
                : currentFunnelLoading
                  ? 'Loading...'
                  : 'Update Current Funnel'}
            </Button>
          )}

          {localStorageFunnel?.id !== '0' && (
            <Button
              onClick={handleDeleteCurrentFunnel}
              disabled={
                deleteFunnelLoading || !backendOrgId || !localStorageFunnel?.id
              }
              variant='outline'
              size='sm'
              className='w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              {deleteFunnelLoading ? 'Deleting...' : 'Delete Current Funnel'}
            </Button>
          )}
        </div>

        {/* Сообщения об успехе */}
        {allFunnelsSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех (All Funnels):</strong> {allFunnelsSuccessMessage}
          </div>
        )}

        {currentFunnelSuccessMessage && (
          <div className='mt-2 rounded bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
            <strong>Успех (Current Funnel):</strong>{' '}
            {currentFunnelSuccessMessage}
          </div>
        )}

        {updateFunnelSuccessMessage && (
          <div className='mt-2 rounded bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
            <strong>Успех (Update Funnel):</strong> {updateFunnelSuccessMessage}
          </div>
        )}

        {deleteFunnelSuccessMessage && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Успех (Delete Funnel):</strong> {deleteFunnelSuccessMessage}
          </div>
        )}

        {/* Ошибки */}
        {allFunnelsError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (All Funnels):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {allFunnelsError}
            </pre>
          </div>
        )}

        {currentFunnelError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Current Funnel):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {currentFunnelError}
            </pre>
          </div>
        )}

        {updateFunnelError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Update Funnel):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {updateFunnelError}
            </pre>
          </div>
        )}

        {deleteFunnelError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Delete Funnel):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {deleteFunnelError}
            </pre>
          </div>
        )}

        {/* Результаты API запросов */}
        {allFunnelsData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
              View All Funnels API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-purple-100 p-2 text-xs dark:bg-purple-900/30 dark:text-purple-200'>
              {JSON.stringify(allFunnelsData, null, 2)}
            </pre>
          </details>
        )}

        {currentFunnelData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
              View Current Funnel API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900/30 dark:text-green-200'>
              {JSON.stringify(currentFunnelData, null, 2)}
            </pre>
          </details>
        )}

        {updateFunnelData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
              View Update Funnel API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-blue-100 p-2 text-xs dark:bg-blue-900/30 dark:text-blue-200'>
              {JSON.stringify(updateFunnelData, null, 2)}
            </pre>
          </details>
        )}

        {deleteFunnelData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
              View Delete Funnel API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-red-100 p-2 text-xs dark:bg-red-900/30 dark:text-red-200'>
              {JSON.stringify(deleteFunnelData, null, 2)}
            </pre>
          </details>
        )}

        {/* Локальные данные */}
        {localStorageFunnel && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
              {localStorageFunnel.id === '0'
                ? 'View All Funnels Local Data'
                : 'View Current Funnel Local Data'}
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800 dark:text-gray-200'>
              {localStorageFunnel.id === '0'
                ? JSON.stringify(localStorageFunnels, null, 2)
                : JSON.stringify(localStorageFunnel, null, 2)}
            </pre>
          </details>
        )}

        {localStorageFunnels && localStorageFunnels.length > 0 && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-orange-600 dark:text-orange-400'>
              View All Local Funnels
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800 dark:text-gray-200'>
              {JSON.stringify(localStorageFunnels, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* Модальное окно создания воронки */}
      <CreateFunnelModal
        isOpen={isCreateFunnelModalOpen}
        onClose={() => setIsCreateFunnelModalOpen(false)}
        onSuccess={handleFunnelCreated}
      />

      {/* Модальное окно обновления воронки */}
      {isUpdateFunnelModalOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='mx-4 flex h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white dark:bg-gray-800'>
            <div className='flex-shrink-0 border-b border-gray-200 p-6 dark:border-gray-700'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                  Update Funnel
                </h2>
                <button
                  onClick={handleCloseUpdateFunnelModal}
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                >
                  <svg
                    className='h-6 w-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-6'>
              {currentFunnelLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='text-center'>
                    <div className='mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Loading funnel data...
                    </p>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  {/* Display Name */}
                  <div>
                    <Label
                      htmlFor='display_name'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      Display Name
                    </Label>
                    <Input
                      id='display_name'
                      type='text'
                      value={updateFormData.display_name}
                      onChange={(e) =>
                        setUpdateFormData({
                          ...updateFormData,
                          display_name: e.target.value
                        })
                      }
                      placeholder='Enter funnel display name'
                      className='mt-1'
                    />
                  </div>

                  {/* Role Instruction */}
                  <div>
                    <Label
                      htmlFor='role_instruction'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      Role Instruction
                    </Label>
                    <textarea
                      id='role_instruction'
                      value={updateFormData.role_instruction}
                      onChange={(e) =>
                        setUpdateFormData({
                          ...updateFormData,
                          role_instruction: e.target.value
                        })
                      }
                      placeholder='Enter role instruction'
                      className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                      rows={3}
                    />
                  </div>

                  {/* Auto Answer */}
                  <div>
                    <Label
                      htmlFor='autoAnswer'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      Auto Answer
                    </Label>
                    <textarea
                      id='autoAnswer'
                      value={updateFormData.autoAnswer}
                      onChange={(e) =>
                        setUpdateFormData({
                          ...updateFormData,
                          autoAnswer: e.target.value
                        })
                      }
                      placeholder='Enter auto answer message'
                      className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                      rows={2}
                    />
                  </div>

                  {/* Numeric Fields */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label
                        htmlFor='contextMemorySize'
                        className='text-sm font-medium text-gray-700 dark:text-gray-300'
                      >
                        Context Memory Size
                      </Label>
                      <Input
                        id='contextMemorySize'
                        type='number'
                        value={updateFormData.contextMemorySize}
                        onChange={(e) =>
                          setUpdateFormData({
                            ...updateFormData,
                            contextMemorySize: parseInt(e.target.value) || 0
                          })
                        }
                        className='mt-1'
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor='mergeToArray'
                        className='text-sm font-medium text-gray-700 dark:text-gray-300'
                      >
                        Merge To Array
                      </Label>
                      <Input
                        id='mergeToArray'
                        type='number'
                        value={updateFormData.mergeToArray}
                        onChange={(e) =>
                          setUpdateFormData({
                            ...updateFormData,
                            mergeToArray: parseInt(e.target.value) || 0
                          })
                        }
                        className='mt-1'
                      />
                    </div>
                  </div>

                  {/* Additional Numeric Fields */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label
                        htmlFor='breakSize'
                        className='text-sm font-medium text-gray-700 dark:text-gray-300'
                      >
                        Break Size
                      </Label>
                      <Input
                        id='breakSize'
                        type='number'
                        value={updateFormData.breakSize}
                        onChange={(e) =>
                          setUpdateFormData({
                            ...updateFormData,
                            breakSize: parseInt(e.target.value) || 0
                          })
                        }
                        className='mt-1'
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor='breakWait'
                        className='text-sm font-medium text-gray-700 dark:text-gray-300'
                      >
                        Break Wait
                      </Label>
                      <Input
                        id='breakWait'
                        type='number'
                        value={updateFormData.breakWait}
                        onChange={(e) =>
                          setUpdateFormData({
                            ...updateFormData,
                            breakWait: parseInt(e.target.value) || 0
                          })
                        }
                        className='mt-1'
                      />
                    </div>
                  </div>

                  {/* Auto Pause and Anti Spam Fields */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label
                        htmlFor='autoPause'
                        className='text-sm font-medium text-gray-700 dark:text-gray-300'
                      >
                        Auto Pause
                      </Label>
                      <Input
                        id='autoPause'
                        type='number'
                        value={updateFormData.autoPause}
                        onChange={(e) =>
                          setUpdateFormData({
                            ...updateFormData,
                            autoPause: parseInt(e.target.value) || 0
                          })
                        }
                        className='mt-1'
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor='antiSpam'
                        className='text-sm font-medium text-gray-700 dark:text-gray-300'
                      >
                        Anti Spam
                      </Label>
                      <Input
                        id='antiSpam'
                        type='number'
                        value={updateFormData.antiSpam}
                        onChange={(e) =>
                          setUpdateFormData({
                            ...updateFormData,
                            antiSpam: parseInt(e.target.value) || 0
                          })
                        }
                        className='mt-1'
                      />
                    </div>
                  </div>

                  {/* Work Schedule Fields */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label
                        htmlFor='workStart'
                        className='text-sm font-medium text-gray-700 dark:text-gray-300'
                      >
                        Work Start Hour
                      </Label>
                      <Input
                        id='workStart'
                        type='number'
                        min='0'
                        max='23'
                        value={updateFormData.workStart}
                        onChange={(e) =>
                          setUpdateFormData({
                            ...updateFormData,
                            workStart: parseInt(e.target.value) || 9
                          })
                        }
                        className='mt-1'
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor='workEnd'
                        className='text-sm font-medium text-gray-700 dark:text-gray-300'
                      >
                        Work End Hour
                      </Label>
                      <Input
                        id='workEnd'
                        type='number'
                        min='0'
                        max='23'
                        value={updateFormData.workEnd}
                        onChange={(e) =>
                          setUpdateFormData({
                            ...updateFormData,
                            workEnd: parseInt(e.target.value) || 18
                          })
                        }
                        className='mt-1'
                      />
                    </div>
                  </div>

                  {/* Boolean Fields */}
                  <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        id='useCompanyKnowledgeBase'
                        checked={updateFormData.useCompanyKnowledgeBase}
                        onChange={(e) =>
                          setUpdateFormData({
                            ...updateFormData,
                            useCompanyKnowledgeBase: e.target.checked
                          })
                        }
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <Label
                        htmlFor='useCompanyKnowledgeBase'
                        className='text-sm'
                      >
                        Use Company Knowledge Base
                      </Label>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        id='useFunnelKnowledgeBase'
                        checked={updateFormData.useFunnelKnowledgeBase}
                        onChange={(e) =>
                          setUpdateFormData({
                            ...updateFormData,
                            useFunnelKnowledgeBase: e.target.checked
                          })
                        }
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <Label
                        htmlFor='useFunnelKnowledgeBase'
                        className='text-sm'
                      >
                        Use Funnel Knowledge Base
                      </Label>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        id='autoPauseFull'
                        checked={updateFormData.autoPauseFull}
                        onChange={(e) =>
                          setUpdateFormData({
                            ...updateFormData,
                            autoPauseFull: e.target.checked
                          })
                        }
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <Label htmlFor='autoPauseFull' className='text-sm'>
                        Auto Pause Full
                      </Label>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        id='acceptFile'
                        checked={updateFormData.acceptFile}
                        onChange={(e) =>
                          setUpdateFormData({
                            ...updateFormData,
                            acceptFile: e.target.checked
                          })
                        }
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <Label htmlFor='acceptFile' className='text-sm'>
                        Accept File
                      </Label>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        id='acceptAudio'
                        checked={updateFormData.acceptAudio}
                        onChange={(e) =>
                          setUpdateFormData({
                            ...updateFormData,
                            acceptAudio: e.target.checked
                          })
                        }
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <Label htmlFor='acceptAudio' className='text-sm'>
                        Accept Audio
                      </Label>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        id='workSchedule'
                        checked={updateFormData.workSchedule}
                        onChange={(e) =>
                          setUpdateFormData({
                            ...updateFormData,
                            workSchedule: e.target.checked
                          })
                        }
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <Label htmlFor='workSchedule' className='text-sm'>
                        Work Schedule
                      </Label>
                    </div>
                  </div>

                  {/* Error Message */}
                  {updateFunnelError && (
                    <div className='rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                      <strong>Ошибка:</strong>
                      <pre className='mt-1 text-sm whitespace-pre-wrap'>
                        {updateFunnelError}
                      </pre>
                    </div>
                  )}

                  {/* Success Message */}
                  {updateFunnelSuccessMessage && (
                    <div className='rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                      <strong>Успех:</strong> {updateFunnelSuccessMessage}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fixed Footer with Action Buttons */}
            <div className='flex-shrink-0 border-t border-gray-200 p-6 dark:border-gray-700'>
              <div className='flex justify-end space-x-3'>
                <Button
                  onClick={handleCloseUpdateFunnelModal}
                  variant='outline'
                  disabled={updateFunnelLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateFunnel}
                  disabled={
                    updateFunnelLoading || !updateFormData.display_name.trim()
                  }
                  className='bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                >
                  <Edit className='mr-2 h-4 w-4' />
                  {updateFunnelLoading ? 'Updating...' : 'Update Funnel'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
