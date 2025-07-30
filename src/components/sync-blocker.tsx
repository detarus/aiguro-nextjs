'use client';

import { useOrganizationSync } from '@/contexts/OrganizationSyncContext';

interface SyncBlockerProps {
  children: React.ReactNode;
}

export function SyncBlocker({ children }: SyncBlockerProps) {
  const { isSyncing } = useOrganizationSync();

  if (isSyncing) {
    return <div className='pointer-events-none opacity-50'>{children}</div>;
  }

  return <>{children}</>;
}
