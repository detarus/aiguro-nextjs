'use client';

import { Suspense } from 'react';
import { PageSkeleton } from '@/components/page-skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { IconProps } from '@tabler/icons-react';
import { PageContainer } from '@/components/ui/page-container';

interface SimplePageTemplateProps {
  title: string;
  description: string;
  icon: React.ElementType<IconProps>;
  sections: {
    title: string;
    description: string;
    content: React.ReactNode;
  }[];
}

export function SimplePageTemplate({
  title,
  description,
  icon: Icon,
  sections
}: SimplePageTemplateProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContainer scrollable={true}>
        <div className='space-y-6'>
          <div className='flex items-start gap-4'>
            <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
              <Icon className='text-primary h-6 w-6' />
            </div>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>{title}</h1>
              <p className='text-muted-foreground'>{description}</p>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {sections.map((section, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>{section.content}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageContainer>
    </Suspense>
  );
}
