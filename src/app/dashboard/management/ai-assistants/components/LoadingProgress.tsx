'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface LoadingProgressProps {
  progress: number;
  currentStep: string;
  steps: string[];
}

export function LoadingProgress({
  progress,
  currentStep,
  steps
}: LoadingProgressProps) {
  return (
    <div className='flex min-h-[600px] items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-center'>
            Загрузка настроек ассистента
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <Progress value={progress} className='w-full' />

          <div className='space-y-2'>
            <p className='text-center text-sm font-medium'>{currentStep}</p>
            <p className='text-muted-foreground text-center text-xs'>
              {Math.round(progress)}% завершено
            </p>
          </div>

          <div className='space-y-1'>
            {steps.map((step, index) => (
              <div key={index} className='flex items-center gap-2 text-xs'>
                <div
                  className={`h-2 w-2 rounded-full ${
                    index < steps.indexOf(currentStep)
                      ? 'bg-green-500'
                      : index === steps.indexOf(currentStep)
                        ? 'animate-pulse bg-blue-500'
                        : 'bg-gray-300'
                  }`}
                />
                <span
                  className={
                    index <= steps.indexOf(currentStep)
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
