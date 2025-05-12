'use client';

import { SearchInput } from './search-input';

interface LeadsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function LeadsHeader({ searchQuery, onSearchChange }: LeadsHeaderProps) {
  return (
    <div className='mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
      <h1 className='text-2xl font-bold'>Leads</h1>
      <div className='w-full md:w-1/3'>
        <SearchInput
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder='Search leads...'
          className='w-full'
        />
      </div>
    </div>
  );
}
