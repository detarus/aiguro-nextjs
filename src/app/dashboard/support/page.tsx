'use client';

import { useState, useMemo, useEffect } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  IconPlus,
  IconArrowRight,
  IconTicket,
  IconUpload,
  IconFile
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { usePageHeaderContext } from '@/contexts/PageHeaderContext';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/hooks/useFunnels';

// Типы данных
interface Ticket {
  id: string;
  subject: string;
  department: string;
  status: 'open' | 'in_progress' | 'waiting' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  messagesCount: number;
  funnelId?: string; // ID воронки или null для общих обращений
  funnelName?: string; // Название воронки
}

// Статичные данные для демонстрации
const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    subject: 'Проблема с загрузкой диалогов',
    department: 'technical',
    status: 'open',
    priority: 'high',
    createdAt: new Date('2024-12-20T10:30:00'),
    updatedAt: new Date('2024-12-20T14:15:00'),
    messagesCount: 3,
    funnelId: 'funnel-1',
    funnelName: 'Основная воронка'
  },
  {
    id: 'TKT-002',
    subject: 'Вопрос по настройке воронки продаж',
    department: 'sales',
    status: 'in_progress',
    priority: 'medium',
    createdAt: new Date('2024-12-19T16:20:00'),
    updatedAt: new Date('2024-12-20T09:45:00'),
    messagesCount: 7,
    funnelId: 'funnel-2',
    funnelName: 'Демо воронка'
  },
  {
    id: 'TKT-003',
    subject: 'Ошибка при создании нового этапа',
    department: 'technical',
    status: 'waiting',
    priority: 'medium',
    createdAt: new Date('2024-12-18T11:15:00'),
    updatedAt: new Date('2024-12-19T13:30:00'),
    messagesCount: 5,
    funnelId: 'funnel-1',
    funnelName: 'Основная воронка'
  },
  {
    id: 'TKT-004',
    subject: 'Запрос на увеличение лимитов',
    department: 'billing',
    status: 'closed',
    priority: 'low',
    createdAt: new Date('2024-12-17T14:00:00'),
    updatedAt: new Date('2024-12-18T10:20:00'),
    messagesCount: 4,
    funnelId: undefined, // Общее обращение
    funnelName: undefined
  },
  {
    id: 'TKT-005',
    subject: 'Интеграция с внешним CRM',
    department: 'technical',
    status: 'open',
    priority: 'urgent',
    createdAt: new Date('2024-12-20T08:45:00'),
    updatedAt: new Date('2024-12-20T12:10:00'),
    messagesCount: 2,
    funnelId: undefined, // Общее обращение
    funnelName: undefined
  },
  {
    id: 'TKT-006',
    subject: 'Настройка автоответчика',
    department: 'technical',
    status: 'open',
    priority: 'medium',
    createdAt: new Date('2024-12-20T15:30:00'),
    updatedAt: new Date('2024-12-20T16:00:00'),
    messagesCount: 1,
    funnelId: 'funnel-2',
    funnelName: 'Демо воронка'
  },
  {
    id: 'TKT-007',
    subject: 'Проблема с уведомлениями',
    department: 'technical',
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date('2024-12-20T12:00:00'),
    updatedAt: new Date('2024-12-20T14:30:00'),
    messagesCount: 4,
    funnelId: 'funnel-1',
    funnelName: 'Основная воронка'
  }
];

const departments = [
  { value: 'technical', label: 'Техническая поддержка' },
  { value: 'sales', label: 'Отдел продаж' },
  { value: 'billing', label: 'Биллинг' },
  { value: 'general', label: 'Общие вопросы' }
];

export default function SupportPage() {
  const router = useRouter();
  const { organization } = useOrganization();
  const [tickets] = useState<Ticket[]>(mockTickets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFunnelId, setSelectedFunnelId] =
    useState<string>('all-funnels');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    department: '',
    subject: '',
    description: '',
    files: [] as File[],
    funnelId: ''
  });

  // Получаем воронки
  const { currentFunnel, funnels, selectFunnel } = useFunnels(
    organization?.publicMetadata?.id_backend as string
  );

  const { updateConfig } = usePageHeaderContext();

  // Функция для получения названия департамента
  const getDepartmentName = (department: string) => {
    const dept = departments.find((d) => d.value === department);
    return dept ? dept.label : department;
  };

  // Настройка заголовка страницы
  useEffect(() => {
    const funnelsList =
      funnels?.map((funnel) => ({
        id: funnel.id,
        name: funnel.display_name || funnel.name || 'Без названия'
      })) || [];

    updateConfig({
      title: 'Поддержка',
      onSearch: setSearchQuery,
      searchValue: searchQuery,
      onFunnelChange: (funnelId: string) => {
        if (funnelId === 'add-funnel') {
          // Открытие модального окна создания воронки
        } else {
          setSelectedFunnelId(funnelId);
          if (funnelId !== 'all-funnels') {
            const selectedFunnel = funnels?.find((f) => f.id === funnelId);
            if (selectedFunnel) {
              selectFunnel(selectedFunnel);
            }
          }
        }
      },
      actions: {
        onExport: () => console.log('Export tickets'),
        onFilters: () => console.log('Toggle filters'),
        onView: () => setIsCreateModalOpen(true), // Кнопка "Создать обращение"
        onData: () => console.log('Refresh data')
      }
    });
  }, [searchQuery, funnels, updateConfig, selectFunnel]);

  // Фильтрация тикетов
  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    // Фильтр по поисковому запросу
    if (searchQuery) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getDepartmentName(ticket.department)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по воронке
    if (selectedFunnelId && selectedFunnelId !== 'all-funnels') {
      filtered = filtered.filter(
        (ticket) => ticket.funnelId === selectedFunnelId
      );
    }

    return filtered;
  }, [tickets, searchQuery, selectedFunnelId]);

  const getStatusBadge = (status: Ticket['status']) => {
    const statusConfig = {
      open: { label: 'Открыт', className: 'bg-blue-500 text-white' },
      in_progress: { label: 'В работе', className: 'bg-yellow-500 text-white' },
      waiting: { label: 'Ожидание', className: 'bg-orange-500 text-white' },
      closed: { label: 'Закрыт', className: 'bg-black text-white' }
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    const priorityConfig = {
      low: { label: 'Низкий', color: 'bg-green-100 text-green-700' },
      medium: { label: 'Средний', color: 'bg-yellow-100 text-yellow-700' },
      high: { label: 'Высокий', color: 'bg-orange-100 text-orange-700' },
      urgent: { label: 'Срочный', color: 'bg-red-100 text-red-700' }
    };

    const config = priorityConfig[priority];
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewTicket((prev) => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const removeFile = (index: number) => {
    setNewTicket((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleCreateTicket = () => {
    // Здесь будет логика создания тикета
    console.log('Creating ticket:', newTicket);
    setIsCreateModalOpen(false);
    setNewTicket({
      department: '',
      subject: '',
      description: '',
      files: [],
      funnelId: ''
    });
  };

  const openTicket = (ticketId: string) => {
    router.push(`/dashboard/support/${ticketId}`);
  };

  // Статистика тикетов (для отфильтрованных данных)
  const ticketStats = useMemo(() => {
    const stats = filteredTickets.reduce(
      (acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: filteredTickets.length,
      open: stats.open || 0,
      inProgress: stats.in_progress || 0,
      waiting: stats.waiting || 0,
      closed: stats.closed || 0
    };
  }, [filteredTickets]);

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Таблица тикетов - перенесена наверх */}
        <div>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold'>Ваши обращения</h2>
              <p className='text-muted-foreground text-sm'>
                {filteredTickets.length === tickets.length
                  ? `Всего обращений: ${tickets.length}`
                  : `Показано ${filteredTickets.length} из ${tickets.length} обращений`}
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <IconPlus className='mr-2 h-4 w-4' />
              Создать обращение
            </Button>
          </div>
          {filteredTickets.length === 0 ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <p className='text-muted-foreground mb-4'>
                  {searchQuery || selectedFunnelId !== 'all-funnels'
                    ? 'Обращения не найдены по заданным критериям'
                    : 'У вас пока нет обращений'}
                </p>
                {(searchQuery || selectedFunnelId !== 'all-funnels') && (
                  <Button
                    variant='outline'
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFunnelId('all-funnels');
                    }}
                  >
                    Сбросить фильтры
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Тема</TableHead>
                  <TableHead>Департамент</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Создано</TableHead>
                  <TableHead>Обновлено</TableHead>
                  <TableHead>Сообщений</TableHead>
                  <TableHead className='w-[60px]'>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className='font-mono text-sm'>
                      {ticket.id}
                    </TableCell>
                    <TableCell className='font-medium'>
                      {ticket.subject}
                    </TableCell>
                    <TableCell>
                      {getDepartmentName(ticket.department)}
                    </TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>
                      {format(ticket.createdAt, 'dd MMM yyyy HH:mm', {
                        locale: ru
                      })}
                    </TableCell>
                    <TableCell>
                      {format(ticket.updatedAt, 'dd MMM yyyy HH:mm', {
                        locale: ru
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>{ticket.messagesCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => openTicket(ticket.id)}
                      >
                        <IconArrowRight className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Статистические карточки - перенесены вниз */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Всего</CardTitle>
              <IconTicket className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{ticketStats.total}</div>
              <p className='text-muted-foreground text-xs'>
                {searchQuery || selectedFunnelId !== 'all-funnels'
                  ? 'По фильтру'
                  : 'Всего обращений'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Открыто</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {ticketStats.open}
              </div>
              <p className='text-muted-foreground text-xs'>Требуют внимания</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>В работе</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {ticketStats.inProgress}
              </div>
              <p className='text-muted-foreground text-xs'>Обрабатываются</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Ожидание</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>
                {ticketStats.waiting}
              </div>
              <p className='text-muted-foreground text-xs'>Ожидают ответа</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Закрыто</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {ticketStats.closed}
              </div>
              <p className='text-muted-foreground text-xs'>Решено</p>
            </CardContent>
          </Card>
        </div>

        {/* Модальное окно создания тикета */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Создать новое обращение</DialogTitle>
              <DialogDescription>
                Опишите вашу проблему, и мы поможем её решить
              </DialogDescription>
            </DialogHeader>

            <div className='grid gap-4 py-4'>
              <div className='grid w-full gap-2'>
                <Label htmlFor='funnel' className='w-full'>
                  Воронка
                </Label>
                <Select
                  value={newTicket.funnelId}
                  onValueChange={(value) =>
                    setNewTicket((prev) => ({ ...prev, funnelId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите воронку или оставьте пустым для общего обращения' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='general'>Общее обращение</SelectItem>
                    {funnels?.map((funnel) => (
                      <SelectItem key={funnel.id} value={funnel.id}>
                        {funnel.display_name || funnel.name || 'Без названия'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid w-full gap-2'>
                <Label htmlFor='department' className='w-full'>
                  Департамент
                </Label>
                <Select
                  value={newTicket.department}
                  onValueChange={(value) =>
                    setNewTicket((prev) => ({ ...prev, department: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите департамент' />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='subject'>Тема обращения</Label>
                <Input
                  id='subject'
                  placeholder='Кратко опишите проблему'
                  value={newTicket.subject}
                  onChange={(e) =>
                    setNewTicket((prev) => ({
                      ...prev,
                      subject: e.target.value
                    }))
                  }
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='description'>Описание проблемы</Label>
                <Textarea
                  id='description'
                  placeholder='Подробно опишите вашу проблему или вопрос'
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) =>
                    setNewTicket((prev) => ({
                      ...prev,
                      description: e.target.value
                    }))
                  }
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='files'>Прикрепить файлы</Label>
                <div className='flex items-center gap-2'>
                  <Input
                    id='files'
                    type='file'
                    multiple
                    accept='image/*,video/*,.pdf,.doc,.docx,.txt'
                    onChange={handleFileChange}
                    className='cursor-pointer'
                  />
                  <Button variant='outline' size='sm' asChild>
                    <label htmlFor='files' className='cursor-pointer'>
                      <IconUpload className='h-4 w-4' />
                    </label>
                  </Button>
                </div>

                {newTicket.files.length > 0 && (
                  <div className='space-y-2'>
                    {newTicket.files.map((file, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between rounded-md border p-2'
                      >
                        <div className='flex items-center gap-2'>
                          <IconFile className='h-4 w-4' />
                          <span className='text-sm'>{file.name}</span>
                          <span className='text-muted-foreground text-xs'>
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => removeFile(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsCreateModalOpen(false)}
              >
                Отмена
              </Button>
              <Button
                onClick={handleCreateTicket}
                disabled={
                  !newTicket.department ||
                  !newTicket.subject ||
                  !newTicket.description
                }
              >
                Создать обращение
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
