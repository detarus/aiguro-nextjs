import { cn } from '@/lib/utils';
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}

export function PageContainer({
  children,
  className,
  scrollable = true
}: PageContainerProps) {
  return (
    <>
      {scrollable ? (
        <ScrollArea className='h-[calc(100vh-120px)]'>
          <div className={cn('container px-4 py-6 md:p-4 md:px-6', className)}>
            {children}
          </div>
        </ScrollArea>
      ) : (
        <div className={cn('container px-4 py-6 md:p-4 md:px-6', className)}>
          {children}
        </div>
      )}
    </>
  );
}
