'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  IconFilter,
  IconChevronDown,
  IconCalendar,
  IconAdjustmentsHorizontal
} from '@tabler/icons-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface ClientFiltersProps {
  options: {
    statuses: string[];
    stages: string[];
    assignees: string[];
    tabs: string[];
  };
  selectedTab: string;
  selectedStatus: string;
  selectedStage: string;
  selectedAssignee: string;
  onTabChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onAssigneeChange: (value: string) => void;
}

export function ClientFilters({
  options,
  selectedTab,
  selectedStatus,
  selectedStage,
  selectedAssignee,
  onTabChange,
  onStatusChange,
  onStageChange,
  onAssigneeChange
}: ClientFiltersProps) {
  const [openSheet, setOpenSheet] = useState(false);
  const [tempStatus, setTempStatus] = useState(selectedStatus);
  const [tempStage, setTempStage] = useState(selectedStage);
  const [tempAssignee, setTempAssignee] = useState(selectedAssignee);

  // Функция для применения фильтров и закрытия модального окна
  const applyFilters = () => {
    onStatusChange(tempStatus);
    onStageChange(tempStage);
    onAssigneeChange(tempAssignee);
    setOpenSheet(false);
  };

  // Функция для сброса фильтров
  const resetFilters = () => {
    setTempStatus('Все');
    setTempStage('Все');
    setTempAssignee('Все');
  };

  // Количество активных фильтров (исключая "Все")
  const activeFilters = [
    selectedStatus !== 'Все' ? 1 : 0,
    selectedStage !== 'Все' ? 1 : 0,
    selectedAssignee !== 'Все' ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className='space-y-3'>
      {/* Десктопная версия вкладок */}
      <div className='hidden sm:block'>
        <Tabs value={selectedTab} onValueChange={onTabChange}>
          <TabsList>
            {options.tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Мобильная версия вкладок */}
      <div className='w-full sm:hidden'>
        <Tabs
          value={selectedTab}
          onValueChange={onTabChange}
          className='w-full'
        >
          <TabsList className='grid w-full grid-cols-4'>
            {options.tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Фильтры селекты - десктопная версия */}
      <div className='hidden flex-wrap gap-2 md:flex'>
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className='w-[140px] sm:w-[180px]'>
            <IconFilter className='mr-2 h-4 w-4' />
            <SelectValue placeholder='Статус' />
          </SelectTrigger>
          <SelectContent>
            {options.statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStage} onValueChange={onStageChange}>
          <SelectTrigger className='w-[140px] sm:w-[180px]'>
            <IconChevronDown className='mr-2 h-4 w-4' />
            <SelectValue placeholder='Стадия' />
          </SelectTrigger>
          <SelectContent>
            {options.stages.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {stage}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedAssignee} onValueChange={onAssigneeChange}>
          <SelectTrigger className='w-[180px] sm:w-[220px]'>
            <IconChevronDown className='mr-2 h-4 w-4' />
            <SelectValue placeholder='Ответственный' />
          </SelectTrigger>
          <SelectContent>
            {options.assignees.map((assignee) => (
              <SelectItem key={assignee} value={assignee}>
                {assignee}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant='outline'>
          <IconCalendar className='mr-2 h-4 w-4' />
          Дата
        </Button>
      </div>

      {/* Мобильная версия фильтров (кнопка с модальным окном) */}
      <div className='flex items-center justify-between md:hidden'>
        <Sheet open={openSheet} onOpenChange={setOpenSheet}>
          <SheetTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center gap-2'
            >
              <IconAdjustmentsHorizontal className='h-4 w-4' />
              <span>Фильтры</span>
              {activeFilters > 0 && (
                <span className='bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs'>
                  {activeFilters}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side='bottom' className='h-[80vh] sm:h-[60vh]'>
            <SheetHeader>
              <SheetTitle>Фильтры клиентов</SheetTitle>
              <SheetDescription>
                Выберите параметры для фильтрации списка клиентов
              </SheetDescription>
            </SheetHeader>
            <div className='space-y-6 py-6'>
              <div className='space-y-2'>
                <Label htmlFor='status'>Статус</Label>
                <Select value={tempStatus} onValueChange={setTempStatus}>
                  <SelectTrigger id='status'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='stage'>Стадия</Label>
                <Select value={tempStage} onValueChange={setTempStage}>
                  <SelectTrigger id='stage'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.stages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='assignee'>Ответственный</Label>
                <Select value={tempAssignee} onValueChange={setTempAssignee}>
                  <SelectTrigger id='assignee'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.assignees.map((assignee) => (
                      <SelectItem key={assignee} value={assignee}>
                        {assignee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SheetFooter className='flex flex-row gap-3 sm:justify-between'>
              <Button
                variant='outline'
                onClick={resetFilters}
                className='flex-1'
              >
                Сбросить
              </Button>
              <Button onClick={applyFilters} className='flex-1'>
                Применить
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Индикаторы активных фильтров */}
        <div className='flex flex-wrap gap-1'>
          {selectedStatus !== 'Все' && (
            <Badge variant='secondary' className='text-xs'>
              {selectedStatus}
            </Badge>
          )}
          {selectedStage !== 'Все' && (
            <Badge variant='secondary' className='text-xs'>
              {selectedStage}
            </Badge>
          )}
          {selectedAssignee !== 'Все' && (
            <Badge
              variant='secondary'
              className='max-w-[120px] truncate text-xs'
            >
              {selectedAssignee}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
