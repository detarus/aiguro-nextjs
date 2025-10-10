'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  IconDotsVertical,
  IconCheck,
  IconX,
  IconEdit,
  IconArrowRight
} from '@tabler/icons-react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Типы для клиентов
export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  assignedTo: string;
  stage: string;
  created: string;
  lastActivity: string;
  status: string;
  // Добавляем новые поля для работы со сделками
  dialogId?: string;
  dialogUuid?: string;
  messagesCount?: number;
  lastMessage?: string;
  closeRatio?: number;
  // Новые поля для карточек в канбан-доске
  description?: string;
  tags?: string[];
  price?: number;
  channel?: string;
  request?: string;
}

interface ClientTableProps {
  clients: Client[];
  backendOrgId?: string;
  onClientUpdate?: (updatedClient: Client) => void;
  onRefresh?: () => void;
}

export function ClientTable({
  clients,
  backendOrgId,
  onClientUpdate,
  onRefresh
}: ClientTableProps) {
  const [selectedClients, setSelectedClients] = useState<Set<number>>(
    new Set()
  );
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [editMode, setEditMode] = useState<Set<number>>(new Set());
  const [clientData, setClientData] = useState<Record<number, Partial<Client>>>(
    {}
  );
  const [updateStatus, setUpdateStatus] = useState<{
    id: number | null;
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ id: null, status: 'idle', message: '' });
  const router = useRouter();

  // Создаем карту стадий для сопоставления кодовых имен с русскими названиями и цветами
  const stageMap = useMemo(() => {
    const map: Record<string, { name: string; color: string }> = {};

    // Определяем цвета для стадий
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
      'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300',
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
      'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300'
    ];

    // Добавляем базовые стадии
    map['qualification'] = {
      name: 'Квалификация',
      color: colors[0]
    };
    map['presentation'] = {
      name: 'Презентация',
      color: colors[1]
    };
    map['closing'] = {
      name: 'Закрытие',
      color: colors[2]
    };

    console.log('Карта стадий создана:', map);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const deleteClient = (id: number) => {
    // Logic to visually hide the client row
    document
      .getElementById(`client-row-${id}`)
      ?.style.setProperty('display', 'none');
    setShowDeleteMessage(true);
    setTimeout(() => {
      setShowDeleteMessage(false);
    }, 3000);
  };

  const deleteSelectedClients = () => {
    selectedClients.forEach((id) => {
      deleteClient(id);
    });
    setSelectedClients(new Set());
  };

  const handleSaveChanges = async (id: number) => {
    if (!backendOrgId) {
      console.error('ID организации не найден:', backendOrgId);
      toast.error('ID организации не найден');
      return;
    }

    if (!clientData[id]) {
      console.error('Данные клиента не найдены для ID:', id);
      toast.error('Данные клиента не найдены');
      return;
    }

    console.log('=== НАЧАЛО ОБНОВЛЕНИЯ КЛИЕНТА ===');
    console.log('ID из таблицы (возможно ID диалога):', id);
    console.log('ID организации:', backendOrgId);
    console.log('Текущие данные клиента в clientData:', clientData[id]);

    // Устанавливаем статус загрузки без сообщения (чтобы избежать дублирования уведомлений)
    setUpdateStatus({
      id,
      status: 'loading',
      message: '' // Пустое сообщение, чтобы не показывать уведомление
    });

    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) {
        throw new Error('Ошибка аутентификации');
      }
      console.log(
        'Токен получен:',
        token ? 'Да (длина: ' + token.length + ')' : 'Нет'
      );

      // Получаем оригинальные данные клиента из массива
      const originalClient = clients.find((c) => c.id === id);
      if (!originalClient) {
        console.error('Оригинальный клиент не найден в массиве clients:', id);
        throw new Error(`Клиент с ID ${id} не найден`);
      }
      console.log('Оригинальные данные клиента:', originalClient);

      // Подготовка данных для отправки в API - используем только поля, которые API ожидает
      const clientToUpdate = {
        name: clientData[id].name || originalClient.name || '',
        phone: clientData[id].phone || originalClient.phone || '',
        email: clientData[id].email || originalClient.email || '',
        manager: clientData[id].assignedTo || originalClient.assignedTo || '',
        request: clientData[id].request || originalClient.request || '',
        price:
          clientData[id].price !== undefined
            ? clientData[id].price
            : originalClient.price
      };

      // Проверка изменений
      const changes = {
        name: {
          original: originalClient.name,
          updated: clientToUpdate.name,
          changed: originalClient.name !== clientToUpdate.name
        },
        phone: {
          original: originalClient.phone,
          updated: clientToUpdate.phone,
          changed: originalClient.phone !== clientToUpdate.phone
        },
        email: {
          original: originalClient.email,
          updated: clientToUpdate.email,
          changed: originalClient.email !== clientToUpdate.email
        },
        manager: {
          original: originalClient.assignedTo,
          updated: clientToUpdate.manager,
          changed: originalClient.assignedTo !== clientToUpdate.manager
        },
        request: {
          original: originalClient.request,
          updated: clientToUpdate.request,
          changed: originalClient.request !== clientToUpdate.request
        },
        price: {
          original: originalClient.price,
          updated: clientToUpdate.price,
          changed: originalClient.price !== clientToUpdate.price
        }
      };
      console.log('Анализ изменений:', changes);
      console.log('Данные для отправки:', clientToUpdate);

      // Проверяем, есть ли реальные изменения
      const hasChanges = Object.values(changes).some((field) => field.changed);
      if (!hasChanges) {
        console.log('Нет изменений для сохранения, пропускаем запрос к API');

        // Выходим из режима редактирования без запроса к API
        setEditMode((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });

        setUpdateStatus({
          id: null,
          status: 'idle',
          message: ''
        });

        return;
      }

      // ШАГ 1: Получаем список всех клиентов, чтобы найти правильный ID клиента
      console.log(
        'Получение списка всех клиентов для поиска правильного ID...'
      );
      const clientsResponse = await fetch(
        `/api/organization/${backendOrgId}/clients`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!clientsResponse.ok) {
        throw new Error(
          `Ошибка получения списка клиентов: ${clientsResponse.status}`
        );
      }

      // Определяем тип для клиентов API
      interface ApiClient {
        id: number;
        name: string;
        email?: string;
        phone?: string;
        manager?: string;
        status?: string;
      }

      // Получаем и типизируем список клиентов
      const allClientsData = await clientsResponse.json();
      const allClients: ApiClient[] = Array.isArray(allClientsData)
        ? allClientsData
        : [];
      console.log('Получен список клиентов:', allClients);

      // ШАГ 2: Ищем клиента по имени
      let matchedClientId: number | null = null;
      let matchedClient: ApiClient | null = null;

      // Перебираем всех клиентов и ищем совпадение по имени
      for (const client of allClients) {
        if (
          client &&
          client.name &&
          originalClient.name &&
          client.name.toLowerCase() === originalClient.name.toLowerCase()
        ) {
          matchedClientId = client.id;
          matchedClient = client;
          console.log('Найден клиент с ID:', matchedClientId);
          console.log('Данные найденного клиента:', client);
          break;
        }
      }

      if (matchedClientId === null || !matchedClient) {
        console.error(
          'Не удалось найти клиента с именем:',
          originalClient.name
        );
        throw new Error(
          `Не удалось найти клиента с именем: ${originalClient.name}`
        );
      }

      const realClientId = matchedClientId;

      // ШАГ 3: Используем правильный ID клиента для обновления
      const endpoint = `/api/organization/${backendOrgId}/client/${realClientId}`;
      console.log('Endpoint API с правильным ID клиента:', endpoint);

      // Создаем тело запроса в формате JSON
      const requestBody = JSON.stringify(clientToUpdate);
      console.log('Тело запроса (JSON):', requestBody);
      console.log('Длина тела запроса:', requestBody.length);

      // Отправка запроса на обновление клиента с правильным ID
      console.log('Отправка запроса с правильным ID клиента...');
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: requestBody
      });

      console.log('Ответ сервера:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        headers: {
          'content-type': response.headers.get('content-type'),
          'content-length': response.headers.get('content-length')
        }
      });

      // Копия ответа для обработки как текста
      const responseClone = response.clone();

      // Получаем текст ответа для отладки
      const responseText = await responseClone.text();
      console.log('Текст ответа сервера:', responseText);
      console.log('Длина текста ответа:', responseText.length);

      // Если ответ не успешный, выбрасываем ошибку
      if (!response.ok) {
        let errorData = {};
        try {
          // Пытаемся распарсить JSON из текста ответа
          errorData = responseText ? JSON.parse(responseText) : {};
          console.error('Ошибка ответа сервера (JSON):', errorData);
        } catch (e) {
          console.error('Не удалось распарсить ответ как JSON:', e);
          console.error('Сырой текст ответа:', responseText);
        }

        throw new Error(
          (errorData as any).error ||
            `Ошибка сервера: ${response.status} ${response.statusText}`
        );
      }

      // ШАГ 4: Обработка успешного ответа
      let responseData = null;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
        console.log('Успешный ответ сервера (JSON):', responseData);
      } catch (e) {
        console.warn('Не удалось распарсить успешный ответ как JSON:', e);
      }

      // Создаем обновленный объект клиента с правильным ID
      const updatedClient: Client = {
        ...originalClient,
        id: realClientId, // Используем правильный ID клиента
        name: clientToUpdate.name,
        email: clientToUpdate.email,
        phone: clientToUpdate.phone,
        assignedTo: clientToUpdate.manager,
        request: clientToUpdate.request,
        price: clientToUpdate.price
      };
      console.log('Обновленный объект клиента с правильным ID:', updatedClient);

      // Прямое обновление данных в таблице без перезагрузки
      // Находим индекс клиента в массиве
      const clientIndex = clients.findIndex((c) => c.id === id);
      if (clientIndex !== -1) {
        // Обновляем клиента непосредственно в массиве
        const updatedClients = [...clients];
        updatedClients[clientIndex] = {
          ...updatedClients[clientIndex],
          name: clientToUpdate.name,
          email: clientToUpdate.email,
          phone: clientToUpdate.phone,
          assignedTo: clientToUpdate.manager,
          request: clientToUpdate.request,
          price: clientToUpdate.price
        };

        // Если у нас есть доступ к функции обновления родительского компонента,
        // мы можем использовать ее для обновления состояния родителя
        if (onRefresh && typeof onRefresh === 'function') {
          console.log(
            'Вызываем функцию обновления родителя для применения изменений'
          );
          onRefresh();
        }
      }

      // Обновляем clientData с новыми данными
      setClientData((prev) => {
        const newClientData = {
          ...prev,
          [id]: {
            ...prev[id],
            ...updatedClient
          }
        };
        console.log('Обновленный clientData:', newClientData);
        return newClientData;
      });

      // Показываем ТОЛЬКО ОДНО уведомление через toast внизу справа
      toast.success('Клиент успешно обновлен', {
        description: `${updatedClient.name} - данные обновлены`,
        duration: 3000,
        position: 'bottom-right' // Позиционируем уведомление внизу справа
      });

      // Устанавливаем статус успеха, но БЕЗ сообщения
      setUpdateStatus({
        id,
        status: 'success',
        message: '' // Пустое сообщение, чтобы не показывать уведомление
      });

      // Сбрасываем статус после небольшой задержки
      setTimeout(() => {
        setUpdateStatus({ id: null, status: 'idle', message: '' });
      }, 3000);

      // Вызываем callback для обновления родительского компонента, но только если он определен
      if (onClientUpdate && typeof onClientUpdate === 'function') {
        console.log(
          'Вызов onClientUpdate с обновленными данными:',
          updatedClient
        );
        // Вызываем callback только если он явно определен как функция
        onClientUpdate(updatedClient);
      } else {
        console.log('onClientUpdate не вызывается или не определен');
      }

      // Выходим из режима редактирования
      setEditMode((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });

      console.log('=== УСПЕШНОЕ ЗАВЕРШЕНИЕ ОБНОВЛЕНИЯ КЛИЕНТА ===');
    } catch (error: any) {
      console.error('=== ОШИБКА ОБНОВЛЕНИЯ КЛИЕНТА ===', error);

      // Устанавливаем статус ошибки, но БЕЗ сообщения
      setUpdateStatus({
        id,
        status: 'error',
        message: '' // Пустое сообщение, чтобы не показывать уведомление
      });

      // Показываем только одно уведомление через toast внизу справа
      toast.error('Ошибка при обновлении клиента', {
        description: error.message,
        duration: 5000,
        position: 'bottom-right' // Позиционируем уведомление внизу справа
      });

      // Сбрасываем статус после небольшой задержки
      setTimeout(() => {
        setUpdateStatus({ id: null, status: 'idle', message: '' });
      }, 3000);
    }
  };

  useEffect(() => {
    // Initialize clientData with existing clients
    const initialData: Record<number, Partial<Client>> = {};
    clients.forEach((client) => {
      // Преобразуем "Не указано" в пустые строки для полей редактирования
      initialData[client.id] = {
        ...client
        // Оставляем значения для отображения, но для редактирования будем использовать пустые строки
      };
    });
    setClientData(initialData);
  }, [clients]);

  // Функция для получения цвета стадии
  const getStageColor = (
    stageName: string,
    stageMap: Record<string, { name: string; color: string }>
  ) => {
    if (!stageName)
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';

    // Проверяем, есть ли соответствие в карте стадий
    const stageInfo = stageMap[stageName.toLowerCase()];
    if (stageInfo) {
      return stageInfo.color;
    }

    // Дефолтные цвета для известных стадий
    switch (stageName.toLowerCase()) {
      case 'qualification':
      case 'квалификация':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'presentation':
      case 'презентация':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'closing':
      case 'закрытие':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  // Функция для отображения стадии с правильным названием и цветом
  const renderStage = (stageName: string) => {
    if (!stageName) return 'Не указано';

    // Проверяем наличие стадии в карте
    const stageInfo = stageMap[stageName.toLowerCase()];
    const displayName = stageInfo ? stageInfo.name : stageName;
    const colorClass = getStageColor(stageName, stageMap);

    return <Badge className={colorClass}>{displayName}</Badge>;
  };

  // Функция для получения значения для редактирования
  const getEditValue = (
    id: number,
    field: keyof Client,
    defaultValue: string = ''
  ) => {
    // Если клиент находится в режиме редактирования
    if (editMode.has(id)) {
      // Если есть данные в clientData, используем их
      if (clientData[id] && clientData[id][field] !== undefined) {
        return clientData[id][field] as string;
      }

      // Иначе ищем клиента в исходном массиве
      const client = clients.find((c) => c.id === id);
      if (client) {
        const value = client[field] as string;
        // Если значение "Не указано" или пустое, возвращаем пустую строку для редактирования
        return value === 'Не указано' || !value ? '' : value;
      }
    }

    return defaultValue;
  };

  // Функция для отображения значения в таблице (не в режиме редактирования)
  const getDisplayValue = (
    id: number,
    field: keyof Client,
    defaultValue: string = 'Не указано'
  ) => {
    // Ищем клиента в исходном массиве
    const client = clients.find((c) => c.id === id);
    if (client) {
      const value = client[field] as string;
      // Если значение пустое или undefined, возвращаем "Не указано"
      return value || defaultValue;
    }

    return defaultValue;
  };

  // Функция для обработки изменений в полях ввода
  const handleInputChange = (
    id: number,
    field: keyof Client,
    value: string
  ) => {
    // Обновляем данные клиента
    setClientData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  // Функция для начала редактирования клиента
  const startEdit = (id: number) => {
    // Инициализируем данные клиента в clientData, если их еще нет
    const client = clients.find((c) => c.id === id);
    if (client) {
      setClientData((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          name: client.name || '',
          phone: client.phone || '',
          email: client.email || '',
          assignedTo: client.assignedTo || '',
          request: client.request || '',
          price: client.price
        }
      }));
    }

    // Добавляем клиента в режим редактирования
    setEditMode((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  // Функция для отмены редактирования
  const cancelEdit = (id: number) => {
    // Удаляем клиента из режима редактирования
    setEditMode((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  return (
    <div className='w-full overflow-hidden rounded-md'>
      <div className='w-full overflow-x-auto'>
        <Table className='w-full min-w-[800px]'>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[40px]'>
                <Checkbox
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedClients(
                        new Set(clients.map((client) => client.id))
                      );
                    } else {
                      setSelectedClients(new Set());
                    }
                  }}
                />
              </TableHead>
              <TableHead className='min-w-[150px]'>Имя</TableHead>
              <TableHead className='hidden min-w-[120px] md:table-cell'>
                Телефон
              </TableHead>
              <TableHead className='hidden min-w-[150px] lg:table-cell'>
                Email
              </TableHead>
              <TableHead className='hidden min-w-[120px] xl:table-cell'>
                Запрос
              </TableHead>
              <TableHead className='min-w-[100px]'>Цена</TableHead>
              <TableHead className='min-w-[100px]'>Стадия</TableHead>
              <TableHead className='hidden min-w-[150px] xl:table-cell'>
                Ответственный
              </TableHead>
              <TableHead className='w-[60px] text-right'>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className='text-muted-foreground py-8 text-center'
                >
                  Сделки не найдены
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow
                  key={client.id}
                  id={`client-row-${client.id}`}
                  className='group'
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedClients.has(client.id)}
                      onCheckedChange={() => toggleClientSelection(client.id)}
                    />
                  </TableCell>
                  <TableCell className='font-medium'>
                    {editMode.has(client.id) ? (
                      <Input
                        type='text'
                        value={getEditValue(client.id, 'name')}
                        onChange={(e) =>
                          handleInputChange(client.id, 'name', e.target.value)
                        }
                        className='w-full rounded border p-1'
                        placeholder='Не указано'
                      />
                    ) : (
                      <div
                        className='cursor-pointer'
                        onClick={() => {
                          if (client.dialogUuid) {
                            router.push(
                              `/dashboard/messengers?uuid=${client.dialogUuid}`
                            );
                          }
                        }}
                      >
                        {getDisplayValue(client.id, 'name')}
                      </div>
                    )}
                    <div className='text-muted-foreground mt-1 text-xs md:hidden'>
                      {getDisplayValue(client.id, 'phone')}
                    </div>
                    <div className='text-muted-foreground mt-1 max-w-[150px] truncate text-xs md:hidden lg:hidden'>
                      {getDisplayValue(client.id, 'email')}
                    </div>
                  </TableCell>
                  <TableCell className='hidden md:table-cell'>
                    {editMode.has(client.id) ? (
                      <Input
                        type='text'
                        value={getEditValue(client.id, 'phone')}
                        onChange={(e) =>
                          handleInputChange(client.id, 'phone', e.target.value)
                        }
                        className='w-full rounded border p-1'
                        placeholder='Не указано'
                      />
                    ) : (
                      getDisplayValue(client.id, 'phone')
                    )}
                  </TableCell>
                  <TableCell className='hidden lg:table-cell'>
                    {editMode.has(client.id) ? (
                      <Input
                        type='text'
                        value={getEditValue(client.id, 'email')}
                        onChange={(e) =>
                          handleInputChange(client.id, 'email', e.target.value)
                        }
                        className='w-full rounded border p-1'
                        placeholder='Не указано'
                      />
                    ) : (
                      getDisplayValue(client.id, 'email')
                    )}
                  </TableCell>
                  <TableCell className='hidden xl:table-cell'>
                    {editMode.has(client.id) ? (
                      <Input
                        type='text'
                        value={getEditValue(client.id, 'request')}
                        onChange={(e) =>
                          handleInputChange(
                            client.id,
                            'request',
                            e.target.value
                          )
                        }
                        className='w-full rounded border p-1'
                        placeholder='Не указано'
                      />
                    ) : (
                      getDisplayValue(client.id, 'request', 'Не указано')
                    )}
                  </TableCell>
                  <TableCell>
                    {editMode.has(client.id) ? (
                      <Input
                        type='text'
                        value={getEditValue(client.id, 'price')}
                        onChange={(e) =>
                          handleInputChange(client.id, 'price', e.target.value)
                        }
                        className='w-full rounded border p-1'
                        placeholder='0 ₽'
                      />
                    ) : client.price ? (
                      new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                        maximumFractionDigits: 0
                      })
                        .format(client.price)
                        .replace('RUB', '₽')
                    ) : (
                      '0 ₽'
                    )}
                  </TableCell>
                  <TableCell>{renderStage(client.stage)}</TableCell>
                  <TableCell className='hidden xl:table-cell'>
                    {editMode.has(client.id) ? (
                      <Input
                        type='text'
                        value={getEditValue(client.id, 'assignedTo')}
                        onChange={(e) =>
                          handleInputChange(
                            client.id,
                            'assignedTo',
                            e.target.value
                          )
                        }
                        className='w-full rounded border p-1'
                        placeholder='Не указано'
                      />
                    ) : (
                      getDisplayValue(client.id, 'assignedTo')
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='opacity-0 group-hover:opacity-100 sm:opacity-100'
                        >
                          <IconDotsVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        {editMode.has(client.id) ? (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleSaveChanges(client.id)}
                              disabled={
                                updateStatus.id === client.id &&
                                updateStatus.status === 'loading'
                              }
                            >
                              {updateStatus.id === client.id &&
                              updateStatus.status === 'loading' ? (
                                <>
                                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600' />
                                  Сохранение...
                                </>
                              ) : (
                                <>
                                  <IconCheck className='mr-2 h-4 w-4 text-green-500' />
                                  Сохранить
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => cancelEdit(client.id)}
                            >
                              <IconX className='mr-2 h-4 w-4 text-red-500' />
                              Отменить
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            {client.dialogUuid && (
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/dashboard/messengers?uuid=${client.dialogUuid}`
                                  )
                                }
                              >
                                <IconArrowRight className='mr-2 h-4 w-4' />
                                Посмотреть
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => startEdit(client.id)}
                            >
                              <IconEdit className='mr-2 h-4 w-4' />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteClient(client.id)}
                            >
                              Удалить
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {selectedClients.size > 0 && (
        <div className='fixed right-4 bottom-4'>
          <Button variant='destructive' onClick={deleteSelectedClients}>
            Удалить выбранные
          </Button>
        </div>
      )}
      {showDeleteMessage && (
        <div className='fixed right-4 bottom-16 rounded bg-green-500 p-2 text-white'>
          Элементы были удалены
        </div>
      )}
    </div>
  );
}
