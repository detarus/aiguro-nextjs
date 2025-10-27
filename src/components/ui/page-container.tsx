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
  const isFullWidth = className?.includes('max-w-full');
  const containerClass = isFullWidth
    ? 'md:p-4 md:px-6'
    : 'md:container md:p-4 md:px-6';

  // If max-w-full is specified, ensure the wrapper div uses full width without container constraint
  const wrapperClass = isFullWidth
    ? 'w-full px-4 py-6 md:p-4 md:px-6'
    : 'w-full px-4 py-6';

  return (
    <>
      {scrollable ? (
        <ScrollArea className='h-[calc(100vh-120px)]'>
          <div
            className={cn(
              wrapperClass,
              !isFullWidth && containerClass,
              className
            )}
          >
            {children}
          </div>
        </ScrollArea>
      ) : (
        <div
          className={cn(
            wrapperClass,
            !isFullWidth && containerClass,
            className
          )}
        >
          {children}
        </div>
      )}
    </>
  );
}
