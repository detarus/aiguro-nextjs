'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonLoader() {
  return (
    <div className='grid grid-cols-12 gap-6'>
      {/* Left Column Skeleton */}
      <div className='col-span-4 h-fit space-y-6'>
        <Card className='h-fit'>
          <CardHeader>
            <Skeleton className='h-6 w-48' />
            <Skeleton className='h-4 w-full' />
          </CardHeader>
          <CardContent className='space-y-4'>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className='flex items-center justify-between gap-4'>
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-3 w-full' />
                </div>
                <Skeleton className='h-6 w-12' />
              </div>
            ))}
            <Skeleton className='h-10 w-full' />
          </CardContent>
        </Card>
      </div>

      {/* Center Column Skeleton */}
      <div className='col-span-5 h-fit space-y-6'>
        {/* Stage Tabs Skeleton */}
        <Card className='h-fit'>
          <CardHeader>
            <Skeleton className='h-6 w-64' />
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className='h-7 w-20' />
              ))}
              <Skeleton className='h-7 w-7' />
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs Skeleton */}
        <Card className='h-fit'>
          <CardHeader>
            <Skeleton className='h-6 w-72' />
          </CardHeader>
          <CardContent>
            <div className='flex gap-2'>
              <Skeleton className='h-10 flex-1' />
              <Skeleton className='h-10 flex-1' />
            </div>
          </CardContent>
        </Card>

        {/* Prompt Skeleton */}
        <Card className='h-fit'>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <Skeleton className='h-[150px] w-full' />
            <div className='flex gap-2'>
              <Skeleton className='h-10 flex-1' />
              <Skeleton className='h-10 w-10' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column Skeleton */}
      <div className='col-span-3 h-fit space-y-6'>
        <Card className='h-fit'>
          <CardContent className='space-y-6 px-6 py-6'>
            {/* Mode */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-12' />
              <Skeleton className='h-10 w-full' />
            </div>

            {/* Model */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-10 w-full' />
            </div>

            {/* Sliders */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-4 w-8' />
                </div>
                <Skeleton className='h-2 w-full' />
              </div>
            ))}

            {/* Preset */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-10 w-full' />
            </div>

            {/* Follow up */}
            <div className='space-y-3'>
              <Skeleton className='h-4 w-20' />
              <div className='flex items-center gap-2'>
                <Skeleton className='h-6 w-12' />
                <div className='flex flex-1 gap-2'>
                  <Skeleton className='h-10 w-16' />
                  <Skeleton className='h-10 flex-1' />
                </div>
              </div>
            </div>

            {/* Transfer */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-10 w-full' />
            </div>

            <Skeleton className='h-10 w-full' />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
