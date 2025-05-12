'use client';

import { useState } from 'react';
import { LeadsGrid } from './leads-grid';
import { LeadFilter } from './lead-filter';
import { LeadCalendar } from './lead-calendar';
import { LeadsHeader } from './leads-header';

// Define Lead types
export interface Lead {
  id: string;
  name: string;
  category: string;
  date: string;
  request: string;
  price: number;
  status: 'new' | 'processing' | 'contacted' | 'qualified' | 'closed';
}

// Sample lead data
const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Валерий Г.',
    category: 'First manager',
    date: '2 day',
    request: 'New project inquiry',
    price: 320000,
    status: 'new'
  },
  {
    id: '2',
    name: 'Валерий Г.',
    category: 'First manager',
    date: '3 day',
    request: 'Website redesign',
    price: 250000,
    status: 'processing'
  },
  {
    id: '3',
    name: 'Валерий Г.',
    category: 'First manager',
    date: '2 day',
    request: 'Mobile app development',
    price: 500000,
    status: 'contacted'
  },
  {
    id: '4',
    name: 'Валерий Г.',
    category: 'First manager',
    date: '3 day',
    request: 'SEO consultation',
    price: 150000,
    status: 'qualified'
  },
  {
    id: '5',
    name: 'Валерий Г.',
    category: 'First manager',
    date: '7 day',
    request: 'E-commerce platform',
    price: 450000,
    status: 'closed'
  },
  {
    id: '6',
    name: 'Валерий Г.',
    category: 'First manager',
    date: '2 day',
    request: 'Branding package',
    price: 180000,
    status: 'new'
  },
  {
    id: '7',
    name: 'Валерий Г.',
    category: 'First manager',
    date: '1 day',
    request: 'Social media campaign',
    price: 120000,
    status: 'processing'
  },
  {
    id: '8',
    name: 'Валерий Г.',
    category: 'First manager',
    date: '5 day',
    request: 'Content marketing',
    price: 90000,
    status: 'contacted'
  },
  {
    id: '9',
    name: 'Валерий Г.',
    category: 'First manager',
    date: '4 day',
    request: 'UI/UX design services',
    price: 280000,
    status: 'qualified'
  }
];

export function LeadsContainer() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter leads based on active filter and search query
  const filteredLeads = mockLeads.filter((lead) => {
    // Filter by category if not "all"
    const categoryMatch =
      activeFilter === 'all' ||
      lead.category.toLowerCase().includes(activeFilter.toLowerCase());

    // Filter by search query
    const searchMatch =
      searchQuery === '' ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
      <div className='col-span-1 md:col-span-3'>
        <LeadsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <LeadFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <div className='mt-6'>
          <LeadsGrid leads={filteredLeads} />
        </div>
      </div>

      <div className='col-span-1 hidden md:block'>
        <LeadCalendar />
      </div>
    </div>
  );
}
