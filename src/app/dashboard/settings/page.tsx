'use client';

import { Suspense } from 'react';
import { PageSkeleton } from '@/components/page-skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { IconSettings } from '@tabler/icons-react';
import { PageContainer } from '@/components/ui/page-container';

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContainer>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Настройки</h1>
            <p className='text-muted-foreground'>
              Управление настройками системы и профиля
            </p>
          </div>

          <Tabs defaultValue='general'>
            <TabsList className='grid w-full max-w-md grid-cols-3'>
              <TabsTrigger value='general'>Общие</TabsTrigger>
              <TabsTrigger value='notifications'>Уведомления</TabsTrigger>
              <TabsTrigger value='appearance'>Внешний вид</TabsTrigger>
            </TabsList>

            <TabsContent value='general' className='space-y-6 pt-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Общие настройки</CardTitle>
                  <CardDescription>
                    Основные параметры учетной записи
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>Название организации</Label>
                    <Input id='name' defaultValue='Guro AI' />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email для связи</Label>
                    <Input
                      id='email'
                      type='email'
                      defaultValue='contact@guroai.ru'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='timezone'>Часовой пояс</Label>
                    <Select defaultValue='Europe/Moscow'>
                      <SelectTrigger id='timezone'>
                        <SelectValue placeholder='Выберите часовой пояс' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Часовые пояса</SelectLabel>
                          <SelectItem value='Europe/Moscow'>
                            Москва (GMT+3)
                          </SelectItem>
                          <SelectItem value='Europe/Kaliningrad'>
                            Калининград (GMT+2)
                          </SelectItem>
                          <SelectItem value='Asia/Yekaterinburg'>
                            Екатеринбург (GMT+5)
                          </SelectItem>
                          <SelectItem value='Asia/Novosibirsk'>
                            Новосибирск (GMT+7)
                          </SelectItem>
                          <SelectItem value='Asia/Vladivostok'>
                            Владивосток (GMT+10)
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='language'>Язык интерфейса</Label>
                    <Select defaultValue='ru'>
                      <SelectTrigger id='language'>
                        <SelectValue placeholder='Выберите язык' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='ru'>Русский</SelectItem>
                        <SelectItem value='en'>English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='flex justify-end'>
                    <Button>Сохранить изменения</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Безопасность</CardTitle>
                  <CardDescription>
                    Настройки безопасности аккаунта
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>
                          Двухфакторная аутентификация
                        </h3>
                        <p className='text-muted-foreground text-sm'>
                          Включите для повышения безопасности аккаунта
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>Сессии устройств</h3>
                        <p className='text-muted-foreground text-sm'>
                          Управление активными сессиями
                        </p>
                      </div>
                      <Button variant='outline' size='sm'>
                        Управление
                      </Button>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>Изменить пароль</h3>
                        <p className='text-muted-foreground text-sm'>
                          Обновление пароля доступа
                        </p>
                      </div>
                      <Button variant='outline' size='sm'>
                        Изменить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='notifications' className='space-y-6 pt-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Настройки уведомлений</CardTitle>
                  <CardDescription>
                    Управление уведомлениями в системе
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>Email уведомления</h3>
                        <p className='text-muted-foreground text-sm'>
                          Отправка уведомлений на email
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>Браузерные уведомления</h3>
                        <p className='text-muted-foreground text-sm'>
                          Показ уведомлений в браузере
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>SMS-уведомления</h3>
                        <p className='text-muted-foreground text-sm'>
                          Отправка критичных уведомлений по SMS
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>Telegram-уведомления</h3>
                        <p className='text-muted-foreground text-sm'>
                          Отправка уведомлений в Telegram
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Категории уведомлений</CardTitle>
                  <CardDescription>
                    Настройте типы событий для уведомлений
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>Новые сообщения</h3>
                        <p className='text-muted-foreground text-sm'>
                          Уведомления о входящих сообщениях
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>Задачи</h3>
                        <p className='text-muted-foreground text-sm'>
                          Уведомления о новых и завершенных задачах
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>Системные события</h3>
                        <p className='text-muted-foreground text-sm'>
                          Уведомления о системных событиях
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>Маркетинговые материалы</h3>
                        <p className='text-muted-foreground text-sm'>
                          Новости и обновления сервиса
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='appearance' className='space-y-6 pt-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Тема оформления</CardTitle>
                  <CardDescription>
                    Настройка внешнего вида интерфейса
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-3 gap-4'>
                    <div className='flex flex-col items-center gap-2'>
                      <div className='border-primary bg-background aspect-video w-full overflow-hidden rounded-md border p-2'>
                        <div className='bg-primary h-3 w-3/4 rounded-sm'></div>
                        <div className='bg-muted mt-2 h-2 w-1/2 rounded-sm'></div>
                        <div className='bg-muted mt-1 h-2 w-1/2 rounded-sm'></div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Switch id='light' aria-label='Светлая тема' />
                        <Label htmlFor='light'>Светлая</Label>
                      </div>
                    </div>
                    <div className='flex flex-col items-center gap-2'>
                      <div className='border-primary aspect-video w-full overflow-hidden rounded-md border bg-zinc-950 p-2'>
                        <div className='bg-primary h-3 w-3/4 rounded-sm'></div>
                        <div className='mt-2 h-2 w-1/2 rounded-sm bg-zinc-800'></div>
                        <div className='mt-1 h-2 w-1/2 rounded-sm bg-zinc-800'></div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Switch
                          id='dark'
                          defaultChecked
                          aria-label='Темная тема'
                        />
                        <Label htmlFor='dark'>Темная</Label>
                      </div>
                    </div>
                    <div className='flex flex-col items-center gap-2'>
                      <div className='border-primary aspect-video w-full overflow-hidden rounded-md border bg-zinc-950 p-2'>
                        <div className='h-3 w-3/4 rounded-sm bg-indigo-500'></div>
                        <div className='mt-2 h-2 w-1/2 rounded-sm bg-zinc-800'></div>
                        <div className='mt-1 h-2 w-1/2 rounded-sm bg-zinc-800'></div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Switch id='system' aria-label='Системная тема' />
                        <Label htmlFor='system'>Системная</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Цветовая схема</CardTitle>
                  <CardDescription>
                    Выберите основной цвет интерфейса
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-6 gap-4'>
                    {[
                      { color: 'bg-blue-600', name: 'Синий' },
                      { color: 'bg-green-600', name: 'Зеленый' },
                      { color: 'bg-red-600', name: 'Красный' },
                      { color: 'bg-yellow-600', name: 'Желтый' },
                      { color: 'bg-purple-600', name: 'Фиолетовый' },
                      { color: 'bg-zinc-600', name: 'Серый' }
                    ].map((theme, i) => (
                      <div key={i} className='flex flex-col items-center gap-2'>
                        <button
                          className={`h-12 w-12 rounded-full ${theme.color} ${i === 0 ? 'ring-primary ring-2 ring-offset-2' : ''}`}
                          title={theme.name}
                        />
                        <span className='text-xs'>{theme.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    </Suspense>
  );
}
