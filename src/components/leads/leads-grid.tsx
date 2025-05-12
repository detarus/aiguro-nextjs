'use client';

import { LeadCard } from './lead-card';
import { Lead } from './types';

interface LeadsGridProps {
  leads: Lead[];
}

export function LeadsGrid({ leads }: LeadsGridProps) {
  if (leads.length === 0) {
    return (
      <div className='p-8 text-center'>
        <p className='text-muted-foreground'>No leads found.</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}
