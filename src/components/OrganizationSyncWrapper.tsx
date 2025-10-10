'use client';

import React from 'react';
import { useOrganizationReady } from '@/hooks/useOrganizationReady';
import { useOrganizationSync } from '@/contexts/OrganizationSyncContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface OrganizationSyncWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function OrganizationSyncWrapper({
  children,
  fallback
}: OrganizationSyncWrapperProps) {
  const { isReady, isLoading, error } = useOrganizationReady();
  const { isSyncing, syncError, syncProgress, triggerSync } =
    useOrganizationSync();

  // Show loading skeleton while organization is loading
  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-1/3' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-1/2' />
      </div>
    );
  }

  // Show error if organization loading failed
  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          Failed to load organization: {error}
        </AlertDescription>
      </Alert>
    );
  }

  // Show sync progress while organization is being created
  if (isSyncing) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <RefreshCw className='h-4 w-4 animate-spin' />
          <span className='text-muted-foreground text-sm'>
            {syncProgress || 'Setting up organization...'}
          </span>
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-1/3' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
        </div>
      </div>
    );
  }

  // Show sync error if organization creation failed
  if (syncError) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription className='space-y-2'>
          <div>Failed to create organization in backend: {syncError}</div>
          <Button size='sm' onClick={triggerSync} className='mt-2'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Show fallback or skeleton if organization is not ready
  if (!isReady) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-1/3' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-1/2' />
      </div>
    );
  }

  // Organization is ready - render children
  return <>{children}</>;
}
