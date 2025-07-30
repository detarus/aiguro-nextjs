'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  IconPhone,
  IconClock,
  IconUser,
  IconPlus,
  IconChevronDown,
  IconChevronUp
} from '@tabler/icons-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Client } from './client-table';
import { useFunnels } from '@/contexts/FunnelsContext';
import { useOrganization } from '@clerk/nextjs';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface KanbanBoardProps {
  clients: Client[];
  onClientUpdate?: (updatedClient: Client) => void;
  onRefresh?: () => void;
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
      <CardContent className='px-2'>
        {/* Заголовок карточки с именем и статусом */}
        <div className='mb-2 flex items-center justify-between'>
          <div className='flex items-center'>
            <Avatar className='mr-2 h-6 w-6'>
              <AvatarImage src='' alt={client.name} />
              <AvatarFallback className='bg-gray-200 text-xs text-gray-600'>
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
        <div className='mb-1 max-h-[30px] min-h-[30px] overflow-hidden pt-0 text-xs text-gray-600'>
          {client.description || 'Описание отсутствует'}
        </div>

        {/* Цена и канал */}
        <div className='flex items-center justify-between'>
          <div className='text-2xl font-semibold text-gray-700'>
            {formattedPrice}
          </div>
          <div className='text-xl text-gray-500'>
            {/* {client.channel || 'Telegram'}   */}
            {client.closeRatio || 62}%
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
          {/* <div className='mt-1 text-right text-sm font-medium text-gray-600'>
            {client.closeRatio || 62}%
          </div> */}
        </div>

        {/* Кнопка открытия диалога */}
        {/* {client.dialogUuid && (
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
        )} */}

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
function KanbanColumn({
  stage,
  clients,
  stageIndex
}: {
  stage: Stage;
  clients: Client[];
  stageIndex: number;
}) {
  const router = useRouter();
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;
  const [isExpanded, setIsExpanded] = useState(false);

  // Обработчик для добавления нового диалога
  const handleAddDialog = () => {
    router.push(`/dashboard/messengers?new=true`);
  };

  // Обработчик для раскрытия/скрытия статистики
  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className='max-w-[320px] min-w-[300px] flex-1'>
      {/* Заголовок колонки */}
      <div className='mb-4 rounded-lg border border-gray-200'>
        <div className={`h-1 w-full rounded-t-lg ${stage.color}`} />
        <div className='bg-muted/50 relative rounded-b-lg px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div
              className='flex h-8 w-8 cursor-help items-center justify-center rounded-full border border-gray-300 bg-gray-100'
              title={
                stage.assistant_code_name
                  ? stage.assistant_code_name
                  : `Этап ${stage.title}`
              }
            >
              <span className='text-xs font-medium text-gray-700'>
                {stageIndex + 1}
              </span>
            </div>
            <div className='mx-3 flex-1 text-center'>
              <h2 className='text-sm font-semibold text-gray-700'>
                {stage.title}: 52%
              </h2>
              <p className='mt-1 text-xs text-gray-500'>
                На этапе: {clients.length} сделок
              </p>
            </div>
            <button
              className='flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-gray-100 transition-colors hover:bg-gray-200'
              onClick={handleToggleExpanded}
              title='Показать/скрыть статистику'
            >
              {isExpanded ? (
                <IconChevronUp className='h-4 w-4 text-gray-600' />
              ) : (
                <IconChevronDown className='h-4 w-4 text-gray-600' />
              )}
            </button>
          </div>

          {/* Расширенная статистика */}
          {isExpanded && (
            <div className='mt-4'>
              <Separator className='mb-4' />
              <div className='space-y-2'>
                <div className='hover:bg-muted/30 mb-0 flex items-center justify-between rounded-md p-2 transition-colors'>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-2 rounded-full bg-green-500'></div>
                    <span className='text-muted-foreground text-sm font-medium'>
                      Конверсия
                    </span>
                  </div>
                  <span className='text-sm font-semibold text-green-600'>
                    12.5%
                  </span>
                </div>

                <div className='hover:bg-muted/30 mb-0 flex items-center justify-between rounded-md p-2 transition-colors'>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                    <span className='text-muted-foreground text-sm font-medium'>
                      Среднее время
                    </span>
                  </div>
                  <span className='text-sm font-semibold text-blue-600'>
                    2.3 дня
                  </span>
                </div>

                <div className='hover:bg-muted/30 mb-0 flex items-center justify-between rounded-md p-2 transition-colors'>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-2 rounded-full bg-purple-500'></div>
                    <span className='text-muted-foreground text-sm font-medium'>
                      Общий доход
                    </span>
                  </div>
                  <span className='text-sm font-semibold text-purple-600'>
                    ₽847K
                  </span>
                </div>

                <div className='hover:bg-muted/30 mb-0 flex items-center justify-between rounded-md p-2 transition-colors'>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-2 rounded-full bg-orange-500'></div>
                    <span className='text-muted-foreground text-sm font-medium'>
                      Рост активности
                    </span>
                  </div>
                  <span className='text-sm font-semibold text-orange-600'>
                    +15%
                  </span>
                </div>

                <Separator className='my-3' />

                <div className='bg-muted/20 mb-0 flex items-center justify-between rounded-md p-2'>
                  <span className='text-foreground text-sm font-medium'>
                    Всего сделок
                  </span>
                  <span className='text-foreground text-sm font-bold'>
                    {clients.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Карточки клиентов */}
      <div className='space-y-3'>
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}

        {/* Кнопка добавления нового клиента */}
        {/* <Button
          variant='ghost'
          className='border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 h-12 w-full border-2 border-dashed'
          onClick={handleAddDialog}
        >
          <IconPlus className='mr-2 h-4 w-4' />
          Добавить диалог
        </Button> */}
      </div>
    </div>
  );
}

export function KanbanBoard({
  clients,
  onClientUpdate,
  onRefresh
}: KanbanBoardProps) {
  const { state } = useSidebar();
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;
  const { currentFunnel } = useFunnels();
  const [stages, setStages] = useState<Stage[]>([]);
  const [debug, setDebug] = useState<{
    stageIds: string[];
    stageCodeNames: Record<string, string | undefined>;
    clientStages: Record<string, number>;
    clientDetails: Array<{ id: number; name: string; stage: string }>;
  }>({ stageIds: [], stageCodeNames: {}, clientStages: {}, clientDetails: [] });
  const router = useRouter();

  // Инициализируем стадии
  useEffect(() => {
    // Используем дефолтные стадии
    setStages([
      { id: 'Новый', title: 'Новый', color: 'bg-blue-500' },
      { id: 'Квалификация', title: 'Квалификация', color: 'bg-orange-500' },
      { id: 'Переговоры', title: 'Переговоры', color: 'bg-yellow-500' },
      { id: 'Закрыто', title: 'Закрыто', color: 'bg-green-500' }
    ]);
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
      {/* {process.env.NODE_ENV !== 'production' && (
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
      )} */}

      {/* Контейнер с ограниченной шириной и горизонтальной прокруткой */}
      <div
        className='overflow-x-auto'
        style={{
          maxWidth: getMaxWidth()
        }}
      >
        <div className='flex gap-6 pb-4'>
          {stages.map((stage, index) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              clients={clientsByStage[stage.id] || []}
              stageIndex={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
