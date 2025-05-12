'use client';

import { IconSearch } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <IconSearch className='text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2' />
      <Input className='pl-8' type='search' {...props} />
    </div>
  );
}
