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
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const [selectedClients, setSelectedClients] = useState<Set<number>>(
    new Set()
  );
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [editMode, setEditMode] = useState<Set<number>>(new Set());
  const [clientData, setClientData] = useState<Record<number, Partial<Client>>>(
    {}
  );

  const router = useRouter();

  const toggleClientSelection = (id: number) => {
    setSelectedClients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const deleteClient = (id: number) => {
    // Logic to visually hide the client row
    document
      .getElementById(`client-row-${id}`)
      ?.style.setProperty('display', 'none');
    setShowDeleteMessage(true);
    setTimeout(() => {
      setShowDeleteMessage(false);
    }, 3000);
  };

  const deleteSelectedClients = () => {
    selectedClients.forEach((id) => {
      deleteClient(id);
    });
    setSelectedClients(new Set());
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

  const handleClientChange = (
    id: number,
    field: keyof Client,
    value: string
  ) => {
    setClientData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const navigateToClientDetail = (id: number) => {
    router.push(`/dashboard/clients/${id}`);
  };

  useEffect(() => {
    // Initialize clientData with existing clients
    const initialData: Record<number, Partial<Client>> = {};
    clients.forEach((client) => {
      initialData[client.id] = { ...client };
    });
    setClientData(initialData);
  }, [clients]);

  return (
    <div className='overflow-hidden rounded-md border'>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[40px]'>
                <Checkbox
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedClients(
                        new Set(clients.map((client) => client.id))
                      );
                    } else {
                      setSelectedClients(new Set());
                    }
                  }}
                />
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
                <TableRow
                  key={client.id}
                  id={`client-row-${client.id}`}
                  className='group'
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedClients.has(client.id)}
                      onCheckedChange={() => toggleClientSelection(client.id)}
                    />
                  </TableCell>
                  <TableCell className='font-medium'>
                    {editMode.has(client.id) ? (
                      <input
                        type='text'
                        value={clientData[client.id]?.name || ''}
                        onChange={(e) =>
                          handleClientChange(client.id, 'name', e.target.value)
                        }
                        className='w-full rounded border p-1'
                      />
                    ) : (
                      <div>{client.name}</div>
                    )}
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
                        <DropdownMenuItem
                          onClick={() => navigateToClientDetail(client.id)}
                        >
                          Посмотреть
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleEditMode(client.id)}
                        >
                          {editMode.has(client.id)
                            ? 'Сохранить'
                            : 'Редактировать'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteClient(client.id)}
                        >
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {selectedClients.size > 0 && (
        <div className='fixed right-4 bottom-4'>
          <Button variant='destructive' onClick={deleteSelectedClients}>
            Удалить выбранные
          </Button>
        </div>
      )}
      {showDeleteMessage && (
        <div className='fixed right-4 bottom-16 rounded bg-green-500 p-2 text-white'>
          Элементы были удалены
        </div>
      )}
    </div>
  );
}
