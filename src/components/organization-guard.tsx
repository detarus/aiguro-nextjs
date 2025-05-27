'use client';

import { useAuth, OrganizationList } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface OrganizationGuardProps {
  children: React.ReactNode;
}

export function OrganizationGuard({ children }: OrganizationGuardProps) {
  const { isLoaded, orgId, userId } = useAuth();
  const [showOrgModal, setShowOrgModal] = useState(false);

  useEffect(() => {
    // Only check after auth is loaded and user is signed in
    if (isLoaded && userId) {
      // If user has no active organization, show the modal
      if (!orgId) {
        setShowOrgModal(true);
      } else {
        setShowOrgModal(false);
      }
    }
  }, [isLoaded, userId, orgId]);

  // Don't render anything until auth is loaded
  if (!isLoaded) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
      </div>
    );
  }

  // If user is not signed in, render children normally (auth will handle redirect)
  if (!userId) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Render children only if user has active organization */}
      {orgId && children}

      {/* Organization selection modal */}
      <Dialog open={showOrgModal} onOpenChange={() => {}}>
        <DialogContent className='sm:max-w-md [&>button]:hidden'>
          <DialogHeader>
            <DialogTitle>Выберите организацию</DialogTitle>
            <DialogDescription>
              Для продолжения работы необходимо выбрать организацию или создать
              новую.
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-center'>
            <OrganizationList
              hidePersonal={true}
              afterCreateOrganizationUrl='/dashboard/overview'
              afterSelectOrganizationUrl='/dashboard/overview'
              skipInvitationScreen={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
