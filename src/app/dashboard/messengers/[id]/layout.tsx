'use client';

import { ReactNode } from 'react';
import { PageContainer } from '@/components/ui/page-container';

interface DialogsIdLayoutProps {
  children: ReactNode;
}

export default function DialogsIdLayout({ children }: DialogsIdLayoutProps) {
  return <PageContainer scrollable={false}>{children}</PageContainer>;
}
