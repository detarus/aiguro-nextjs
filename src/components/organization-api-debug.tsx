'use client';

import { useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { RefreshCw, Building, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function OrganizationApiDebug() {
  const { organization } = useOrganization();

  const [allOrgsData, setAllOrgsData] = useState<any>(null);
  const [allOrgsLoading, setAllOrgsLoading] = useState(false);
  const [allOrgsError, setAllOrgsError] = useState<string | null>(null);
  const [allOrgsSuccessMessage, setAllOrgsSuccessMessage] = useState<
    string | null
  >(null);

  const [currentOrgData, setCurrentOrgData] = useState<any>(null);
  const [currentOrgLoading, setCurrentOrgLoading] = useState(false);
  const [currentOrgError, setCurrentOrgError] = useState<string | null>(null);
  const [currentOrgSuccessMessage, setCurrentOrgSuccessMessage] = useState<
    string | null
  >(null);

  // Состояния для создания организации
  const [createOrgData, setCreateOrgData] = useState<any>(null);
  const [createOrgLoading, setCreateOrgLoading] = useState(false);
  const [createOrgError, setCreateOrgError] = useState<string | null>(null);
  const [createOrgSuccessMessage, setCreateOrgSuccessMessage] = useState<
    string | null
  >(null);

  // Состояния для модального окна создания организации
  const [createOrgModalOpen, setCreateOrgModalOpen] = useState(false);
  const [createOrgForm, setCreateOrgForm] = useState({
    display_name: '',
    gid: '',
    is_active: true,
    organization_id: ''
  });

  // Получаем backend ID для отображения
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  // Очищаем данные при смене организации
  useEffect(() => {
    setAllOrgsData(null);
    setAllOrgsError(null);
    setAllOrgsSuccessMessage(null);
    setCurrentOrgData(null);
    setCurrentOrgError(null);
    setCurrentOrgSuccessMessage(null);
    setCreateOrgData(null);
    setCreateOrgError(null);
    setCreateOrgSuccessMessage(null);
  }, [backendOrgId]);

  // Инициализация формы при открытии модального окна
  const handleOpenCreateModal = () => {
    const timestamp = Date.now();
    setCreateOrgForm({
      display_name: `Test Organization ${timestamp}`,
      gid: `org_${timestamp}`,
      is_active: true,
      organization_id: backendOrgId || ''
    });
    setCreateOrgModalOpen(true);
  };

  const handleFetchAllOrganizations = async () => {
    console.log('Get All Organizations button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setAllOrgsError('No token available in __session cookie');
      return;
    }

    setAllOrgsLoading(true);
    setAllOrgsError(null);
    setAllOrgsSuccessMessage(null);

    try {
      console.log('Sending request to /api/aiguro-organizations...');

      const response = await fetch('/api/aiguro-organizations', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

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
      console.log('Successfully fetched all organizations:', data);

      setAllOrgsData(data);
      setAllOrgsSuccessMessage('Запрос успешно отправлен и данные получены!');

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setAllOrgsSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setAllOrgsError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAllOrgsLoading(false);
    }
  };

  const handleFetchCurrentOrganization = async () => {
    console.log('Get Current Organization button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setCurrentOrgError('No token available in __session cookie');
      return;
    }

    if (!backendOrgId) {
      setCurrentOrgError('No backend organization ID found in metadata');
      return;
    }

    setCurrentOrgLoading(true);
    setCurrentOrgError(null);
    setCurrentOrgSuccessMessage(null);

    try {
      // Используем внутренний API endpoint вместо прямого запроса к внешнему API
      const apiUrl = `/api/aiguro-organizations/${backendOrgId}`;
      console.log('Sending request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

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
      console.log('Successfully fetched current organization:', data);

      setCurrentOrgData(data);
      setCurrentOrgSuccessMessage(
        'Запрос успешно отправлен и данные получены!'
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setCurrentOrgSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error fetching current organization:', err);
      setCurrentOrgError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCurrentOrgLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    console.log('Create Organization button clicked!');

    // Получаем токен из cookie
    const token = getClerkTokenFromClientCookie();
    console.log('Token from cookie:', !!token);

    if (!token) {
      setCreateOrgError('No token available in __session cookie');
      return;
    }

    // Валидация формы
    if (!createOrgForm.display_name.trim()) {
      setCreateOrgError('Display name is required');
      return;
    }

    if (!createOrgForm.gid.trim()) {
      setCreateOrgError('GID is required');
      return;
    }

    setCreateOrgLoading(true);
    setCreateOrgError(null);
    setCreateOrgSuccessMessage(null);
    setCreateOrgModalOpen(false);

    try {
      console.log('Creating organization with data:', createOrgForm);

      // Строим URL с query параметрами
      const url = new URL('/api/organization', window.location.origin);
      if (createOrgForm.organization_id) {
        url.searchParams.append(
          'organization_id',
          createOrgForm.organization_id
        );
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          display_name: createOrgForm.display_name.trim(),
          gid: createOrgForm.gid.trim(),
          is_active: createOrgForm.is_active
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            // Обработка ошибок валидации (422)
            errorMessage = `Validation Error: ${JSON.stringify(errorData.detail)}`;
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
      console.log('Successfully created organization:', data);

      setCreateOrgData(data);
      setCreateOrgSuccessMessage('Организация успешно создана!');

      // Убираем сообщение об успехе через 5 секунд
      setTimeout(() => {
        setCreateOrgSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error creating organization:', err);
      setCreateOrgError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCreateOrgLoading(false);
    }
  };

  return (
    <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-900/20'>
      <h3 className='mb-2 font-semibold text-purple-800 dark:text-purple-200'>
        Organization API Debug Info
      </h3>
      <div className='space-y-2 text-sm'>
        <p>
          <strong>Selected Org ID (Backend):</strong> {backendOrgId || 'None'}
        </p>
        <p>
          <strong>Has Token:</strong>{' '}
          {getClerkTokenFromClientCookie() ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Clerk Org ID:</strong> {organization?.id || 'Not set'}
        </p>
        <p>
          <strong>Organization Loaded:</strong> {organization ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Has Backend ID:</strong> {backendOrgId ? 'Yes' : 'No'}
        </p>

        {/* Кнопки для API запросов */}
        <div className='mt-4 space-y-2'>
          <Button
            onClick={handleFetchAllOrganizations}
            disabled={allOrgsLoading}
            variant='outline'
            size='sm'
            className='w-full justify-start'
          >
            <Building className='mr-2 h-4 w-4' />
            {allOrgsLoading ? 'Loading...' : 'Get All Organizations'}
          </Button>

          <Button
            onClick={handleFetchCurrentOrganization}
            disabled={currentOrgLoading || !backendOrgId}
            variant='outline'
            size='sm'
            className='w-full justify-start'
          >
            <RefreshCw className='mr-2 h-4 w-4' />
            {currentOrgLoading ? 'Loading...' : 'Get Current Organization'}
          </Button>

          <Button
            onClick={handleOpenCreateModal}
            disabled={createOrgLoading}
            variant='outline'
            size='sm'
            className='w-full justify-start'
          >
            <Plus className='mr-2 h-4 w-4' />
            {createOrgLoading ? 'Creating...' : 'Create New Organization'}
          </Button>
        </div>

        {/* Сообщения об успехе */}
        {allOrgsSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех (All Organizations):</strong> {allOrgsSuccessMessage}
          </div>
        )}

        {currentOrgSuccessMessage && (
          <div className='mt-2 rounded bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
            <strong>Успех (Current Organization):</strong>{' '}
            {currentOrgSuccessMessage}
          </div>
        )}

        {createOrgSuccessMessage && (
          <div className='mt-2 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
            <strong>Успех (Create Organization):</strong>{' '}
            {createOrgSuccessMessage}
          </div>
        )}

        {/* Ошибки */}
        {allOrgsError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (All Organizations):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {allOrgsError}
            </pre>
          </div>
        )}

        {currentOrgError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Current Organization):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {currentOrgError}
            </pre>
          </div>
        )}

        {createOrgError && (
          <div className='mt-2 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            <strong>Ошибка (Create Organization):</strong>
            <pre className='mt-1 text-sm whitespace-pre-wrap'>
              {createOrgError}
            </pre>
          </div>
        )}

        {/* Результаты API запросов */}
        {allOrgsData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-purple-600 dark:text-purple-400'>
              View All Organizations API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-purple-100 p-2 text-xs dark:bg-purple-900/30 dark:text-purple-200'>
              {JSON.stringify(allOrgsData, null, 2)}
            </pre>
          </details>
        )}

        {currentOrgData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-purple-600 dark:text-purple-400'>
              View Current Organization API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900/30 dark:text-green-200'>
              {JSON.stringify(currentOrgData, null, 2)}
            </pre>
          </details>
        )}

        {createOrgData && (
          <details className='mt-2'>
            <summary className='cursor-pointer text-purple-600 dark:text-purple-400'>
              View Create Organization API Response
            </summary>
            <pre className='mt-2 max-h-64 overflow-auto rounded bg-orange-100 p-2 text-xs dark:bg-orange-900/30 dark:text-orange-200'>
              {JSON.stringify(createOrgData, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* Модальное окно создания организации */}
      <Dialog open={createOrgModalOpen} onOpenChange={setCreateOrgModalOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Создать новую организацию</DialogTitle>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='display_name'>Display Name *</Label>
              <Input
                id='display_name'
                value={createOrgForm.display_name}
                onChange={(e) =>
                  setCreateOrgForm((prev) => ({
                    ...prev,
                    display_name: e.target.value
                  }))
                }
                placeholder='Введите название организации'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='gid'>GID *</Label>
              <Input
                id='gid'
                value={createOrgForm.gid}
                onChange={(e) =>
                  setCreateOrgForm((prev) => ({
                    ...prev,
                    gid: e.target.value
                  }))
                }
                placeholder='Введите GID организации'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='organization_id'>Organization ID (Query)</Label>
              <Input
                id='organization_id'
                value={createOrgForm.organization_id}
                onChange={(e) =>
                  setCreateOrgForm((prev) => ({
                    ...prev,
                    organization_id: e.target.value
                  }))
                }
                placeholder='ID организации для query параметра'
              />
            </div>

            <div className='flex items-center space-x-2'>
              <Switch
                id='is_active'
                checked={createOrgForm.is_active}
                onCheckedChange={(checked) =>
                  setCreateOrgForm((prev) => ({
                    ...prev,
                    is_active: checked
                  }))
                }
              />
              <Label htmlFor='is_active'>Активна</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setCreateOrgModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreateOrganization}
              disabled={createOrgLoading}
            >
              {createOrgLoading ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
