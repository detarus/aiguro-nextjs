'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ru } from 'date-fns/locale';

// Mock event data
const events = [
  {
    id: '1',
    title: 'Звонок с Valerti',
    date: new Date(2024, 11, 28),
    time: '13:30-14:30'
  },
  {
    id: '2',
    title: 'Звонок с Valerti',
    date: new Date(2024, 11, 28),
    time: '15:30-16:00'
  },
  {
    id: '3',
    title: 'Звонок с Valerti',
    date: new Date(2024, 11, 28),
    time: '11:30-12:00'
  }
];

export function LeadCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvents, setSelectedEvents] = useState(
    events.filter(
      (event) =>
        event.date.getDate() === new Date().getDate() &&
        event.date.getMonth() === new Date().getMonth() &&
        event.date.getFullYear() === new Date().getFullYear()
    )
  );

  // Handle date change to update selected events
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      setSelectedEvents(
        events.filter(
          (event) =>
            event.date.getDate() === newDate.getDate() &&
            event.date.getMonth() === newDate.getMonth() &&
            event.date.getFullYear() === newDate.getFullYear()
        )
      );
    } else {
      setSelectedEvents([]);
    }
  };

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';

    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='text-lg'>Digital Client</CardTitle>
        <div className='text-muted-foreground text-sm'>{formatDate(date)}</div>
      </CardHeader>
      <CardContent className='flex flex-col gap-4 p-0'>
        <div className='px-4'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={handleDateChange}
            locale={ru}
            className='rounded-md border p-2'
          />
        </div>

        <div className='px-4 pb-4'>
          <h3 className='mb-2 font-medium'>События на день</h3>
          {selectedEvents.length > 0 ? (
            <div className='space-y-2'>
              {selectedEvents.map((event) => (
                <div key={event.id} className='bg-muted rounded-md p-2 text-xs'>
                  <p className='font-medium'>{event.title}</p>
                  <p className='text-muted-foreground'>{event.time}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-muted-foreground text-sm'>
              Нет событий на выбранную дату
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
