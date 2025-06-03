'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/components/ui/sidebar';
import { IconSearch, IconList, IconLayoutKanban } from '@tabler/icons-react';
import { ClientTable, Client } from './components/client-table';
import { ClientActions } from './components/client-actions';
import { KanbanBoard } from './components/kanban-board';

// Пример данных для клиентов
const clients: Client[] = [
  {
    id: 1,
    name: 'Мария Иванова',
    email: 'maria@example.com',
    phone: '+7 (901) 123-45-67',
    assignedTo: 'Александр Петров',
    stage: 'Новый',
    created: '01 июня 2023',
    lastActivity: '15 минут назад',
    status: 'Активный'
  },
  {
    id: 2,
    name: 'Иван Смирнов',
    email: 'ivan@example.com',
    phone: '+7 (902) 234-56-78',
    assignedTo: 'Ольга Сидорова',
    stage: 'Квалификация',
    created: '15 мая 2023',
    lastActivity: '2 часа назад',
    status: 'Активный'
  },
  {
    id: 3,
    name: 'Анна Петрова',
    email: 'anna@example.com',
    phone: '+7 (903) 345-67-89',
    assignedTo: 'Михаил Кузнецов',
    stage: 'Новый',
    created: '10 апреля 2023',
    lastActivity: '1 день назад',
    status: 'Неактивный'
  },
  {
    id: 4,
    name: 'Дмитрий Козлов',
    email: 'dmitry@example.com',
    phone: '+7 (904) 456-78-90',
    assignedTo: 'Елена Морозова',
    stage: 'Закрыто',
    created: '05 марта 2023',
    lastActivity: '5 дней назад',
    status: 'Активный'
  },
  {
    id: 5,
    name: 'Елена Новикова',
    email: 'elena@example.com',
    phone: '+7 (905) 567-89-01',
    assignedTo: 'Андрей Соколов',
    stage: 'Новый',
    created: '20 февраля 2023',
    lastActivity: '10 дней назад',
    status: 'Активный'
  },
  {
    id: 6,
    name: 'Сергей Морозов',
    email: 'sergey@example.com',
    phone: '+7 (906) 678-90-12',
    assignedTo: 'Наталья Волкова',
    stage: 'Новый',
    created: '15 января 2023',
    lastActivity: '2 недели назад',
    status: 'Неактивный'
  },
  {
    id: 7,
    name: 'Ольга Волкова',
    email: 'olga@example.com',
    phone: '+7 (907) 789-01-23',
    assignedTo: 'Сергей Петров',
    stage: 'Переговоры',
    created: '10 декабря 2022',
    lastActivity: '1 месяц назад',
    status: 'Отложен'
  },
  {
    id: 8,
    name: 'Андрей Соколов',
    email: 'andrey@example.com',
    phone: '+7 (908) 890-12-34',
    assignedTo: 'Ирина Смирнова',
    stage: 'Квалификация',
    created: '05 ноября 2022',
    lastActivity: '2 месяца назад',
    status: 'Активный'
  }
];

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'new'>(
    'all'
  );
  const { state } = useSidebar();

  // Динамически рассчитываем max-width в зависимости от состояния сайдбара
  const getMaxWidth = () => {
    if (state === 'collapsed') {
      return 'calc(100vw - 3rem - 2rem)'; // 3rem для свернутого сайдбара + 2rem отступы
    }
    return 'calc(100vw - 16rem - 2rem)'; // 16rem для развернутого сайдбара + 2rem отступы
  };

  // Фильтрация клиентов на основе поиска и статуса
  const filteredClients = clients.filter((client) => {
    // Поисковая фильтрация
    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch =
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone.toLowerCase().includes(query);
    }

    // Фильтрация по статусу
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = client.status === 'Активный';
    } else if (statusFilter === 'new') {
      matchesStatus = client.stage === 'Новый';
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <PageContainer>
      <div className='flex w-full max-w-full flex-col space-y-4'>
        {/* Заголовок и кнопки действий */}
        <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <div className='flex items-center gap-4'>
            <h1 className='text-xl font-semibold sm:text-2xl'>Клиенты</h1>

            {/* Переключатель видов */}
            <div className='flex items-center rounded-lg border p-1'>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('list')}
                className='h-8 w-8 p-0'
              >
                <IconList className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('kanban')}
                className='h-8 w-8 p-0'
              >
                <IconLayoutKanban className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <ClientActions />
        </div>

        {/* Поиск */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]'>
          <div className='relative'>
            <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
            <Input
              placeholder='Поиск клиентов...'
              className='pl-8'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Быстрые фильтры для обоих режимов */}
          <div className='hidden items-center gap-2 md:flex'>
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setStatusFilter('all')}
            >
              Все
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setStatusFilter('active')}
            >
              Активные
            </Button>
            <Button
              variant={statusFilter === 'new' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setStatusFilter('new')}
            >
              Новые
            </Button>
          </div>
        </div>

        {/* Контейнер с горизонтальной прокруткой для контента */}
        <div
          className='overflow-x-auto'
          style={{
            maxWidth: getMaxWidth()
          }}
        >
          <div className={viewMode === 'kanban' ? 'w-full' : 'min-w-[800px]'}>
            {/* Контент в зависимости от выбранного режима */}
            {viewMode === 'list' ? (
              <>
                {/* Таблица клиентов */}
                <ClientTable clients={filteredClients} />

                {/* Пагинация */}
                <div className='mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row'>
                  <div className='text-muted-foreground w-full text-center text-sm sm:w-auto sm:text-left'>
                    Показано {filteredClients.length} из {clients.length}{' '}
                    клиентов
                  </div>
                  <div className='flex w-full justify-center gap-1 sm:w-auto sm:justify-end'>
                    <Button variant='outline' size='sm' disabled>
                      Предыдущая
                    </Button>
                    <Button variant='outline' size='sm'>
                      Следующая
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Kanban доска */
              <KanbanBoard clients={filteredClients} />
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
