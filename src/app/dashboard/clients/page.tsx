'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconCalendar,
  IconChevronDown
} from '@tabler/icons-react';
import { ClientTable, Client } from './components/client-table';
import { ClientFilters } from './components/client-filters';
import { ClientActions } from './components/client-actions';

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
    stage: 'Переговоры',
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
    status: 'Отложен'
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
    stage: 'Квалификация',
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
    stage: 'Закрыто',
    created: '05 ноября 2022',
    lastActivity: '2 месяца назад',
    status: 'Активный'
  }
];

// Варианты для фильтров
const filterOptions = {
  statuses: ['Все', 'Активный', 'Неактивный', 'Отложен'],
  stages: ['Все', 'Новый', 'Квалификация', 'Переговоры', 'Закрыто'],
  assignees: [
    'Все',
    'Александр Петров',
    'Ольга Сидорова',
    'Михаил Кузнецов',
    'Елена Морозова',
    'Андрей Соколов',
    'Наталья Волкова',
    'Сергей Петров',
    'Ирина Смирнова'
  ],
  tabs: ['Все', 'Активные', 'Новые', 'Отложенные']
};

export default function ClientsPage() {
  const [selectedStatus, setSelectedStatus] = useState('Все');
  const [selectedStage, setSelectedStage] = useState('Все');
  const [selectedAssignee, setSelectedAssignee] = useState('Все');
  const [selectedTab, setSelectedTab] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтрация клиентов на основе выбранных фильтров
  const filteredClients = clients.filter((client) => {
    // Фильтр по вкладкам
    if (selectedTab === 'Активные' && client.status !== 'Активный') {
      return false;
    }
    if (selectedTab === 'Новые' && client.stage !== 'Новый') {
      return false;
    }
    if (selectedTab === 'Отложенные' && client.status !== 'Отложен') {
      return false;
    }

    // Фильтр по статусу
    if (selectedStatus !== 'Все' && client.status !== selectedStatus) {
      return false;
    }

    // Фильтр по стадии
    if (selectedStage !== 'Все' && client.stage !== selectedStage) {
      return false;
    }

    // Фильтр по ответственному
    if (selectedAssignee !== 'Все' && client.assignedTo !== selectedAssignee) {
      return false;
    }

    // Поиск по имени, email или телефону
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <PageContainer>
      <div className='flex w-full max-w-full flex-col space-y-4'>
        {/* Заголовок и кнопки действий */}
        <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <h1 className='text-xl font-semibold sm:text-2xl'>Клиенты</h1>
          <ClientActions />
        </div>

        {/* Поиск и фильтры */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]'>
          {/* Поиск */}
          <div className='relative'>
            <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
            <Input
              placeholder='Поиск клиентов...'
              className='pl-8'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Быстрые фильтры для десктопа */}
          <div className='hidden items-center gap-2 md:flex'>
            <Button
              variant={selectedTab === 'Все' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedTab('Все')}
            >
              Все
            </Button>
            <Button
              variant={selectedTab === 'Активные' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedTab('Активные')}
            >
              Активные
            </Button>
            <Button
              variant={selectedTab === 'Новые' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedTab('Новые')}
            >
              Новые
            </Button>
          </div>
        </div>

        {/* Фильтры */}
        <ClientFilters
          options={filterOptions}
          selectedTab={selectedTab}
          selectedStatus={selectedStatus}
          selectedStage={selectedStage}
          selectedAssignee={selectedAssignee}
          onTabChange={setSelectedTab}
          onStatusChange={setSelectedStatus}
          onStageChange={setSelectedStage}
          onAssigneeChange={setSelectedAssignee}
        />

        {/* Таблица клиентов */}
        <ClientTable clients={filteredClients} />

        {/* Пагинация */}
        <div className='flex flex-col items-center justify-between gap-3 sm:flex-row'>
          <div className='text-muted-foreground w-full text-center text-sm sm:w-auto sm:text-left'>
            Показано {filteredClients.length} из {clients.length} клиентов
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
      </div>
    </PageContainer>
  );
}
