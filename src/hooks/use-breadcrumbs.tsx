'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { navItems } from '@/constants/data';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Панель управления', link: '/dashboard' }],
  '/dashboard/employee': [
    { title: 'Панель управления', link: '/dashboard' },
    { title: 'Сотрудник', link: '/dashboard/employee' }
  ],
  '/dashboard/product': [
    { title: 'Панель управления', link: '/dashboard' },
    { title: 'Товар', link: '/dashboard/product' }
  ]
  // Add more custom mappings as needed
};

function findSidebarTitle(path: string): string | undefined {
  // Flatten navItems and their children
  const flatItems = navItems.flatMap((item) => [item, ...(item.items || [])]);
  const found = flatItems.find((item) => {
    // Remove query params for comparison
    const cleanUrl = item.url?.split('?')[0];
    const cleanPath = path.split('?')[0];
    return cleanUrl === cleanPath;
  });
  return found?.title;
}

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Special case for dashboard root
    if (pathname === '/dashboard') {
      return [{ title: 'Панель управления', link: '/dashboard' }];
    }

    // Try to build breadcrumbs from segments
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      let title: string | undefined;
      if (path === '/dashboard') {
        title = 'Панель управления';
      } else {
        title = findSidebarTitle(path);
      }
      return {
        title: title || segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path
      };
    });
  }, [pathname]);

  return breadcrumbs;
}
