'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { IconPhone, IconClock, IconUser, IconPlus } from '@tabler/icons-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Client } from './client-table';
import { useFunnels } from '@/hooks/useFunnels';
import { useOrganization } from '@clerk/nextjs';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

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

// Функция для определения цвета стадии на основе индекса
const getStageColor = (index: number) => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-green-500',
    'bg-pink-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-rose-500',
    'bg-emerald-500',
    'bg-violet-500'
  ];
  return colors[index % colors.length];
};

// Компонент карточки клиента
function ClientCard({ client }: { client: Client }) {
  const statusColor = getStatusColor(client.status);
  const initials = getInitials(client.name);
  const router = useRouter();
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  // Форматируем цену для отображения
  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  })
    .format(client.price || 0)
    .replace('RUB', '₽');

  // Обработчик клика по карточке
  const handleCardClick = () => {
    if (client.dialogUuid) {
      router.push(`/dashboard/messengers?uuid=${client.dialogUuid}`);
    }
  };

  return (
    <Card
      className='mb-3 cursor-pointer transition-all hover:shadow-md'
      onClick={handleCardClick}
    >
      <CardContent className='px-4'>
        {/* Заголовок карточки с именем и статусом */}
        <div className='mb-2 flex items-center justify-between'>
          <div className='flex items-center'>
            <Avatar className='mr-2 h-8 w-8'>
              <AvatarImage src='' alt={client.name} />
              <AvatarFallback className='bg-gray-200 text-gray-600'>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className='font-medium'>{client.name}</div>
          </div>
          <div className='text-xs font-medium text-green-500'>
            {client.status === 'Активный' && '3 мин назад'}
          </div>
        </div>

        {/* Теги */}
        <div className='mb-2 flex flex-wrap gap-1'>
          {(client.tags || ['Новый клиент']).map((tag, index) => (
            <Badge
              key={index}
              variant='outline'
              className='bg-gray-100 text-gray-700 hover:bg-gray-200'
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Описание задачи */}
        <div className='mb-3 pt-3 text-xs text-gray-600'>
          {client.description || 'Описание отсутствует'}
        </div>

        {/* Цена и канал */}
        <div className='flex items-center justify-between'>
          <div className='text-2xl font-semibold text-gray-700'>
            {formattedPrice}
          </div>
          <div className='text-sm text-gray-500'>
            {client.channel || 'Telegram'}
          </div>
        </div>

        {/* Индикатор прогресса (берем из closeRatio) */}
        <div className='mt-2'>
          <div className='h-1.5 w-full rounded-full bg-gray-100'>
            <div
              className='h-1.5 rounded-full bg-green-500'
              style={{ width: `${client.closeRatio || 62}%` }}
            ></div>
          </div>
          <div className='mt-1 text-right text-sm font-medium text-gray-600'>
            {client.closeRatio || 62}%
          </div>
        </div>

        {/* Кнопка открытия диалога */}
        {client.dialogUuid && (
          <div className='mt-3 flex justify-end'>
            <Button
              variant='outline'
              size='sm'
              className='text-xs'
              onClick={(e) => {
                e.stopPropagation(); // Предотвращаем срабатывание клика по карточке
                router.push(`/dashboard/messengers?uuid=${client.dialogUuid}`);
              }}
            >
              Открыть диалог
            </Button>
          </div>
        )}

        {/* Отладочная информация */}
        {/* {process.env.NODE_ENV !== 'production' && (
          <div className='text-xs mt-1 text-blue-500'>
            Стадия: {client.stage || 'Не указана'}
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}

// Компонент колонки Kanban
function KanbanColumn({ stage, clients }: { stage: Stage; clients: Client[] }) {
  const router = useRouter();
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  // Обработчик для добавления нового диалога
  const handleAddDialog = () => {
    router.push(`/dashboard/messengers?new=true`);
  };

  return (
    <div className='max-w-[320px] min-w-[300px] flex-1'>
      {/* Заголовок колонки */}
      <div className='mb-4'>
        <div className={`h-1 w-full rounded-t-lg ${stage.color}`} />
        <div className='bg-muted/50 rounded-b-lg px-4 py-3'>
          <div className='flex items-center justify-between'>
            <h2 className='text-sm font-semibold text-gray-700'>
              {stage.title}
              {stage.assistant_code_name && (
                <span className='ml-2 text-xs font-normal text-gray-500'>
                  ({stage.assistant_code_name})
                </span>
              )}
            </h2>
            <Badge variant='outline' className='bg-gray-100 text-gray-600'>
              {clients.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Карточки клиентов */}
      <div className='space-y-3'>
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}

        {/* Кнопка добавления нового клиента */}
        <Button
          variant='ghost'
          className='border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 h-12 w-full border-2 border-dashed'
          onClick={handleAddDialog}
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
  const [debug, setDebug] = useState<{
    stageIds: string[];
    stageCodeNames: Record<string, string | undefined>;
    clientStages: Record<string, number>;
    clientDetails: Array<{ id: number; name: string; stage: string }>;
  }>({ stageIds: [], stageCodeNames: {}, clientStages: {}, clientDetails: [] });
  const router = useRouter();

  // Инициализируем стадии из данных воронки
  useEffect(() => {
    if (currentFunnel?.stages && currentFunnel.stages.length > 0) {
      // Создаем стадии из данных воронки
      const funnelStages: Stage[] = currentFunnel.stages.map((stage, index) => {
        // Если у стадии нет assistant_code_name, используем id в нижнем регистре в качестве assistant_code_name
        const assistant_code_name =
          stage.assistant_code_name && stage.assistant_code_name.trim() !== ''
            ? stage.assistant_code_name
            : stage.name.toLowerCase().replace(/\s+/g, '_');

        console.log(
          `Стадия ${stage.name}: assistant_code_name = ${assistant_code_name} (оригинал: ${stage.assistant_code_name || 'не задан'})`
        );

        return {
          id: stage.name,
          title: stage.name,
          color: getStageColor(index),
          assistant_code_name
        };
      });
      setStages(funnelStages);

      // Для отладки
      const stageCodeNames: Record<string, string | undefined> = {};
      funnelStages.forEach((stage) => {
        stageCodeNames[stage.id] = stage.assistant_code_name;

        // Отладка: проверяем, есть ли совпадения id стадии с assistant_code_name
        if (
          stage.assistant_code_name &&
          stage.id.toLowerCase() === stage.assistant_code_name.toLowerCase()
        ) {
          console.log(
            `ВНИМАНИЕ: Совпадение id и assistant_code_name для стадии ${stage.id}`
          );
        }
      });

      setDebug((prev) => ({
        ...prev,
        stageIds: funnelStages.map((s) => s.id),
        stageCodeNames
      }));
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

  // Собираем статистику по этапам клиентов для отладки
  useEffect(() => {
    const clientStages: Record<string, number> = {};
    const clientDetails: Array<{ id: number; name: string; stage: string }> =
      [];

    clients.forEach((client) => {
      if (!clientStages[client.stage]) {
        clientStages[client.stage] = 0;
      }
      clientStages[client.stage]++;

      // Добавляем детальную информацию о клиенте для отладки
      clientDetails.push({
        id: client.id,
        name: client.name,
        stage: client.stage
      });
    });

    setDebug((prev) => ({
      ...prev,
      clientStages,
      clientDetails
    }));
  }, [clients]);

  // Группируем клиентов по стадиям с учетом сопоставления stage с assistant_code_name
  const clientsByStage = useMemo(() => {
    const result: Record<string, Client[]> = {};

    // Инициализируем пустые массивы для каждой стадии
    stages.forEach((stage) => {
      result[stage.id] = [];
    });

    console.log('Распределение клиентов по стадиям:');
    console.log(
      'Стадии:',
      stages.map((s) => ({
        id: s.id,
        assistant_code_name: s.assistant_code_name
      }))
    );
    console.log(
      'Клиенты:',
      clients.map((c) => ({ id: c.id, name: c.name, stage: c.stage }))
    );

    // Распределяем клиентов по стадиям
    clients.forEach((client) => {
      // Проверяем, что у клиента есть стадия
      if (!client.stage) {
        console.log(
          `Клиент ${client.id} (${client.name}) - отсутствует стадия, добавляем в первую стадию ${stages[0]?.id || 'неизвестно'}`
        );
        if (stages.length > 0) {
          result[stages[0].id].push(client);
        }
        return;
      }

      // Ищем стадию по assistant_code_name (игнорируем регистр)
      const matchingStage = stages.find(
        (stage) =>
          stage.assistant_code_name &&
          stage.assistant_code_name.trim() !== '' &&
          stage.assistant_code_name.toLowerCase() === client.stage.toLowerCase()
      );

      if (matchingStage) {
        // Если нашли точное соответствие по assistant_code_name, добавляем в эту стадию
        console.log(
          `Клиент ${client.id} (${client.name}) - найдено точное соответствие по assistant_code_name: ${client.stage} -> стадия ${matchingStage.id}`
        );
        result[matchingStage.id].push(client);
      } else {
        // Если не нашли по assistant_code_name, проверяем точное соответствие по id (игнорируем регистр)
        const idMatchStage = stages.find(
          (stage) => stage.id.toLowerCase() === client.stage.toLowerCase()
        );

        if (idMatchStage) {
          // Если нашли точное соответствие по id, добавляем в эту стадию
          console.log(
            `Клиент ${client.id} (${client.name}) - найдено точное соответствие по id: ${client.stage} -> стадия ${idMatchStage.id}`
          );
          result[idMatchStage.id].push(client);
        } else {
          // Если не нашли точных соответствий, ищем частичное соответствие
          const partialMatch = stages.find(
            (stage) =>
              (stage.assistant_code_name &&
                stage.assistant_code_name
                  .toLowerCase()
                  .includes(client.stage.toLowerCase())) ||
              stage.id.toLowerCase().includes(client.stage.toLowerCase()) ||
              client.stage.toLowerCase().includes(stage.id.toLowerCase())
          );

          if (partialMatch) {
            console.log(
              `Клиент ${client.id} (${client.name}) - найдено частичное соответствие: ${client.stage} -> стадия ${partialMatch.id}`
            );
            result[partialMatch.id].push(client);
          } else if (stages.length > 0) {
            // Если не нашли соответствия, добавляем в первую стадию
            console.log(
              `Клиент ${client.id} (${client.name}) - не найдено соответствие для стадии ${client.stage}, добавляем в первую стадию ${stages[0].id}`
            );
            result[stages[0].id].push(client);
          }
        }
      }
    });

    return result;
  }, [stages, clients]);

  // Динамически рассчитываем max-width в зависимости от состояния сайдбара
  const getMaxWidth = () => {
    if (state === 'collapsed') {
      return 'calc(100vw - 3rem - 2rem)'; // 3rem для свернутого сайдбара + 2rem отступы
    }
    return 'calc(100vw - 16rem - 2rem)'; // 16rem для развернутого сайдбара + 2rem отступы
  };

  return (
    <div className='w-full'>
      {/* Отладочная информация */}
      {process.env.NODE_ENV !== 'production' && (
        <div className='mb-4 rounded border border-gray-200 p-4 text-xs'>
          <details>
            <summary className='cursor-pointer font-medium'>
              Отладочная информация
            </summary>
            <div className='mt-2 space-y-2'>
              <div>
                <div className='font-semibold'>Стадии из воронки:</div>
                <pre className='mt-1 rounded bg-gray-100 p-2 whitespace-pre-wrap'>
                  {JSON.stringify(debug.stageIds, null, 2)}
                </pre>
              </div>
              <div>
                <div className='font-semibold'>Коды ассистентов:</div>
                <pre className='mt-1 rounded bg-gray-100 p-2 whitespace-pre-wrap'>
                  {JSON.stringify(debug.stageCodeNames, null, 2)}
                </pre>
              </div>
              <div>
                <div className='font-semibold'>Стадии клиентов:</div>
                <pre className='mt-1 rounded bg-gray-100 p-2 whitespace-pre-wrap'>
                  {JSON.stringify(debug.clientStages, null, 2)}
                </pre>
              </div>
              <div>
                <div className='font-semibold'>
                  Детальная информация о клиентах:
                </div>
                <pre className='mt-1 rounded bg-gray-100 p-2 whitespace-pre-wrap'>
                  {JSON.stringify(debug.clientDetails, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </div>
      )}

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
