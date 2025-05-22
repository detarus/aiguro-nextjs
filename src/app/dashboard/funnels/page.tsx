'use client';

import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { IconSearch } from '@tabler/icons-react';

// Mock data based on the mockup
const funnels = [
  {
    id: '1',
    active: true,
    name: 'Воронка 1',
    date: '23-11-2024',
    channel: 'WhatsApp',
    composition: {
      blue: 1,
      yellow: 4,
      red: 2,
      green: 1
    },
    conversion: 25,
    goal: 'Встреча',
    responsible: 'Валерий Гуро'
  },
  {
    id: '2',
    active: false,
    name: 'Воронка 2',
    date: '23-11-2024',
    channel: 'WhatsApp',
    composition: {
      blue: 1,
      yellow: 4,
      red: 2,
      green: 0
    },
    conversion: 17,
    goal: 'Встреча',
    responsible: 'Валерий Гуро'
  },
  {
    id: '3',
    active: false,
    name: 'Воронка 3',
    date: '23-11-2024',
    channel: 'WhatsApp',
    composition: {
      blue: 1,
      yellow: 4,
      red: 2,
      green: 0
    },
    conversion: 17,
    goal: 'Встреча',
    responsible: 'Валерий Гуро'
  }
];

export default function FunnelsPage() {
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <PageContainer>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>Воронки</h1>
          <Button
            variant='outline'
            className='text-primary border-primary hover:bg-primary/10'
          >
            Инструкция
          </Button>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <div className='relative w-full sm:w-auto'>
            <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
            <Input
              placeholder='Поиск...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='h-9 pl-9'
            />
          </div>
          <Input
            type='date'
            placeholder='Начальная Дата'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className='h-9 w-full sm:w-auto'
          />
          <Input
            type='date'
            placeholder='Конечная Дата'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className='h-9 w-full sm:w-auto'
          />
        </div>

        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='hover:bg-transparent'>
                <TableHead className='w-[70px]'>Состояние</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Дата Создания</TableHead>
                <TableHead>Канал</TableHead>
                <TableHead>Состав</TableHead>
                <TableHead>Конверсия</TableHead>
                <TableHead>Цель</TableHead>
                <TableHead>Ответственный</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funnels.map((funnel) => (
                <TableRow key={funnel.id}>
                  <TableCell>
                    <Switch
                      checked={funnel.active}
                      onCheckedChange={() => {}}
                    />
                  </TableCell>
                  <TableCell className='font-medium'>{funnel.name}</TableCell>
                  <TableCell>{funnel.date}</TableCell>
                  <TableCell>{funnel.channel}</TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      <div className='flex items-center'>
                        <div className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-400 text-xs font-medium text-white'>
                          {funnel.composition.blue}
                        </div>
                      </div>
                      <div className='flex items-center'>
                        <div className='flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-xs font-medium text-white'>
                          {funnel.composition.yellow}
                        </div>
                      </div>
                      <div className='flex items-center'>
                        <div className='flex h-5 w-5 items-center justify-center rounded-full bg-red-400 text-xs font-medium text-white'>
                          {funnel.composition.red}
                        </div>
                      </div>
                      <div className='flex items-center'>
                        <div
                          className={`${funnel.composition.green > 0 ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-600'} flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white`}
                        >
                          {funnel.composition.green}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <div className='h-1.5 w-24 rounded-full bg-gray-100 dark:bg-gray-600'>
                        <div
                          className='h-1.5 rounded-full bg-green-400'
                          style={{ width: `${funnel.conversion}%` }}
                        ></div>
                      </div>
                      <span className='text-sm'>{funnel.conversion}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{funnel.goal}</TableCell>
                  <TableCell>{funnel.responsible}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageContainer>
  );
}
