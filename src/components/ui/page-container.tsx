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
        <ScrollArea className='h-[calc(100dvh-52px)]'>
          <div className={cn('container px-4 py-6 md:px-6 md:py-8', className)}>
            {children}
          </div>
        </ScrollArea>
      ) : (
        <div className={cn('container px-4 py-6 md:px-6 md:py-8', className)}>
          {children}
        </div>
      )}
    </>
  );
}
