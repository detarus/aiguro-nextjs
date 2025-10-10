'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PageContainer } from '@/components/ui/page-container';

export function PageSkeleton() {
  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Header Skeleton */}
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-8 w-[250px]' />
          <Skeleton className='h-4 w-[350px]' />
        </div>

        {/* Main Content Skeleton */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <Skeleton className='h-5 w-[150px]' />
            </CardHeader>
            <CardContent className='space-y-4'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
              <div className='flex gap-2 pt-2'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className='h-5 w-[150px]' />
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center gap-4'>
                  <Skeleton className='h-12 w-12 rounded-full' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-[200px]' />
                    <Skeleton className='h-4 w-[150px]' />
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <Skeleton className='h-12 w-12 rounded-full' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-[200px]' />
                    <Skeleton className='h-4 w-[150px]' />
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <Skeleton className='h-12 w-12 rounded-full' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-[200px]' />
                    <Skeleton className='h-4 w-[150px]' />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Skeleton */}
        <Card className='overflow-hidden'>
          <CardHeader>
            <Skeleton className='h-5 w-[150px]' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-[250px] w-full rounded-md' />
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className='h-5 w-[150px]' />
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex justify-between'>
                <Skeleton className='h-10 w-[200px]' />
                <Skeleton className='h-10 w-[150px]' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-12 w-full' />
                <Skeleton className='h-12 w-full' />
                <Skeleton className='h-12 w-full' />
                <Skeleton className='h-12 w-full' />
                <Skeleton className='h-12 w-full' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
