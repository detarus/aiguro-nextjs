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
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Клиенты',
    url: '/dashboard/clients',
    icon: 'users',
    shortcut: ['c', 'l'],
    isActive: false,
    items: [] // No child items
  },
  // {
  //   title: 'Дайборд',
  //   url: '/dashboard/leads',
  //   icon: 'leads',
  //   shortcut: ['l', 'd'],
  //   isActive: false,
  //   items: [] // No child items
  // },
  {
    // title: 'Product',
    // url: '/dashboard/product',
    // icon: 'product',
    // shortcut: ['p', 'p'],
    title: 'Мессенджеры',
    url: '/dashboard/messengers',
    icon: 'messengers',
    shortcut: ['m', 's'],
    isActive: false,
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
    title: 'Голосовые',
    url: '/dashboard/voice',
    icon: 'voice',
    shortcut: ['v', 'c'],
    isActive: false,
    items: [
      {
        title: 'Входящие',
        url: '/dashboard/voice?tab=incoming',
        shortcut: ['v', 'i']
      },
      {
        title: 'Исходящие',
        url: '/dashboard/voice?tab=outgoing',
        shortcut: ['v', 'o']
      }
    ]
  },
  {
    title: 'CRM',
    url: '/dashboard/crm',
    icon: 'crm',
    shortcut: ['c', 'r'],
    isActive: false,
    items: []
  },
  {
    title: 'Управление',
    url: '/dashboard/management',
    icon: 'management',
    shortcut: ['m', 'n'],
    isActive: false,
    items: []
  },
  {
    title: 'Аналитика',
    url: '/dashboard/analytics',
    icon: 'analytics',
    shortcut: ['a', 'n'],
    isActive: false,
    items: []
  },
  {
    title: 'Готовые Шаблоны',
    url: '/dashboard/templates',
    icon: 'templates',
    shortcut: ['t', 'p'],
    isActive: false,
    items: []
  },
  {
    title: 'Маркетплейс Услуг',
    url: '/dashboard/marketplace',
    icon: 'product',
    shortcut: ['m', 'k'],
    isActive: false,
    items: []
  },
  {
    title: 'Интеграции',
    url: '/dashboard/integrations',
    icon: 'devices',
    shortcut: ['i', 'n'],
    isActive: false,
    items: []
  },
  {
    title: 'API-ключи',
    url: '/dashboard/api-keys',
    icon: 'apiKeys',
    shortcut: ['a', 'p'],
    isActive: false,
    items: []
  },
  {
    title: 'База знаний',
    url: '/dashboard/knowledge-base',
    icon: 'knowledgeBase',
    shortcut: ['k', 'b'],
    isActive: false,
    items: []
  },
  {
    title: 'Поддержка',
    url: '/dashboard/support',
    icon: 'support',
    shortcut: ['s', 'p'],
    isActive: false,
    items: []
  },
  {
    title: 'Настройки',
    url: '/dashboard/settings',
    icon: 'systemSettings',
    shortcut: ['s', 't'],
    isActive: false,
    items: []
  }
  // {
  //   title: 'Account',
  //   url: '#', // Placeholder as there is no direct link for the parent
  //   icon: 'billing',
  //   isActive: true,
  //   items: [
  //     {
  //       title: 'Profile',
  //       url: '/dashboard/profile',
  //       icon: 'userPen',
  //       shortcut: ['m', 'm']
  //     },
  //     {
  //       title: 'Login',
  //       shortcut: ['l', 'l'],
  //       url: '/',
  //       icon: 'login'
  //     }
  //   ]
  // },
  // {
  //   title: 'Kanban',
  //   url: '/dashboard/kanban',
  //   icon: 'kanban',
  //   shortcut: ['k', 'k'],
  //   isActive: false,
  //   items: [] // No child items
  // }
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
