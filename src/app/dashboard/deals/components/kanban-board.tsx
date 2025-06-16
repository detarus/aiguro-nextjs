'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { IconPhone, IconClock, IconUser, IconPlus } from '@tabler/icons-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Client } from './client-table';
import { useFunnels } from '@/hooks/useFunnels';
import { useOrganization } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

interface KanbanBoardProps {
  clients: Client[];
}

interface Stage {
  id: string;
  title: string;
  color: string;
  assistant_code_name?: string;
}

// Функция для получения инициалов из имени
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Функция для получения цвета статуса
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Активный':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'Неактивный':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    case 'Отложен':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
  }
};

// Функция для получения цвета этапа
const getStageColor = (index: number) => {
  const colors = [
    'bg-blue-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500'
  ];
  return colors[index % colors.length];
};

// Компонент карточки клиента
function ClientCard({ client }: { client: Client }) {
  return (
    <Card className='mb-3 cursor-pointer transition-all hover:shadow-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-3'>
            <Avatar className='h-10 w-10'>
              <AvatarFallback className='bg-primary/10 text-primary text-sm font-medium'>
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <h3 className='truncate text-sm font-medium'>{client.name}</h3>
              <p className='text-muted-foreground truncate text-xs'>
                {client.email}
              </p>
            </div>
          </div>
          <Badge
            variant='secondary'
            className={`text-xs ${getStatusColor(client.status)}`}
          >
            {client.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-3 pt-0'>
        <div className='space-y-2'>
          <div className='text-muted-foreground flex items-center text-xs'>
            <IconPhone className='mr-2 h-3 w-3 flex-shrink-0' />
            <span className='truncate'>{client.phone}</span>
          </div>
          <div className='text-muted-foreground flex items-center text-xs'>
            <IconUser className='mr-2 h-3 w-3 flex-shrink-0' />
            <span className='truncate'>{client.assignedTo}</span>
          </div>
          <div className='text-muted-foreground flex items-center text-xs'>
            <IconClock className='mr-2 h-3 w-3 flex-shrink-0' />
            <span className='truncate'>{client.lastActivity}</span>
          </div>
          {client.messagesCount !== undefined && (
            <div className='text-muted-foreground flex flex-col text-xs'>
              <div className='font-medium'>
                Сообщений: {client.messagesCount}
              </div>
              {client.lastMessage && (
                <div className='text-muted-foreground max-w-[200px] truncate text-xs'>
                  {client.lastMessage}
                </div>
              )}
              {client.closeRatio !== undefined && (
                <div className='mt-1'>
                  <div className='text-xs font-medium'>
                    Вероятность: {client.closeRatio}%
                  </div>
                  <div className='mt-1 h-1.5 w-full rounded-full bg-gray-200'>
                    <div
                      className='h-1.5 rounded-full bg-green-500'
                      style={{
                        width: `${Math.max(0, Math.min(100, client.closeRatio))}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className='text-muted-foreground text-xs'>
          Создан: {client.created}
        </div>
        <div className='text-right'>
          <span className='text-lg font-semibold'>
            ID: {client.dialogUuid || 'N/A'}
          </span>
          <div className='text-muted-foreground text-xs'>Dialog ID</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Компонент колонки Kanban
function KanbanColumn({ stage, clients }: { stage: Stage; clients: Client[] }) {
  return (
    <div className='max-w-[320px] min-w-[280px] flex-1'>
      {/* Заголовок колонки */}
      <div className='mb-4'>
        <div className={`h-1 w-full rounded-t-lg ${stage.color}`} />
        <div className='bg-muted/50 rounded-b-lg px-4 py-3'>
          <h2 className='text-muted-foreground text-center text-sm font-semibold'>
            {stage.title}
            {stage.assistant_code_name && (
              <div className='mt-1 text-xs font-normal opacity-75'>
                {stage.assistant_code_name}
              </div>
            )}
          </h2>
        </div>
      </div>

      {/* Карточки клиентов */}
      <div className='space-y-0'>
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}

        {/* Кнопка добавления нового клиента */}
        <Button
          variant='ghost'
          className='border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 h-12 w-full border-2 border-dashed'
        >
          <IconPlus className='mr-2 h-4 w-4' />
          Добавить диалог
        </Button>
      </div>
    </div>
  );
}

export function KanbanBoard({ clients }: KanbanBoardProps) {
  const { state } = useSidebar();
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;
  const { currentFunnel } = useFunnels(backendOrgId);
  const [stages, setStages] = useState<Stage[]>([]);

  // Инициализируем стадии из данных воронки
  useEffect(() => {
    if (currentFunnel?.stages && currentFunnel.stages.length > 0) {
      // Создаем стадии из данных воронки
      const funnelStages: Stage[] = currentFunnel.stages.map(
        (stage, index) => ({
          id: stage.name,
          title: stage.name,
          color: getStageColor(index),
          assistant_code_name: stage.assistant_code_name
        })
      );
      setStages(funnelStages);
    } else {
      // Используем дефолтные стадии, если нет данных в воронке
      setStages([
        { id: 'Новый', title: 'Новый', color: 'bg-blue-500' },
        { id: 'Квалификация', title: 'Квалификация', color: 'bg-orange-500' },
        { id: 'Переговоры', title: 'Переговоры', color: 'bg-yellow-500' },
        { id: 'Закрыто', title: 'Закрыто', color: 'bg-green-500' }
      ]);
    }
  }, [currentFunnel]);

  // Группируем клиентов по стадиям
  const clientsByStage = stages.reduce(
    (acc, stage) => {
      acc[stage.id] = clients.filter((client) => client.stage === stage.id);
      return acc;
    },
    {} as Record<string, Client[]>
  );

  // Динамически рассчитываем max-width в зависимости от состояния сайдбара
  const getMaxWidth = () => {
    if (state === 'collapsed') {
      return 'calc(100vw - 3rem - 2rem)'; // 3rem для свернутого сайдбара + 2rem отступы
    }
    return 'calc(100vw - 16rem - 2rem)'; // 16rem для развернутого сайдбара + 2rem отступы
  };

  return (
    <div className='w-full'>
      {/* Контейнер с ограниченной шириной и горизонтальной прокруткой */}
      <div
        className='overflow-x-auto'
        style={{
          maxWidth: getMaxWidth()
        }}
      >
        <div className='flex min-w-[1400px] gap-6 pb-4'>
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              clients={clientsByStage[stage.id] || []}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
