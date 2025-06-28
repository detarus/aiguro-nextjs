import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Дашборд',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: true,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Клиенты',
    url: '/dashboard/clients',
    icon: 'users',
    isActive: true,
    shortcut: ['c', 'l'],
    items: []
  },
  {
    title: 'Диалоги',
    url: '/dashboard/messengers',
    icon: 'messengers',
    isActive: true,
    shortcut: ['m', 's'],
    items: [
      {
        title: 'Входящие',
        url: '/dashboard/messengers?tab=incoming',
        shortcut: ['m', 'i']
      },
      {
        title: 'Исходящие',
        url: '/dashboard/messengers?tab=outgoing',
        shortcut: ['m', 'o']
      }
    ]
  },
  {
    title: 'Управление',
    url: '/dashboard/management',
    icon: 'management',
    isActive: true,
    shortcut: ['m', 'n'],
    items: []
  },
  {
    title: 'Интеграции',
    url: '/dashboard/integrations',
    icon: 'integrations',
    isActive: true,
    shortcut: ['i', 't'],
    items: []
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Оливия Мартинова',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Джек Ли',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Изабель Нгуен',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'Уильям Ким',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'София Дейвис',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
