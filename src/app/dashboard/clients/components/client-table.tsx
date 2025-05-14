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
import { IconDotsVertical } from '@tabler/icons-react';

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
}

interface ClientTableProps {
  clients: Client[];
}

export function ClientTable({ clients }: ClientTableProps) {
  return (
    <div className='overflow-hidden rounded-md border'>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[40px]'>
                <Checkbox />
              </TableHead>
              <TableHead className='min-w-[150px]'>Имя</TableHead>
              <TableHead className='hidden min-w-[120px] md:table-cell'>
                Телефон
              </TableHead>
              <TableHead className='hidden min-w-[150px] lg:table-cell'>
                Email
              </TableHead>
              <TableHead className='hidden min-w-[150px] xl:table-cell'>
                Ответственный
              </TableHead>
              <TableHead className='min-w-[100px]'>Стадия</TableHead>
              <TableHead className='hidden lg:table-cell'>Создан</TableHead>
              <TableHead className='hidden min-w-[150px] md:table-cell'>
                Последняя активность
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
                  Клиенты не найдены
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className='group'>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell className='font-medium'>
                    <div>{client.name}</div>
                    <div className='text-muted-foreground mt-1 text-xs md:hidden'>
                      {client.phone}
                    </div>
                    <div className='text-muted-foreground mt-1 max-w-[150px] truncate text-xs md:hidden lg:hidden'>
                      {client.email}
                    </div>
                  </TableCell>
                  <TableCell className='hidden md:table-cell'>
                    {client.phone}
                  </TableCell>
                  <TableCell className='hidden lg:table-cell'>
                    {client.email}
                  </TableCell>
                  <TableCell className='hidden xl:table-cell'>
                    {client.assignedTo}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        client.stage === 'Новый'
                          ? 'default'
                          : client.stage === 'Квалификация'
                            ? 'secondary'
                            : client.stage === 'Переговоры'
                              ? 'outline'
                              : 'success'
                      }
                    >
                      {client.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className='hidden lg:table-cell'>
                    {client.created}
                  </TableCell>
                  <TableCell className='hidden md:table-cell'>
                    {client.lastActivity}
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
                        <DropdownMenuItem>Просмотреть профиль</DropdownMenuItem>
                        <DropdownMenuItem>Редактировать</DropdownMenuItem>
                        <DropdownMenuItem>Отправить сообщение</DropdownMenuItem>
                        <DropdownMenuItem>Удалить</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
