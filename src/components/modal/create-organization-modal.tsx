'use client';

import { useClerk } from '@clerk/nextjs';
import { useEffect } from 'react';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrganizationModal({
  isOpen,
  onClose
}: CreateOrganizationModalProps) {
  const clerk = useClerk();

  useEffect(() => {
    if (isOpen && clerk) {
      clerk.openCreateOrganization({
        afterCreateOrganizationUrl: '/dashboard/overview',
        appearance: {
          elements: {
            rootBox: 'w-full',
            card: 'shadow-none border-0 w-full',
            headerTitle: 'text-lg font-semibold',
            headerSubtitle: 'text-sm text-muted-foreground',
            socialButtonsBlockButton: 'border border-input',
            formButtonPrimary: 'bg-primary hover:bg-primary/90',
            footerActionLink: 'text-primary hover:text-primary/90'
          }
        }
      });
    }
  }, [isOpen, clerk]);

  useEffect(() => {
    if (!isOpen && clerk) {
      clerk.closeCreateOrganization();
    }
  }, [isOpen, clerk]);

  // Этот компонент не рендерит ничего, так как Clerk управляет модальным окном
  return null;
}
