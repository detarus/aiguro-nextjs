export interface Lead {
  id: string;
  name: string;
  category: string;
  date: string;
  request: string;
  price: number;
  status: LeadStatus;
}

export type LeadStatus =
  | 'new'
  | 'processing'
  | 'contacted'
  | 'qualified'
  | 'closed';

// Status indicator color mapping
export const statusColorMap = {
  new: 'bg-red-500',
  processing: 'bg-orange-500',
  contacted: 'bg-yellow-500',
  qualified: 'bg-blue-500',
  closed: 'bg-green-500'
};

// Status labels for display
export const statusLabels = {
  new: 'New',
  processing: 'Processing',
  contacted: 'Contacted',
  qualified: 'Qualified',
  closed: 'Closed'
};

// Sample lead data
export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Георгий В.',
    category: 'First manager',
    date: '2 day',
    request: 'New project inquiry',
    price: 320000,
    status: 'new'
  },
  {
    id: '2',
    name: 'Егор П.',
    category: 'First manager',
    date: '3 day',
    request: 'Website redesign',
    price: 250000,
    status: 'processing'
  },
  {
    id: '3',
    name: 'Анастасия М.',
    category: 'First manager',
    date: '2 day',
    request: 'Mobile app development',
    price: 500000,
    status: 'contacted'
  },
  {
    id: '4',
    name: 'Петр М.',
    category: 'First manager',
    date: '3 day',
    request: 'SEO consultation',
    price: 150000,
    status: 'qualified'
  },
  {
    id: '5',
    name: 'Алексей Е.',
    category: 'First manager',
    date: '7 day',
    request: 'E-commerce platform',
    price: 450000,
    status: 'closed'
  },
  {
    id: '6',
    name: 'Виктор М.',
    category: 'First manager',
    date: '2 day',
    request: 'Branding package',
    price: 180000,
    status: 'new'
  },
  {
    id: '7',
    name: 'Александр К.',
    category: 'First manager',
    date: '1 day',
    request: 'Social media campaign',
    price: 120000,
    status: 'processing'
  },
  {
    id: '8',
    name: 'Федор М.',
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
