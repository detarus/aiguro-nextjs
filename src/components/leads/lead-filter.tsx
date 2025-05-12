'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadStatus, statusLabels } from './types';

interface LeadFilterProps {
  activeCategory: string;
  onCategoryChange: (value: string) => void;
  activeStatus: LeadStatus | 'all';
  onStatusChange: (value: LeadStatus | 'all') => void;
}

// Define the category filter options
const categoryOptions = [
  { id: 'all', label: 'All Leads' },
  { id: 'hot', label: 'Hot Leads' },
  { id: 'cold', label: 'Cold Leads' },
  { id: 'warm', label: 'Warm Leads' },
  { id: 'new', label: 'New Interest' },
  { id: 'first', label: 'First Manager' }
];

export function LeadFilter({ activeStatus, onStatusChange }: LeadFilterProps) {
  return (
    <div className='space-y-4'>
      {/* Category filter */}
      {/* <div className='bg-background rounded-md border p-1'>
        <ToggleGroup
          type='single'
          value={activeCategory}
          onValueChange={(value) => {
            if (value) onCategoryChange(value);
          }}
          className='flex flex-wrap'
        >
          {categoryOptions.map((option) => (
            <ToggleGroupItem
              key={option.id}
              value={option.id}
              aria-label={option.label}
              className='data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex-grow rounded-md px-3 py-2 text-sm'
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div> */}

      {/* Status filter */}
      <div className='bg-background rounded-md border p-1'>
        <Tabs
          value={activeStatus}
          onValueChange={(value) => onStatusChange(value as LeadStatus | 'all')}
          className='w-full'
        >
          <TabsList className='grid w-full grid-cols-6'>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='new'>{statusLabels.new}</TabsTrigger>
            <TabsTrigger value='processing'>
              {statusLabels.processing}
            </TabsTrigger>
            <TabsTrigger value='contacted'>
              {statusLabels.contacted}
            </TabsTrigger>
            <TabsTrigger value='qualified'>
              {statusLabels.qualified}
            </TabsTrigger>
            <TabsTrigger value='closed'>{statusLabels.closed}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
