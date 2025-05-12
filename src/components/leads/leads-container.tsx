'use client';

import { useState } from 'react';
import { LeadsGrid } from './leads-grid';
import { LeadFilter } from './lead-filter';
import { LeadCalendar } from './lead-calendar';
import { LeadsHeader } from './leads-header';
import { LeadStatus, mockLeads } from './types';

export function LeadsContainer() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<LeadStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter leads based on active category, status and search query
  const filteredLeads = mockLeads.filter((lead) => {
    // Filter by category if not "all"
    const categoryMatch =
      activeCategory === 'all' ||
      lead.category.toLowerCase().includes(activeCategory.toLowerCase());

    // Filter by status if not "all"
    const statusMatch = activeStatus === 'all' || lead.status === activeStatus;

    // Filter by search query
    const searchMatch =
      searchQuery === '' ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.request.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && statusMatch && searchMatch;
  });

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
      <div className='col-span-1 md:col-span-3'>
        <LeadsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <LeadFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
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
