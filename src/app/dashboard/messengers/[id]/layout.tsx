'use client';

import { ReactNode } from 'react';

interface MessengersIdLayoutProps {
  children: ReactNode;
}

export default function MessengersIdLayout({
  children
}: MessengersIdLayoutProps) {
  return <div className='h-full'>{children}</div>;
}
