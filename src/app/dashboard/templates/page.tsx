'use client';

import { Suspense } from 'react';
import { PageSkeleton } from '@/components/page-skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconTemplate,
  IconPlus,
  IconSearch,
  IconCopy,
  IconEdit,
  IconTrash
} from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/page-container';

export default function TemplatesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContainer scrollable={true}>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Готовые Шаблоны
            </h1>
            <p className='text-muted-foreground'>
              Управление шаблонами для различных типов сообщений и документов
            </p>
          </div>

          <div className='flex items-center justify-between'>
            <div className='relative max-w-sm flex-1'>
              <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
              <Input
                type='search'
                placeholder='Поиск шаблонов...'
                className='w-full pl-8'
              />
            </div>
            <Button>
              <IconPlus className='mr-2 h-4 w-4' />
              Новый шаблон
            </Button>
          </div>

          <Tabs defaultValue='message'>
            <TabsList className='grid w-full max-w-md grid-cols-3'>
              <TabsTrigger value='message'>Сообщения</TabsTrigger>
              <TabsTrigger value='document'>Документы</TabsTrigger>
              <TabsTrigger value='script'>Скрипты</TabsTrigger>
            </TabsList>

            <TabsContent value='message' className='space-y-6 pt-4'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {[
                  {
                    title: 'Приветственное сообщение',
                    description: 'Приветствие нового клиента',
                    category: 'WhatsApp',
                    status: 'Активный'
                  },
                  {
                    title: 'Подтверждение заказа',
                    description: 'Информация о принятом заказе',
                    category: 'SMS',
                    status: 'Активный'
                  },
                  {
                    title: 'Специальное предложение',
                    description: 'Акционное предложение для клиентов',
                    category: 'Email',
                    status: 'Черновик'
                  },
                  {
                    title: 'Напоминание о встрече',
                    description: 'Напоминание о предстоящей встрече',
                    category: 'Telegram',
                    status: 'Активный'
                  },
                  {
                    title: 'Опрос удовлетворенности',
                    description: 'Запрос обратной связи после оказания услуги',
                    category: 'WhatsApp',
                    status: 'Активный'
                  },
                  {
                    title: 'Возобновление общения',
                    description: 'Сообщение для неактивных клиентов',
                    category: 'Email',
                    status: 'Черновик'
                  }
                ].map((template, i) => (
                  <Card key={i}>
                    <CardHeader className='pb-3'>
                      <div className='flex items-center justify-between'>
                        <Badge variant='outline'>{template.category}</Badge>
                        <Badge
                          variant={
                            template.status === 'Активный'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {template.status}
                        </Badge>
                      </div>
                      <CardTitle className='pt-2'>{template.title}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='text-muted-foreground text-sm'>
                        {template.title === 'Приветственное сообщение' ? (
                          <>
                            Здравствуйте! Спасибо за обращение в нашу компанию.
                            Мы рады приветствовать вас...
                          </>
                        ) : template.title === 'Подтверждение заказа' ? (
                          <>
                            Ваш заказ #12345 успешно оформлен и принят в
                            обработку. Ожидаемая дата доставки...
                          </>
                        ) : template.title === 'Специальное предложение' ? (
                          <>
                            Только для вас! Специальное предложение на наши
                            услуги. Скидка 15% при заказе до...
                          </>
                        ) : template.title === 'Напоминание о встрече' ? (
                          <>
                            Напоминаем о встрече завтра в 15:00. Адрес: ул.
                            Примерная, 123. Будем рады видеть вас!
                          </>
                        ) : template.title === 'Опрос удовлетворенности' ? (
                          <>
                            Как вы оцениваете качество нашего обслуживания?
                            Пожалуйста, уделите минуту, чтобы...
                          </>
                        ) : (
                          <>
                            Давно не общались! У нас появились новые услуги,
                            которые могут вас заинтересовать...
                          </>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className='flex justify-end gap-2'>
                      <Button variant='outline' size='sm'>
                        <IconCopy className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='sm'>
                        <IconEdit className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='sm'>
                        <IconTrash className='h-4 w-4' />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='document' className='space-y-6 pt-4'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {[
                  {
                    title: 'Коммерческое предложение',
                    description: 'Стандартное коммерческое предложение',
                    category: 'PDF',
                    status: 'Активный'
                  },
                  {
                    title: 'Договор на услуги',
                    description: 'Типовой договор оказания услуг',
                    category: 'DOCX',
                    status: 'Активный'
                  },
                  {
                    title: 'Счет на оплату',
                    description: 'Шаблон счета для выставления клиентам',
                    category: 'PDF',
                    status: 'Активный'
                  },
                  {
                    title: 'Акт выполненных работ',
                    description: 'Документ о завершении работ',
                    category: 'DOCX',
                    status: 'Активный'
                  }
                ].map((template, i) => (
                  <Card key={i}>
                    <CardHeader className='pb-3'>
                      <div className='flex items-center justify-between'>
                        <Badge variant='outline'>{template.category}</Badge>
                        <Badge
                          variant={
                            template.status === 'Активный'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {template.status}
                        </Badge>
                      </div>
                      <CardTitle className='pt-2'>{template.title}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='bg-muted/50 flex items-center justify-center rounded-md border py-8'>
                        <IconTemplate className='text-muted-foreground h-12 w-12' />
                      </div>
                    </CardContent>
                    <CardFooter className='flex justify-end gap-2'>
                      <Button variant='outline' size='sm'>
                        <IconCopy className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='sm'>
                        <IconEdit className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='sm'>
                        <IconTrash className='h-4 w-4' />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='script' className='space-y-6 pt-4'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {[
                  {
                    title: 'Входящий звонок',
                    description: 'Скрипт ответа на входящий звонок',
                    category: 'Продажи',
                    status: 'Активный'
                  },
                  {
                    title: 'Холодный звонок',
                    description: 'Скрипт для первого контакта',
                    category: 'Продажи',
                    status: 'Активный'
                  },
                  {
                    title: 'Работа с возражениями',
                    description: 'Скрипт для обработки возражений',
                    category: 'Продажи',
                    status: 'Черновик'
                  }
                ].map((template, i) => (
                  <Card key={i}>
                    <CardHeader className='pb-3'>
                      <div className='flex items-center justify-between'>
                        <Badge variant='outline'>{template.category}</Badge>
                        <Badge
                          variant={
                            template.status === 'Активный'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {template.status}
                        </Badge>
                      </div>
                      <CardTitle className='pt-2'>{template.title}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='text-muted-foreground bg-muted/20 rounded-md border p-3 text-sm'>
                        {template.title === 'Входящий звонок' ? (
                          <>
                            1. Поприветствуйте клиента
                            <br />
                            2. Представьтесь
                            <br />
                            3. Уточните цель звонка
                            <br />
                            4. Предложите решение...
                          </>
                        ) : template.title === 'Холодный звонок' ? (
                          <>
                            1. Поздоровайтесь и представьтесь
                            <br />
                            2. Объясните причину звонка
                            <br />
                            3. Задайте вопрос о потребностях...
                          </>
                        ) : (
                          <>
                            1. Выслушайте возражение
                            <br />
                            2. Покажите понимание
                            <br />
                            3. Перефразируйте возражение
                            <br />
                            4. Предложите решение...
                          </>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className='flex justify-end gap-2'>
                      <Button variant='outline' size='sm'>
                        <IconCopy className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='sm'>
                        <IconEdit className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='sm'>
                        <IconTrash className='h-4 w-4' />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    </Suspense>
  );
}
