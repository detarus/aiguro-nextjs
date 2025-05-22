'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageSkeleton } from '@/components/page-skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { IconMessage, IconDotsVertical } from '@tabler/icons-react';
import { PageContainer } from '@/components/ui/page-container';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function MessengersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabParam === 'outgoing' ? 'outgoing' : 'incoming'
  );
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [editMode, setEditMode] = useState<Set<number>>(new Set());
  const [requests, setRequests] = useState<Record<number, string>>({
    1: 'хочет интегрировать систему в свой бизнес по продаже автомобилей',
    2: 'хочет интегрировать систему в свой бизнес по продаже автомобилей',
    3: 'хочет интегрировать систему в свой бизнес по продаже автомобилей',
    4: 'хочет интегрировать систему в свой бизнес по продаже автомобилей',
    5: 'хочет интегрировать систему в свой бизнес по продаже автомобилей'
  });
  const [stages, setStages] = useState<Record<number, string>>({
    1: 'Знакомство',
    2: 'Квалификация',
    3: 'Презентация',
    4: 'Закрытие',
    5: 'Знакомство'
  });

  const toggleRowSelection = (id: number) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const deleteRow = (id: number) => {
    const row = document.getElementById(`row-${id}`);
    if (row) {
      row.style.transition = 'opacity 0.5s ease-out';
      row.style.opacity = '0';
      setTimeout(() => {
        row.style.display = 'none';
        setShowDeleteMessage(true);
        setTimeout(() => {
          setShowDeleteMessage(false);
        }, 3000);
      }, 500);
    }
  };

  const deleteSelectedRows = () => {
    selectedRows.forEach((id: number) => {
      deleteRow(id);
    });
    setSelectedRows(new Set());
  };

  const toggleEditMode = (id: number) => {
    setEditMode((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleRequestChange = (id: number, value: string) => {
    setRequests((prev) => ({ ...prev, [id]: value }));
  };

  const handleStageChange = (id: number, value: string) => {
    setStages((prev) => ({ ...prev, [id]: value }));
  };

  const navigateToChat = (id: number) => {
    router.push(`/dashboard/messengers/${id}/chat`);
  };

  // Update the tab when URL parameters change
  useEffect(() => {
    if (tabParam === 'outgoing' || tabParam === 'incoming') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContainer scrollable={true}>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Мессенджеры</h1>
            <p className='text-muted-foreground'>
              Управление сообщениями из различных мессенджеров
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className='mb-4 flex items-center justify-between'>
              <TabsList className='flex gap-4'>
                <TabsTrigger value='incoming'>Входящие</TabsTrigger>
                <TabsTrigger value='outgoing'>Исходящие</TabsTrigger>
              </TabsList>
              <div className='flex gap-2'>
                <Button variant='outline'>Экспорт CSV</Button>
                <Button variant='outline'>Экспорт PDF</Button>
              </div>
            </div>
            <TabsContent value='incoming' className='space-y-6 pt-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Диалоги с клиентами</CardTitle>
                  <CardDescription>
                    Управление всеми входящими сообщениями
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='overflow-hidden rounded-md border'>
                    <div className='overflow-x-auto'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className='w-[40px]'>
                              <Checkbox
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedRows(new Set([1, 2, 3, 4, 5]));
                                  } else {
                                    setSelectedRows(new Set());
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead className='max-w-[100px] text-xs'>
                              Дата и время
                            </TableHead>
                            <TableHead className='max-w-[100px] text-xs'>
                              Посл. Событие
                            </TableHead>
                            <TableHead className='max-w-[80px] text-xs'>
                              Канал
                            </TableHead>
                            <TableHead className='max-w-[120px] text-xs'>
                              Контакт
                            </TableHead>
                            <TableHead className='max-w-[200px] text-xs break-words'>
                              Запрос
                            </TableHead>
                            <TableHead className='max-w-[100px] text-xs'>
                              Вероятность
                            </TableHead>
                            <TableHead className='max-w-[60px] text-xs'>
                              AI/M
                            </TableHead>
                            <TableHead className='max-w-[200px] text-xs break-words'>
                              Этап воронки
                            </TableHead>
                            <TableHead className='text-right'>
                              Действия
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <TableRow key={i} id={`row-${i}`} className='group'>
                              <TableCell className='w-[40px]'>
                                <Checkbox
                                  checked={selectedRows.has(i)}
                                  onCheckedChange={() => toggleRowSelection(i)}
                                />
                              </TableCell>
                              <TableCell className='max-w-[100px] text-xs'>
                                23-11-2024 15:11
                              </TableCell>
                              <TableCell className='max-w-[100px] text-xs'>
                                23-11-2024 15:11
                              </TableCell>
                              <TableCell className='max-w-[80px] text-xs'>
                                WhatsApp
                              </TableCell>
                              <TableCell className='max-w-[120px] text-xs'>
                                +79999999999
                              </TableCell>
                              <TableCell className='max-w-[200px] text-xs break-words'>
                                {editMode.has(i) ? (
                                  <textarea
                                    value={requests[i]}
                                    onChange={(e) =>
                                      handleRequestChange(i, e.target.value)
                                    }
                                    className='w-full rounded border p-1'
                                  />
                                ) : (
                                  requests[i]
                                )}
                              </TableCell>
                              <TableCell className='max-w-[100px] text-xs'>
                                <div className='flex items-center'>
                                  <Progress value={65} />
                                  <span className='ml-2'>{65}%</span>
                                </div>
                              </TableCell>
                              <TableCell className='max-w-[60px] text-xs'>
                                <Switch defaultChecked />
                              </TableCell>
                              <TableCell className='max-w-[200px] text-xs break-words'>
                                {editMode.has(i) ? (
                                  <select
                                    value={stages[i]}
                                    onChange={(e) =>
                                      handleStageChange(i, e.target.value)
                                    }
                                    className='w-full rounded border p-1'
                                  >
                                    <option value='Знакомство'>
                                      Знакомство
                                    </option>
                                    <option value='Квалификация'>
                                      Квалификация
                                    </option>
                                    <option value='Презентация'>
                                      Презентация
                                    </option>
                                    <option value='Закрытие'>Закрытие</option>
                                  </select>
                                ) : (
                                  stages[i]
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
                                    <DropdownMenuItem
                                      onClick={() => navigateToChat(i)}
                                    >
                                      Посмотреть
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => toggleEditMode(i)}
                                    >
                                      {editMode.has(i)
                                        ? 'Сохранить'
                                        : 'Редактировать'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => deleteRow(i)}
                                    >
                                      Удалить
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Статистика обращений</CardTitle>
                  <CardDescription>
                    Статистика по входящим сообщениям
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>124</div>
                      <div className='text-muted-foreground text-sm'>
                        Всего за сегодня
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>98%</div>
                      <div className='text-muted-foreground text-sm'>
                        Отвечено
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>3.2 мин</div>
                      <div className='text-muted-foreground text-sm'>
                        Среднее время ответа
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='outgoing' className='space-y-6 pt-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Исходящие сообщения</CardTitle>
                  <CardDescription>
                    Управление всеми исходящими сообщениями
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className='flex items-start gap-4 rounded-lg border p-4'
                      >
                        <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                          <IconMessage className='text-primary h-5 w-5' />
                        </div>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-medium'>Рассылка #{i}</h3>
                            <Badge variant='outline'>Telegram</Badge>
                            <span className='text-muted-foreground text-xs'>
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>
                          <p className='text-muted-foreground text-sm'>
                            Уважаемые клиенты! Сообщаем о новых услугах в нашей
                            компании...
                          </p>
                          <div className='flex gap-2 text-xs'>
                            <span>Отправлено: 145</span>
                            <span>Доставлено: 142</span>
                            <span>Прочитано: 98</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Статистика рассылок</CardTitle>
                  <CardDescription>
                    Эффективность исходящих сообщений
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>14</div>
                      <div className='text-muted-foreground text-sm'>
                        Активных кампаний
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>1,245</div>
                      <div className='text-muted-foreground text-sm'>
                        Отправлено за месяц
                      </div>
                    </div>
                    <div className='rounded-lg border p-4'>
                      <div className='text-xl font-bold'>18%</div>
                      <div className='text-muted-foreground text-sm'>
                        Средний отклик
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        {selectedRows.size > 0 && (
          <div className='fixed right-4 bottom-4'>
            <Button variant='destructive' onClick={deleteSelectedRows}>
              Удалить выбранные
            </Button>
          </div>
        )}
        {showDeleteMessage && (
          <div className='fixed right-4 bottom-16 rounded bg-green-500 p-2 text-white'>
            Элементы были удалены
          </div>
        )}
      </PageContainer>
    </Suspense>
  );
}
