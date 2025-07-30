'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Modal } from '@/components/ui/modal';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useOrganization } from '@clerk/nextjs';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';

interface CreateFunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FunnelFormData {
  display_name: string;
  mergeToArray: number;
  breakSize: number;
  breakWait: number;
  contextMemorySize: number;
  useCompanyKnowledgeBase: boolean;
  useFunnelKnowledgeBase: boolean;
  autoPause: number;
  autoPauseFull: boolean;
  autoAnswer: string;
  antiSpam: number;
  acceptFile: boolean;
  acceptAudio: boolean;
  workSchedule: boolean;
  workStart: number;
  workEnd: number;
}

export function CreateFunnelModal({
  isOpen,
  onClose,
  onSuccess
}: CreateFunnelModalProps) {
  const { organization } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FunnelFormData>({
    defaultValues: {
      display_name: '',
      mergeToArray: 0,
      breakSize: 0,
      breakWait: 0,
      contextMemorySize: 0,
      useCompanyKnowledgeBase: true,
      useFunnelKnowledgeBase: true,
      autoPause: 0,
      autoPauseFull: false,
      autoAnswer:
        'К сожалению, мы сейчас не можем вам ответить, напишите позже',
      antiSpam: 0,
      acceptFile: false,
      acceptAudio: false,
      workSchedule: false,
      workStart: 0,
      workEnd: 0
    }
  });

  const onSubmit = async (data: FunnelFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) {
        throw new Error('No token available');
      }

      const backendOrgId = organization?.publicMetadata?.id_backend as string;
      if (!backendOrgId) {
        throw new Error('No backend organization ID found');
      }

      const response = await fetch(`/api/organization/${backendOrgId}/funnel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          stages: [] // stages всегда пустой массив
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log('Funnel created successfully:', result);

      form.reset();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error creating funnel:', err);
      setError(err.message || 'Failed to create funnel');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title='Создать воронку'
      description='Заполните параметры для создания новой воронки'
      isOpen={isOpen}
      onClose={onClose}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='max-h-[70vh] space-y-4 overflow-y-auto pr-2'
        >
          {/* Display Name */}
          <FormField
            control={form.control}
            name='display_name'
            rules={{ required: 'Название воронки обязательно' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название воронки</FormLabel>
                <FormControl>
                  <Input placeholder='Введите название воронки' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Merge To Array */}
          <FormField
            control={form.control}
            name='mergeToArray'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Merge To Array</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Break Size */}
          <FormField
            control={form.control}
            name='breakSize'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Break Size</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Break Wait */}
          <FormField
            control={form.control}
            name='breakWait'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Break Wait</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Context Memory Size */}
          <FormField
            control={form.control}
            name='contextMemorySize'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Context Memory Size</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Use Company Knowledge Base */}
          <FormField
            control={form.control}
            name='useCompanyKnowledgeBase'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                <div className='space-y-0.5'>
                  <FormLabel>Использовать базу знаний компании</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Use Funnel Knowledge Base */}
          <FormField
            control={form.control}
            name='useFunnelKnowledgeBase'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                <div className='space-y-0.5'>
                  <FormLabel>Использовать базу знаний воронки</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Auto Pause */}
          <FormField
            control={form.control}
            name='autoPause'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auto Pause</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Auto Pause Full */}
          <FormField
            control={form.control}
            name='autoPauseFull'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                <div className='space-y-0.5'>
                  <FormLabel>Auto Pause Full</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Auto Answer */}
          <FormField
            control={form.control}
            name='autoAnswer'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Автоответ</FormLabel>
                <FormControl>
                  <Textarea placeholder='Введите текст автоответа' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Anti Spam */}
          <FormField
            control={form.control}
            name='antiSpam'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anti Spam</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Accept File */}
          <FormField
            control={form.control}
            name='acceptFile'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                <div className='space-y-0.5'>
                  <FormLabel>Принимать файлы</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Accept Audio */}
          <FormField
            control={form.control}
            name='acceptAudio'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                <div className='space-y-0.5'>
                  <FormLabel>Принимать аудио</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Work Schedule */}
          <FormField
            control={form.control}
            name='workSchedule'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                <div className='space-y-0.5'>
                  <FormLabel>Рабочий график</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Work Start */}
          <FormField
            control={form.control}
            name='workStart'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Начало рабочего дня</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Work End */}
          <FormField
            control={form.control}
            name='workEnd'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Конец рабочего дня</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Error Message */}
          {error && (
            <div className='rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <ErrorDetails error={error} />
            </div>
          )}

          {/* Form Actions */}
          <div className='flex justify-end space-x-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Создание...' : 'Создать воронку'}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}

function ErrorDetails({ error }: { error: any }) {
  if (!error) return null;
  let parsed: any = error;
  if (typeof error === 'string') {
    try {
      parsed = JSON.parse(error);
    } catch {
      return <div>{error}</div>;
    }
  }
  if (typeof parsed === 'object' && parsed !== null) {
    return (
      <pre className='text-xs whitespace-pre-wrap'>
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  }
  return <div>{String(error)}</div>;
}
