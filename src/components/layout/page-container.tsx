import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PageContainer({
  children,
  scrollable = true
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  return (
    <>
      {scrollable ? (
        <ScrollArea className='h-[calc(100vh-80px)]'>
          <div className='flex w-full max-w-full flex-1 overflow-x-hidden px-1.5 py-1.5 sm:p-2 sm:px-3 md:p-4'>
            <div className='w-full max-w-full'>{children}</div>
          </div>
        </ScrollArea>
      ) : (
        <div className='flex w-full max-w-full flex-1 overflow-x-hidden px-1.5 py-1.5 sm:p-2 sm:px-3 md:p-4'>
          <div className='w-full max-w-full'>{children}</div>
        </div>
      )}
    </>
  );
}
