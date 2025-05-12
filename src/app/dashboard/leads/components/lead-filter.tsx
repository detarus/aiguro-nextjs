'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface LeadFilterProps {
  activeFilter: string;
  onFilterChange: (value: string) => void;
}

// Define the filter options
const filterOptions = [
  { id: 'all', label: 'All Leads' },
  { id: 'hot', label: 'Hot Leads' },
  { id: 'cold', label: 'Cold Leads' },
  { id: 'warm', label: 'Warm Leads' },
  { id: 'new', label: 'New Interest' },
  { id: 'first', label: 'First Manager' }
];

export function LeadFilter({ activeFilter, onFilterChange }: LeadFilterProps) {
  return (
    <div className='bg-background rounded-md border p-1'>
      <ToggleGroup
        type='single'
        value={activeFilter}
        onValueChange={(value) => {
          if (value) onFilterChange(value);
        }}
        className='flex flex-wrap'
      >
        {filterOptions.map((option) => (
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
    </div>
  );
}
