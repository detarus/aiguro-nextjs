'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Lead, statusColorMap } from './types';

interface LeadCardProps {
  lead: Lead;
}

export function LeadCard({ lead }: LeadCardProps) {
  const { name, category, date, request, price, status } = lead;
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('');

  // Format the price with currency
  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(price);

  return (
    <Card className='h-full'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Avatar className='bg-muted h-10 w-10'>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className='font-medium'>{name}</p>
              <p className='text-muted-foreground text-xs'>{category}</p>
            </div>
          </div>
          <div className='text-muted-foreground text-xs'>{date}</div>
        </div>
      </CardHeader>

      <CardContent className='pb-2'>
        <p className='mb-1 text-sm'>{request}</p>
        <p className='font-bold'>{formattedPrice}</p>
      </CardContent>

      <CardFooter className='pt-2'>
        <div className='flex items-center gap-2'>
          <span
            className={`h-3 w-3 rounded-full ${statusColorMap[status]}`}
            aria-hidden='true'
          />
          <Badge variant='outline' className='capitalize'>
            {status}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}
