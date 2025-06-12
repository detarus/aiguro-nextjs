'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { IconRotateClockwise } from '@tabler/icons-react';

interface StageSettings {
  id: number;
  name: string;
  prompt: string;
  isActive: boolean;
  aiSettings: any;
}

interface StageConfigurationProps {
  stages: StageSettings[];
  currentFunnelData: any;
  activeStageId: number;
  activeSettingsTab: 'setup' | 'test';
  instructions: string;
  saving: boolean;
  successMessage: string | null;
  error: string | null;
  onStageChange: (stageId: number) => void;
  onTabChange: (tab: 'setup' | 'test') => void;
  onInstructionsChange: (value: string) => void;
  onSubmitInstructions: () => void;
}

export function StageConfiguration({
  stages,
  currentFunnelData,
  activeStageId,
  activeSettingsTab,
  instructions,
  saving,
  successMessage,
  error,
  onStageChange,
  onTabChange,
  onInstructionsChange,
  onSubmitInstructions
}: StageConfigurationProps) {
  return (
    <>
      {/* Stage Tabs */}
      <Card className='h-fit'>
        <CardHeader>
          <CardTitle>Настройка мультиагента по этапам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2'>
            {currentFunnelData?.stages?.map((stage: any, index: number) => (
              <Button
                key={stage.name || index}
                variant={activeStageId === index + 1 ? 'default' : 'outline'}
                size='sm'
                onClick={() => onStageChange(index + 1)}
              >
                {stage.name || `Этап ${index + 1}`}
              </Button>
            )) ||
              stages.map((stage) => (
                <Button
                  key={stage.id}
                  variant={activeStageId === stage.id ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => onStageChange(stage.id)}
                >
                  {stage.name}
                </Button>
              ))}
            <Button variant='outline' size='sm' disabled>
              +
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings and Testing Tabs */}
      <Card className='h-fit'>
        <CardHeader>
          <CardTitle>Настройка промптов и тестирование этапа</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeSettingsTab}
            onValueChange={(value) => onTabChange(value as 'setup' | 'test')}
          >
            <TabsList className='w-full'>
              <TabsTrigger value='setup' className='flex-1'>
                Настройка
              </TabsTrigger>
              <TabsTrigger value='test' className='flex-1'>
                Тестирование
              </TabsTrigger>
            </TabsList>
            <TabsContent value='setup' className='mt-4'>
              <p className='text-muted-foreground text-sm'>
                Настройте промпты и параметры для текущего этапа
              </p>
            </TabsContent>
            <TabsContent value='test' className='mt-4'>
              <p className='text-muted-foreground text-sm'>
                Протестируйте работу агента на текущем этапе
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Agent Prompt */}
      <Card className='h-fit'>
        <CardHeader>
          <CardTitle>Промпт агента</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Textarea
            value={instructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            placeholder='Fix the grammar.'
            className='h-[278px] resize-none'
          />

          {/* Success and Error Messages */}
          {successMessage && !successMessage.includes('AI настройки') && (
            <div className='rounded-md border border-green-200 bg-green-50 p-3'>
              <div className='flex'>
                <div className='text-sm text-green-700'>{successMessage}</div>
              </div>
            </div>
          )}

          {error && (
            <div className='rounded-md border border-red-200 bg-red-50 p-3'>
              <div className='flex'>
                <div className='text-sm text-red-700'>{error}</div>
              </div>
            </div>
          )}

          <div className='flex gap-2'>
            <Button
              onClick={onSubmitInstructions}
              disabled={saving}
              className='flex-1'
            >
              {saving ? 'Сохранение...' : 'Submit'}
            </Button>
            <Button variant='outline' size='icon'>
              <IconRotateClockwise className='h-4 w-4' />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
